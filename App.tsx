import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";

import { store } from "./src/store/store";
import { ThemeProvider, useTheme } from "./src/utils/ThemeContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

import { initPushNotifications } from "./src/services/NotificationHandler";

const MainApp = () => {
  const { theme } = useTheme();

  React.useEffect(() => {
    let fcmUnsubscribe: any;
    initPushNotifications().then((res) => {
      if (res && res.unsubscribe) {
        fcmUnsubscribe = res.unsubscribe;
      }
    });
    return () => {
      if (fcmUnsubscribe) {
        fcmUnsubscribe();
      }
    };
  }, []);

  return (
    <>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />
      <AppNavigator />
    </>
  );
};

const linking = {
  prefixes: ["forgegym://", "https://forgegym.com"],
  config: {
    screens: {
      AuthStack: {
        path: "auth",
        screens: {
          Login: "login",
          Register: "register",
          ForgotPassword: "forgot-password",
          OtpVerification: "otp-verify",
          ResetPassword: "reset-password",
        },
      },
      AdminDashboardRoot: "admin",
      MemberDashboardRoot: {
        path: "",
        screens: {
          Payments: "payment/success",
        },
      },
    },
  },
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer linking={linking}>
          <MainApp />
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
}
