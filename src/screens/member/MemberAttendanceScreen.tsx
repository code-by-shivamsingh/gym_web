import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getAttendanceHistory, checkInAttendance, checkOutAttendance } from "../../services/api";

interface AttendanceLog {
  _id: string;
  checkIn: string;
  checkOut: string | null;
  createdAt: string;
}

export default function MemberAttendanceScreen() {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await getAttendanceHistory();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.warn("Failed fetching attendance history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const handleCheckInOut = async (type: "in" | "out") => {
    try {
      setSubmitting(true);
      const res = type === "in" ? await checkInAttendance() : await checkOutAttendance();
      if (res.success) {
        Alert.alert("Success", type === "in" ? "Checked in successfully! 👋" : "Checked out successfully! 🏃");
        fetchAttendance();
      } else {
        Alert.alert("Action Failed", res.message || "Attendance check failed.");
      }
    } catch (err) {
      Alert.alert("Error", "Server verification failure.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderLogItem = useCallback(({ item }: { item: AttendanceLog }) => {
    const inDate = new Date(item.checkIn);
    const dateStr = inDate.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    const inTimeStr = inDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const outTimeStr = item.checkOut
      ? new Date(item.checkOut).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "Active";

    const isCurrentActive = !item.checkOut;

    return (
      <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.logLeft}>
          <Text style={[styles.logDate, { color: colors.text }]}>{dateStr}</Text>
          <Text style={[styles.logTime, { color: colors.textMuted }]}>
            In: {inTimeStr} | Out: {outTimeStr}
          </Text>
        </View>
        <View style={[
          styles.badge,
          {
            backgroundColor: isCurrentActive ? colors.primary + "20" : colors.success + "20",
            borderColor: isCurrentActive ? colors.primary : colors.success,
          }
        ]}>
          <Text style={[
            styles.badgeText,
            { color: isCurrentActive ? colors.primary : colors.success }
          ]}>
            {isCurrentActive ? "Checked In" : "Completed"}
          </Text>
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

  const isCheckedIn = logs.length > 0 && !logs[0].checkOut;

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Attendance Actions */}
        <View style={[styles.actionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>Quick Log Check-In</Text>
          <Text style={[styles.actionDesc, { color: colors.textMuted }]}>
            Record your gym visit. Remember to check out when leaving.
          </Text>

          <TouchableOpacity
            onPress={() => handleCheckInOut(isCheckedIn ? "out" : "in")}
            disabled={submitting}
            style={[
              styles.logBtn,
              { backgroundColor: isCheckedIn ? colors.accent : colors.primary }
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.logBtnText}>
                {isCheckedIn ? "CHECK OUT NOW 🏃" : "CHECK IN NOW 🏋️"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* History logs */}
        <Text style={[styles.historyTitle, { color: colors.text }]}>Attendance History</Text>
        <FlatList
          data={logs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No attendance history logs recorded yet.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  actionBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actionDesc: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  logBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  logCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  logLeft: {
    flex: 1,
  },
  logDate: {
    fontSize: 15,
    fontWeight: "bold",
  },
  logTime: {
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
