import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, FlatList, ScrollView } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getAllMembers, createMember, updateMember, deleteMember, getTrainers, assignMembersToTrainer } from "../../services/api";

interface Member {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  plan: "Basic" | "Premium" | "Elite";
  status: "Active" | "Expired";
  trainer?: {
    _id: string;
    name: string;
  } | null;
}

export default function AdminMembersScreen() {
  const { colors } = useTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [plan, setPlan] = useState("Basic");
  const [status, setStatus] = useState("Active");
  const [submitting, setSubmitting] = useState(false);

  // Trainer Assign States
  const [trainerModalVisible, setTrainerModalVisible] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [membersRes, trainersRes] = await Promise.all([
        getAllMembers(),
        getTrainers(),
      ]);
      if (membersRes.success && membersRes.data) {
        setMembers(membersRes.data);
      }
      if (trainersRes.success && trainersRes.data) {
        setTrainers(trainersRes.data);
      }
    } catch (err) {
      console.warn("Failed fetching members listing:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setMobile("");
    setPlan("Basic");
    setStatus("Active");
    setModalVisible(true);
  };

  const openEditModal = (member: Member) => {
    setEditingId(member._id);
    setName(member.name);
    setEmail(member.email);
    setMobile(member.mobile);
    setPlan(member.plan);
    setStatus(member.status);
    setModalVisible(true);
  };

  const handleSaveMember = async () => {
    if (!name || !email || !mobile) {
      Alert.alert("Error", "Please fill in all inputs.");
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await updateMember(editingId, { name, email, mobile, plan, status });
      } else {
        res = await createMember({ name, email, mobile, plan });
      }

      if (res.success) {
        Alert.alert("Success", editingId ? "Member updated successfully." : "Member created successfully.");
        setModalVisible(false);
        loadData();
      } else {
        Alert.alert("Action Failed", res.message || "Failed to save member details.");
      }
    } catch (err) {
      Alert.alert("Error", "Server submission failure.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = (id: string, memberName: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete member ${memberName}? This will also delete their credentials.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await deleteMember(id);
              if (res.success) {
                Alert.alert("Deleted", "Member removed successfully.");
                loadData();
              } else {
                Alert.alert("Error", res.message || "Failed to delete member.");
              }
            } catch (err) {
              Alert.alert("Error", "Server delete failure.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openTrainerAssign = (memberId: string) => {
    setSelectedMemberId(memberId);
    setTrainerModalVisible(true);
  };

  const handleAssignTrainer = async (trainerId: string) => {
    if (!selectedMemberId) return;
    try {
      setLoading(true);
      setTrainerModalVisible(false);
      const res = await assignMembersToTrainer(trainerId, [selectedMemberId]);
      if (res.success) {
        Alert.alert("Assigned", "Trainer assigned successfully to member.");
        loadData();
      } else {
        Alert.alert("Error", res.message || "Assignment failed.");
      }
    } catch (err) {
      Alert.alert("Error", "Trainer assign failure.");
    } finally {
      setLoading(false);
      setSelectedMemberId(null);
    }
  };

  const renderMemberItem = useCallback(({ item }: { item: Member }) => {
    return (
      <View style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.memberName, { color: colors.text }]}>{item.name}</Text>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === "Active" ? colors.success + "20" : colors.accent + "20",
              borderColor: item.status === "Active" ? colors.success : colors.accent,
            }
          ]}>
            <Text style={[styles.statusText, { color: item.status === "Active" ? colors.success : colors.accent }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.email, { color: colors.textMuted }]}>{item.email} | {item.mobile}</Text>
        
        <View style={styles.planTrainerRow}>
          <Text style={[styles.metaVal, { color: colors.primary, fontWeight: "bold" }]}>
            Plan: {item.plan}
          </Text>
          <Text style={[styles.metaVal, { color: colors.textMuted }]}>
            Trainer: {item.trainer?.name || "Unassigned"}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => openTrainerAssign(item._id)}
            style={[styles.actionBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Assign Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={[styles.actionBtn, { borderColor: colors.success }]}
          >
            <Text style={[styles.actionBtnText, { color: colors.success }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteMember(item._id, item.name)}
            style={[styles.actionBtn, { borderColor: colors.accent }]}
          >
            <Text style={[styles.actionBtnText, { color: colors.accent }]}>Delete</Text>
          </TouchableOpacity>
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
        {/* Search & Actions Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Gym Members ({members.length})</Text>
          <TouchableOpacity
            onPress={openAddModal}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.addBtnText}>+ Add Member</Text>
          </TouchableOpacity>
        </View>

        {/* Performant list */}
        <View style={{ flex: 1, minHeight: 200 }}>
          <FlatList
            data={members}
            renderItem={renderMemberItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
          />
        </View>

      {/* CRUD Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingId ? "Edit Member" : "New Member signup"}
            </Text>

            <ScrollView style={{ maxHeight: 350 }}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Mobile</Text>
                <TextInput
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Select Plan</Text>
                <View style={styles.planRow}>
                  {["Basic", "Premium", "Elite"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPlan(p)}
                      style={[
                        styles.planSelectBtn,
                        {
                          borderColor: plan === p ? colors.primary : colors.border,
                          backgroundColor: plan === p ? colors.primary + "15" : colors.background,
                        }
                      ]}
                    >
                      <Text style={{ color: plan === p ? colors.primary : colors.textMuted }}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {editingId && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Select status</Text>
                  <View style={styles.planRow}>
                    {["Active", "Expired"].map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setStatus(s)}
                        style={[
                          styles.planSelectBtn,
                          {
                            borderColor: status === s ? colors.primary : colors.border,
                            backgroundColor: status === s ? colors.primary + "15" : colors.background,
                          }
                        ]}
                      >
                        <Text style={{ color: status === s ? colors.primary : colors.textMuted }}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveMember}
                disabled={submitting}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                {submitting ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.modalBtnText}>SAVE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Trainer Assign Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={trainerModalVisible}
        onRequestClose={() => setTrainerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, maxHeight: 400 }]}>
            <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 16 }]}>Assign Personal Trainer</Text>
            <FlatList
              data={trainers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAssignTrainer(item._id)}
                  style={[styles.trainerItem, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.trainerName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.trainerMeta, { color: colors.textMuted }]}>{item.specialization}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.textMuted, fontStyle: "italic", textAlign: "center", padding: 20 }}>
                  No expert trainers available.
                </Text>
              }
            />
            <TouchableOpacity
              onPress={() => setTrainerModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={[styles.cancelBtnText, { color: colors.accent }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 13,
  },
  memberCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  email: {
    fontSize: 13,
    marginTop: 4,
  },
  planTrainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  metaVal: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 6,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  planRow: {
    flexDirection: "row",
    gap: 8,
  },
  planSelectBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  trainerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  trainerName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  trainerMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
