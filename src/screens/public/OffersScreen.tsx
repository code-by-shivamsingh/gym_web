import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, ActivityIndicator, Dimensions } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getMembershipPlans } from "../../services/api";

const { width } = Dimensions.get("window");

interface Coupon {
  code: string;
  discount: string;
  desc: string;
  expiry: string;
}

const COUPONS: Coupon[] = [
  { code: "FORGE50", discount: "50% OFF", desc: "Applicable on Elite Annual Plan.", expiry: "Ends in 2 days" },
  { code: "FITLAUNCH", discount: "20% OFF", desc: "Applicable on Premium monthly signup.", expiry: "Valid till end of month" }
];

const COMPARISONS = [
  { feature: "Access to Gym Floor", basic: "✓", premium: "✓", elite: "✓" },
  { feature: "Locker Facilities", basic: "✓", premium: "✓", elite: "✓" },
  { feature: "Group Fitness Classes", basic: "✕", premium: "✓", elite: "✓" },
  { feature: "Personal Trainer", basic: "✕", premium: "1/mo", elite: "Unlimited" },
  { feature: "Custom Diet & Meal Plans", basic: "✕", premium: "✓", elite: "✓" },
  { feature: "Sauna & Steam Room Access", basic: "✕", premium: "✕", elite: "✓" },
  { feature: "Guest passes (per month)", basic: "0", premium: "1 pass", elite: "3 passes" }
];

export default function OffersScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getMembershipPlans();
        if (res.success && res.data) {
          setPlans(res.data);
        } else {
          // Fallback plans if database has none
          setPlans([
            { name: "Basic", price: 999, duration: "1 Month" },
            { name: "Silver", price: 1499, duration: "1 Month" },
            { name: "Gold", price: 2499, duration: "1 Month" },
            { name: "Premium", price: 4999, duration: "1 Month" }
          ]);
        }
      } catch (err) {
        console.warn("Failed to fetch plans for offers:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    Alert.alert("Coupon Copied", `Promo code "${code}" has been copied! Apply this during your checkout step.`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: "Join Forge Gym with me today and transform your body! Use promo code FITLAUNCH to get 20% off. Let's lift!",
      });
    } catch (error) {
      console.warn("Share failed:", error);
    }
  };

  const handleSelectPlan = (planName: string) => {
    if (navigation) {
      navigation.navigate("Payments", { plan: planName });
    }
  };

  const handleSupportInquiry = () => {
    if (navigation) {
      navigation.navigate("ContactWeb");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>EXCLUSIVE CAMPAIGNS</Text>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Active Promotional Deals</Text>

        {/* Coupons List */}
        {COUPONS.map((coupon, idx) => (
          <View key={idx} style={[styles.couponCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.expiryBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.expiryBadgeText}>{coupon.expiry.toUpperCase()}</Text>
            </View>

            <Text style={[styles.discountText, { color: colors.primary }]}>{coupon.discount}</Text>
            <Text style={[styles.descText, { color: colors.text }]}>{coupon.desc}</Text>

            <View style={[styles.codeRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.codeText, { color: colors.text }]}>{coupon.code}</Text>
              <TouchableOpacity
                onPress={() => handleCopyCode(coupon.code)}
                style={[styles.copyBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.copyBtnText}>
                  {copiedCode === coupon.code ? "COPIED ✓" : "COPY CODE"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Membership Plans Dynamic List */}
        <Text style={[styles.subsectionHeading, { color: colors.text, marginTop: 30 }]}>Membership Packages</Text>
        {loadingPlans ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plansScroll}>
            {plans.map((plan, idx) => (
              <View key={idx} style={[styles.planMinicard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                <Text style={[styles.planPrice, { color: colors.primary }]}>
                  ₹{plan.price}
                  <Text style={styles.planPeriod}>/{plan.duration || "mo"}</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => handleSelectPlan(plan.name)}
                  activeOpacity={0.8}
                  style={[styles.selectBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.selectBtnText}>Claim Plan</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Plans Comparison Matrix Table */}
        <Text style={[styles.subsectionHeading, { color: colors.text, marginTop: 30 }]}>Benefits Comparison Matrix</Text>
        <View style={[styles.matrixCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Table Headers */}
          <View style={[styles.matrixHeaderRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.matrixHeaderCell, { flex: 2, color: colors.text }]}>Benefits</Text>
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

        {/* Referral Card */}
        <View style={[styles.referralCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 24 }]}>
          <Text style={styles.referralIcon}>🎁</Text>
          <Text style={[styles.referralHeading, { color: colors.text }]}>Refer a Friend & Earn</Text>
          <Text style={[styles.referralDesc, { color: colors.textMuted }]}>
            Share the Forge Gym transformation spirit. For every friend that signs up for a Premium or Elite annual membership, both of you will receive 1 Month Free credit!
          </Text>
          <View style={styles.referralActions}>
            <TouchableOpacity
              onPress={handleShareReferral}
              style={[styles.shareBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.shareBtnText}>SHARE REFERRAL LINK 🔗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSupportInquiry}
              style={[styles.inquireBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.inquireBtnText, { color: colors.text }]}>ASK SUPPORT TEAM</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 20,
  },
  subsectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  couponCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  expiryBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  expiryBadgeText: {
    color: "#000000",
    fontSize: 9,
    fontWeight: "bold",
  },
  discountText: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  descText: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    paddingLeft: 16,
  },
  codeText: {
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  copyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyBtnText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "bold",
  },
  plansScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  planMinicard: {
    width: width * 0.45,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  planName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  planPrice: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: "normal",
  },
  selectBtn: {
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  selectBtnText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
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
  referralCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  referralIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  referralHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  referralDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  referralActions: {
    width: "100%",
    gap: 10,
  },
  shareBtn: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  shareBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  inquireBtn: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inquireBtnText: {
    fontSize: 13,
    fontWeight: "bold",
  },
});
