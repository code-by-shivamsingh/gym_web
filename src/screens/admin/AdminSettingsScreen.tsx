import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getSettings, updateSettings } from "../../services/api";

export default function AdminSettingsScreen() {
  const { colors } = useTheme();

  const [gymName, setGymName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          setGymName(res.data.gymName || "");
          setAddress(res.data.address || "");
          setMobile(res.data.mobile || "");
          setWhatsapp(res.data.whatsapp || "");
          setTaxRate(String(res.data.taxRate || "18"));
        }
      } catch (err) {
        console.warn("Failed fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateSettings = async () => {
    if (!gymName || !address || !mobile || !whatsapp || !taxRate) {
      Alert.alert("Error", "Please fill in all setting inputs.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateSettings({
        gymName,
        address,
        mobile,
        whatsapp,
        taxRate: Number(taxRate),
      });

      if (res.success) {
        Alert.alert("Success", "Gym settings updated successfully!");
      } else {
        Alert.alert("Failed", res.message || "Failed to update settings.");
      }
    } catch (err) {
      Alert.alert("Error", "Server submission failure.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        {...({ keyboardShouldPersistTaps: "handled" } as any)}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
        >
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Gym System Configurations</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Gym Name</Text>
          <TextInput
            value={gymName}
            onChangeText={setGymName}
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Physical Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Contact Phone</Text>
          <TextInput
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>WhatsApp Support Link</Text>
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>GST / Tax Rate (%)</Text>
          <TextInput
            value={taxRate}
            onChangeText={setTaxRate}
            keyboardType="numeric"
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          />
        </View>

        <TouchableOpacity
          onPress={handleUpdateSettings}
          disabled={submitting}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          {submitting ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.saveBtnText}>APPLY SETTINGS</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    marginBottom: 16,
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
    height: 80,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  saveBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },
});
