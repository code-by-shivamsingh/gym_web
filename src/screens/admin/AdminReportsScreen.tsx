import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getReportsStats } from "../../services/api";

interface BreakdownItem {
  month: string;
  revenue: number;
}

export default function AdminReportsScreen() {
  const { colors } = useTheme();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await getReportsStats();
      if (res.success) {
        setReport(res.data);
      }
      setLoading(false);
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalMembers = report?.totalMembers ?? 0;
  const activeMembers = report?.activeMembers ?? 0;
  const totalRevenue = report?.totalRevenue ?? 0;
  const monthlyTarget = report?.monthlyTarget ?? 700000;
  const progressPercent = report?.progressPercent ?? 75;
  const breakdown: BreakdownItem[] = report?.breakdown || [];

  // Find max revenue for bar scaling
  const maxRevenue = breakdown.length > 0 ? Math.max(...breakdown.map((b) => b.revenue)) : 100000;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Target Progress Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Hypertrophy Target Report</Text>
        <Text style={[styles.amount, { color: colors.primary }]}>₹{totalRevenue.toLocaleString()}</Text>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>Target: ₹{monthlyTarget.toLocaleString()}</Text>
          <Text style={[styles.metaVal, { color: colors.success }]}>{progressPercent}%</Text>
        </View>
      </View>

      {/* Stats Summary Grid */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryVal, { color: colors.text }]}>{totalMembers}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Registered Members</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryVal, { color: colors.success }]}>{activeMembers}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Active Subscriptions</Text>
        </View>
      </View>

      {/* Monthly Bar chart */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Revenue Breakdown (Monthly)</Text>
        
        {breakdown.length > 0 ? (
          <View style={styles.chartContainer}>
            <View style={styles.barContainer}>
              {breakdown.map((item, idx) => {
                // Calculate height percentage relative to maximum revenue
                const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * 120 : 10;
                return (
                  <View key={idx} style={styles.barWrapper}>
                    <View style={styles.barOuter}>
                      <View style={[styles.barInner, { height: barHeight, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.textMuted }]}>{item.month}</Text>
                  </View>
                );
              })}
            </View>

            {/* List breakdown */}
            <View style={styles.list}>
              {breakdown.map((item, idx) => (
                <View key={idx} style={[styles.listItem, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.listLabel, { color: colors.text }]}>{item.month} Revenue</Text>
                  <Text style={[styles.listVal, { color: colors.success }]}>₹{item.revenue.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No chart breakdown data available.</Text>
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
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amount: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 12,
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
  },
  metaText: {
    fontSize: 12,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: "bold",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  summaryVal: {
    fontSize: 24,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  chartContainer: {
    marginTop: 20,
  },
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 160,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    paddingBottom: 4,
  },
  barWrapper: {
    alignItems: "center",
  },
  barOuter: {
    width: 24,
    height: 120,
    backgroundColor: "#18181b",
    borderRadius: 4,
    justifyContent: "flex-end",
  },
  barInner: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: "bold",
  },
  list: {
    marginTop: 10,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listLabel: {
    fontSize: 14,
  },
  listVal: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
});
