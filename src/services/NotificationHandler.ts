import { Alert } from "react-native";
import messaging from "@react-native-firebase/messaging";
import firebase from "@react-native-firebase/app";

// Request notification permissions (required for iOS & Android 13+)
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!firebase.apps.length) {
      console.log("[FCM] Firebase not initialized. Skipping notification permission request.");
      return false;
    }
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      console.log("[FCM] Push Notification permission granted. Status:", authStatus);
      return true;
    }
    console.warn("[FCM] Push Notification permission denied.");
    return false;
  } catch (error) {
    console.warn("[FCM] Permission request error:", error);
    return false;
  }
};

// Retrieve device registration token
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    console.log("[FCM] Device registration token:", token);
    return token;
  } catch (error) {
    console.warn("[FCM] Failed to get device token:", error);
    return null;
  }
};

// Main Notification Handler Bootstrapper (Unified version)
export const initPushNotifications = async () => {
  try {
    if (!firebase.apps.length) {
      console.log("[FCM] Firebase is not initialized (google-services.json may be missing). Skipping push notification setup.");
      return null;
    }
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const token = await getFcmToken();

    // 1. Listen for background events
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log("[FCM Background] Background message received:", remoteMessage);
    });

    // 2. Listen for foreground notifications
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log("[FCM Foreground] Message received:", remoteMessage);
      const title = remoteMessage.notification?.title || "ForgeGym";
      const body = remoteMessage.notification?.body || "A new update is available!";
      
      // Render simple foreground alert
      Alert.alert(title, body);
    });

    // 3. Listen for token refreshes
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(newToken => {
      console.log("[FCM] Token refreshed:", newToken);
    });

    return {
      token,
      unsubscribe: () => {
        unsubscribeOnMessage();
        unsubscribeTokenRefresh();
      }
    };
  } catch (error) {
    console.warn("[FCM] Setup failed:", error);
    return null;
  }
};

// Trigger local alert notifications (Mock notifications)
export const showLocalNotification = (title: string, message: string) => {
  Alert.alert(title, message);
};
