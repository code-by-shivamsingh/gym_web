import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, FlatList, ScrollView } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from "../../services/api";

interface Trainer {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  specialization: string;
  experience: string;
}

export default function AdminTrainersScreen() {
  const { colors } = useTheme();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTrainers = async () => {
    try {
      const res = await getTrainers();
      if (res.success && res.data) {
        setTrainers(res.data);
      }
    } catch (err) {
      console.warn("Failed fetching trainers listing:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setMobile("");
    setSpecialization("");
    setExperience("");
    setModalVisible(true);
  };

  const openEditModal = (trainer: Trainer) => {
    setEditingId(trainer._id);
    setName(trainer.name);
    setEmail(trainer.email);
    setPassword("");
    setMobile(trainer.mobile);
    setSpecialization(trainer.specialization);
    setExperience(trainer.experience);
    setModalVisible(true);
  };

  const handleSaveTrainer = async () => {
    if (!name || !email || (!editingId && !password)) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await updateTrainer(editingId, { name, email, mobile, specialization, experience });
      } else {
        res = await createTrainer({ name, email, password, mobile, specialization, experience });
      }

      if (res.success) {
        Alert.alert("Success", editingId ? "Trainer details updated." : "Trainer created successfully.");
        setModalVisible(false);
        loadTrainers();
      } else {
        Alert.alert("Action Failed", res.message || "Failed to save trainer.");
      }
    } catch (err) {
      Alert.alert("Error", "Server submission failure.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrainer = (id: string, trainerName: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to remove trainer ${trainerName}? This will unassign them from all members.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await deleteTrainer(id);
              if (res.success) {
                Alert.alert("Deleted", "Trainer removed successfully.");
                loadTrainers();
              } else {
                Alert.alert("Error", res.message || "Failed to delete trainer.");
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

  const renderTrainerItem = useCallback(({ item }: { item: Trainer }) => {
    return (
      <View style={[styles.trainerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.trainerName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.trainerEmail, { color: colors.textMuted }]}>{item.email} | {item.mobile}</Text>
        
        <View style={styles.metaRow}>
          <Text style={[styles.metaVal, { color: colors.primary }]}>Spec: {item.specialization || "General Coaching"}</Text>
          <Text style={[styles.metaVal, { color: colors.text }]}>Exp: {item.experience || "N/A"}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={[styles.actionBtn, { borderColor: colors.success }]}
          >
            <Text style={[styles.actionBtnText, { color: colors.success }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteTrainer(item._id, item.name)}
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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Trainers ({trainers.length})</Text>
          <TouchableOpacity
            onPress={openAddModal}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.addBtnText}>+ Add Coach</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={trainers}
          renderItem={renderTrainerItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, fontStyle: "italic", textAlign: "center", padding: 30 }}>
              No personal trainers added yet.
            </Text>
          }
        />

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
              {editingId ? "Edit Trainer Profile" : "Add New Trainer"}
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

              {!editingId && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Default Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                  />
                </View>
              )}

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
                <Text style={[styles.label, { color: colors.textMuted }]}>Specialization</Text>
                <TextInput
                  placeholder="e.g. Strength Training"
                  placeholderTextColor={colors.textMuted}
                  value={specialization}
                  onChangeText={setSpecialization}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Experience</Text>
                <TextInput
                  placeholder="e.g. 8 Years Experience"
                  placeholderTextColor={colors.textMuted}
                  value={experience}
                  onChangeText={setExperience}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTrainer}
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
  trainerCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  trainerEmail: {
    fontSize: 13,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
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
});
