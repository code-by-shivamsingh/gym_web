import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Linking, TextInput } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getPayments, BASE_URL } from "../../services/api";
import * as Keychain from "react-native-keychain";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface Payment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  method: string;
  status: "Pending" | "Completed" | "Failed" | "Cancelled";
  transactionId: string;
  createdAt: string;
}

export default function AdminPaymentsScreen() {
  const { colors } = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchPayments = async () => {
    try {
      const res = await getPayments();
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.warn("Failed fetching admin payments ledger:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Reset page limit when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOrder]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleDownloadInvoice = (paymentId: string, transactionId: string) => {
    Alert.alert(
      "Download Invoice",
      `Audit Invoice-${transactionId || 'GEN'}.pdf document?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Link",
          onPress: async () => {
            try {
              const credentials = await Keychain.getGenericPassword({
                service: "user_session",
              });
              const token = credentials ? credentials.password : "";
              const downloadUrl = `${BASE_URL}/api/invoices/${paymentId}?token=${encodeURIComponent(token)}`;

              const supported = await Linking.canOpenURL(downloadUrl);
              if (supported) {
                await Linking.openURL(downloadUrl);
              } else {
                // Fallback attempt to direct open link
                await Linking.openURL(downloadUrl);
              }
            } catch (err) {
              Alert.alert("Error", "Download failure.");
            }
          }
        }
      ]
    );
  };

  const renderItem = useCallback(({ item }: { item: Payment }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const isCompleted = item.status === "Completed";

    let badgeBgColor = colors.accent + "20";
    let badgeBorderColor = colors.accent;
    let badgeTextColor = colors.accent;

    if (item.status === 'Completed') {
      badgeBgColor = colors.success + "20";
      badgeBorderColor = colors.success;
      badgeTextColor = colors.success;
    } else if (item.status === 'Failed') {
      badgeBgColor = "#ef444420";
      badgeBorderColor = "#ef4444";
      badgeTextColor = "#ef4444";
    } else if (item.status === 'Cancelled') {
      badgeBgColor = "#6b728020";
      badgeBorderColor = "#6b7280";
      badgeTextColor = "#6b7280";
    } else {
      badgeBgColor = "#facc1520";
      badgeBorderColor = "#facc15";
      badgeTextColor = "#facc15";
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.txId, { color: colors.textMuted }]}>ID: {item.transactionId || item._id}</Text>
          <View style={[
            styles.badge,
            {
              backgroundColor: badgeBgColor,
              borderColor: badgeBorderColor,
            }
          ]}>
            <Text style={[styles.badgeText, { color: badgeTextColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.name, { color: colors.text }]}>{item.user?.name || "Unknown Member"}</Text>
        <Text style={[styles.email, { color: colors.textMuted }]}>{item.user?.email || "N/A"}</Text>

        <View style={styles.bodyRow}>
          <View>
            <Text style={[styles.amount, { color: colors.text }]}>₹{item.amount.toLocaleString()}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Method: {item.method} | {dateStr}</Text>
          </View>

          {isCompleted && (
            <TouchableOpacity
              onPress={() => handleDownloadInvoice(item._id, item.transactionId)}
              style={[styles.downloadBtn, { borderColor: colors.primary }]}
            >
              <Text style={[styles.downloadText, { color: colors.primary }]}>PDF 📄</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [colors]);

  // 1. Search, Filter & Sort Logic
  const filteredPayments = payments
    .filter((item) => {
      if (statusFilter !== "All" && item.status !== statusFilter) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const name = (item.user?.name || "").toLowerCase();
      const email = (item.user?.email || "").toLowerCase();
      const txnId = (item.transactionId || "").toLowerCase();
      const method = (item.method || "").toLowerCase();
      const amount = (item.amount || "").toString();
      return (
        name.includes(query) ||
        email.includes(query) ||
        txnId.includes(query) ||
        method.includes(query) ||
        amount.includes(query)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  const paginatedPayments = filteredPayments.slice(0, currentPage * recordsPerPage);
  const hasMore = filteredPayments.length > paginatedPayments.length;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search Input Box */}
      <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <MaterialIcons name="search" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search member name, email, reference ID..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1, color: colors.text, fontSize: 13, padding: 0 }}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Sorting & Filter Header */}
      <View style={styles.filterHeader}>
        <Text style={[styles.filterTitle, { color: colors.textMuted }]}>STATUS FILTERS</Text>
        <TouchableOpacity
          onPress={() => setSortOrder(p => p === "latest" ? "oldest" : "latest")}
          style={[styles.sortBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <MaterialIcons name="sort" size={14} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={{ color: colors.text, fontSize: 11, fontWeight: "bold" }}>
            {sortOrder === "latest" ? "Latest First" : "Oldest First"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Scrollable Tabs */}
      <View style={{ height: 38, marginBottom: 10 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["All", "Completed", "Pending", "Failed", "Cancelled"]}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const active = statusFilter === item;
            return (
              <TouchableOpacity
                onPress={() => setStatusFilter(item)}
                style={[
                  styles.filterTab,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary + "15" : colors.card
                  }
                ]}
              >
                <Text style={{ color: active ? colors.primary : colors.textMuted, fontSize: 11, fontWeight: "bold" }}>
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.container}>
        <FlatList
          data={paginatedPayments}
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
              No transaction records matched.
            </Text>
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                onPress={() => setCurrentPage(p => p + 1)}
                style={[styles.loadMoreBtn, { borderColor: colors.primary, backgroundColor: colors.primary + "10" }]}
              >
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "bold" }}>LOAD MORE TRANSACTIONS 🔄</Text>
              </TouchableOpacity>
            ) : null
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
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    paddingBottom: 8,
    marginBottom: 8,
  },
  txId: {
    fontSize: 11,
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
  name: {
    fontSize: 15,
    fontWeight: "bold",
  },
  email: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  bodyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  downloadBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  downloadText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterTab: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 30,
  },
  loadMoreBtn: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
});
