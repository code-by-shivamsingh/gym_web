import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getSettings } from "../../services/api";
import GymLocationCard from "../../components/contact/GymLocationCard";

export default function ContactScreen() {
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [gymSettings, setGymSettings] = useState({
    gymName: "FORGE Fitness & Fuel",
    address: "Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India",
    mobile: "+123 456 7890",
    whatsapp: "+91 98765 43210",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          setGymSettings({
            gymName: res.data.gymName || "FORGE Fitness & Fuel",
            address: res.data.address || "Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India",
            mobile: res.data.mobile || "+123 456 7890",
            whatsapp: res.data.whatsapp || "+91 98765 43210",
          });
        }
      } catch (err) {
        console.warn("Failed loading Contact screen config:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert("Error", "Please fill in all inputs.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        "Query Submitted",
        `Thank you! Message successfully sent. Our support team will reach you at ${email} shortly.`,
        [{ text: "OK" }]
      );
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  if (loadingConfig) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0B0B", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0B" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        >
          {/* Gym Location & Contact Card */}
          <GymLocationCard gymSettings={gymSettings} />

          {/* Inquiry Form Card */}
          <View style={[styles.card, { backgroundColor: "#171717", borderColor: "#333333", marginTop: 20, borderRadius: 20 }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Send us a Message</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Your Name</Text>
              <TextInput
                value={name}
                placeholder="Enter full name"
                placeholderTextColor={colors.textMuted}
                onChangeText={setName}
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
              <TextInput
                value={email}
                placeholder="Enter email address"
                placeholderTextColor={colors.textMuted}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Subject</Text>
              <TextInput
                value={subject}
                placeholder="Enter query subject"
                placeholderTextColor={colors.textMuted}
                onChangeText={setSubject}
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Message</Text>
              <TextInput
                value={message}
                placeholder="Write your message here..."
                placeholderTextColor={colors.textMuted}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <Text style={styles.submitText}>SUBMIT INQUIRY</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
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
  textArea: {
    height: 90,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
