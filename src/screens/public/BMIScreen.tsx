import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

const { width } = Dimensions.get("window");

// Custom Slider Component built from scratch to avoid extra native binary dependencies
const CustomSlider = ({ min, max, value, onChange, colors }: any) => {
  const [sliderWidth, setSliderWidth] = useState(0);

  const handleTouch = (event: any) => {
    if (sliderWidth === 0) return;
    const touchX = event.nativeEvent.locationX;
    const percentage = Math.min(Math.max(touchX / sliderWidth, 0), 1);
    const newValue = Math.round(min + percentage * (max - min));
    onChange(newValue);
  };

  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <View
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleTouch}
      onResponderMove={handleTouch}
      style={styles.sliderContainer}
    >
      {/* Slider Track */}
      <View style={[styles.sliderTrack, { backgroundColor: colors.border }]} />
      {/* Active Fill Track */}
      <View
        style={[
          styles.sliderActiveFill,
          {
            backgroundColor: colors.primary,
            width: `${fillPercent}%`,
          },
        ]}
      />
      {/* Draggable Thumb Indicator */}
      <View
        style={[
          styles.sliderThumb,
          {
            borderColor: colors.primary,
            backgroundColor: colors.white,
            left: `${fillPercent}%`,
          },
        ]}
      />
    </View>
  );
};

export default function BMIScreen() {
  const { colors } = useTheme();

  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(175); // cm
  const [weight, setWeight] = useState(70); // kg

  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [idealWeight, setIdealWeight] = useState("");
  const [advice, setAdvice] = useState<string[]>([]);

  const calculateBMI = () => {
    if (height <= 0 || weight <= 0) return;

    const heightM = height / 100;
    const bmiVal = parseFloat((weight / (heightM * heightM)).toFixed(1));
    setBmi(bmiVal);

    // Calculate Status & Advice matching web logic exactly
    let statusStr = "";
    let adviceList: string[] = [];

    if (bmiVal < 18.5) {
      statusStr = "Underweight";
      adviceList = [
        "Focus on calorie-dense, nutrient-rich diets.",
        "Integrate progressive overload resistance training to build muscle mass.",
        "Limit high-intensity cardio exercises to preserve energy balances."
      ];
    } else if (bmiVal >= 18.5 && bmiVal < 25) {
      statusStr = "Normal Weight";
      adviceList = [
        "Maintain current balanced diets containing clean proteins and carbs.",
        "Perform a mix of strength training and cardio sessions weekly.",
        "Prioritize solid sleep cycles and recovery periods."
      ];
    } else if (bmiVal >= 25 && bmiVal < 30) {
      statusStr = "Overweight";
      adviceList = [
        "Create a moderate calorie deficit, focusing on high protein intake.",
        "Increase active caloric burn with HIIT or strength supersets.",
        "Drink at least 3-4 liters of water daily to enhance metabolisms."
      ];
    } else {
      statusStr = "Obese";
      adviceList = [
        "Seek a professional nutritionist program to secure proper food logs.",
        "Start with low-impact cardio (swimming, walking) and light weight sessions.",
        "Avoid sugar-dense and highly processed fast foods."
      ];
    }

    setStatus(statusStr);
    setAdvice(adviceList);

    // Ideal Weight Range (Devine formula estimate)
    const idealLow = Math.round(18.5 * heightM * heightM);
    const idealHigh = Math.round(24.9 * heightM * heightM);
    setIdealWeight(`${idealLow} kg - ${idealHigh} kg`);
  };

  const getStatusColor = (classification: string) => {
    switch (classification) {
      case "Normal Weight": return colors.success;
      case "Overweight": return colors.secondary;
      case "Obese": return colors.accent;
      default: return colors.primary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        >
          {/* Input Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.primary }]}>BODY METRICS</Text>
            <Text style={[styles.heading, { color: colors.text }]}>BMI Calculator</Text>

            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Gender</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setGender("male")}
                  style={[
                    styles.genderBtn,
                    {
                      backgroundColor: gender === "male" ? colors.primary : colors.background,
                      borderColor: gender === "male" ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.genderBtnText, { color: gender === "male" ? colors.black : colors.text }]}>
                    🙋‍♂️ Male
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setGender("female")}
                  style={[
                    styles.genderBtn,
                    {
                      backgroundColor: gender === "female" ? colors.primary : colors.background,
                      borderColor: gender === "female" ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.genderBtnText, { color: gender === "female" ? colors.black : colors.text }]}>
                    🙋‍♀️ Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Age Slider */}
            <View style={styles.inputGroup}>
              <View style={styles.sliderLabelRow}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Age</Text>
                <Text style={[styles.sliderValueText, { color: colors.primary }]}>{age} Years</Text>
              </View>
              <CustomSlider min={10} max={80} value={age} onChange={setAge} colors={colors} />
            </View>

            {/* Height Slider */}
            <View style={styles.inputGroup}>
              <View style={styles.sliderLabelRow}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Height</Text>
                <Text style={[styles.sliderValueText, { color: colors.primary }]}>{height} cm</Text>
              </View>
              <CustomSlider min={120} max={220} value={height} onChange={setHeight} colors={colors} />
            </View>

            {/* Weight Slider */}
            <View style={styles.inputGroup}>
              <View style={styles.sliderLabelRow}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Weight</Text>
                <Text style={[styles.sliderValueText, { color: colors.primary }]}>{weight} kg</Text>
              </View>
              <CustomSlider min={30} max={150} value={weight} onChange={setWeight} colors={colors} />
            </View>

            <TouchableOpacity
              onPress={calculateBMI}
              activeOpacity={0.8}
              style={[styles.calcBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.calcBtnText}>CALCULATE BMI</Text>
            </TouchableOpacity>
          </View>

          {/* Result Panel */}
          {bmi !== null && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
              <Text style={[styles.resultTitle, { color: colors.text }]}>Your BMI Result</Text>
              
              <View style={styles.resultDisplayRow}>
                <View style={[styles.scoreBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                  <Text style={[styles.scoreVal, { color: colors.primary }]}>{bmi}</Text>
                  <Text style={[styles.scoreLabel, { color: colors.primary }]}>SCORE</Text>
                </View>
                <View style={styles.resultMeta}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Classification</Text>
                  <Text style={[styles.metaValue, { color: getStatusColor(status) }]}>{status}</Text>
                  <Text style={[styles.metaRange, { color: colors.textMuted }]}>
                    Ideal weight target: <Text style={{ color: colors.primary, fontWeight: "bold" }}>{idealWeight}</Text>
                  </Text>
                </View>
              </View>

              {/* Progress gauge bar */}
              <View style={[styles.gaugeBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.gaugeFill,
                    {
                      backgroundColor: getStatusColor(status),
                      width: `${Math.min((bmi / 40) * 100, 100)}%`
                    }
                  ]}
                />
              </View>

              {/* Health & Training Advice */}
              <View style={[styles.adviceSection, { borderTopColor: colors.border }]}>
                <Text style={[styles.adviceHeading, { color: colors.text }]}>Health & Training Advice</Text>
                <View style={styles.adviceList}>
                  {advice.map((item, idx) => (
                    <View key={idx} style={styles.adviceItem}>
                      <Text style={[styles.adviceBullet, { color: colors.primary }]}>✓</Text>
                      <Text style={[styles.adviceText, { color: colors.textMuted }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Reference Guide Grid */}
          <View style={styles.guideContainer}>
            <Text style={[styles.guideTitle, { color: colors.textMuted }]}>REFERENCE GUIDE</Text>
            <Text style={[styles.guideHeading, { color: colors.text }]}>BMI Range Classifications</Text>

            <View style={styles.guideGrid}>
              <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.guideCardBadge, { color: colors.primary }]}>Underweight</Text>
                <Text style={[styles.guideCardRange, { color: colors.text }]}>Below 18.5</Text>
                <Text style={[styles.guideCardDesc, { color: colors.textMuted }]}>
                  Body mass is lower than ideal requirements. Focus on muscle building.
                </Text>
              </View>

              <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.success, borderLeftWidth: 2 }]}>
                <Text style={[styles.guideCardBadge, { color: colors.success }]}>Normal Range</Text>
                <Text style={[styles.guideCardRange, { color: colors.text }]}>18.5 - 24.9</Text>
                <Text style={[styles.guideCardDesc, { color: colors.textMuted }]}>
                  Perfect weight proportion to height. Maintain healthy lifestyle.
                </Text>
              </View>

              <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.guideCardBadge, { color: colors.secondary }]}>Overweight</Text>
                <Text style={[styles.guideCardRange, { color: colors.text }]}>25.0 - 29.9</Text>
                <Text style={[styles.guideCardDesc, { color: colors.textMuted }]}>
                  Moderate body mass excess. Consider cardiovascular programs.
                </Text>
              </View>

              <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.accent, borderLeftWidth: 2 }]}>
                <Text style={[styles.guideCardBadge, { color: colors.accent }]}>Obese</Text>
                <Text style={[styles.guideCardRange, { color: colors.text }]}>30.0 & Above</Text>
                <Text style={[styles.guideCardDesc, { color: colors.textMuted }]}>
                  High proportion of fat deposits. Consultation and diet control advised.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 6,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  genderBtnText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  sliderLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderValueText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  sliderContainer: {
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    width: "100%",
  },
  sliderActiveFill: {
    height: 6,
    borderRadius: 3,
    position: "absolute",
    left: 0,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    position: "absolute",
    top: 8,
    marginLeft: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  calcBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  calcBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scoreBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreVal: {
    fontSize: 32,
    fontWeight: "900",
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  resultMeta: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 2,
  },
  metaRange: {
    fontSize: 12,
    marginTop: 4,
  },
  gaugeBg: {
    height: 8,
    borderRadius: 4,
    marginVertical: 18,
  },
  gaugeFill: {
    height: "100%",
    borderRadius: 4,
  },
  adviceSection: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  adviceHeading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },
  adviceList: {
    gap: 10,
  },
  adviceItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  adviceBullet: {
    fontSize: 14,
    fontWeight: "bold",
  },
  adviceText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  guideContainer: {
    marginTop: 30,
  },
  guideTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  guideHeading: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  guideGrid: {
    gap: 12,
  },
  guideCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  guideCardBadge: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  guideCardRange: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  guideCardDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
