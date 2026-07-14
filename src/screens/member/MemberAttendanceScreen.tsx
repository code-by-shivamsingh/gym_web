import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getAttendanceHistory, checkInAttendance, checkOutAttendance, getCurrentAttendanceStatus } from "../../services/api";

interface AttendanceLog {
  _id: string;
  checkIn: string;
  checkOut: string | null;
  totalDuration?: number;
  status?: string;
  source?: string;
  createdAt: string;
}

export default function MemberAttendanceScreen() {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [currentStatus, setCurrentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = async () => {
    try {
      const [historyRes, statusRes] = await Promise.all([
        getAttendanceHistory(),
        getCurrentAttendanceStatus()
      ]);

      if (historyRes.success && historyRes.data) {
        setLogs(historyRes.data);
      }
      if (statusRes.success) {
        setCurrentStatus(statusRes.data);
      }
    } catch (err) {
      console.warn("Failed fetching attendance details:", err);
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

  const handleCheckInOut = async () => {
    const isCheckedIn = currentStatus?.isCheckedIn ?? false;
    try {
      setSubmitting(true);
      const res = isCheckedIn ? await checkOutAttendance() : await checkInAttendance();
      if (res.success) {
        Alert.alert("Success", !isCheckedIn ? "Checked in successfully! 👋" : "Checked out successfully! 🏃");
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
    const isGps = item.source === "Automatic GPS";

    return (
      <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.logLeft}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[styles.logDate, { color: colors.text }]}>{dateStr}</Text>
            {isGps && (
              <View style={[styles.gpsTag, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                <Text style={[styles.gpsTagText, { color: colors.primary }]}>📍 GPS</Text>
              </View>
            )}
          </View>
          <Text style={[styles.logTime, { color: colors.textMuted }]}>
            In: {inTimeStr} | Out: {outTimeStr}
          </Text>
          {item.totalDuration !== undefined && item.totalDuration > 0 && (
            <Text style={[styles.durationText, { color: colors.textMuted }]}>
              ⏱️ Duration: {item.totalDuration} mins
            </Text>
          )}
        </View>
        <View style={[
          styles.badge,
          {
            backgroundColor: isCurrentActive ? colors.primary + "15" : colors.success + "15",
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

  const isCheckedIn = currentStatus?.isCheckedIn ?? false;
  const totalDays = logs.length;
  const monthlyRate = Math.round(Math.min((totalDays / 20) * 100, 100)); // target 20 sessions/month
  const totalMinutes = logs.reduce((sum, item) => sum + (item.totalDuration || 0), 0);
  const workoutHours = (totalMinutes / 60).toFixed(1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Attendance Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.metricTitle, { color: colors.textMuted }]}>Total Days</Text>
            <Text style={[styles.metricValue, { color: colors.primary }]}>{totalDays} Days</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.metricTitle, { color: colors.textMuted }]}>Monthly Rate</Text>
            <Text style={[styles.metricValue, { color: colors.success }]}>{monthlyRate}%</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.metricTitle, { color: colors.textMuted }]}>Workout Hours</Text>
            <Text style={[styles.metricValue, { color: colors.secondary }]}>{workoutHours} hrs</Text>
          </View>
        </View>

        {/* Manual Fallback Action Box */}
        <View style={[styles.actionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>Gym Manual Log Option</Text>
          <Text style={[styles.actionDesc, { color: colors.textMuted }]}>
            If automated background GPS check-in fails, log manually here.
          </Text>

          <TouchableOpacity
            onPress={handleCheckInOut}
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
        <Text style={[styles.historyTitle, { color: colors.text }]}>Check-In History</Text>
        
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
                No check-in logs recorded yet.
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
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  actionBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 14,
  },
  logBtn: {
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logBtnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  logCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  logLeft: {
    flex: 1,
  },
  logDate: {
    fontSize: 14,
    fontWeight: "bold",
  },
  gpsTag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  gpsTagText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  logTime: {
    fontSize: 12,
    marginTop: 4,
  },
  durationText: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
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
