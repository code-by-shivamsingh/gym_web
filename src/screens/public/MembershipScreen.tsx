import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getMembershipPlans } from "../../services/api";

const { width } = Dimensions.get("window");

const COMPARISONS = [
  { feature: "Gym Floor Access", basic: "✓", premium: "✓", elite: "✓" },
  { feature: "Locker & Showers", basic: "✓", premium: "✓", elite: "✓" },
  { feature: "Customized Diet Plan", basic: "✕", premium: "✓", elite: "✓" },
  { feature: "Personal Trainer Sessions", basic: "✕", premium: "✓", elite: "✓ (Dedicated)" },
  { feature: "Steam Room Access", basic: "✕", premium: "✕", elite: "✓" },
  { feature: "24/7 Support Desk", basic: "Basic", premium: "Priority", elite: "24/7 VIP" }
];

const MEMBERSHIP_FAQS = [
  { q: "Is there a registration or startup fee?", a: "No, we do not charge any registration or activation fees. You only pay for your selected subscription plan." },
  { q: "Can I upgrade or downgrade my tier anytime?", a: "Yes, you can upgrade or downgrade your plan directly from your dashboard billing settings." },
  { q: "What is your refund policy?", a: "We offer a 7-day money-back guarantee for first-time memberships if you're not fully satisfied with our facilities." }
];

export default function MembershipScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getMembershipPlans();
        if (res.success && res.data) {
          setPlans(res.data);
        } else {
          // Fallback PLANS matching standard pricing tiers if database is empty
          setPlans([
            { name: "Basic", price: 999, duration: "month", popular: false, features: ["Gym Access", "Locker Facility", "Basic Support"] },
            { name: "Silver", price: 1499, duration: "month", popular: false, features: ["Gym Access", "Locker Facility", "Standard Support", "General Trainer"] },
            { name: "Gold", price: 2499, duration: "month", popular: true, features: ["Gym Access", "Personal Trainer", "Diet Plan", "Locker Facility"] },
            { name: "Premium", price: 4999, duration: "month", popular: false, features: ["Gym Access", "Personal Trainer", "Diet Plan", "Workout Plan", "Priority Support"] }
          ]);
        }
      } catch (err) {
        console.warn("Failed fetching membership tiers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleJoinPlan = (planName: string) => {
    if (navigation) {
      navigation.navigate("Payments", { plan: planName });
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>FLEXIBLE TIERS</Text>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Choose Your Membership</Text>
        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          Select a tier that matches your commitment. No hidden charges, cancel anytime, and enjoy complete access to premium workout amenities.
        </Text>

        {/* Dynamic Plan Cards */}
        {plans.map((plan, idx) => {
          const isPopular = plan.popular || plan.name === "Gold" || plan.name === "Premium";
          const features = plan.features || [
            "Gym Access",
            "Locker & Shower Facility",
            plan.name !== "Basic" ? "Diet Plan" : "Basic Support",
            plan.name === "Premium" || plan.name === "Gold" ? "Personal Trainer" : "General Trainer"
          ];

          return (
            <View
              key={plan._id || idx}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: isPopular ? colors.primary : colors.border,
                  borderWidth: isPopular ? 2 : 1,
                },
              ]}
            >
              {isPopular && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>RECOMMENDED</Text>
                </View>
              )}

              <Text style={[styles.name, { color: colors.text }]}>{plan.name}</Text>
              <Text style={[styles.price, { color: colors.primary }]}>
                ₹{plan.price}
                <Text style={[styles.period, { color: colors.textMuted }]}>/{plan.duration || "month"}</Text>
              </Text>

              <View style={styles.features}>
                {features.map((feature: string, fIdx: number) => (
                  <Text key={fIdx} style={[styles.featureItem, { color: colors.textMuted }]}>
                    ✅ {feature}
                  </Text>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => handleJoinPlan(plan.name)}
                activeOpacity={0.8}
                style={[styles.joinBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.joinText}>Join Now</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Comparison Matrix Table */}
        <Text style={[styles.subsectionHeading, { color: colors.text, marginTop: 24 }]}>Compare Package Inclusions</Text>
        <View style={[styles.matrixCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Table Headers */}
          <View style={[styles.matrixHeaderRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.matrixHeaderCell, { flex: 2, color: colors.text }]}>Features</Text>
            <Text style={[styles.matrixHeaderCell, { color: colors.text }]}>Basic</Text>
            <Text style={[styles.matrixHeaderCell, { color: colors.primary }]}>Prem.</Text>
            <Text style={[styles.matrixHeaderCell, { color: colors.text }]}>Elite</Text>
          </View>
          {/* Table Rows */}
          {COMPARISONS.map((row, idx) => (
            <View key={idx} style={[styles.matrixRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.matrixLabelCell, { flex: 2, color: colors.textMuted }]}>{row.feature}</Text>
              <Text style={[styles.matrixValCell, { color: row.basic === "✓" ? colors.success : colors.textMuted }]}>
                {row.basic}
              </Text>
              <Text style={[styles.matrixValCell, { color: colors.primary }]}>{row.premium}</Text>
              <Text style={[styles.matrixValCell, { color: colors.primary, fontWeight: "bold" }]}>{row.elite}</Text>
            </View>
          ))}
        </View>

        {/* Membership FAQ Cards list */}
        <Text style={[styles.subsectionHeading, { color: colors.text, marginTop: 30 }]}>Membership FAQs</Text>
        <View style={styles.faqList}>
          {MEMBERSHIP_FAQS.map((faq, idx) => (
            <View key={idx} style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>❓ {faq.q}</Text>
              <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>{faq.a}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginTop: 10,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 6,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 24,
  },
  subsectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "bold",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  price: {
    fontSize: 36,
    fontWeight: "900",
    marginTop: 12,
  },
  period: {
    fontSize: 14,
    fontWeight: "normal",
  },
  features: {
    marginVertical: 20,
    gap: 8,
  },
  featureItem: {
    fontSize: 13,
  },
  joinBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  joinText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  matrixCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  matrixHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  matrixHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  matrixRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  matrixLabelCell: {
    fontSize: 11,
    lineHeight: 16,
  },
  matrixValCell: {
    flex: 1,
    fontSize: 11,
    textAlign: "center",
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 18,
  },
});
