import React from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

const { width } = Dimensions.get("window");

export default function AboutScreen({ navigation }: any) {
  const { colors } = useTheme();

  const timeline = [
    { year: "2016", title: "Forge Gym Founded", description: "Started as a single local powerlifting warehouse." },
    { year: "2019", title: "Expansion & Cardio Integration", description: "Upgraded facilities to 10,000 sq ft, introducing modern cardio machinery and amenities." },
    { year: "2022", title: "Elite Health App Launch", description: "Launched our full-stack coaching, diet scheduling, and digital tracking dashboard." },
    { year: "2026", title: "Global Expansion", description: "Voted #1 premium fitness experience across the metropolitan region." }
  ];

  const coreValues = [
    { title: "Peak Performance", description: "Pushing limits to achieve physical excellence and unlock potential." },
    { title: "Discipline & Grit", description: "Consistency and dedication are the cornerstones of lasting transformations." },
    { title: "Empathetic Coaching", description: "Our trainers meet you where you are to guide you safely to where you want to be." },
    { title: "Inclusive Community", description: "A supportive environment where every level of fitness feels at home." }
  ];

  const stats = [
    { label: "Happy Members", val: "500+" },
    { label: "Certified Coaches", val: "20+" },
    { label: "Years Experience", val: "10+" },
    { label: "Support Schedule", val: "24/7" },
  ];

  const handleStartToday = () => {
    if (navigation) {
      navigation.navigate("MainPortal", { screen: "MembershipTab" });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Hero Banner Background */}
        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800" }}
          style={styles.heroBackground}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={[styles.badge, { borderColor: colors.primary + "50", backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>OUR STORY</Text>
            </View>
            <Text style={[styles.heroHeading, { color: colors.white }]}>
              We Forge <Text style={{ color: colors.primary }}>Champions</Text>
            </Text>
            <Text style={styles.heroSubheading}>
              Since 2016, we have been more than a gym. We are a sanctuary of growth, strength, and transformation.
            </Text>
          </View>
        </ImageBackground>

        {/* Stats and Description Card */}
        <View style={styles.sectionContainer}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionSubtitle, { color: colors.primary }]}>ABOUT US</Text>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>We Help You Build Strength & Discipline</Text>
            <Text style={[styles.descText, { color: colors.textMuted }]}>
              Our facilities are structured to generate maximum results. Whether you aim for weight loss, mass gain, or powerlifting prep, our trainers are ready to guide you.
            </Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {stats.map((item, idx) => (
                <View key={idx} style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{item.val}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Timeline Milestones Section */}
        <View style={[styles.sectionContainer, { marginTop: 10 }]}>
          <Text style={[styles.sectionSubtitle, { color: colors.primary, textAlign: "center" }]}>MILESTONES</Text>
          <Text style={[styles.sectionHeading, { color: colors.text, textAlign: "center", marginBottom: 20 }]}>
            The Journey So Far
          </Text>

          <View style={styles.timelineList}>
            {timeline.map((item, idx) => (
              <View key={idx} style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.timelineYear, { color: colors.primary }]}>{item.year}</Text>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.timelineDesc, { color: colors.textMuted }]}>{item.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Core Values Section */}
        <View style={[styles.sectionContainer, { marginTop: 24 }]}>
          <Text style={[styles.sectionSubtitle, { color: colors.primary, textAlign: "center" }]}>OUR CORE VALUES</Text>
          <Text style={[styles.sectionHeading, { color: colors.text, textAlign: "center", marginBottom: 20 }]}>
            What Drives Forge Gym
          </Text>

          <View style={styles.valuesGrid}>
            {coreValues.map((value, idx) => (
              <View key={idx} style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.valueIndexBg, { backgroundColor: colors.primary + "15" }]}>
                  <Text style={[styles.valueIndex, { color: colors.primary }]}>{idx + 1}</Text>
                </View>
                <Text style={[styles.valueTitle, { color: colors.text }]}>{value.title}</Text>
                <Text style={[styles.valueDesc, { color: colors.textMuted }]}>{value.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Call to Action Section */}
        <View style={[styles.ctaSection, { backgroundColor: colors.primary }]}>
          <Text style={styles.ctaHeading}>Are You Ready to Transform?</Text>
          <Text style={styles.ctaSubtext}>
            Claim your 50% discount and get immediate access to customized plans and coaching.
          </Text>
          <TouchableOpacity
            onPress={handleStartToday}
            activeOpacity={0.9}
            style={[styles.ctaBtn, { backgroundColor: colors.black }]}
          >
            <Text style={[styles.ctaBtnText, { color: colors.white }]}>START TRAINING TODAY</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBackground: {
    width: width,
    height: 380,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  heroContent: {
    padding: 24,
    paddingBottom: 36,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  heroHeading: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroSubheading: {
    color: "#d4d4d8",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 6,
    lineHeight: 28,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  timelineList: {
    gap: 12,
  },
  timelineCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  timelineYear: {
    fontSize: 22,
    fontWeight: "900",
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
  },
  timelineDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  valuesGrid: {
    gap: 16,
  },
  valueCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  valueIndexBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  valueIndex: {
    fontSize: 16,
    fontWeight: "bold",
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  valueDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  ctaSection: {
    marginTop: 40,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  ctaHeading: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  ctaSubtext: {
    color: "rgba(0,0,0,0.8)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  ctaBtn: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
