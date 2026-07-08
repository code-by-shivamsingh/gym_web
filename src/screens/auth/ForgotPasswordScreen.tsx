import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { forgotPassword } from "../../services/api";

export default function ForgotPasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      console.log(`[FRONTEND] 🚀 ForgotPassword requested for: "${email}"`);
      console.log(`[FRONTEND]   Calling API: POST /auth/forgot-password`);
      console.log(`[FRONTEND]   Request Body:`, { email });
      
      const res = await forgotPassword(email);
      
      console.log(`[FRONTEND] 📥 API Response:`, res);
      
      if (res.success) {
        Alert.alert("Success", res.message || "OTP code sent to email.");
        navigation.navigate("OtpVerification", { email });
      } else {
        console.error(`[FRONTEND] ❌ ForgotPassword failed with message: ${res.message}`);
        Alert.alert("Error", res.message || "Failed to request code.");
      }
    } catch (err: any) {
      console.error(`[FRONTEND] 🚨 Network/Server error:`, err);
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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
          contentContainerStyle={[
            styles.scrollContainer,
            { backgroundColor: colors.background, flexGrow: 1, paddingBottom: 120 }
          ]}
        >
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Enter your email and we'll send you a 6-digit OTP verification code.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput
              placeholder="Enter Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            />
          </View>

          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitBtnText}>SEND CODE</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#eab308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  backText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
});
