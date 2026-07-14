import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform, PermissionsAndroid } from "react-native";
import Geolocation from "react-native-geolocation-service";
import { useTheme } from "../../utils/ThemeContext";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { 
  getUserProfile, 
  getDashboardStats, 
  getTodayRecommendedWorkout, 
  logLocationTelemetry, 
  getCurrentAttendanceStatus 
} from "../../services/api";
import { setUserProfile } from "../../store/slices/userDetailsSlice";
import { setActiveSession } from "../../store/slices/attendanceSlice";

const { width } = Dimensions.get("window");

export default function MemberDashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.userDetails.userProfile);

  const [stats, setStats] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTelemetry = async () => {
    try {
      console.log("[Dashboard GPS] Initiating foreground location check...");
      if (Platform.OS === "android") {
        let hasFineLocation = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (!hasFineLocation) {
          console.log("[Dashboard GPS] Foreground ACCESS_FINE_LOCATION not granted. Requesting permission...");
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "ForgeGym Location Access Permission",
              message: "ForgeGym needs access to your GPS coordinate to log automated check-in details when arriving at the gym.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn("[Dashboard GPS] Foreground location permission denied by user. Skipping telemetry sync.");
            return;
          }
          hasFineLocation = true;
        }
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          if (!position || !position.coords) {
            console.warn("[Dashboard GPS] Empty position coordinates received.");
            return;
          }
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`[Dashboard GPS] Foreground Location acquired: Lat: ${latitude}, Lon: ${longitude}, Acc: ${accuracy}m`);
          
          try {
            console.log("[Dashboard GPS] Sending location telemetry to API...");
            const res = await logLocationTelemetry(latitude, longitude, accuracy);
            if (res.success && res.data) {
              console.log(`[Dashboard GPS] Telemetry update succeeded. Gym: ${res.data.gymName}, Distance: ${res.data.distance}m`);
              setTelemetry(res.data);
              // Refresh stats to ensure check-in UI is synced
              const statsRes = await getDashboardStats();
              if (statsRes.success) setStats(statsRes.data);
            } else {
              console.warn(`[Dashboard GPS] Telemetry post rejected (Code: ${res.message})`);
            }
          } catch (err: any) {
            console.warn("[Dashboard GPS] Telemetry update failed during API call:", err.message || err);
          }
        },
        (err) => {
          console.warn("[Dashboard GPS] Foreground location fetch failed:", err.message);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true 
        }
      );
    } catch (error) {
      console.error("[Dashboard GPS] Error in fetchTelemetry:", error);
    }
  };

  const loadData = async () => {
    try {
      const [profileRes, statsRes, workoutRes, attendanceRes] = await Promise.all([
        getUserProfile(),
        getDashboardStats(),
        getTodayRecommendedWorkout(),
        getCurrentAttendanceStatus()
      ]);

      if (profileRes.success && profileRes.data) {
        dispatch(setUserProfile(profileRes.data));
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (workoutRes.success) {
        setWorkout(workoutRes.data);
      }
      if (attendanceRes.success && attendanceRes.data) {
        setTelemetry(attendanceRes.data);
      }

      fetchTelemetry();
    } catch (err) {
      console.warn("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Add screen focus listener to refresh data
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayName = profile?.name || "Member";
  const visits = stats?.totalVisits ?? 0;
  const streak = stats?.dayStreak ?? 0;
  const progress = stats?.goalProgress ?? 0;
  const membershipPlan = stats?.membership ?? "Basic";
  const isCheckedIn = telemetry?.isCheckedIn ?? stats?.isCheckedIn ?? false;
  const distance = telemetry?.distance ?? null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Dynamic GPS & Welcome Banner */}
        <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.heroWelcome}>Welcome Back, {displayName} 👋</Text>
          <Text style={styles.heroSubText}>Stay consistent. Every workout brings you closer to your goal.</Text>
          
          <View style={[styles.gpsBadgeCard, { backgroundColor: colors.black, flexDirection: "column", alignItems: "flex-start", gap: 10 }]}>
            <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "900" }}>
                {telemetry?.gymName || "FORGE Fitness & Fuel"}
              </Text>
              <TouchableOpacity
                onPress={loadData}
                style={[styles.gpsRefreshBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.gpsRefreshText}>🔄 CHECK</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.gpsBadgeText, { color: isCheckedIn ? colors.success : colors.accent, fontSize: 15 }]}>
              {isCheckedIn ? "🟢 Inside Gym" : "🔴 Outside Gym"}
            </Text>

            <View style={{ marginTop: 2 }}>
              <Text style={{ color: "#a1a1aa", fontSize: 12 }}>Distance:</Text>
              <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "bold", marginTop: 2 }}>
                {distance !== null ? `${distance} meters` : "Determining..."}
              </Text>
            </View>

            <View style={{ marginTop: 2 }}>
              <Text style={{ color: "#a1a1aa", fontSize: 12 }}>Attendance:</Text>
              <Text style={{ color: isCheckedIn ? colors.success : colors.accent, fontSize: 15, fontWeight: "bold", marginTop: 2 }}>
                {isCheckedIn ? "Auto Checked-In" : "Auto Checked-Out"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{visits}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Visits</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>{progress}%</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Goal Progress</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.accent, fontSize: 20 }]}>{membershipPlan}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Membership</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Attendance")}
              style={[styles.actionCell, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.actionCellText}>📅 Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("WorkoutPlan")}
              style={[styles.actionCell, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.actionCellText, { color: colors.text }]}>🏋️ Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("DietPlan")}
              style={[styles.actionCell, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.actionCellText, { color: colors.text }]}>🥗 Diet Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Payments")}
              style={[styles.actionCell, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.actionCellText, { color: colors.text }]}>💳 Billing</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Workout */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={[styles.sectionCardTitle, { color: colors.text, marginBottom: 0 }]}>Today's Workout</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate("WorkoutPlan")}
              style={{ backgroundColor: colors.primary + "20", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}
            >
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "bold" }}>▶ START ROUTINE</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.workoutTitle, { color: colors.primary }]}>
            {workout?.isBeginner ? `🔰 Beginner Program - ${workout?.day}` : `🤖 AI 추천 Split - ${workout?.day}`}
          </Text>

          {workout?.workout && workout.workout.length > 0 ? (
            <View style={styles.exerciseList}>
              {workout.workout.map((ex: any, idx: number) => (
                <View key={idx} style={styles.exerciseItem}>
                  <Text style={styles.checkIcon}>{ex.completed ? "✅" : "⬜"}</Text>
                  <Text style={[styles.exerciseText, { color: colors.textMuted, textDecorationLine: ex.completed ? "line-through" : "none" }]}>
                    {ex.title} - {ex.duration} Mins ({ex.category})
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No exercise videos assigned for today. Follow recovery programs.
            </Text>
          )}
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressRow}>
          <View style={[styles.halfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.halfCardTitle, { color: colors.text }]}>Attendance Target</Text>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { backgroundColor: colors.primary, width: `${Math.min((visits / 30) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              {visits} / 30 Days this month
            </Text>
          </View>

          <View style={[styles.halfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.halfCardTitle, { color: colors.text }]}>Body Target</Text>
            <Text style={[styles.percentValue, { color: colors.success }]}>{progress}%</Text>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Muscle Mass Progress</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionCardTitle, { color: colors.text }]}>Achievements 🏆</Text>
          <View style={styles.achievementsRow}>
            <View style={[styles.badge, { backgroundColor: colors.background }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>🏅 {streak} Day Streak</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.background }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>💪 {visits} Gym Hits</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.background }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>🔥 Goal Progress {progress}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heroBanner: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  heroWelcome: {
    color: "#000000",
    fontSize: 26,
    fontWeight: "900",
  },
  heroSubText: {
    color: "#1f2937",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  gpsBadgeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  badgeLeft: {
    flex: 1,
  },
  gpsBadgeText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  gpsDistanceText: {
    color: "#a1a1aa",
    fontSize: 12,
    marginTop: 4,
  },
  gpsRefreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gpsRefreshText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionCell: {
    width: (width - 42) / 2,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  actionCellText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  exerciseList: {
    marginTop: 4,
    gap: 8,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  exerciseText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  progressRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  halfCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    minHeight: 110,
  },
  halfCardTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 11,
  },
  percentValue: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  achievementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
