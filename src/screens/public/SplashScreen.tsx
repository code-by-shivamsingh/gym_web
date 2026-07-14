import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Dimensions, StatusBar, Text } from "react-native";
import SplashScreenNative from "react-native-splash-screen";

interface SplashScreenProps {
  isReady: boolean;
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isReady, onAnimationComplete }) => {
  // Start fully visible (opacity 1, scale 1) to match the native static splash screen exactly.
  // This completely resolves the "double splash" or "logo blink" visual issue.
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [exitStarted, setExitStarted] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // 1. Instantly hide the static native splash screen as soon as the JS layout is mounted.
    // Because the JS logo renders at opacity 1 and scale 1 in the exact same spot,
    // this transition is completely seamless and does not produce a visual "flash" or double logo.
    try {
      SplashScreenNative.hide();
      console.log("[Splash JS] Native static splash hidden seamlessly.");
    } catch (e) {
      console.warn("[Splash JS] Could not hide native splash:", e);
    }

    // 2. Run a gentle zoom/loading animation (scale from 1.0 to 1.12 over 1500ms)
    Animated.timing(scaleAnim, {
      toValue: 1.12,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      // 3. Mark minimum display time as elapsed after the zoom completes
      setMinTimeElapsed(true);
    });
  }, [scaleAnim]);

  useEffect(() => {
    // 4. Trigger the exit fade-out ONLY when the minimum display time has elapsed
    // AND the parent navigation bootstrap logic (isReady) is fully complete.
    if (minTimeElapsed && isReady && !exitStarted) {
      setExitStarted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.25,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationComplete();
      });
    }
  }, [minTimeElapsed, isReady, fadeAnim, scaleAnim, onAnimationComplete, exitStarted]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.Image
          source={require("../../../assets/images/logo.webp")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>FORGE GYM</Text>
        <Text style={styles.subtitle}>ELITE FITNESS CLUB</Text>
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    marginBottom: 15,
  },
  title: {
    color: "#D4AF37", // Gold accent color
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 4,
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 5,
    marginTop: 6,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
