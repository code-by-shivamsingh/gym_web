import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Keychain from "react-native-keychain";

import { useTheme } from "../utils/ThemeContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUserProfile } from "../store/slices/userDetailsSlice";
import { getUserProfile, logoutUser } from "../services/api";

// Import Screens (Placeholder imports - screens are built in src/screens)
import OnboardingScreen from "../screens/auth/OnboardingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import OtpVerificationScreen from "../screens/auth/OtpVerificationScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";

import MemberDashboardScreen from "../screens/member/MemberDashboardScreen";
import MemberAttendanceScreen from "../screens/member/MemberAttendanceScreen";
import MemberWorkoutPlanScreen from "../screens/member/MemberWorkoutPlanScreen";
import MemberDietPlanScreen from "../screens/member/MemberDietPlanScreen";
import MemberProfileScreen from "../screens/member/MemberProfileScreen";
import MemberPaymentsScreen from "../screens/member/MemberPaymentsScreen";
import MemberNotificationsScreen from "../screens/member/MemberNotificationsScreen";
import MemberProgressScreen from "../screens/member/MemberProgressScreen";

import HomeScreen from "../screens/public/HomeScreen";
import AboutScreen from "../screens/public/AboutScreen";
import FeaturesScreen from "../screens/public/FeaturesScreen";
import ContactScreen from "../screens/public/ContactScreen";
import TrainersScreen from "../screens/public/TrainersScreen";
import GalleryScreen from "../screens/public/GalleryScreen";
import BMIScreen from "../screens/public/BMIScreen";
import MembershipScreen from "../screens/public/MembershipScreen";
import FaqScreen from "../screens/public/FaqScreen";
import OffersScreen from "../screens/public/OffersScreen";
import TrainingScreen from "../screens/public/TrainingScreen";
import ServicesScreen from "../screens/public/ServicesScreen";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminMembersScreen from "../screens/admin/AdminMembersScreen";
import AdminTrainersScreen from "../screens/admin/AdminTrainersScreen";
import AdminAttendanceScreen from "../screens/admin/AdminAttendanceScreen";
import AdminPaymentsScreen from "../screens/admin/AdminPaymentsScreen";
import AdminReportsScreen from "../screens/admin/AdminReportsScreen";
import AdminSettingsScreen from "../screens/admin/AdminSettingsScreen";

// TypeScript Parameter Lists for Type-Safe Navigation
export type AuthStackParamList = {
  Login: undefined;
  Register: { plan?: string } | undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
  ResetPassword: { token: string };
};

export type RootStackParamList = {
  Onboarding: undefined;
  AuthStack: {
    screen?: keyof AuthStackParamList;
    params?: AuthStackParamList[keyof AuthStackParamList];
  } | undefined;
  AdminDashboardRoot: undefined;
  MemberDashboardRoot: undefined;
};

// Stacks Initialization with Type Safety
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthSubStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Layout to Render Profiles and Role status
const CustomDrawerContent: React.FC<any> = (props) => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.userDetails.userProfile);

  const handleLogout = async () => {
    await logoutUser();
    dispatch(setUserProfile(null));
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors.background }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 10 }}>
        <Text style={{ color: colors.primary, fontSize: 22, fontWeight: "900", letterSpacing: 1.5 }}>
          FORGEGYM
        </Text>
        {profile && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "bold" }}>{profile.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{profile.email}</Text>
            <View style={{
              backgroundColor: profile.role === "Admin" ? colors.accent + "20" : colors.primary + "20",
              alignSelf: "flex-start",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginTop: 8,
              borderWidth: 1,
              borderColor: profile.role === "Admin" ? colors.accent : colors.primary,
            }}>
              <Text style={{
                color: profile.role === "Admin" ? colors.accent : colors.primary,
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase"
              }}>
                {profile.role}
              </Text>
            </View>
          </View>
        )}
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        labelStyle={{ color: colors.accent, fontWeight: "bold" }}
        onPress={handleLogout}
        icon={({ size }) => <MaterialIcons name="logout" color={colors.accent} size={size} />}
      />
    </DrawerContentScrollView>
  );
};

// Bottom Tabs Navigator for Members
const MemberTabNavigator = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="DashboardHome"
        component={MemberDashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TrainersTab"
        component={TrainersScreen}
        options={{
          tabBarLabel: "Trainers",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="weight-lifter" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="BMITab"
        component={BMIScreen}
        options={{
          tabBarLabel: "BMI",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calculator" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="GalleryTab"
        component={GalleryScreen}
        options={{
          tabBarLabel: "Gallery",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="photo-library" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="MembershipTab"
        component={MembershipScreen}
        options={{
          tabBarLabel: "Plans",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="payment" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Drawer Navigator for Members
const MemberDrawerNavigator = () => {
  const { colors } = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTintColor: colors.text,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        drawerStyle: { backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen
        name="MainPortal"
        component={MemberTabNavigator}
        options={{
          title: "Forge Gym Portal",
          drawerLabel: "Home Dashboard",
          drawerIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={MemberProfileScreen}
        options={{
          title: "My Profile",
          drawerIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Attendance"
        component={MemberAttendanceScreen}
        options={{
          title: "Attendance Log",
          drawerIcon: ({ color, size }) => <MaterialIcons name="date-range" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="WorkoutPlan"
        component={MemberWorkoutPlanScreen}
        options={{
          title: "Workout Schedule",
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="run" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="DietPlan"
        component={MemberDietPlanScreen}
        options={{
          title: "Nutrition Plan",
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="food-apple" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Payments"
        component={MemberPaymentsScreen}
        options={{
          title: "Billing & Invoices",
          drawerIcon: ({ color, size }) => <MaterialIcons name="receipt-long" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={MemberNotificationsScreen}
        options={{
          title: "Inbox Notifications",
          drawerIcon: ({ color, size }) => <MaterialIcons name="notifications" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Progress"
        component={MemberProgressScreen}
        options={{
          title: "Body Progress Tracker",
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-bell-curve-cumulative" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AboutWeb"
        component={AboutScreen}
        options={{
          title: "About Forge Gym",
          drawerIcon: ({ color, size }) => <MaterialIcons name="info" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="FeaturesWeb"
        component={FeaturesScreen}
        options={{
          title: "Features & Amenities",
          drawerIcon: ({ color, size }) => <MaterialIcons name="star" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="ContactWeb"
        component={ContactScreen}
        options={{
          title: "Contact & Support",
          drawerIcon: ({ color, size }) => <MaterialIcons name="contact-support" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="TrainingWeb"
        component={TrainingScreen}
        options={{
          title: "Training Tracks",
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="weight-lifter" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="OffersWeb"
        component={OffersScreen}
        options={{
          title: "Promotions & Offers",
          drawerIcon: ({ color, size }) => <MaterialIcons name="local-offer" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="FaqWeb"
        component={FaqScreen}
        options={{
          title: "Frequently Asked Questions",
          drawerIcon: ({ color, size }) => <MaterialIcons name="help-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="ServicesWeb"
        component={ServicesScreen}
        options={{
          title: "Core Services",
          drawerIcon: ({ color, size }) => <MaterialIcons name="design-services" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
};

// Drawer Navigator for Admin
const AdminDrawerNavigator = () => {
  const { colors } = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTintColor: colors.text,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        drawerStyle: { backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Dashboard Overview",
          drawerIcon: ({ color, size }) => <MaterialIcons name="admin-panel-settings" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminMembers"
        component={AdminMembersScreen}
        options={{
          title: "Member Management",
          drawerIcon: ({ color, size }) => <MaterialIcons name="group" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminTrainers"
        component={AdminTrainersScreen}
        options={{
          title: "Trainer Directory",
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminAttendance"
        component={AdminAttendanceScreen}
        options={{
          title: "Attendance Reports",
          drawerIcon: ({ color, size }) => <MaterialIcons name="fact-check" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminPayments"
        component={AdminPaymentsScreen}
        options={{
          title: "Revenue Ledger",
          drawerIcon: ({ color, size }) => <MaterialIcons name="account-balance-wallet" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{
          title: "Analytics Graphs",
          drawerIcon: ({ color, size }) => <MaterialIcons name="analytics" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{
          title: "System Settings",
          drawerIcon: ({ color, size }) => <MaterialIcons name="settings" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
};

// Nested Authentication Stack Navigator
const AuthStackNavigator = () => {
  return (
    <AuthSubStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthSubStack.Screen name="Login" component={LoginScreen} />
      <AuthSubStack.Screen name="Register" component={RegisterScreen} />
      <AuthSubStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthSubStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <AuthSubStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthSubStack.Navigator>
  );
};

// Root Stack Navigator
export const AppNavigator = () => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((state) => state.userDetails.userProfile);

  console.log("Inside AppNavigator, userProfile:", userProfile ? userProfile.role : "null");

  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const bootstrapApp = async () => {
      try {
        // 1. Check if Onboarding is complete
        const onboardedVal = await AsyncStorage.getItem("onboarded");
        setOnboarded(onboardedVal === "true");

        // 2. Validate session credentials in secure storage
        const credentials = await Keychain.getGenericPassword({
          service: "user_session",
        });

        if (credentials) {
          console.log("Keychain token exists:", credentials.password.substring(0, 10) + "...");
          const res = await getUserProfile();
          if (res.success && res.data) {
            dispatch(setUserProfile(res.data));
            console.log("After Redux dispatch in bootstrapApp, Redux User:", res.data);
          } else {
            await Keychain.resetGenericPassword({ service: "user_session" });
          }
        } else {
          console.log("No Keychain token found");
        }
      } catch (err) {
        console.warn("Bootstrap navigation state failed:", err);
      } finally {
        setLoading(false);
      }
    };
    bootstrapApp();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: 14 }}>Loading session...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. Onboarding Screen */}
      {!onboarded && (
        <Stack.Screen name="Onboarding">
          {(props: any) => <OnboardingScreen {...props} onFinish={() => setOnboarded(true)} />}
        </Stack.Screen>
      )}

      {/* Conditional Dashboard or Authentication Navigation */}
      {userProfile ? (
        userProfile.role === "Admin" ? (
          <Stack.Screen name="AdminDashboardRoot" component={AdminDrawerNavigator} />
        ) : (
          <Stack.Screen name="MemberDashboardRoot" component={MemberDrawerNavigator} />
        )
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
};
