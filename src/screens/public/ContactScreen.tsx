import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Linking, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getSettings } from "../../services/api";

export default function ContactScreen() {
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [gymSettings, setGymSettings] = useState({
    address: "Gwalior, Madhya Pradesh (M.P.), India",
    mobile: "+123 456 7890",
    whatsapp: "+91 98765 43210",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          setGymSettings({
            address: res.data.address || "Gwalior, Madhya Pradesh (M.P.), India",
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

  const handleWhatsApp = async () => {
    const cleanNum = gymSettings.whatsapp.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanNum}?text=Hello%20Forge%20Gym%20support!`;
    try {
      await Linking.openURL(whatsappUrl);
    } catch (err) {
      Alert.alert("Error", "Could not open WhatsApp support.");
    }
  };

  if (loadingConfig) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        >
          {/* Dynamic Contact details card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.primary }]}>GET IN TOUCH</Text>
            <Text style={[styles.heading, { color: colors.text }]}>We are here to help!</Text>

            <Text style={[styles.desc, { color: colors.textMuted }]}>
              📍 <Text style={{ fontWeight: "bold", color: colors.text }}>Address:</Text> {gymSettings.address}{"\n\n"}
              📞 <Text style={{ fontWeight: "bold", color: colors.text }}>Phone:</Text> {gymSettings.mobile}{"\n\n"}
              ✉️ <Text style={{ fontWeight: "bold", color: colors.text }}>Email:</Text> support@forgegym.com
            </Text>

            <TouchableOpacity
              onPress={handleWhatsApp}
              activeOpacity={0.8}
              style={[styles.whatsappBtn, { backgroundColor: colors.success }]}
            >
              <Text style={styles.whatsappText}>💬 CHAT ON WHATSAPP</Text>
            </TouchableOpacity>
          </View>

          {/* Opening Hours Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Operating Hours</Text>
            <View style={styles.hoursList}>
              <View style={[styles.hoursRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.hoursDay, { color: colors.textMuted }]}>Monday - Friday</Text>
                <Text style={[styles.hoursTime, { color: colors.primary }]}>5:00 AM - 11:00 PM</Text>
              </View>
              <View style={[styles.hoursRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.hoursDay, { color: colors.textMuted }]}>Saturday</Text>
                <Text style={[styles.hoursTime, { color: colors.primary }]}>6:00 AM - 10:00 PM</Text>
              </View>
              <View style={[styles.hoursRow, { borderBottomColor: "transparent" }]}>
                <Text style={[styles.hoursDay, { color: colors.textMuted }]}>Sunday</Text>
                <Text style={[styles.hoursTime, { color: colors.primary }]}>8:00 AM - 8:00 PM</Text>
              </View>
            </View>
          </View>

          {/* Inquiry Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
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
    borderRadius: 24,
    padding: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 14,
  },
  whatsappBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  whatsappText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  hoursList: {
    gap: 4,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  hoursDay: {
    fontSize: 13,
    fontWeight: "500",
  },
  hoursTime: {
    fontSize: 13,
    fontWeight: "bold",
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
