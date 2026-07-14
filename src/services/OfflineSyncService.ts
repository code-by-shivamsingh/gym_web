import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { logLocationTelemetry, completeWorkoutVideo } from "./api";

const CACHE_KEYS = {
  LOCATIONS: "offline_locations_cache",
  WORKOUTS: "offline_workouts_cache"
};

export interface OfflineLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface OfflineWorkout {
  workoutVideoId: string;
  timestamp: string;
}

// Queue coordinates locally
export const queueOfflineLocation = async (location: OfflineLocation) => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEYS.LOCATIONS);
    const list: OfflineLocation[] = raw ? JSON.parse(raw) : [];
    list.push(location);
    await AsyncStorage.setItem(CACHE_KEYS.LOCATIONS, JSON.stringify(list));
    console.log(`[Offline Sync] Cached location log offline: ${location.latitude}, ${location.longitude}`);
  } catch (error) {
    console.warn("[Offline Sync] Failed caching location:", error);
  }
};

// Queue workout completion locally
export const queueOfflineWorkout = async (workoutVideoId: string) => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEYS.WORKOUTS);
    const list: OfflineWorkout[] = raw ? JSON.parse(raw) : [];
    list.push({ workoutVideoId, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(CACHE_KEYS.WORKOUTS, JSON.stringify(list));
    console.log(`[Offline Sync] Cached workout completion offline: ${workoutVideoId}`);
  } catch (error) {
    console.warn("[Offline Sync] Failed caching workout:", error);
  }
};

// Sync local cache data with backend
export const syncOfflineData = async () => {
  try {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      console.log("[Offline Sync] Connection offline. Skipping cache sync.");
      return;
    }

    console.log("[Offline Sync] Connection active. Starting synchronization check...");

    // 1. Sync Locations cache
    const rawLocations = await AsyncStorage.getItem(CACHE_KEYS.LOCATIONS);
    if (rawLocations) {
      const locations: OfflineLocation[] = JSON.parse(rawLocations);
      if (locations.length > 0) {
        console.log(`[Offline Sync] Syncing ${locations.length} cached location coordinates...`);
        for (const loc of locations) {
          await logLocationTelemetry(loc.latitude, loc.longitude, loc.accuracy);
        }
        await AsyncStorage.removeItem(CACHE_KEYS.LOCATIONS);
        console.log("[Offline Sync] Location telemetry synced successfully.");
      }
    }

    // 2. Sync Workouts cache
    const rawWorkouts = await AsyncStorage.getItem(CACHE_KEYS.WORKOUTS);
    if (rawWorkouts) {
      const workouts: OfflineWorkout[] = JSON.parse(rawWorkouts);
      if (workouts.length > 0) {
        console.log(`[Offline Sync] Syncing ${workouts.length} cached workout completions...`);
        for (const work of workouts) {
          await completeWorkoutVideo(work.workoutVideoId);
        }
        await AsyncStorage.removeItem(CACHE_KEYS.WORKOUTS);
        console.log("[Offline Sync] Workout progress synced successfully.");
      }
    }
  } catch (error) {
    console.warn("[Offline Sync] Synchronization error:", error);
  }
};

let isNetInfoListening = false;
let netInfoUnsubscribe: (() => void) | null = null;

// Setup dynamic network event listener (idempotent, return unsubscribe)
export const initNetworkSyncListener = () => {
  if (isNetInfoListening) {
    console.log("[Offline Sync] NetInfo listener is already active. Skipping duplicate registration.");
    return netInfoUnsubscribe;
  }

  console.log("[Offline Sync] Registering NetInfo online status sync trigger listener.");
  isNetInfoListening = true;
  netInfoUnsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      console.log("[Offline Sync] Connection restored to ONLINE. Triggering synchronization...");
      syncOfflineData();
    }
  });

  return netInfoUnsubscribe;
};

// Remove the network listener
export const stopNetworkSyncListener = () => {
  if (netInfoUnsubscribe) {
    console.log("[Offline Sync] Removing NetInfo online status sync listener.");
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
  isNetInfoListening = false;
};
