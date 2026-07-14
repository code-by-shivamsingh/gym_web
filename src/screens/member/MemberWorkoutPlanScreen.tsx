import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  Linking
} from "react-native";
import { WebView as RNWebView, WebViewProps } from "react-native-webview";
// Fix for react-native-webview TypeScript regression where props default to 'never'
const WebView = RNWebView as unknown as React.ComponentClass<WebViewProps>;
import { useTheme } from "../../utils/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import YoutubePlayer from "react-native-youtube-iframe";
import {
  getWorkoutProgram,
  getWorkoutDay,
  getWorkoutProgress,
  startWorkoutProgram,
  completeExercise,
  completeWorkoutDay,
  getWorkoutHistory,
  BASE_URL
} from "../../services/api";

const { width } = Dimensions.get("window");

interface Exercise {
  _id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipmentRequired: string;
  difficulty: string;
  calories: number;
  duration: number; // seconds
  sets: number;
  reps: string;
  restTime: number;
  tips?: string[];
  commonMistakes?: string[];
  safetyInstructions?: string[];
  videoUrl: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  order: number;
}

interface Day {
  _id: string;
  dayNumber: number;
  title: string;
  dayName: string;
  description: string;
  exercises: string[];
}

export default function MemberWorkoutPlanScreen() {
  const { colors } = useTheme();

  // Program & Progress States
  const [program, setProgram] = useState<any>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [activeDay, setActiveDay] = useState<Day | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  // UI/Loading States
  const [loading, setLoading] = useState(true);
  const [completingExerciseId, setCompletingExerciseId] = useState<string | null>(null);
  const [completingDay, setCompletingDay] = useState(false);
  const [viewMode, setViewMode] = useState<"workout" | "history">("workout");
  
  // Video Player Loading/Error States
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [debugVideoUrl, setDebugVideoUrl] = useState<string | null>(null);

  // Complete Day Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [caloriesInput, setCaloriesInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [congratsData, setCongratsData] = useState<any>(null);

  // Scrolling Refs
  const dayFlatListRef = useRef<FlatList>(null);
  const webViewRef = useRef<RNWebView<any>>(null);

  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle video player load/playback errors
  const handleVideoError = (reason: string) => {
    console.log(`[Video Player Error] Video failed to load. Reason: ${reason}`);
    setVideoLoading(false);
    setVideoError(true);
  };

  // Reset debug video on exercise change
  useEffect(() => {
    setDebugVideoUrl(null);
  }, [currentExercise]);

  // Consolidated video loading effect with failsafe timers and logging
  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setVideoLoading(true);
    setVideoError(false);
    setIsPlaying(true);

    const activeUrl = debugVideoUrl || (currentExercise ? currentExercise.videoUrl : "");

    if (activeUrl) {
      console.log("[Youtube Debug] Loading video. Active URL:", activeUrl);
      const ytId = getYouTubeId(activeUrl);
      console.log("[Youtube Debug] Extracted Video ID:", ytId);
      const playlistId = getYouTubePlaylistId(activeUrl);
      console.log("[Youtube Debug] Extracted Playlist ID:", playlistId);
      const isValidYt = isYouTube(activeUrl);
      console.log("[Youtube Debug] Is URL detected as YouTube?", isValidYt);
      console.log("[Youtube Debug] Extracted Video ID length valid (11)?", ytId.length === 11);

      // Failsafe timeout: if video is YouTube and doesn't load within 30 seconds, trigger error
      if (isValidYt) {
        if (!ytId) {
          console.log("[Youtube Debug] Detected YouTube URL but failed to extract 11-char Video ID. Triggering error.");
          handleVideoError("invalid_youtube_id");
        } else {
          loadingTimeoutRef.current = setTimeout(() => {
            console.log("[Youtube Debug] Loading timeout reached (30s) for YouTube player.");
            handleVideoError("loading_timeout");
          }, 30000); // 30 seconds timeout
        }
      } else {
        // Fallback for non-YouTube videos (MP4 in WebView) in case WebView load events don't fire
        loadingTimeoutRef.current = setTimeout(() => {
          console.log("[Video Debug] Non-YouTube load timeout (30s) reached.");
          handleVideoError("mp4_load_timeout");
        }, 30000); // 30 seconds timeout
      }
    } else {
      console.log("[Youtube Debug] No active video URL to load.");
      setVideoLoading(false);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [currentExercise, debugVideoUrl]);

  const handleTestDiagnosticVideo = () => {
    console.log("[Youtube Debug] Triggering Diagnostic Test Video (dQw4w9WgXcQ)");
    setVideoLoading(true);
    setVideoError(false);
    setIsPlaying(true);
    setDebugVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    setPlayerKey((prev) => prev + 1);
  };

  const handleRetryVideo = () => {
    setVideoError(false);
    setVideoLoading(true);
    setPlayerKey((prev) => prev + 1);
  };

  // Helper: YouTube Detection
  const isYouTube = (url: string) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  // Helper: Extract YouTube ID
  const getYouTubeId = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return "";
  };

  // Helper: Extract YouTube Playlist ID
  const getYouTubePlaylistId = (url: string) => {
    if (!url) return "";
    const match = url.match(/[?&]list=([^#\&\?]+)/);
    return match ? match[1] : "";
  };

  // Helper: Extract YouTube start time query parameter
  const getYouTubeStartSeconds = (url: string) => {
    if (!url) return 0;
    const secMatch = url.match(/[?&]t=(\d+)(s)?/);
    if (secMatch) {
      return parseInt(secMatch[1]);
    }
    const minSecMatch = url.match(/[?&]t=(?:(\d+)m)?(?:(\d+)s)?/);
    if (minSecMatch) {
      const minutes = minSecMatch[1] ? parseInt(minSecMatch[1]) : 0;
      const seconds = minSecMatch[2] ? parseInt(minSecMatch[2]) : 0;
      return minutes * 60 + seconds;
    }
    return 0;
  };

  // Helper: Format Video URL
  const getVideoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  };

  // Fetch initial data
  const loadData = async (initial = true) => {
    try {
      if (initial) setLoading(true);
      const [progRes, progressRes, historyRes] = await Promise.all([
        getWorkoutProgram(),
        getWorkoutProgress(),
        getWorkoutHistory()
      ]);

      let currentProg = progressRes?.data;

      if (progRes.success && progRes.data) {
        setProgram(progRes.data.program);
        const daysList = progRes.data.days || [];
        setDays(daysList);
      }

      if (progressRes.success && progressRes.data) {
        setProgress(currentProg);
      }

      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data);
      }

      // Load active day exercises
      if (progRes.success && progRes.data && currentProg) {
        const dayToLoad = currentProg.currentDay || 1;
        await selectDay(dayToLoad, currentProg);
      }
    } catch (err) {
      console.warn("Error loading workout plan data:", err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Scroll to active day card on load or progress update
  useEffect(() => {
    if (progress && days.length > 0) {
      const activeIdx = days.findIndex(d => d.dayNumber === progress.currentDay);
      if (activeIdx !== -1) {
        setTimeout(() => {
          try {
            dayFlatListRef.current?.scrollToIndex({
              index: activeIdx,
              animated: true,
              viewPosition: 0.5
            });
          } catch (e) {
            // Ignore scroll errors if layout is not fully rendered
          }
        }, 500);
      }
    }
  }, [progress?.currentDay, days]);

  // Select Workout Day
  const selectDay = async (dayNumber: number, progressContext?: any) => {
    const activeProgress = progressContext || progress;
    if (activeProgress) {
      const isUnlocked =
        dayNumber <= (activeProgress.unlockedDay || 1) ||
        (activeProgress.unlockedDays && activeProgress.unlockedDays.includes(dayNumber));
      if (!isUnlocked) {
        return; // Locked
      }
    }

    try {
      const dayRes = await getWorkoutDay(dayNumber);
      if (dayRes.success && dayRes.data) {
        const loadedDay = dayRes.data;
        setActiveDay(loadedDay);
        const exList = loadedDay.exercises || [];
        setExercises(exList);

        // Resume last active video or first video of day
        let defaultEx = exList[0] || null;
        if (activeProgress && activeProgress.currentDay === dayNumber && activeProgress.lastActiveVideoId) {
          const matched = exList.find((ex: any) => ex._id === activeProgress.lastActiveVideoId);
          if (matched) defaultEx = matched;
        }

        setCurrentExercise(defaultEx);
      }
    } catch (err) {
      console.warn(`Error loading day ${dayNumber}:`, err);
    }
  };

  // Complete exercise
  const handleCompleteExercise = async (exerciseId: string) => {
    if (!program || !activeDay || !progress) return;
    setCompletingExerciseId(exerciseId);
    try {
      const res = await completeExercise(program._id, activeDay.dayNumber, exerciseId);
      if (res.success && res.data) {
        const updatedProgress = res.data;
        setProgress(updatedProgress);

        // Auto-progress playlist
        const currentIndex = exercises.findIndex((ex) => ex._id === exerciseId);
        if (currentIndex !== -1 && currentIndex + 1 < exercises.length) {
          const nextEx = exercises[currentIndex + 1];
          setCurrentExercise(nextEx);
        }
      }
    } catch (err) {
      console.warn("Error completing exercise:", err);
    } finally {
      setCompletingExerciseId(null);
    }
  };

  // Complete Workout Day
  const handleCompleteWorkoutDay = async () => {
    if (!program || !activeDay || !progress) return;
    
    setCompletingDay(true);
    setShowConfirmModal(false);

    const currentDayNum = activeDay.dayNumber;
    const nextDayNum = currentDayNum + 1;
    const hasNextDay = nextDayNum <= (program.durationDays || 7);

    // Calculate total calories and duration for tracking
    const totalCalories = exercises.reduce((acc, curr) => acc + (curr.calories || 0), 0);
    const totalMinutes = Math.round(exercises.reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60);

    const caloriesBurned = parseInt(caloriesInput) || totalCalories;
    const timeSpent = parseInt(timeInput) || totalMinutes;

    try {
      const res = await completeWorkoutDay(program._id, currentDayNum, caloriesBurned, timeSpent);
      if (res.success && res.data) {
        setProgress(res.data);
        
        // Show congrats overlay modal
        setCongratsData({
          dayNumber: currentDayNum,
          dayTitle: activeDay.title,
          calories: caloriesBurned,
          minutes: timeSpent,
          hasNextDay
        });
        setShowCongratsModal(true);

        // Reload logs
        const historyRes = await getWorkoutHistory();
        if (historyRes.success && historyRes.data) {
          setHistory(historyRes.data);
        }
      } else {
        Alert.alert("Error", res.message || "Failed to complete today's split.");
      }
    } catch (err) {
      console.warn("Complete day request failed:", err);
      Alert.alert("Error", "Something went wrong while logging progress.");
    } finally {
      setCompletingDay(false);
      setCaloriesInput("");
      setTimeInput("");
    }
  };

  // Reset Progression Call
  const handleResetProgram = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to restart your workout split? This will clear your current day progression status.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Reset",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const res = await startWorkoutProgram();
              if (res.success && res.data) {
                setProgress(res.data);
                await selectDay(1, res.data);
                Alert.alert("Success", "Progression has been reset back to Day 1!");
              }
            } catch (err) {
              console.warn("Reset failed:", err);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleYoutubePlayerError = (error: string) => {
    console.log("[Youtube Player Error] YouTube error occurred:", error);
    setVideoError(true);
    setVideoLoading(false);

    if (error === "embedded_video_not_allowed" || error === "video_not_found" || error === "html5_error") {
      if (currentExercise && currentExercise.videoUrl) {
        console.log("[Youtube Player Error] Automatically opening restricted video externally:", currentExercise.videoUrl);
        Linking.openURL(currentExercise.videoUrl).catch(() => {
          console.warn("[Youtube Player Error] Failed to open URL:", currentExercise.videoUrl);
        });
      }
    }
  };

  // Handle Event Bridge ended trigger
  const handleWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.event === "videoEnded" && currentExercise) {
        // Automatically complete the playing video
        handleCompleteExercise(currentExercise._id);
      }
    } catch (e) {
      // Message is not JSON or invalid format
    }
  };

  // Generate HTML wrapper string for local/external MP4 video player
  const generateVideoHtml = (exercise: Exercise | null) => {
    if (!exercise || !exercise.videoUrl) {
      console.log("[Video Player] No exercise or videoUrl provided.");
      return `
        <html>
          <body style="margin:0; background-color:#000; display:flex; align-items:center; justify-content:center; height:100vh;">
            <p style="color:#a1a1aa; font-family:sans-serif; text-align:center; font-size:18px; padding:20px;">
              🎥 Preparing Demonstration Video...
            </p>
          </body>
        </html>
      `;
    }

    const videoSource = getVideoUrl(exercise.videoUrl);
    console.log("[Video Player] Local/External video source formatted:", videoSource);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body { margin: 0; background-color: #000; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
            video { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <video id="localVideo" controls autoplay playsinline poster="${exercise.thumbnailUrl || exercise.thumbnail || ''}">
            <source src="${videoSource}" type="video/mp4">
            Your browser does not support HTML5 video.
          </video>
          <script>
            var video = document.getElementById('localVideo');
            video.onended = function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'videoEnded' }));
            };
          </script>
        </body>
      </html>
    `;
  };

  const isCurrentDayCompleted = () => {
    if (!progress || !activeDay) return false;
    return progress.completedDays.includes(activeDay.dayNumber);
  };

  const allExercisesCompleted = () => {
    if (exercises.length === 0 || !progress) return false;
    return exercises.every((ex) => progress.completedExercises.includes(ex._id));
  };

  const getDayProgressPercentage = () => {
    if (exercises.length === 0 || !progress) return 0;
    if (isCurrentDayCompleted()) return 100;
    const completedCount = exercises.filter((ex) => progress.completedExercises.includes(ex._id)).length;
    return Math.round((completedCount / exercises.length) * 100);
  };

  // Selection Button Handlers
  const handlePrevExercise = () => {
    const idx = exercises.findIndex((ex) => ex._id === currentExercise?._id);
    if (idx > 0) setCurrentExercise(exercises[idx - 1]);
  };

  const handleNextExercise = () => {
    const idx = exercises.findIndex((ex) => ex._id === currentExercise?._id);
    if (idx !== -1 && idx + 1 < exercises.length) setCurrentExercise(exercises[idx + 1]);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>Syncing Premium Workout Engine...</Text>
      </View>
    );
  }

  const activeVideoUrl = debugVideoUrl || (currentExercise ? currentExercise.videoUrl : "");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Netflix-style Premium Header Banner */}
        <View style={[styles.headerBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bannerInfo}>
            <View style={styles.badgeRow}>
              <Text style={[styles.badge, { backgroundColor: colors.primary, color: colors.background }]}>
                {program?.difficulty || "Beginner"} Program
              </Text>
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>7-Day Split Onboarding</Text>
            </View>
            <Text style={[styles.programTitle, { color: colors.text }]}>{program?.name}</Text>
            <Text style={[styles.programDesc, { color: colors.textMuted }]}>{program?.description}</Text>
          </View>

          {/* Progress Ring / Percentage Display */}
          <View style={styles.bannerProgress}>
            <View style={[styles.progressRing, { borderColor: colors.primary }]}>
              <Text style={[styles.progressPercentText, { color: colors.primary }]}>
                {progress?.percentage || 0}%
              </Text>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Complete</Text>
            </View>
            <TouchableOpacity onPress={handleResetProgram} style={[styles.resetBtn, { borderColor: colors.accent + "30" }]}>
              <Text style={[styles.resetBtnText, { color: colors.accent }]}>Reset Program</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Selector Horizontal Split Cards */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Select Workout Day</Text>
        </View>
        <View style={styles.daySelectorContainer}>
          <FlatList
            ref={dayFlatListRef}
            data={days}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => {
              const isCompleted = progress?.completedDays?.includes(item.dayNumber);
              const isUnlocked =
                item.dayNumber <= (progress?.unlockedDay || 1) ||
                (progress?.unlockedDays && progress?.unlockedDays.includes(item.dayNumber));
              const isActive = activeDay?.dayNumber === item.dayNumber;

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (!isUnlocked) {
                      Alert.alert("Locked Day", "Please complete your active workout splits to unlock this day.");
                      return;
                    }
                    selectDay(item.dayNumber);
                  }}
                  disabled={!isUnlocked}
                  style={[
                    styles.dayCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isActive
                        ? colors.primary
                        : isCompleted
                        ? colors.success + "40"
                        : colors.border,
                      opacity: isUnlocked ? 1 : 0.4
                    }
                  ]}
                >
                  <Text style={[styles.dayCardNum, { color: colors.primary }]}>Day {item.dayNumber}</Text>
                  <Text style={[styles.dayCardSub, { color: colors.textMuted }]}>{item.dayName || `Split ${item.dayNumber}`}</Text>
                  <Text numberOfLines={1} style={[styles.dayCardTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <View style={styles.dayStatusRow}>
                    {isCompleted ? (
                      <Text style={[styles.statusText, { color: colors.success }]}>🟢 Done</Text>
                    ) : !isUnlocked ? (
                      <Text style={[styles.statusText, { color: colors.textMuted }]}>🔒 Locked</Text>
                    ) : isActive ? (
                      <Text style={[styles.statusText, { color: colors.primary }]}>🟡 Active</Text>
                    ) : (
                      <Text style={[styles.statusText, { color: colors.text }]}>⚪ Unlocked</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* View Mode Switching Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setViewMode("workout")}
            style={[
              styles.tabBtn,
              {
                backgroundColor: viewMode === "workout" ? colors.primary : colors.card,
                borderColor: viewMode === "workout" ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={[styles.tabBtnText, { color: viewMode === "workout" ? colors.background : colors.text }]}>
              🏋️ Workout Streamer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("history")}
            style={[
              styles.tabBtn,
              {
                backgroundColor: viewMode === "history" ? colors.primary : colors.card,
                borderColor: viewMode === "history" ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={[styles.tabBtnText, { color: viewMode === "history" ? colors.background : colors.text }]}>
              📊 Completion Logs
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === "workout" ? (
          <View style={styles.workoutFlowContainer}>
            {/* WebView Dynamic Player */}
            {/* WebView Dynamic Player */}
            <View style={[styles.playerWrapper, { borderColor: colors.border }]}>
              {currentExercise && activeVideoUrl ? (
                <>
                  {videoError ? (
                    <View style={styles.playerErrorContainer}>
                      <MaterialIcons name="error-outline" color={colors.accent} size={40} />
                      <Text style={[styles.playerErrorTitle, { color: colors.text }]}>
                        Failed to load video
                      </Text>
                      <Text style={[styles.playerErrorSub, { color: colors.textMuted }]}>
                        This demonstration video could not be loaded.
                      </Text>
                      <TouchableOpacity
                        onPress={handleRetryVideo}
                        style={[styles.playerRetryBtn, { backgroundColor: colors.primary }]}
                      >
                        <Text style={[styles.playerRetryText, { color: colors.background }]}>
                          🔄 Retry Video
                        </Text>
                      </TouchableOpacity>
                      {activeVideoUrl && isYouTube(activeVideoUrl) && (
                        <TouchableOpacity
                          onPress={() => {
                            Linking.openURL(activeVideoUrl).catch(() => {
                              Alert.alert("Error", "Unable to open YouTube link.");
                            });
                          }}
                          style={[styles.playerRetryBtn, { backgroundColor: colors.border, marginTop: 10 }]}
                        >
                          <Text style={[styles.playerRetryText, { color: colors.text }]}>
                            📺 Open in YouTube
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={handleTestDiagnosticVideo}
                        style={[styles.playerRetryBtn, { backgroundColor: colors.accent, marginTop: 10 }]}
                      >
                        <Text style={[styles.playerRetryText, { color: colors.background }]}>
                          🛠️ Play Test YouTube Video
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {isYouTube(activeVideoUrl) ? (
                        getYouTubeId(activeVideoUrl) ? (
                          <YoutubePlayer
                            key={getYouTubeId(activeVideoUrl) || playerKey}
                            height={(width - 32) * 9 / 16}
                            play={isPlaying}
                            videoId={getYouTubeId(activeVideoUrl)}
                            initialPlayerParams={{
                              start: getYouTubeStartSeconds(activeVideoUrl),
                              rel: false,
                              preventFullScreen: false,
                            }}
                            onChangeState={(state: string) => {
                              console.log("[Youtube Debug] onChangeState fired:", state);
                              if (state === "ended") {
                                handleCompleteExercise(currentExercise._id);
                              }
                              if (state === "playing") {
                                setIsPlaying(true);
                              }
                              if (state === "paused") {
                                setIsPlaying(false);
                              }
                            }}
                            onReady={() => {
                              console.log("[Youtube Debug] Player onReady fired. Setting videoLoading to false.");
                              if (loadingTimeoutRef.current) {
                                clearTimeout(loadingTimeoutRef.current);
                                loadingTimeoutRef.current = null;
                              }
                              setVideoLoading(false);
                            }}
                            onError={(err: string) => {
                              console.log("[Youtube Debug] Player onError fired:", err);
                              if (loadingTimeoutRef.current) {
                                clearTimeout(loadingTimeoutRef.current);
                                loadingTimeoutRef.current = null;
                              }
                              handleVideoError("youtube_player_error_" + err);
                            }}
                            webViewProps={{
                              androidLayerType: "hardware",
                              originWhitelist: ["*"],
                              mixedContentMode: "always",
                              domStorageEnabled: true,
                              javaScriptEnabled: true,
                              onLoad: () => {
                                console.log("[Youtube Debug] Internal WebView onLoad successfully fired");
                              },
                              onLoadStart: () => {
                                console.log("[Youtube Debug] Internal WebView onLoadStart fired");
                              },
                              onLoadEnd: () => {
                                console.log("[Youtube Debug] Internal WebView onLoadEnd fired");
                              },
                              onError: (syntheticEvent) => {
                                const { nativeEvent } = syntheticEvent;
                                console.log("[Youtube Debug] Internal WebView onError fired:", nativeEvent);
                                if (loadingTimeoutRef.current) {
                                  clearTimeout(loadingTimeoutRef.current);
                                  loadingTimeoutRef.current = null;
                                }
                                handleVideoError("youtube_webview_error");
                              },
                              onHttpError: (syntheticEvent) => {
                                const { nativeEvent } = syntheticEvent;
                                console.log("[Youtube Debug] Internal WebView onHttpError fired:", nativeEvent);
                                if (loadingTimeoutRef.current) {
                                  clearTimeout(loadingTimeoutRef.current);
                                  loadingTimeoutRef.current = null;
                                }
                                handleVideoError("youtube_webview_http_error");
                              }
                            }}
                          />
                        ) : (
                          <View style={styles.playerErrorContainer}>
                            <MaterialIcons name="error-outline" color={colors.accent} size={40} />
                            <Text style={[styles.playerErrorTitle, { color: colors.text }]}>
                              Invalid YouTube Link
                            </Text>
                            <Text style={[styles.playerErrorSub, { color: colors.textMuted }]}>
                              The provided exercise video link is formatted incorrectly.
                            </Text>
                            {activeVideoUrl && (
                              <TouchableOpacity
                                onPress={() => {
                                  Linking.openURL(activeVideoUrl).catch(() => {
                                    Alert.alert("Error", "Unable to open link.");
                                  });
                                }}
                                style={[styles.playerRetryBtn, { backgroundColor: colors.border, marginTop: 10 }]}
                              >
                                <Text style={[styles.playerRetryText, { color: colors.text }]}>
                                  🔗 Open Original URL
                                </Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              onPress={handleTestDiagnosticVideo}
                              style={[styles.playerRetryBtn, { backgroundColor: colors.accent, marginTop: 10 }]}
                            >
                              <Text style={[styles.playerRetryText, { color: colors.background }]}>
                                🛠️ Play Test YouTube Video
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )
                      ) : (
                        <WebView
                          key={playerKey}
                          ref={webViewRef}
                          source={{
                            html: generateVideoHtml(currentExercise),
                            baseUrl: BASE_URL
                          }}
                          style={[styles.webView, (videoLoading || videoError) && { width: 0, height: 0, opacity: 0 }]}
                          allowsFullscreenVideo={true}
                          javaScriptEnabled={true}
                          domStorageEnabled={true}
                          onMessage={handleWebViewMessage}
                          originWhitelist={["*"]}
                          mixedContentMode="always"
                          mediaPlaybackRequiresUserAction={false}
                          allowsInlineMediaPlayback={true}
                          onLoadStart={() => setVideoLoading(true)}
                          onLoadEnd={() => {
                            console.log("[Video Debug] WebView onLoadEnd for MP4 video fired.");
                            if (loadingTimeoutRef.current) {
                              clearTimeout(loadingTimeoutRef.current);
                              loadingTimeoutRef.current = null;
                            }
                            setVideoLoading(false);
                          }}
                          onError={() => {
                            console.log("[Video Debug] WebView onError for MP4 video fired.");
                            if (loadingTimeoutRef.current) {
                              clearTimeout(loadingTimeoutRef.current);
                              loadingTimeoutRef.current = null;
                            }
                            handleVideoError("mp4_webview_error");
                          }}
                        />
                      )}
                    </>
                  )}
                  {videoLoading && !videoError && (
                    <View style={styles.playerLoadingContainer}>
                      <ActivityIndicator color={colors.primary} size="large" />
                      <Text style={[styles.playerStatusText, { color: colors.textMuted }]}>
                        Loading Demonstration...
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.playerErrorContainer}>
                  <MaterialIcons name="videocam-off" color={colors.textMuted} size={40} />
                  <Text style={[styles.playerErrorTitle, { color: colors.text }]}>
                    No demonstration video
                  </Text>
                  <Text style={[styles.playerErrorSub, { color: colors.textMuted }]}>
                    No video demo is available for this exercise.
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Player Playlist Navigators */}
            <View style={styles.playerNavRow}>
              <TouchableOpacity
                onPress={handlePrevExercise}
                disabled={exercises.findIndex((ex) => ex._id === currentExercise?._id) === 0}
                style={[styles.playerNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <MaterialIcons name="skip-previous" color={colors.text} size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (isCurrentDayCompleted()) return;
                  if (allExercisesCompleted()) {
                    setShowConfirmModal(true);
                  } else if (currentExercise) {
                    handleCompleteExercise(currentExercise._id);
                  }
                }}
                disabled={isCurrentDayCompleted() || completingExerciseId !== null}
                style={[
                  styles.mainCompleteBtn,
                  {
                    backgroundColor: isCurrentDayCompleted()
                      ? colors.success + "20"
                      : colors.primary
                  }
                ]}
              >
                {completingExerciseId ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : isCurrentDayCompleted() ? (
                  <Text style={{ color: colors.success, fontWeight: "bold" }}>✓ Day Completed</Text>
                ) : allExercisesCompleted() ? (
                  <Text style={{ color: colors.background, fontWeight: "bold" }}>🏆 Log Workout Split</Text>
                ) : (
                  <Text style={{ color: colors.background, fontWeight: "bold" }}>✓ Complete Exercise</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextExercise}
                disabled={
                  exercises.findIndex((ex) => ex._id === currentExercise?._id) === exercises.length - 1
                }
                style={[styles.playerNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <MaterialIcons name="skip-next" color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            {/* Exercise Stats Panel */}
            <View style={[styles.exerciseInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.exerciseTitle, { color: colors.primary }]}>{currentExercise?.name}</Text>
              <Text style={[styles.exerciseDesc, { color: colors.textMuted }]}>{currentExercise?.description}</Text>

              <View style={[styles.metricsRow, { borderColor: colors.border }]}>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Duration</Text>
                  <Text style={[styles.metricVal, { color: colors.text }]}>
                    {currentExercise ? Math.round(currentExercise.duration / 60) : 0} Mins
                  </Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Energy</Text>
                  <Text style={[styles.metricVal, { color: colors.text }]}>
                    {currentExercise?.calories || 0} kcal
                  </Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Sets</Text>
                  <Text style={[styles.metricVal, { color: colors.text }]}>{currentExercise?.sets || 3}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Reps</Text>
                  <Text style={[styles.metricVal, { color: colors.text }]}>{currentExercise?.reps || "10"}</Text>
                </View>
              </View>

              {/* Safety Instructions / Pro Tips drop panel */}
              {currentExercise?.tips && currentExercise.tips.length > 0 && (
                <View style={styles.notesBox}>
                  <Text style={[styles.notesHeader, { color: colors.primary }]}>💡 Expert Pro-Tips</Text>
                  {currentExercise.tips.map((tip, index) => (
                    <Text key={index} style={[styles.notesText, { color: colors.textMuted }]}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              )}

              {currentExercise?.commonMistakes && currentExercise.commonMistakes.length > 0 && (
                <View style={styles.notesBox}>
                  <Text style={[styles.notesHeader, { color: colors.accent }]}>⚠️ Common Mistakes</Text>
                  {currentExercise.commonMistakes.map((mistake, index) => (
                    <Text key={index} style={[styles.notesText, { color: colors.textMuted }]}>
                      • {mistake}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            {/* Exercise Playlist Section */}
            <View style={styles.playlistBox}>
              <View style={styles.playlistHeader}>
                <Text style={[styles.playlistTitle, { color: colors.text }]}>Exercise Playlist</Text>
                <View style={[styles.percentRingSmall, { backgroundColor: colors.border }]}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "bold" }}>
                    {getDayProgressPercentage()}% Done
                  </Text>
                </View>
              </View>

              <View style={styles.playlistContainer}>
                {exercises.map((item, index) => {
                  const isCompleted =
                    isCurrentDayCompleted() || progress?.completedExercises.includes(item._id);
                  const isPlaying = currentExercise?._id === item._id;

                  return (
                    <TouchableOpacity
                      key={item._id}
                      onPress={() => setCurrentExercise(item)}
                      style={[
                        styles.playlistCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: isPlaying
                            ? colors.primary
                            : isCompleted
                            ? colors.success + "30"
                            : colors.border
                        }
                      ]}
                    >
                      <View style={styles.playlistCardInfo}>
                        <Text style={[styles.playlistCardName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.playlistCardMeta, { color: colors.textMuted }]}>
                          ⏱ {Math.round(item.duration / 60)} Mins • 🔥 {item.calories} kcal • {item.difficulty}
                        </Text>
                      </View>
                      <View style={styles.playlistCardIcon}>
                        {isCompleted ? (
                          <MaterialIcons name="check-circle" color={colors.success} size={22} />
                        ) : isPlaying ? (
                          <MaterialIcons name="play-circle-filled" color={colors.primary} size={22} />
                        ) : (
                          <MaterialIcons name="radio-button-unchecked" color={colors.border} size={22} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          /* Completion Logs history tab list */
          <View style={styles.historyContainer}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>Workout Achievement History</Text>
            {history.length > 0 ? (
              <View style={styles.historyList}>
                {history.map((item) => (
                  <View key={item._id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.historyHeader}>
                      <Text style={[styles.historyDayText, { color: colors.primary }]}>Day {item.dayNumber}</Text>
                      <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                        {new Date(item.completedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[styles.historyProgramText, { color: colors.text }]}>
                      {item.programId?.name || "7-Day Beginner Split"}
                    </Text>
                    <View style={styles.historyStatsRow}>
                      <View style={styles.historyStatItem}>
                        <Text style={[styles.historyStatLabel, { color: colors.textMuted }]}>Duration</Text>
                        <Text style={[styles.historyStatVal, { color: colors.text }]}>{item.timeSpent} Mins</Text>
                      </View>
                      <View style={styles.historyStatItem}>
                        <Text style={[styles.historyStatLabel, { color: colors.textMuted }]}>Calories</Text>
                        <Text style={[styles.historyStatVal, { color: colors.secondary }]}>🔥 {item.caloriesBurned} kcal</Text>
                      </View>
                      <View style={styles.historyStatItem}>
                        <Text style={[styles.historyStatLabel, { color: colors.textMuted }]}>Status</Text>
                        <Text style={[styles.historyStatVal, { color: colors.success }]}>✓ Complete</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyHistoryBox, { borderColor: colors.border }]}>
                <Text style={[styles.emptyHistoryText, { color: colors.textMuted }]}>
                  No workout history logged yet. Complete all exercises in your active split to save your first completed session.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.primary + "50" }]}>
            <Text style={styles.modalEmoji}>🏆</Text>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Finish Workout Split</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Congratulations! Ready to log stats for today's session?
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Estimated Calories (kcal)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder={String(exercises.reduce((acc, curr) => acc + (curr.calories || 0), 0))}
                placeholderTextColor="#71717a"
                keyboardType="numeric"
                value={caloriesInput}
                onChangeText={setCaloriesInput}
              />

              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>Time Spent (minutes)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder={String(Math.round(exercises.reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60))}
                placeholderTextColor="#71717a"
                keyboardType="numeric"
                value={timeInput}
                onChangeText={setTimeInput}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setShowConfirmModal(false)}
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCompleteWorkoutDay}
                disabled={completingDay}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                {completingDay ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: colors.background, fontWeight: "bold" }]}>Log Split</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Congrats Modal */}
      <Modal
        visible={showCongratsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCongratsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.primary + "50" }]}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={[styles.congratsTitle, { color: colors.primary }]}>Workout Completed!</Text>
            <Text style={[styles.congratsSubtitle, { color: colors.text }]}>
              Day {congratsData?.dayNumber} — {congratsData?.dayTitle}
            </Text>
            <Text style={[styles.congratsDesc, { color: colors.textMuted }]}>
              Outstanding effort! You successfully completed today's split program and logged your active stats.
            </Text>

            <View style={styles.statsSummaryGrid}>
              <View style={[styles.summaryBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Duration</Text>
                <Text style={[styles.summaryVal, { color: colors.text }]}>{congratsData?.minutes} Mins</Text>
              </View>
              <View style={[styles.summaryBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Burned</Text>
                <Text style={[styles.summaryVal, { color: colors.secondary }]}>🔥 {congratsData?.calories} kcal</Text>
              </View>
            </View>

            <View style={{ width: "100%", gap: 12 }}>
              {congratsData?.hasNextDay ? (
                <TouchableOpacity
                  onPress={async () => {
                    setShowCongratsModal(false);
                    await selectDay(congratsData.dayNumber + 1);
                  }}
                  style={[styles.congratsMainBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.congratsMainBtnText, { color: colors.background }]}>
                    🚀 UNLOCK & START DAY {congratsData.dayNumber + 1}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.congratsMsgBox, { borderColor: colors.primary + "30" }]}>
                  <Text style={{ color: colors.primary, textAlign: "center", fontWeight: "bold", fontSize: 13 }}>
                    🎉 Split completed! Repeat this track or consult your trainer for advanced splits.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setShowCongratsModal(false)}
                style={[styles.congratsCloseBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.congratsCloseBtnText, { color: colors.text }]}>Close Window</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5
  },
  headerBanner: {
    margin: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bannerInfo: {
    flex: 1,
    paddingRight: 12
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  badge: {
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: "uppercase"
  },
  subLabel: {
    fontSize: 11,
    fontWeight: "bold"
  },
  programTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5
  },
  programDesc: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16
  },
  bannerProgress: {
    alignItems: "center",
    gap: 10
  },
  progressRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center"
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: "900"
  },
  progressLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginTop: 1
  },
  resetBtn: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  resetBtnText: {
    fontSize: 9,
    fontWeight: "bold"
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  daySelectorContainer: {
    marginBottom: 20
  },
  dayCard: {
    width: 140,
    height: 110,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: "space-between"
  },
  dayCardNum: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  dayCardSub: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 1
  },
  dayCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4
  },
  dayStatusRow: {
    marginTop: 8
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold"
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: "bold"
  },
  workoutFlowContainer: {
    paddingHorizontal: 16
  },
  playerWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#000"
  },
  webView: {
    flex: 1,
    backgroundColor: "#000"
  },
  playerNavRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 20,
    alignItems: "center"
  },
  playerNavBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  mainCompleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  exerciseInfoCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: "900"
  },
  exerciseDesc: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18
  },
  metricsRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8
  },
  metricBox: {
    flex: 1,
    alignItems: "center"
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  metricVal: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4
  },
  notesBox: {
    marginTop: 16,
    gap: 4
  },
  notesHeader: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 2
  },
  notesText: {
    fontSize: 12,
    lineHeight: 16
  },
  playlistBox: {
    marginTop: 10
  },
  playlistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: "900"
  },
  percentRingSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  playlistContainer: {
    gap: 8
  },
  playlistCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "space-between"
  },
  playlistCardInfo: {
    flex: 1,
    paddingRight: 10
  },
  playlistCardName: {
    fontSize: 14,
    fontWeight: "bold"
  },
  playlistCardMeta: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "bold"
  },
  playlistCardIcon: {
    marginLeft: 10
  },
  historyContainer: {
    paddingHorizontal: 16
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16
  },
  historyList: {
    gap: 12
  },
  historyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  historyDayText: {
    fontSize: 14,
    fontWeight: "900"
  },
  historyDate: {
    fontSize: 11,
    fontWeight: "bold"
  },
  historyProgramText: {
    fontSize: 15,
    fontWeight: "bold"
  },
  historyStatsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16
  },
  historyStatItem: {
    flex: 1
  },
  historyStatLabel: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  historyStatVal: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2
  },
  emptyHistoryBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center"
  },
  emptyHistoryText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: "center"
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18
  },
  inputContainer: {
    width: "100%",
    marginVertical: 20
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 6,
    fontSize: 14
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%"
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: "bold"
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  congratsSubtitle: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4
  },
  congratsDesc: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16
  },
  statsSummaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 20,
    width: "100%"
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center"
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  summaryVal: {
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2
  },
  congratsMainBtn: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center"
  },
  congratsMainBtnText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  congratsMsgBox: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 14
  },
  congratsCloseBtn: {
    width: "100%",
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  congratsCloseBtnText: {
    fontSize: 12,
    fontWeight: "bold"
  },
  playerLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000"
  },
  playerStatusText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10
  },
  playerErrorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20
  },
  playerErrorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12
  },
  playerErrorSub: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16
  },
  playerRetryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  playerRetryText: {
    fontSize: 13,
    fontWeight: "bold"
  }
});
