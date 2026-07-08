import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../utils/ThemeContext";

const { width, height } = Dimensions.get("window");

interface Slide {
  id: string;
  emoji: string;
  title: string;
  desc: string;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    id: "1",
    emoji: "🏋️‍♂️",
    title: "Unleash The Beast",
    desc: "Welcome to Forge Gym! Get ready to transform your strength, discipline, and energy with premium equipment and certified fitness coaches.",
  },
  {
    id: "2",
    emoji: "🥗",
    title: "Tailored Diet & Workouts",
    desc: "Follow custom workout schedules and high-performance meal plans assigned directly to your dashboard by your personal trainers.",
  },
  {
    id: "3",
    emoji: "📅",
    title: "Mobile Check-Ins & Billing",
    desc: "Seamlessly log your daily attendance check-ins, monitor active streaks, manage payments, and download secure invoices on the go.",
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { colors } = useTheme();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < ONBOARDING_SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentSlideIndex(nextIndex);
    } else {
      try {
        await AsyncStorage.setItem("onboarded", "true");
        onFinish();
      } catch (err) {
        console.warn("Error saving onboarding state:", err);
      }
    }
  };

  const renderSlideItem = useCallback(({ item }: { item: Slide }) => {
    return (
      <View style={[styles.slideContainer, { backgroundColor: colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 120,
          }}
        >
          <Text style={styles.slideEmoji}>{item.emoji}</Text>
          <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.slideDesc, { color: colors.textMuted }]}>{item.desc}</Text>
        </ScrollView>
      </View>
    );
  }, [colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlideItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlideIndex(index);
        }}
      />

      {/* Slide Indicators */}
      <View style={styles.indicatorContainer}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              {
                backgroundColor: index === currentSlideIndex ? colors.primary : colors.border,
                width: index === currentSlideIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Button Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.actionBtnText}>
            {currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? "GET STARTED 🚀" : "NEXT ➡️"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    width: width,
    height: height * 0.75,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  slideEmoji: {
    fontSize: 90,
    marginBottom: 30,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  slideDesc: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 26,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  controlsContainer: {
    paddingHorizontal: 30,
    marginBottom: 60,
  },
  actionBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#eab308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
