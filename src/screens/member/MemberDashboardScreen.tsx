import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { getUserProfile, getDashboardStats, getWorkoutPlans, checkInAttendance, checkOutAttendance } from "../../services/api";
import { setUserProfile } from "../../store/slices/userDetailsSlice";
import { setActiveSession } from "../../store/slices/attendanceSlice";

const { width } = Dimensions.get("window");

export default function MemberDashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.userDetails.userProfile);

  const [stats, setStats] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const loadData = async () => {
    try {
      const [profileRes, statsRes, workoutRes] = await Promise.all([
        getUserProfile(),
        getDashboardStats(),
        getWorkoutPlans(),
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
    } catch (err) {
      console.warn("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAttendanceAction = async () => {
    if (!stats) return;
    try {
      setChecking(true);
      if (stats.isCheckedIn) {
        const res = await checkOutAttendance();
        if (res.success) {
          dispatch(setActiveSession(null));
          loadData();
        }
      } else {
        const res = await checkInAttendance();
        if (res.success) {
          dispatch(setActiveSession(res.data));
          loadData();
        }
      }
    } catch (err) {
      console.warn("Failed attendance action:", err);
    } finally {
      setChecking(false);
    }
  };

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
  const isCheckedIn = stats?.isCheckedIn ?? false;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Hero Welcome Banner */}
      <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
        <Text style={styles.heroWelcome}>Welcome Back, {displayName} 👋</Text>
        <Text style={styles.heroSubText}>Stay consistent. Every workout brings you closer to your goal.</Text>
        
        <View style={styles.heroBtnContainer}>
          <TouchableOpacity
            onPress={handleAttendanceAction}
            disabled={checking}
            style={[styles.heroBtn, { backgroundColor: colors.black }]}
          >
            {checking ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={[styles.heroBtnText, { color: colors.white }]}>
                {isCheckedIn ? "📅 CHECK OUT" : "📅 CHECK IN"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={[styles.heroBtn, { backgroundColor: colors.white }]}
          >
            <Text style={[styles.heroBtnText, { color: colors.black }]}>👤 PROFILE</Text>
          </TouchableOpacity>
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
        <Text style={[styles.sectionCardTitle, { color: colors.text }]}>Today's Workout</Text>
        <Text style={[styles.workoutTitle, { color: colors.primary }]}>
          {workout?.title || "Custom Gym Routine"}
        </Text>
        {workout?.exercises && workout.exercises.length > 0 ? (
          <View style={styles.exerciseList}>
            {workout.exercises.map((ex: any, idx: number) => (
              <View key={idx} style={styles.exerciseItem}>
                <Text style={styles.checkIcon}>{ex.done ? "✅" : "⬜"}</Text>
                <Text style={[styles.exerciseText, { color: colors.textMuted }]}>
                  {ex.name} - {ex.sets} Sets {ex.reps ? `x ${ex.reps} Reps` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No exercises assigned yet. Follow your standard weekly schedule.
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
  heroBtnContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  heroBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  exerciseList: {
    marginTop: 8,
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
    fontSize: 14,
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
