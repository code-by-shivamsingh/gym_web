import { Platform, PermissionsAndroid, Alert, Linking } from "react-native";
import Geolocation from "react-native-geolocation-service";
import BackgroundService from "react-native-background-actions";
import { logLocationTelemetry } from "./api";
import { queueOfflineLocation } from "./OfflineSyncService";

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

let watchId: number | null = null;
let isHunting = false;

// Progressive acquisition strategy to resolve cold starts and network fallbacks
const triggerHighAccuracyHunt = (delay: number) => {
  if (isHunting) return;
  isHunting = true;
  console.log("[GPS background] Initiating high-accuracy oneshot hunt to resolve poor satellite locks...");

  Geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude, accuracy, speed, altitude } = position.coords;
      const timestamp = new Date(position.timestamp).toISOString();
      const currentSpeed = speed !== null && speed !== undefined ? speed : 0;
      const currentAltitude = altitude !== null && altitude !== undefined ? altitude : 0;
      const isMocked = position.mocked || false;
      const provider = position.provider || "unknown";
      
      console.log(
        `[GPS background] Oneshot Hunt Result:\n` +
        `  - Latitude: ${latitude}\n` +
        `  - Longitude: ${longitude}\n` +
        `  - Accuracy: ${accuracy}m\n` +
        `  - Speed: ${currentSpeed.toFixed(2)} m/s\n` +
        `  - Altitude: ${currentAltitude.toFixed(2)}m\n` +
        `  - Provider: ${provider}\n` +
        `  - Mocked: ${isMocked}\n` +
        `  - Timestamp: ${timestamp}`
      );

      if (isMocked) {
        console.warn("[GPS background] WARNING: Spoofed mock location detected during oneshot hunt!");
      }

      if (accuracy <= 200) {
        try {
          console.log("[GPS background] Posting hunt telemetry to API...");
          const res = await logLocationTelemetry(latitude, longitude, accuracy);
          if (res.success) {
            console.log(`[GPS background] Hunt telemetry posted successfully. Gym: ${res.data?.gymName || "None"}, Distance: ${res.data?.distance}m`);
          } else {
            console.warn(`[GPS background] Hunt telemetry post rejected: ${res.message}. Caching locally.`);
            await queueOfflineLocation({ latitude, longitude, accuracy, timestamp });
          }
        } catch (apiErr: any) {
          console.warn("[GPS background] Hunt API exception, caching offline:", apiErr.message || apiErr);
          await queueOfflineLocation({ latitude, longitude, accuracy, timestamp });
        }
      } else {
        console.warn(`[GPS background] Hunt also returned low accuracy: ${accuracy}m. Caching locally.`);
        await queueOfflineLocation({ latitude, longitude, accuracy, timestamp });
      }
      isHunting = false;
    },
    (error) => {
      console.warn(`[GPS background] Oneshot Hunt failed (Code ${error.code}): ${error.message}`);
      isHunting = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,                // Fetch lock within 10 seconds
      maximumAge: 0,                 // Bypasses local cache to force raw GPS check
      forceRequestLocation: true
    }
  );
};

// Background task execution logic using watchPosition
const locationBackgroundTask = async (taskDataArguments: any) => {
  const delay = taskDataArguments?.delay || 30000; // Prefer updates every 30 seconds
  console.log("[GPS background] Background task runner thread started.");

  // Register watch position immediately
  await new Promise<void>((resolve) => {
    watchId = Geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, speed, altitude } = position.coords;
        const timestamp = new Date(position.timestamp).toISOString();
        const currentSpeed = speed !== null && speed !== undefined ? speed : 0;
        const currentAltitude = altitude !== null && altitude !== undefined ? altitude : 0;
        const isMocked = position.mocked || false;
        const provider = position.provider || "unknown";
        
        console.log(
          `[GPS background] Location Update Received:\n` +
          `  - Latitude: ${latitude}\n` +
          `  - Longitude: ${longitude}\n` +
          `  - Accuracy: ${accuracy}m\n` +
          `  - Speed: ${currentSpeed.toFixed(2)} m/s\n` +
          `  - Altitude: ${currentAltitude.toFixed(2)}m\n` +
          `  - Provider: ${provider}\n` +
          `  - Mocked: ${isMocked}\n` +
          `  - Timestamp: ${timestamp}`
        );

        if (isMocked) {
          console.warn("[GPS background] WARNING: Spoofed mock location detected!");
        }

        // Filter out extreme low accuracy early (above 200m) to save bandwidth,
        // but cache offline and trigger high-accuracy oneshot hunt.
        if (accuracy > 200) {
          console.warn(`[GPS background] Low accuracy GPS update ignored for API sync: ${accuracy}m (>200m). Caching locally and triggering a high-accuracy hunt.`);
          await queueOfflineLocation({
            latitude,
            longitude,
            accuracy,
            timestamp
          });
          triggerHighAccuracyHunt(delay);
          return;
        }

        try {
          console.log("[GPS background] Posting telemetry to API...");
          const res = await logLocationTelemetry(latitude, longitude, accuracy);
          if (res.success) {
            console.log(`[GPS background] Telemetry successfully posted. Gym info: ${res.data?.gymName || "None"}, Distance: ${res.data?.distance}m`);
          } else {
            console.warn(`[GPS background] Telemetry post rejected by backend (Code: ${res.message}). Caching offline.`);
            await queueOfflineLocation({
              latitude,
              longitude,
              accuracy,
              timestamp
            });
          }
        } catch (apiErr: any) {
          console.warn("[GPS background] API communication exception, caching offline:", apiErr.message || apiErr);
          await queueOfflineLocation({
            latitude,
            longitude,
            accuracy,
            timestamp
          });
        }
      },
      (error) => {
        console.error(`[GPS background] Geolocation Watch Error (Code ${error.code}): ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5,           // Receive updates if user moves >5 meters
        interval: delay,             // Location update interval
        fastestInterval: 15000,      // Fastest location update interval (15s)
        showLocationDialog: true,    // Prompts user to enable GPS if turned off
        forceRequestLocation: true,  // Bypasses cache and requests fresh location
      }
    );
    console.log(`[GPS background] Location listener successfully registered with watchId: ${watchId}`);
    resolve();
  });

  // Delay checking BackgroundService.isRunning() by 2 seconds to allow the start promise 
  // on the JS side to resolve and set backgroundServer._isRunning to true. 
  // This completely bypasses the asynchronous startup race condition.
  console.log("[GPS background] Waiting 2 seconds for JS context synchronization...");
  await sleep(2000);

  // Keep the task thread alive while the service runs
  while (BackgroundService.isRunning()) {
    await sleep(10000); // Check status every 10 seconds
  }

  // Cleanup watch position when stopping
  if (watchId !== null) {
    console.log(`[GPS background] Stopping background task. Clearing watchId: ${watchId}`);
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
  console.log("[GPS background] Background task thread terminated.");
};

const backgroundOptions = {
  taskName: "ForgeGymGPS",
  taskTitle: "Gym Automated Attendance active",
  taskDesc: "Background location tracking is running to verify gym check-ins.",
  taskIcon: {
    name: "ic_launcher",
    type: "mipmap",
  },
  color: "#eab308", // gold theme matching dashboard
  parameters: {
    delay: 30000, // Post coordinates every 30 seconds
  },
};

// Sequenced production-ready permissions handling
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    console.log("[GPS Service] Initiating system permission diagnostic checks...");

    if (Platform.OS === "ios") {
      const auth = await Geolocation.requestAuthorization("always");
      console.log(`[GPS Service] iOS Geolocation permission status: ${auth}`);
      return auth === "granted";
    }

    if (Platform.OS === "android") {
      // 1. Request POST_NOTIFICATIONS permission for Android 13+ (API 33+)
      if (Platform.Version >= 33) {
        const notifyGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Notification Permission Required",
            message: "ForgeGym needs notification permission to display background tracking status in your notification drawer.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        console.log(`[GPS Service] Android notification permission status: ${notifyGranted}`);
        if (notifyGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn("[GPS Service] Foreground notification permission denied. Background service execution might be restricted by OS.");
        }
      }

      // 2. Request Foreground Location permissions (ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION)
      console.log("[GPS Service] Requesting foreground ACCESS_FINE_LOCATION...");
      const fineGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "ForgeGym Location Access Permission",
          message: "ForgeGym needs access to your GPS coordinate to log automated check-in details when arriving at the gym.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      console.log(`[GPS Service] Foreground Location permission status: ${fineGranted}`);

      if (fineGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          "Location Permission Required",
          "You have permanently denied location permission. Please enable it in the app settings to use automated gym check-ins.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }

      if (fineGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }

      // 3. Request Background Location permission for Android 10+ (API level 29)
      if (Platform.Version >= 29) {
        console.log("[GPS Service] Requesting ACCESS_BACKGROUND_LOCATION (API 29+)...");
        const backgroundGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: "ForgeGym Background Location Permission",
            message: "ForgeGym requires background location access ('Allow all the time') to verify geofence check-ins when the application is minimized or closed.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        console.log(`[GPS Service] Background Location permission status: ${backgroundGranted}`);

        if (
          backgroundGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN || 
          backgroundGranted === PermissionsAndroid.RESULTS.DENIED
        ) {
          Alert.alert(
            "Background Location Required",
            "To verify check-ins in the background, you must select 'Allow all the time' in the system settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        }

        return backgroundGranted === PermissionsAndroid.RESULTS.GRANTED;
      }

      return true;
    }
  } catch (err) {
    console.error("[GPS Service] Error checking permissions:", err);
    return false;
  }
  return false;
};

// Start background service thread
export const startLocationTracking = async () => {
  try {
    if (BackgroundService.isRunning()) {
      console.log("[GPS Service] Background GPS runner already running.");
      return;
    }

    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      console.warn("[GPS Service] Geolocation tracking access denied by user.");
      Alert.alert(
        "Permissions Required",
        "Geofencing requires 'Always' Location permission to run in the background. Please enable it in system settings."
      );
      return;
    }

    console.log("[GPS Service] Starting background location task...");
    await BackgroundService.start(locationBackgroundTask, backgroundOptions);
    console.log("[GPS Service] Background GPS tracking initialized successfully.");
  } catch (error) {
    console.error("[GPS Service] Failed starting background service:", error);
  }
};

// Stop background service thread
export const stopLocationTracking = async () => {
  try {
    if (!BackgroundService.isRunning()) {
      return;
    }
    console.log("[GPS Service] Stopping background actions task...");
    await BackgroundService.stop();
    console.log("[GPS Service] Background GPS tracking service stopped.");
  } catch (error) {
    console.error("[GPS Service] Error stopping background service:", error);
  }
};
