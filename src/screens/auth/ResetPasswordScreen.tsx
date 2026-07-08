import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { resetPassword } from "../../services/api";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function ResetPasswordScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { token } = route.params || { token: "" };

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      console.log(`[FRONTEND] 🚀 ResetPassword requested`);
      console.log(`[FRONTEND]   Calling API: POST /auth/reset-password`);
      console.log(`[FRONTEND]   Request Body:`, { password: "****************", token });
      
      const res = await resetPassword(password, token);
      
      console.log(`[FRONTEND] 📥 ResetPassword API Response:`, res);
      
      if (res.success) {
        Alert.alert("Success", "Password updated successfully. Please login.");
        navigation.navigate("Login");
      } else {
        console.error(`[FRONTEND] ❌ ResetPassword failed: ${res.message}`);
        Alert.alert("Error", res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      console.error(`[FRONTEND] 🚨 ResetPassword Network/Server error:`, err);
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
              <Text style={[styles.title, { color: colors.text }]}>New Password</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Create a secure, new password for your account.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Enter Password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Re-enter Password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.submitBtnText}>RESET PASSWORD</Text>
                )}
              </TouchableOpacity>
            </View>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 15,
  },
  eyeBtn: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
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
});
