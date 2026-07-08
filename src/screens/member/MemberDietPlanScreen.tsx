import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { getDietPlans } from "../../services/api";

interface Meal {
  name: string;
  calories: number;
  time: string;
}

export default function MemberDietPlanScreen() {
  const { colors } = useTheme();
  const [diet, setDiet] = useState<any>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiet = async () => {
    try {
      const res = await getDietPlans();
      if (res.success && res.data) {
        setDiet(res.data);
        setMeals(res.data.meals || []);
      }
    } catch (err) {
      console.warn("Failed fetching diet plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiet();
  }, []);

  const renderMealItem = useCallback(({ item }: { item: Meal }) => {
    return (
      <View style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.mealHeader}>
          <Text style={[styles.mealTime, { color: colors.primary }]}>{item.time}</Text>
          <View style={[styles.calorieBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.calorieText, { color: colors.text }]}>{item.calories} kcal</Text>
          </View>
        </View>
        <Text style={[styles.mealName, { color: colors.text }]}>{item.name}</Text>
      </View>
    );
  }, [colors]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalCalories = meals.reduce((sum, item) => sum + item.calories, 0);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.subTitle, { color: colors.textMuted }]}>DAILY NUTRITION PLAN</Text>
          <Text style={[styles.planTitle, { color: colors.primary }]}>{diet?.title || "Standard Balanced Diet"}</Text>
          <View style={styles.sumRow}>
            <Text style={[styles.sumLabel, { color: colors.textMuted }]}>Total Daily Intake Target:</Text>
            <Text style={[styles.sumValue, { color: colors.text }]}>{totalCalories} kcal</Text>
          </View>
        </View>

        <FlatList
          data={meals}
          renderItem={renderMealItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No nutrition diet plans assigned yet.
              </Text>
            </View>
          }
        />
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
    marginBottom: 12,
  },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingTop: 12,
  },
  sumLabel: {
    fontSize: 13,
  },
  sumValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mealCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealTime: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  calorieBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  calorieText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 22,
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
});
