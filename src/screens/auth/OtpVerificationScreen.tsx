import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { verifyOtp, forgotPassword } from "../../services/api";

export default function OtpVerificationScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { email } = route.params || { email: "" };
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown < 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendOtp = async () => {
    if (countdown >= 0 || resendLoading) return;
    try {
      setResendLoading(true);
      console.log(`[FRONTEND] 🚀 Resend OTP requested for: "${email}"`);
      console.log(`[FRONTEND]   Calling API: POST /auth/forgot-password`);
      console.log(`[FRONTEND]   Request Body:`, { email });
      
      const res = await forgotPassword(email);
      
      console.log(`[FRONTEND] 📥 Resend OTP API Response:`, res);
      
      if (res.success) {
        Alert.alert("Success", "A new secure 6-digit OTP code has been dispatched. Please check your inbox.");
        setCountdown(60); // Restart countdown to 60s (matching backend rate limiter)
      } else {
        console.error(`[FRONTEND] ❌ Resend OTP failed: ${res.message}`);
        Alert.alert("Error", res.message || "Failed to resend code.");
      }
    } catch (err: any) {
      console.error(`[FRONTEND] 🚨 Resend OTP Network/Server error:`, err);
      Alert.alert("Error", "An error occurred while resending the code.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP code.");
      return;
    }

    try {
      setLoading(true);
      console.log(`[FRONTEND] 🚀 Verify OTP requested for: "${email}"`);
      console.log(`[FRONTEND]   Calling API: POST /auth/verify-otp`);
      console.log(`[FRONTEND]   Request Body:`, { email, otp });
      
      const res = await verifyOtp(email, otp);
      
      console.log(`[FRONTEND] 📥 Verify OTP API Response:`, res);
      
      if (res.success && res.token) {
        Alert.alert("Success", "OTP code verified.");
        navigation.navigate("ResetPassword", { token: res.token });
      } else {
        console.error(`[FRONTEND] ❌ OTP verification failed: ${res.message}`);
        Alert.alert("Verification Failed", res.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      console.error(`[FRONTEND] 🚨 Verify OTP Network/Server error:`, err);
      Alert.alert("Error", "An error occurred.");
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
          <Text style={[styles.title, { color: colors.text }]}>Enter OTP</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            A secure verification code has been dispatched to:{"\n"}
            <Text style={{ color: colors.text, fontWeight: "bold" }}>{email}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>6-Digit Verification Code</Text>
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor={colors.textMuted}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            />
          </View>

          <TouchableOpacity
            onPress={handleVerifyOtp}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitBtnText}>VERIFY OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleResendOtp} 
          disabled={countdown >= 0 || resendLoading}
          style={{ paddingVertical: 10 }}
        >
          {resendLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.backText, { color: countdown >= 0 ? colors.textMuted : colors.primary }]}>
              {countdown >= 0 ? `Resend OTP in ${String(countdown).padStart(2, '0')}s` : "Resend OTP"}
            </Text>
          )}
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
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 8,
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
