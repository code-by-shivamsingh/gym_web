import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const { colors } = useTheme();

  // Summer Sale Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-07-01T00:00:00");
    const interval = setInterval(() => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
      >
        {/* Summer Sale Banner */}
        <View style={[styles.banner, { borderColor: colors.primary }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🔥 LIMITED TIME OFFER</Text>
          </View>

          <Text style={styles.bannerTitle}>50% OFF</Text>
          <Text style={[styles.bannerSubtitle, { color: colors.text }]}>SUMMER SALE</Text>
          
          <Text style={[styles.desc, { color: colors.textMuted }]}>
            Free Personal Trainer + Custom Diet Plan + Fitness Assessment.
          </Text>

          {/* Countdown */}
          <View style={styles.countdownRow}>
            {[
              { label: "Days", val: timeLeft.days },
              { label: "Hours", val: timeLeft.hours },
              { label: "Mins", val: timeLeft.minutes },
              { label: "Secs", val: timeLeft.seconds },
            ].map((item, idx) => (
              <View key={idx} style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.boxVal, { color: colors.primary }]}>{String(item.val).padStart(2, "0")}</Text>
                <Text style={[styles.boxLabel, { color: colors.textMuted }]}>{item.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Payments", { plan: "Premium" })}
            style={[styles.claimBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.claimText}>🚀 CLAIM OFFER NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Gym Summary Details */}
        <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.aboutTitle, { color: colors.primary }]}>ABOUT FORGE GYM</Text>
          <Text style={[styles.aboutHeading, { color: colors.text }]}>Build Strength & Discipline</Text>
          <Text style={[styles.aboutDesc, { color: colors.textMuted }]}>
            Our facilities are structured to generate maximum results. Whether you aim for weight loss, mass gain, or powerlifting prep, our trainers are ready to guide you.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    borderWidth: 1,
    borderRadius: 24,
    backgroundColor: "rgba(250,204,21,0.05)",
    padding: 24,
    alignItems: "center",
    marginVertical: 20,
  },
  badge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "bold",
  },
  bannerTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#eab308",
    marginTop: 16,
  },
  bannerSubtitle: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 14,
    lineHeight: 20,
  },
  countdownRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 16,
  },
  box: {
    width: (width - 100) / 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  boxVal: {
    fontSize: 22,
    fontWeight: "bold",
  },
  boxLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  claimBtn: {
    height: 52,
    width: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  claimText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },
  aboutCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  aboutTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  aboutHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 6,
  },
  aboutDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
});
