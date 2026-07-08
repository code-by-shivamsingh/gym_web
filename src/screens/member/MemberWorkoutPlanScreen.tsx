import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getWorkoutPlans } from "../../services/api";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  done: boolean;
}

export default function MemberWorkoutPlanScreen() {
  const { colors } = useTheme();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "weekly">("active");

  const weeklySchedule = [
    { day: "Monday", workout: "Chest & Triceps" },
    { day: "Tuesday", workout: "Back & Biceps" },
    { day: "Wednesday", workout: "Legs" },
    { day: "Thursday", workout: "Shoulders" },
    { day: "Friday", workout: "Arms" },
    { day: "Saturday", workout: "Cardio Split" },
  ];

  const fetchWorkout = async () => {
    try {
      const res = await getWorkoutPlans();
      if (res.success && res.data) {
        setWorkout(res.data);
        setExercises(res.data.exercises || []);
      }
    } catch (err) {
      console.warn("Failed fetching workout plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, []);

  const toggleExercise = (index: number) => {
    const updated = [...exercises];
    updated[index].done = !updated[index].done;
    setExercises(updated);
  };

  const renderExerciseItem = useCallback(({ item, index }: { item: Exercise; index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => toggleExercise(index)}
        activeOpacity={0.7}
        style={[
          styles.exerciseCard,
          {
            backgroundColor: colors.card,
            borderColor: item.done ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.cardLeft}>
          <Text style={[styles.exerciseName, { color: colors.text, textDecorationLine: item.done ? "line-through" : "none" }]}>
            {item.name}
          </Text>
          <Text style={[styles.exerciseStats, { color: colors.textMuted }]}>
            {item.sets} Sets × {item.reps} Reps
          </Text>
        </View>
        <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: item.done ? colors.primary : "transparent" }]}>
          {item.done && <Text style={styles.check}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  }, [colors, exercises]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        
        {/* Tab Toggle buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("active")}
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === "active" ? colors.primary : colors.card,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === "active" ? colors.black : colors.textMuted }]}>
              🏋️ Exercises
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab("weekly")}
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === "weekly" ? colors.primary : colors.card,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === "weekly" ? colors.black : colors.textMuted }]}>
              📅 Weekly Split
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "active" ? (
          <View style={{ flex: 1 }}>
            <View style={[styles.headerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.subTitle, { color: colors.textMuted }]}>ACTIVE PLAN</Text>
              <Text style={[styles.planTitle, { color: colors.primary }]}>{workout?.title || "Standard Workout Schedule"}</Text>
              <Text style={[styles.planDesc, { color: colors.textMuted }]}>
                Complete your daily set target. Check off exercises as you finish them.
              </Text>
            </View>

            <FlatList
              data={exercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No workouts assigned yet. Standard routine default is chest and triceps.
                  </Text>
                </View>
              }
            />
          </View>
        ) : (
          <FlatList
            data={weeklySchedule}
            renderItem={({ item }) => (
              <View style={[styles.weeklyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.weeklyDay, { color: colors.primary }]}>{item.day}</Text>
                <Text style={[styles.weeklyWorkout, { color: colors.text }]}>{item.workout}</Text>
              </View>
            )}
            keyExtractor={(item) => item.day}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerBox: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  planDesc: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  exerciseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  cardLeft: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseStats: {
    fontSize: 13,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  check: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  weeklyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  weeklyDay: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  weeklyWorkout: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
  },
});
