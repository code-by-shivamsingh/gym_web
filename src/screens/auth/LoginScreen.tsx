import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { useAppDispatch } from "../../store/hooks";
import { setUserProfile } from "../../store/slices/userDetailsSlice";
import { loginUser } from "../../services/api";

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      if (res.success && res.data) {
        dispatch(setUserProfile(res.data));
        console.log("After Redux dispatch (Login)");
        console.log("Redux User", res.data);
      } else {
        Alert.alert("Login Failed", res.message || "Invalid credentials.");
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logoTextBold, { color: colors.primary }]}>
            FORGE<Text style={{ color: colors.text }}>GYM</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Transform Your Body. Transform Your Life.
          </Text>
        </View>

        {/* Inputs */}
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

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                placeholder="Enter Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.input, styles.passwordInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.toggleBtn}
              >
                <Text style={[styles.toggleBtnText, { color: colors.primary }]}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: rememberMe ? colors.primary : "transparent" }]}>
                {rememberMe && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.textMuted }]}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={[styles.link, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitBtnText}>LOGIN</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Don't have an account?{" "}
          <Text
            onPress={() => navigation.navigate("Register")}
            style={[styles.footerLink, { color: colors.primary }]}
          >
            Register
          </Text>
        </Text>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoTextBold: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
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
  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 64,
  },
  toggleBtn: {
    position: "absolute",
    right: 16,
    top: 0,
    height: 52,
    justifyContent: "center",
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    fontSize: 12,
    color: "#000000",
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: "bold",
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
  footerText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 16,
  },
  footerLink: {
    fontWeight: "bold",
  },
});
