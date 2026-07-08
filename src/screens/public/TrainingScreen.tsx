import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

const { width } = Dimensions.get("window");

interface ProgramItem {
  title: string;
  icon: string;
  image?: string;
  description: string;
  features?: string[];
  isExtra?: boolean;
}

const PROGRAMS: ProgramItem[] = [
  {
    title: "Cardio Training",
    icon: "🏃",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600",
    description: "Improve stamina, burn calories, boost heart health and increase endurance with world-class cardio equipment.",
    features: ["Treadmills", "Cycling", "HIIT Workouts", "Fat Burn Programs"],
  },
  {
    title: "Strength Training",
    icon: "🏋️",
    image: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=600",
    description: "Build muscle, gain strength and transform your physique with expert-guided strength programs.",
    features: ["Free Weights", "Powerlifting", "Muscle Building", "Functional Training"],
  },
  {
    title: "Yoga & Flexibility",
    icon: "🧘‍♂️",
    description: "Develop mindfulness, flexibility, balance, and core stability in our instructor-guided dynamic flow sessions.",
    isExtra: true,
  },
  {
    title: "CrossFit Circuit",
    icon: "🔥",
    description: "High-intensity functional conditioning using ropes, kettlebells, rowing machine challenges, and sandbags.",
    isExtra: true,
  },
  {
    title: "Powerlifting Setup",
    icon: "💪",
    description: "Master barbell mechanics on compound moves: Squat, Bench Press, and Deadlift under specialized guidance.",
    isExtra: true,
  },
  {
    title: "HIIT Conditioning",
    icon: "⏱️",
    description: "Short intervals of max exertion followed by brief rests to elevate metabolic burn rate for up to 24 hours.",
    isExtra: true,
  },
];

export default function TrainingScreen({ navigation }: any) {
  const { colors } = useTheme();

  const handleStartTraining = () => {
    if (navigation) {
      // Navigate to the Trainers tab so they can book a slot with a coach
      navigation.navigate("TrainersTab");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>TRAINING PROGRAMS</Text>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Train Like A Champion</Text>
        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          Discover specialized training programs designed to improve endurance, build strength and unlock your full potential.
        </Text>

        {/* Render Primary Programs with Images */}
        {PROGRAMS.filter(p => !p.isExtra).map((prog, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {prog.image && (
              <Image source={{ uri: prog.image }} style={styles.image} resizeMode="cover" />
            )}
            
            <View style={styles.cardContent}>
              <View style={styles.titleRow}>
                <Text style={styles.icon}>{prog.icon}</Text>
                <Text style={[styles.title, { color: colors.text }]}>{prog.title}</Text>
              </View>

              <Text style={[styles.desc, { color: colors.textMuted }]}>{prog.description}</Text>

              {prog.features && (
                <View style={styles.featuresGrid}>
                  {prog.features.map((feat, fIdx) => (
                    <View key={fIdx} style={[styles.featureTag, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                      <Text style={[styles.featureText, { color: colors.primary }]}>✓ {feat}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={handleStartTraining}
                activeOpacity={0.8}
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.startBtnText}>START TRAINING NOW ⚡</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Additional Tracks Section */}
        <Text style={[styles.subsectionHeading, { color: colors.text, marginTop: 20 }]}>Specialized Workout Splits</Text>
        <View style={styles.extraGrid}>
          {PROGRAMS.filter(p => p.isExtra).map((prog, idx) => (
            <View key={idx} style={[styles.extraCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.extraHeader}>
                <View style={[styles.extraIconBg, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={styles.extraIcon}>{prog.icon}</Text>
                </View>
                <Text style={[styles.extraTitle, { color: colors.text }]} numberOfLines={1}>{prog.title}</Text>
              </View>
              <Text style={[styles.extraDesc, { color: colors.textMuted }]}>{prog.description}</Text>
            </View>
          ))}
        </View>

        {/* Choose Trainer Section */}
        <View style={[styles.trainerCta, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.trainerCtaHeading, { color: colors.text }]}>Need Personalized Guidance?</Text>
          <Text style={[styles.trainerCtaDesc, { color: colors.textMuted }]}>
            Book a one-on-one personal trainer session. Let our experts build a specific plan tailored exactly for your body.
          </Text>
          <TouchableOpacity
            onPress={handleStartTraining}
            activeOpacity={0.8}
            style={[styles.trainerBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.trainerBtnText}>CHOOSE YOUR TRAINER</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  subsectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  featureTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  featureText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  startBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  startBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  extraGrid: {
    gap: 12,
  },
  extraCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  extraHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  extraIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  extraIcon: {
    fontSize: 20,
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  extraDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  trainerCta: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    marginTop: 30,
    alignItems: "center",
  },
  trainerCtaHeading: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  trainerCtaDesc: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  trainerBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  trainerBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
