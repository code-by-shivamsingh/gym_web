import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { useAppDispatch } from "../../store/hooks";
import { setUserProfile } from "../../store/slices/userDetailsSlice";
import { registerUser } from "../../services/api";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const PLANS = ["Basic", "Silver", "Gold", "Premium"];

export default function RegisterScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const routePlan = route?.params?.plan;
  const initialPlan = PLANS.includes(routePlan) ? routePlan : "Basic";
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (routePlan && PLANS.includes(routePlan)) {
      setSelectedPlan(routePlan);
    }
  }, [routePlan]);

  const handleRegister = async () => {
    if (!name || !email || !mobile || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await registerUser({
        name,
        email,
        mobile,
        password,
        role: "Member",
        plan: selectedPlan,
      });

      if (res.success && res.data) {
        dispatch(setUserProfile(res.data));
        console.log("After Redux dispatch (Register)");
        console.log("Redux User", res.data);
      } else {
        Alert.alert("Registration Failed", res.message || "Failed to create account.");
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred.");
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Join the Forge Gym community today!
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              placeholder="Enter Full Name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            />
          </View>

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
            <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
            <TextInput
              placeholder="Enter Mobile"
              placeholderTextColor={colors.textMuted}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Create Password"
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

          {/* Membership Plan Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Select Fitness Plan</Text>
            <View style={styles.plansContainer}>
              {PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan}
                  onPress={() => setSelectedPlan(plan)}
                  style={[
                    styles.planBtn,
                    {
                      borderColor: selectedPlan === plan ? colors.primary : colors.border,
                      backgroundColor: selectedPlan === plan ? colors.primary + "15" : colors.background,
                    },
                  ]}
                >
                  <Text style={[
                    styles.planBtnText,
                    {
                      color: selectedPlan === plan ? colors.primary : colors.textMuted,
                      fontWeight: selectedPlan === plan ? "bold" : "normal",
                    },
                  ]}>
                    {plan}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitBtnText}>REGISTER</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Already have an account?{" "}
          <Text
            onPress={() => navigation.navigate("Login")}
            style={[styles.footerLink, { color: colors.primary }]}
          >
            Login
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
    marginTop: 6,
    textAlign: "center",
  },
  form: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
  plansContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  planBtn: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  planBtnText: {
    fontSize: 14,
  },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
