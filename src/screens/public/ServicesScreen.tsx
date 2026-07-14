import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

interface GymService {
  emoji: string;
  title: string;
  desc: string;
}

const SERVICES: GymService[] = [
  {
    emoji: "🍏",
    title: "Custom Diet & Meal Plans",
    desc: "Receive personalized calorie and macronutrient breakdowns aligned with your fat loss or muscle gaining targets.",
  },
  {
    emoji: "🥤",
    title: "Juice & Protein Bar Access",
    desc: "Refuel immediately post-workout with our premium selection of whey shakes, fresh juices, and pre-workout blends.",
  },
  {
    emoji: "🚿",
    title: "Premium Locker & Steam Rooms",
    desc: "Enjoy hot showers, private lockers, and steam bath facilities to relax and rejuvenate your muscles after heavy training.",
  },
];

export default function ServicesScreen({ navigation }: any) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
      >
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>CORE SERVICES</Text>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Included with All Memberships</Text>

        {SERVICES.map((service, index) => (
          <View key={index} style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emojiContainer, { backgroundColor: colors.primary + "15" }]}>
              <Text style={styles.emoji}>{service.emoji}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{service.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{service.desc}</Text>
            </View>
          </View>
        ))}

        {/* Call to Action */}
        <TouchableOpacity
          onPress={() => navigation.navigate("MainPortal", { screen: "MembershipTab" })}
          style={[styles.ctaCard, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.ctaHeading}>Elevate Your Fitness Level</Text>
          <Text style={styles.ctaSub}>Get custom diet plans, workouts, and priority lockers today.</Text>
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>VIEW MEMBERSHIPS ➡️</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  serviceCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  ctaCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 16,
  },
  ctaHeading: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  ctaSub: {
    color: "#000000",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 16,
  },
  ctaBtn: {
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
