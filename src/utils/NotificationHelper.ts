import firebase from "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import { Alert, Platform } from "react-native";

/**
 * Request permission and initialize Firebase Cloud Messaging push handlers
 */
export const initPushNotifications = async () => {
  try {
    if (!firebase.apps.length) {
      console.log("[FCM] Firebase is not initialized (google-services.json may be missing). Skipping push notification setup.");
      return null;
    }
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("[FCM] Push Notification permission granted. Authorization status:", authStatus);
      
      // Get FCM token
      const token = await messaging().getToken();
      console.log("[FCM] Retrieve Device Token:", token);
      // In production, we'd save this token to the user model on the server
      
      // Handle foreground push messages
      const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
        console.log("[FCM] Foreground notification received:", remoteMessage);
        Alert.alert(
          remoteMessage.notification?.title || "Forge Gym Notification",
          remoteMessage.notification?.body || "Check out today's recommendations!"
        );
      });

      // Handle notification clicks (app in background)
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log("[FCM] Notification opened from background:", remoteMessage);
      });

      // Handle notification clicks (app was closed/quit state)
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log("[FCM] Notification opened from quit state:", remoteMessage);
          }
        });

      return {
        token,
        unsubscribe: () => {
          unsubscribeOnMessage();
        }
      };
    } else {
      console.log("[FCM] Notification permission denied.");
    }
  } catch (err) {
    console.warn("FCM registration failed:", err);
  }
  return null;
};
