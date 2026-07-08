import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

interface Trainer {
  name: string;
  specialization: string;
  experience: string;
  image: string;
  certifications: string[];
  bio: string;
}

const TRAINERS_LIST: Trainer[] = [
  {
    name: "John Carter",
    specialization: "Strength Training",
    experience: "8 Years Experience",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800",
    certifications: ["NASM Certified Personal Trainer", "USA Weightlifting Level 1 Coach"],
    bio: "John specializes in hypertrophy, powerlifting coaching, and functional strength conditioning.",
  },
  {
    name: "Sarah Wilson",
    specialization: "Weight Loss Coach",
    experience: "6 Years Experience",
    image: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=800",
    certifications: ["ACE Health & Wellness Specialist", "Certified Sports Nutritionist (CSN)"],
    bio: "Sarah designs customized, holistic fat loss and athletic conditioning systems.",
  },
  {
    name: "Mike Johnson",
    specialization: "Bodybuilding Expert",
    experience: "10 Years Experience",
    image: "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=800",
    certifications: ["IFBB Pro Card Holder", "ISSA Master Trainer Certification"],
    bio: "Mike brings elite bodybuilding training protocols directly to gym members.",
  },
];

const TIME_SLOTS = ["09:00 AM", "11:00 AM", "02:00 PM", "05:00 PM", "07:00 PM"];

export default function TrainersScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  // Booking Form States
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleOpenBooking = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setModalVisible(true);
  };

  const handleCloseBooking = () => {
    setModalVisible(false);
    setSelectedTrainer(null);
    setBookingName("");
    setBookingEmail("");
    setBookingDate("");
    setBookingTime("");
    setBookingLoading(false);
  };

  const handleConfirmSlot = () => {
    if (!bookingName || !bookingEmail || !bookingDate || !bookingTime) {
      Alert.alert("Error", "Please fill in all booking fields.");
      return;
    }

    setBookingLoading(true);
    setTimeout(() => {
      Alert.alert(
        "Booking Confirmed",
        `Appointment successfully booked with Trainer ${selectedTrainer?.name} for ${bookingDate} at ${bookingTime}!`,
        [{ text: "OK", onPress: handleCloseBooking }]
      );
    }, 1500);
  };

  const renderTrainerItem = useCallback(({ item }: { item: Trainer }) => {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.spec, { color: colors.primary }]}>{item.specialization}</Text>
          <Text style={[styles.exp, { color: colors.textMuted }]}>{item.experience}</Text>
          <Text style={[styles.bio, { color: colors.textMuted }]}>{item.bio}</Text>

          <Text style={[styles.certTitle, { color: colors.text }]}>Certifications:</Text>
          {item.certifications.map((c, i) => (
            <Text key={i} style={[styles.certText, { color: colors.textMuted }]}>✓ {c}</Text>
          ))}

          <TouchableOpacity
            onPress={() => handleOpenBooking(item)}
            style={[styles.hireBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.hireText}>BOOK FREE APPOINTMENT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [colors]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={TRAINERS_LIST}
        renderItem={renderTrainerItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
      />

      {/* Interactive Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseBooking}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleCloseBooking}
              style={styles.closeModalBtn}
            >
              <Text style={{ color: colors.textMuted, fontSize: 18, fontWeight: "bold" }}>✕</Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.primary }]}>Book Consultation</Text>
            {selectedTrainer && (
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                Consult with <Text style={{ color: colors.text, fontWeight: "bold" }}>{selectedTrainer.name}</Text> to kickstart your program.
              </Text>
            )}

            {/* Form Fields */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%", maxHeight: 350 }} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Your Full Name</Text>
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                  value={bookingName}
                  onChangeText={setBookingName}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Your Email</Text>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textMuted}
                  value={bookingEmail}
                  onChangeText={setBookingEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Preferred Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={bookingDate}
                  onChangeText={setBookingDate}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Time Slot</Text>
                <View style={styles.timeSlotsGrid}>
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = bookingTime === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        onPress={() => setBookingTime(slot)}
                        style={[
                          styles.timeSlotBtn,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary + "15" : colors.background
                          }
                        ]}
                      >
                        <Text style={[styles.timeSlotText, { color: isSelected ? colors.primary : colors.textMuted, fontWeight: isSelected ? "bold" : "normal" }]}>
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleConfirmSlot}
              disabled={bookingLoading}
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            >
              {bookingLoading ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <Text style={[styles.confirmBtnText, { color: colors.black }]}>Confirm Free Slot</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 220,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  spec: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  exp: {
    fontSize: 12,
    marginTop: 2,
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 16,
  },
  certTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  certText: {
    fontSize: 12,
    marginBottom: 4,
  },
  hireBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  hireText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    position: "relative",
  },
  closeModalBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
    width: "100%",
  },
  inputLabel: {
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
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  timeSlotBtn: {
    width: "48%",
    height: 42,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  timeSlotText: {
    fontSize: 12,
  },
  confirmBtn: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
