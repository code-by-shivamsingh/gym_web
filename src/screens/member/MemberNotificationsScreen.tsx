import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getUserNotifications } from "../../services/api";

interface GymNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export default function MemberNotificationsScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<GymNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await getUserNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn("Failed fetching notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "✅";
      case "warning": return "⚠️";
      case "trainer": return "💪";
      default: return "ℹ️";
    }
  };

  const renderItem = useCallback(({ item }: { item: GymNotification }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

    return (
      <View style={[styles.notificationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
          <View style={styles.headerContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>{dateStr}</Text>
          </View>
        </View>
        <Text style={[styles.messageText, { color: colors.textMuted }]}>{item.message}</Text>
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
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Your notification inbox is currently empty.
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
  },
  notificationCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 22,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 11,
    marginTop: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 34,
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
