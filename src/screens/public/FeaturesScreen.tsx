import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

export default function FeaturesScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.primary }]}>OUR FEATURES</Text>
          <Text style={[styles.heading, { color: colors.text }]}>World-Class Facilities</Text>

          {[
            { icon: "🏋️‍♂️", title: "Heavy Weight Training Zones", desc: "Top-tier barbells, racks, platforms, and dumbbells ranging up to 60kg for intense compound lifts." },
            { icon: "🚴‍♀️", title: "Cardio Zones & HIIT Classes", desc: "High-performance air bikes, rowers, self-powered treadmills, and dynamic functional crossfit rigs." },
            { icon: "🧖‍♀️", title: "Steam Room & Sauna", desc: "Flush out toxins and speed up recovery in our dry rock saunas and hot steam rooms." },
            { icon: "🚿", title: "Luxury Locker Rooms", desc: "Private showers, keyless smart lockers, vanity desks, and premium grooming products." },
            { icon: "🔑", title: "24/7 Access Pass", desc: "Elite membership holders get unrestricted scan-in keyless access to work out anytime." },
            { icon: "🥤", title: "Nutrition & Protein Bar", desc: "Post-workout hydration, customized shakes, protein cookies, and performance supplements." }
          ].map((item, idx) => (
            <View key={idx} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    marginTop: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  itemIcon: {
    fontSize: 32,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
});
