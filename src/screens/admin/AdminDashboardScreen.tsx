import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { useAppSelector } from "../../store/hooks";
import { getDashboardStats } from "../../services/api";

const { width } = Dimensions.get("window");

export default function AdminDashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const profile = useAppSelector((state) => state.userDetails.userProfile);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn("Failed loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalMembers = stats?.totalMembers ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;
  const totalTrainers = stats?.totalTrainers ?? 0;
  const attendanceRate = stats?.attendanceRate ?? 92;
  const recentMembers = stats?.recentMembers || [];

  const target = 700000;
  const revenuePercent = monthlyRevenue ? Math.min(Math.round((monthlyRevenue / target) * 100), 100) : 75;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Admin Dashboard</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Welcome back, {profile?.name || "Gym Owner"} 👋
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: colors.primary }]}>{totalMembers}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Members</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: colors.success }]}>₹{monthlyRevenue.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Monthly Revenue</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: colors.secondary }]}>{totalTrainers}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Trainers</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: colors.accent }]}>{attendanceRate}%</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Attendance Rate</Text>
        </View>
      </View>

      {/* Revenue Progress */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Revenue Target Target</Text>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.success, width: `${revenuePercent}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={[styles.progressMeta, { color: colors.textMuted }]}>Target: ₹{target.toLocaleString()}</Text>
          <Text style={[styles.progressVal, { color: colors.success }]}>{revenuePercent}% Reached</Text>
        </View>
      </View>

      {/* Quick Action Navigation */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          onPress={() => navigation.navigate("AdminMembers")}
          style={[styles.quickBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.quickText}>👥 Members Panel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("AdminTrainers")}
          style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.quickText, { color: colors.text }]}>💪 Trainers List</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Signups */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Recent Signups</Text>
        {recentMembers.length > 0 ? (
          <View style={styles.list}>
            {recentMembers.map((member: any, idx: number) => {
              const dateStr = new Date(member.createdAt || member.joinedDate || Date.now()).toLocaleDateString();
              return (
                <View key={member._id || idx} style={[styles.listItem, { borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={[styles.listName, { color: colors.text }]}>{member.name}</Text>
                    <Text style={[styles.listMeta, { color: colors.textMuted }]}>{member.plan} Plan | {dateStr}</Text>
                  </View>
                  <View style={[
                    styles.badge,
                    {
                      backgroundColor: member.status === "Active" ? colors.success + "20" : colors.accent + "20",
                      borderColor: member.status === "Active" ? colors.success : colors.accent,
                    }
                  ]}>
                    <Text style={[styles.badgeText, { color: member.status === "Active" ? colors.success : colors.accent }]}>
                      {member.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No member signups recorded yet.</Text>
        )}
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
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
  statVal: {
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBg: {
    height: 10,
    borderRadius: 5,
    marginVertical: 14,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressMeta: {
    fontSize: 12,
  },
  progressVal: {
    fontSize: 13,
    fontWeight: "bold",
  },
  quickGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  quickBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  quickText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  listMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
});
