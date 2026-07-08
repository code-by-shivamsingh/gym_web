import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getDashboardStats } from "../../services/api";

export default function MemberProgressScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const progress = stats?.goalProgress ?? 85;
  const visits = stats?.totalVisits ?? 25;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Target Metrics */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Muscle Mass Goal</Text>
        <Text style={[styles.percent, { color: colors.primary }]}>{progress}%</Text>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
        </View>
        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          You have achieved {progress}% of your total hypertrophy weight gain target.
        </Text>
      </View>

      {/* Stats Table */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Body Metrics Analysis</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Current Weight</Text>
            <Text style={[styles.metricVal, { color: colors.text }]}>74.5 kg</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Target Weight</Text>
            <Text style={[styles.metricVal, { color: colors.text }]}>80.0 kg</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Estimated Fat</Text>
            <Text style={[styles.metricVal, { color: colors.text }]}>14.2 %</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Target Fat</Text>
            <Text style={[styles.metricVal, { color: colors.text }]}>12.0 %</Text>
          </View>
        </View>
      </View>

      {/* Workout Achievements list */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Milestones & Badges</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeIcon}>🔥</Text>
          <View style={styles.badgeContent}>
            <Text style={[styles.badgeTitle, { color: colors.text }]}>Consistency Hero</Text>
            <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>Completed {visits} workouts in the gym.</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeIcon}>⚡</Text>
          <View style={styles.badgeContent}>
            <Text style={[styles.badgeTitle, { color: colors.text }]}>Active Streak</Text>
            <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>Maintained {stats?.dayStreak ?? 7} continuous days of gym attendance.</Text>
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
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  percent: {
    fontSize: 48,
    fontWeight: "900",
  },
  progressBg: {
    height: 10,
    borderRadius: 5,
    marginVertical: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16,
  },
  metricItem: {
    flex: 1,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  metricVal: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  badgeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  badgeDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
