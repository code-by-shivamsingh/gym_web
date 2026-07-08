import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getAdminAttendanceOverview } from "../../services/api";

interface AttendanceOverviewItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
  };
  checkIn: string;
  checkOut: string | null;
}

export default function AdminAttendanceScreen() {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<AttendanceOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await getAdminAttendanceOverview();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.warn("Failed fetching attendance overview:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  const renderItem = useCallback(({ item }: { item: AttendanceOverviewItem }) => {
    const inDate = new Date(item.checkIn);
    const dateStr = inDate.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    const inTimeStr = inDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const outTimeStr = item.checkOut
      ? new Date(item.checkOut).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "Active";

    const isCurrentActive = !item.checkOut;

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.left}>
          <Text style={[styles.name, { color: colors.text }]}>{item.user?.name || "Unknown Member"}</Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>{item.user?.email || "N/A"}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            In: {inTimeStr} | Out: {outTimeStr}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.dateText, { color: colors.primary }]}>{dateStr}</Text>
          <View style={[
            styles.badge,
            {
              backgroundColor: isCurrentActive ? colors.primary + "15" : colors.success + "15",
              borderColor: isCurrentActive ? colors.primary : colors.success
            }
          ]}>
            <Text style={[
              styles.badgeText,
              { color: isCurrentActive ? colors.primary : colors.success }
            ]}>
              {isCurrentActive ? "Active" : "Done"}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [colors]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, fontStyle: "italic", textAlign: "center", padding: 40 }}>
              No check-in logs registered.
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  left: {
    flex: 1.2,
  },
  right: {
    flex: 0.8,
    alignItems: "flex-end",
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
  },
  email: {
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    marginTop: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "bold",
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
    textTransform: "uppercase",
  },
});
