"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import {
  getWorkoutProgram,
  getWorkoutDay,
  getWorkoutProgress,
  startWorkoutProgram,
  completeExercise,
  completeWorkoutDay,
  getWorkoutHistory
} from "@/src/services/workoutService";

export default function WorkoutPage() {
  // Database States
  const [program, setProgram] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExercise, setCurrentExercise] = useState<any>(null);

  // UI/Loading States
  const [loading, setLoading] = useState(true);
  const [completingExerciseId, setCompletingExerciseId] = useState<string | null>(null);
  const [completingDay, setCompletingDay] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [congratsData, setCongratsData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"workout" | "history">("workout");

  // Custom Video Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Playlist Scrolling Refs
  const playlistContainerRef = useRef<HTMLDivElement>(null);
  const exerciseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const dayRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // YouTube Player states
  const [ytApiReady, setYtApiReady] = useState(false);
  const ytPlayerRef = useRef<any>(null);

  // Helper to check if URL is YouTube
  const isYouTube = (url: string) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  // Helper to extract YouTube Video ID
  const getYouTubeId = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  // Helper to extract start time query parameter in seconds
  const getYouTubeStartSeconds = (url: string) => {
    if (!url) return 0;
    const match = url.match(/[?&]t=(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Helper to safely format local/external video URLs
  const getVideoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
    return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  };

  // Load YouTube IFrame Player API
  useEffect(() => {
    if ((window as any).YT && (window as any).YT.Player) {
      setYtApiReady(true);
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        setYtApiReady(true);
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }
  }, []);

  // Initialize/Update YouTube Player on Exercise change
  useEffect(() => {
    if (!currentExercise || !isYouTube(currentExercise.videoUrl) || !ytApiReady) {
      return;
    }

    const timer = setTimeout(() => {
      const ytId = getYouTubeId(currentExercise.videoUrl);
      const startSec = getYouTubeStartSeconds(currentExercise.videoUrl);

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YT player", e);
        }
        ytPlayerRef.current = null;
      }

      try {
        ytPlayerRef.current = new (window as any).YT.Player("yt-player", {
          videoId: ytId,
          playerVars: {
            start: startSec,
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                handleVideoEnded();
              }
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              }
              if (event.data === (window as any).YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
            onError: () => {
              setVideoError(true);
            }
          }
        });
        setIsPlaying(true);
        setVideoError(false);
      } catch (err) {
        console.error("Failed to initialize YT Player:", err);
        setVideoError(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [currentExercise?._id, ytApiReady]);

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const programRes = await getWorkoutProgram();
      const progressRes = await getWorkoutProgress();
      const historyRes = await getWorkoutHistory();

      if (programRes.success && programRes.data) {
        setProgram(programRes.data.program);
        setDays(programRes.data.days);
      }

      if (progressRes.success && progressRes.data) {
        setProgress(progressRes.data);
        const dayToLoad = progressRes.data.currentDay || 1;
        await selectDay(dayToLoad, progressRes.data);
      }

      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error("Error loading workout page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(5);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-5);
          break;
        case "ArrowUp":
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, isMuted, volume, isFullscreen]);

  // Auto-scroll to current exercise in the playlist
  useEffect(() => {
    if (currentExercise?._id && exerciseRefs.current[currentExercise._id]) {
      exerciseRefs.current[currentExercise._id]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [currentExercise]);

  // Load a specific day
  const selectDay = async (dayNumber: number, progressContext?: any) => {
    const activeProgress = progressContext || progress;
    if (activeProgress) {
      const isUnlocked = dayNumber <= (activeProgress.unlockedDay || 1) || 
                         (activeProgress.unlockedDays && activeProgress.unlockedDays.includes(dayNumber));
      if (!isUnlocked) {
        return; // Locked
      }
    }

    try {
      const dayRes = await getWorkoutDay(dayNumber);
      if (dayRes.success && dayRes.data) {
        setActiveDay(dayRes.data);
        const exList = dayRes.data.exercises || [];
        setExercises(exList);

        // Resume last active video or play first exercise
        let defaultEx = exList[0];
        if (activeProgress && activeProgress.currentDay === dayNumber && activeProgress.lastActiveVideoId) {
          const matched = exList.find((ex: any) => ex._id === activeProgress.lastActiveVideoId);
          if (matched) defaultEx = matched;
        }

        setCurrentExercise(defaultEx);
        setIsPlaying(false);
        setVideoError(false);
        setCurrentTime(0);
      }
    } catch (err) {
      console.error(`Error loading day ${dayNumber}:`, err);
    }
  };

  // Video Actions
  const togglePlay = () => {
    if (currentExercise && isYouTube(currentExercise.videoUrl)) {
      if (ytPlayerRef.current && ytPlayerRef.current.getPlayerState) {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === (window as any).YT.PlayerState.PLAYING) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      }
      return;
    }

    if (!videoRef.current || videoError) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setVideoError(true);
      });
    }
  };

  const seek = (seconds: number) => {
    if (currentExercise && isYouTube(currentExercise.videoUrl)) {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime && ytPlayerRef.current.seekTo) {
        const currTime = ytPlayerRef.current.getCurrentTime();
        ytPlayerRef.current.seekTo(currTime + seconds, true);
      }
      return;
    }

    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentExercise && isYouTube(currentExercise.videoUrl)) {
      // For YouTube, click to seek is handled natively, but we can do custom seek if we want
      return;
    }
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const adjustVolume = (delta: number) => {
    const newVol = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVol);
    if (currentExercise && isYouTube(currentExercise.videoUrl)) {
      if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
        ytPlayerRef.current.setVolume(newVol * 100);
      }
      if (newVol > 0) setIsMuted(false);
      return;
    }
    if (!videoRef.current) return;
    videoRef.current.volume = newVol;
    if (newVol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (currentExercise && isYouTube(currentExercise.videoUrl)) {
      if (ytPlayerRef.current && ytPlayerRef.current.isMuted) {
        if (ytPlayerRef.current.isMuted()) {
          ytPlayerRef.current.unMute();
          setIsMuted(false);
        } else {
          ytPlayerRef.current.mute();
          setIsMuted(true);
        }
      }
      return;
    }

    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    setPlaybackSpeed(rate);
    videoRef.current.playbackRate = rate;
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-play next exercise when current ends
  const handleVideoEnded = async () => {
    setIsPlaying(false);
    if (!currentExercise || !activeDay || !progress) return;

    // Automatically trigger exercise completion API
    await handleCompleteExercise(currentExercise._id);
  };

  // Complete Exercise Call
  const handleCompleteExercise = async (exerciseId: string) => {
    if (!program || !activeDay || !progress) return;
    setCompletingExerciseId(exerciseId);
    try {
      const res = await completeExercise(program._id, activeDay.dayNumber, exerciseId);
      if (res.success && res.data) {
        setProgress(res.data);

        // Auto-progress to next exercise when completing active exercise
        if (currentExercise && currentExercise._id === exerciseId) {
          const currentIndex = exercises.findIndex((ex) => ex._id === exerciseId);
          if (currentIndex !== -1 && currentIndex + 1 < exercises.length) {
            const nextEx = exercises[currentIndex + 1];
            setCurrentExercise(nextEx);
            setVideoError(false);
            setIsPlaying(true);
          }
        }
      }
    } catch (err) {
      console.error("Error completing exercise:", err);
    } finally {
      setCompletingExerciseId(null);
    }
  };

  // Click handler for days selection
  const handleDayClick = (day: any) => {
    const isUnlocked = day.dayNumber <= (progress?.unlockedDay || 1) || 
                       (progress?.unlockedDays && progress?.unlockedDays.includes(day.dayNumber));
    if (!isUnlocked) {
      alert("Complete the previous workout to unlock this day.");
      return;
    }
    selectDay(day.dayNumber);
  };

  // Complete Day Call with Optimistic UI updates and Auto-Scroll
  const handleCompleteWorkoutDay = async () => {
    if (!program || !activeDay || !progress) return;
    setShowConfirmModal(false);
    setCompletingDay(true);

    const currentDayNum = activeDay.dayNumber;
    const nextDayNum = currentDayNum + 1;
    const hasNextDay = nextDayNum <= (program.durationDays || 7);

    // Backup state for rollback
    const backupProgress = { ...progress };
    const backupActiveDay = { ...activeDay };

    // Calculate calories & time
    const totalCalories = exercises.reduce((acc, curr) => acc + (curr.calories || 0), 0);
    const totalMinutes = Math.round(exercises.reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60);

    // Optimistic UI Update
    const updatedCompletedDays = [...(progress.completedDays || [])];
    if (!updatedCompletedDays.includes(currentDayNum)) {
      updatedCompletedDays.push(currentDayNum);
    }
    const updatedUnlockedDays = [...(progress.unlockedDays || [1])];
    if (!updatedUnlockedDays.includes(currentDayNum)) {
      updatedUnlockedDays.push(currentDayNum);
    }
    let newUnlockedDay = progress.unlockedDay;
    if (hasNextDay) {
      newUnlockedDay = Math.max(progress.unlockedDay, nextDayNum);
      if (!updatedUnlockedDays.includes(nextDayNum)) {
        updatedUnlockedDays.push(nextDayNum);
      }
    }

    const totalDays = program.durationDays || 7;
    const newPercentage = Math.round((updatedCompletedDays.length / totalDays) * 100);

    const optimisticProgress = {
      ...progress,
      completedDays: updatedCompletedDays,
      unlockedDays: updatedUnlockedDays,
      unlockedDay: newUnlockedDay,
      percentage: newPercentage,
    };

    // Apply optimistic updates
    setProgress(optimisticProgress);

    try {
      const res = await completeWorkoutDay(program._id, currentDayNum, totalCalories, totalMinutes);
      if (res.success && res.data) {
        // Update with actual server data
        setProgress(res.data);

        // Success Toast for completing current day
        alert(`Congratulations! You have completed Day ${currentDayNum}!`);

        if (hasNextDay) {
          // Select and load the next day
          await selectDay(nextDayNum, res.data);
          
          // Show unlock message
          alert(`🎉 Day ${nextDayNum} has been unlocked!`);

          // Smooth scroll to next day card after a brief timeout to let DOM render
          setTimeout(() => {
            if (dayRefs.current[nextDayNum]) {
              dayRefs.current[nextDayNum]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
              });
            }
          }, 300);
        } else {
          // End of program congrats
          setCongratsData({
            dayNumber: currentDayNum,
            dayTitle: activeDay.title,
            calories: totalCalories,
            minutes: totalMinutes,
            hasNextDay: false
          });
          setShowCongrats(true);
        }

        // Refresh history
        const historyRes = await getWorkoutHistory();
        if (historyRes.success && historyRes.data) {
          setHistory(historyRes.data);
        }
      } else {
        throw new Error(res.message || "Failed to save workout progress.");
      }
    } catch (err: any) {
      console.error("Error completing day:", err);
      // Rollback optimistic update
      setProgress(backupProgress);
      setActiveDay(backupActiveDay);
      alert(`Error: ${err.message || "Something went wrong while saving progress."}`);
    } finally {
      setCompletingDay(false);
    }
  };

  // Start Program Reset
  const handleResetProgram = async () => {
    if (!confirm("Are you sure you want to reset your program progression? This will wipe your current active days progress.")) {
      return;
    }
    try {
      setLoading(true);
      const res = await startWorkoutProgram();
      if (res.success && res.data) {
        setProgress(res.data);
        await selectDay(1, res.data);
      }
    } catch (err) {
      console.error("Error resetting program:", err);
    } finally {
      setLoading(false);
    }
  };

  // Progress Bar Helpers
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isExerciseUnlocked = (exId: string) => {
    return true; // All exercises inside a day are always unlocked and clickable
  };

  const isCurrentDayCompleted = () => {
    if (!progress || !activeDay) return false;
    return progress.completedDays.includes(activeDay.dayNumber);
  };

  const allExercisesCompleted = () => {
    if (exercises.length === 0 || !progress) return false;
    return exercises.every((ex) => progress.completedExercises.includes(ex._id));
  };

  // Next / Prev playlist button handlers
  const handlePrevExercise = () => {
    const currentIndex = exercises.findIndex((ex) => ex._id === currentExercise?._id);
    if (currentIndex > 0) {
      setCurrentExercise(exercises[currentIndex - 1]);
      setIsPlaying(false);
      setVideoError(false);
    }
  };

  const handleNextExercise = () => {
    const currentIndex = exercises.findIndex((ex) => ex._id === currentExercise?._id);
    if (currentIndex !== -1 && currentIndex + 1 < exercises.length) {
      setCurrentExercise(exercises[currentIndex + 1]);
      setIsPlaying(false);
      setVideoError(false);
    }
  };

  // Calculated stats helpers
  const getDayTotalTime = () => {
    if (!exercises || exercises.length === 0) return "0 mins";
    const totalSeconds = exercises.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    return `${Math.round(totalSeconds / 60)} mins`;
  };

  const getDayTotalCalories = () => {
    if (!exercises || exercises.length === 0) return "0 kcal";
    const totalCalories = exercises.reduce((acc, curr) => acc + (curr.calories || 0), 0);
    return `${totalCalories} kcal`;
  };

  const getRemainingTime = () => {
    if (!exercises || exercises.length === 0 || !progress) return "0 mins";
    if (isCurrentDayCompleted()) return "0 mins";
    const incomplete = exercises.filter(ex => !progress.completedExercises.includes(ex._id));
    const totalSeconds = incomplete.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    return `${Math.round(totalSeconds / 60)} mins`;
  };

  const getDayProgressPercentage = () => {
    if (!exercises || exercises.length === 0 || !progress) return 0;
    if (isCurrentDayCompleted()) return 100;
    const completedCount = exercises.filter(ex => progress.completedExercises.includes(ex._id)).length;
    return Math.round((completedCount / exercises.length) * 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mb-4" />
          <p className="text-yellow-400 font-bold text-lg animate-pulse uppercase tracking-wider">Syncing Premium Workout Engine...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto text-white px-2">
        
        {/* premium netflix-style header banner */}
        <div className="relative rounded-[32px] overflow-hidden border border-zinc-850 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-8 md:p-10 mb-8 shadow-2xl">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <span className="bg-yellow-400 text-black text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  {program?.difficulty || "Beginner"} Program
                </span>
                <span className="text-zinc-500 font-bold text-xs uppercase tracking-wider">
                  7-Day Split Onboarding
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-white leading-tight">
                {program?.name}
              </h1>
              
              <p className="text-zinc-400 text-sm md:text-base mt-3 max-w-3xl leading-relaxed">
                {program?.description}
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-6 text-sm text-zinc-300 font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏱</span>
                  <span>Total Split Duration: <span className="text-white font-extrabold">{getDayTotalTime()}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">🔥</span>
                  <span>Estimated Burn: <span className="text-orange-400 font-extrabold">{getDayTotalCalories()}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">⏳</span>
                  <span>Time Remaining: <span className="text-blue-400 font-extrabold">{getRemainingTime()}</span></span>
                </div>
              </div>
            </div>

            {/* Overall stats progress info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center lg:items-end lg:flex-col gap-6 shrink-0 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-3xl backdrop-blur-md">
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-wider">Overall Completion</p>
                  <h3 className="text-2xl font-black text-white mt-1">{progress?.percentage || 0}%</h3>
                </div>
                
                {/* Circular indicator */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" className="stroke-zinc-800 fill-none" strokeWidth="4" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      className="stroke-yellow-400 fill-none transition-all duration-700"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - (progress?.percentage || 0) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-yellow-400">{progress?.percentage || 0}%</span>
                </div>
              </div>

              <button
                onClick={handleResetProgram}
                className="text-[11px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 transition flex items-center gap-2 bg-red-500/5 px-4 py-2.5 rounded-xl border border-red-500/10 hover:border-red-500/30 cursor-pointer w-full justify-center"
              >
                🔄 Reset Program Progression
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day split season selector row */}
        <div className="mb-8">
          <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-4">Select Workout Day</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {days.map((day) => {
              const isCompleted = progress?.completedDays?.includes(day.dayNumber);
              const isUnlocked = day.dayNumber <= (progress?.unlockedDay || 1) || 
                                 (progress?.unlockedDays && progress?.unlockedDays.includes(day.dayNumber));
              const isActive = activeDay?.dayNumber === day.dayNumber;

              return (
                <motion.div
                  key={day._id}
                  ref={(el) => { dayRefs.current[day.dayNumber] = el; }}
                  onClick={() => handleDayClick(day)}
                  whileHover={isUnlocked ? { scale: 1.03, y: -2 } : {}}
                  whileTap={isUnlocked ? { scale: 0.98 } : {}}
                  layout
                  className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 relative group/day ${
                    isUnlocked ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
                  } ${
                    isActive
                      ? "bg-gradient-to-br from-zinc-900 to-black border-yellow-400 text-white shadow-lg shadow-yellow-400/10 scale-[1.02]"
                      : isCompleted
                      ? "bg-green-500/5 border-green-500/20 text-zinc-300 hover:border-green-500/40"
                      : "bg-zinc-950 border-zinc-850 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-wider text-yellow-400 group-hover/day:text-yellow-300 transition-colors">
                      Day {day.dayNumber}
                    </p>
                    <p className="text-zinc-500 text-[11px] font-bold">
                      {day.dayName || `Split ${day.dayNumber}`}
                    </p>
                    <h4 className="font-extrabold text-sm mt-1 text-white leading-tight truncate">
                      {day.title}
                    </h4>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    {isCompleted ? (
                      <span className="text-green-400 font-extrabold flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-green-500 fill-current shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd"/>
                        </svg>
                        Done
                      </span>
                    ) : !isUnlocked ? (
                      <span className="text-zinc-650 font-bold flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-zinc-600 fill-current shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        Locked
                      </span>
                    ) : isActive ? (
                      <span className="text-yellow-400 font-extrabold flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-yellow-400 fill-current animate-pulse shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                        </svg>
                        Active
                      </span>
                    ) : (
                      <span className="text-zinc-400 font-bold hover:text-white transition-colors flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-zinc-400 fill-current shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 016 0v1a1 1 0 102 0V7a5 5 0 00-5-5z" clipRule="evenodd"/>
                        </svg>
                        Unlocked
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setViewMode("workout")}
            className={`px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 border cursor-pointer ${
              viewMode === "workout"
                ? "bg-yellow-400 text-black border-yellow-400 font-extrabold shadow-lg shadow-yellow-400/20"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            🏋️ Netflix Workout Streamer
          </button>
          <button
            onClick={() => setViewMode("history")}
            className={`px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 border cursor-pointer ${
              viewMode === "history"
                ? "bg-yellow-400 text-black border-yellow-400 font-extrabold shadow-lg shadow-yellow-400/20"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            📊 Completion Logs
          </button>
        </div>

        {viewMode === "workout" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Player & Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Premium Video Player */}
              <div 
                ref={playerContainerRef}
                className={`relative group aspect-video rounded-[32px] overflow-hidden bg-black border border-zinc-800 shadow-2xl ${
                  isFullscreen ? "w-screen h-screen border-none rounded-none" : ""
                }`}
              >
                {/* Buffering/Loading Spinner */}
                {isBuffering && (
                  <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-yellow-400/10 border-t-yellow-400 rounded-full animate-spin" />
                  </div>
                )}

                {/* Video Coming Soon Placeholder Overlay */}
                {videoError || !currentExercise?.videoUrl ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black z-20 flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-yellow-400 text-6xl animate-pulse">🎥</div>
                    <h3 className="text-2xl font-extrabold text-white mt-4">Workout Video Coming Soon</h3>
                    <p className="text-zinc-500 text-sm max-w-md mt-2 leading-relaxed">
                      Our certified personal trainers are currently filming this demonstration. You can still read the instructions below and mark it complete!
                    </p>
                    <button
                      onClick={() => handleCompleteExercise(currentExercise?._id)}
                      disabled={progress?.completedExercises.includes(currentExercise?._id)}
                      className={`mt-6 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border ${
                        progress?.completedExercises.includes(currentExercise?._id)
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400"
                      }`}
                    >
                      {progress?.completedExercises.includes(currentExercise?._id) ? "✓ Completed" : "💪 Skip Video & Mark Complete"}
                    </button>
                  </div>
                ) : isYouTube(currentExercise.videoUrl) ? (
                  <div className="w-full h-full relative z-10 bg-black">
                    <div id="yt-player" className="w-full h-full pointer-events-auto" />
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      src={getVideoUrl(currentExercise?.videoUrl)}
                      poster={currentExercise?.thumbnailUrl}
                      onClick={togglePlay}
                      onTimeUpdate={() => {
                        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                      }}
                      onDurationChange={() => {
                        if (videoRef.current) setDuration(videoRef.current.duration);
                      }}
                      onWaiting={() => setIsBuffering(true)}
                      onCanPlay={() => setIsBuffering(false)}
                      onEnded={handleVideoEnded}
                      onError={() => setVideoError(true)}
                      className="w-full h-full object-cover relative z-10"
                    />

                    {/* Custom Player Controls Overlays (Fade out unless hovering or playing is paused) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/55 z-10 flex flex-col justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      
                      {/* Top Overlay Bar */}
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-black tracking-wide bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-xl border border-zinc-800">
                          {currentExercise?.name}
                        </h4>
                        <span className="text-xs font-bold text-zinc-400 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800">
                          {quality} • {playbackSpeed}x
                        </span>
                      </div>

                      {/* Bottom Controls Panel */}
                      <div className="space-y-4">
                        {/* Custom Progress Bar */}
                        <div className="space-y-1">
                          <div
                            onClick={handleProgressBarClick}
                            className="w-full h-1.5 bg-zinc-800 rounded-full cursor-pointer overflow-hidden relative group/bar border border-zinc-850"
                          >
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
                              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-zinc-400 font-bold px-0.5">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Prev button for player playlist controls */}
                            <button
                              onClick={handlePrevExercise}
                              disabled={exercises.findIndex((ex) => ex._id === currentExercise?._id) === 0}
                              className="text-white hover:text-yellow-400 p-2 transition cursor-pointer disabled:opacity-40 disabled:hover:text-white"
                              title="Previous Exercise"
                            >
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                            </button>

                            {/* Play/Pause Button */}
                            <button
                              onClick={togglePlay}
                              className="bg-yellow-400 text-black p-3.5 rounded-full hover:scale-110 transition shadow-lg cursor-pointer"
                            >
                              {isPlaying ? (
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                              ) : (
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              )}
                            </button>

                            {/* Next button for player playlist controls */}
                            <button
                              onClick={handleNextExercise}
                              disabled={exercises.findIndex((ex) => ex._id === currentExercise?._id) === exercises.length - 1}
                              className="text-white hover:text-yellow-400 p-2 transition cursor-pointer disabled:opacity-40 disabled:hover:text-white"
                              title="Next Exercise"
                            >
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/></svg>
                            </button>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2 group/volume">
                              <button onClick={toggleMute} className="text-white hover:text-yellow-400 p-2 transition cursor-pointer">
                                {isMuted || volume === 0 ? (
                                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 2.82-1.73 5.25-4.19 6.25l1.09 1.09C19.14 18.01 21 15.22 21 12s-1.86-6.01-5.1-7.34l-1.09 1.09C17.27 6.75 19 9.18 19 12zm-8.5 5.5l-5-5H2v-5h3.5l5-5v15z"/></svg>
                                ) : (
                                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                                )}
                              </button>
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={volume}
                                onChange={(e) => {
                                  const vol = parseFloat(e.target.value);
                                  setVolume(vol);
                                  if (videoRef.current) {
                                    videoRef.current.volume = vol;
                                    videoRef.current.muted = vol === 0;
                                  }
                                  setIsMuted(vol === 0);
                                }}
                                className="w-16 h-1 accent-yellow-400 rounded-full cursor-pointer bg-zinc-700 outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 relative">
                            {/* Speed Selector */}
                            <div className="relative">
                              <button
                                onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }}
                                className="text-white hover:text-yellow-400 font-bold text-xs bg-zinc-900/60 hover:bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-800 cursor-pointer"
                              >
                                ⏳ Speed: {playbackSpeed}x
                              </button>
                              {showSpeedMenu && (
                                <div className="absolute bottom-10 right-0 bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 z-40 space-y-1 w-20 text-center">
                                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => changeSpeed(s)}
                                      className={`w-full text-xs py-1 rounded font-bold hover:bg-yellow-400 hover:text-black transition ${
                                        playbackSpeed === s ? "text-yellow-400" : "text-zinc-400"
                                      }`}
                                    >
                                      {s}x
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Quality Selector */}
                            <div className="relative">
                              <button
                                onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}
                                className="text-white hover:text-yellow-400 font-bold text-xs bg-zinc-900/60 hover:bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-zinc-800 cursor-pointer"
                              >
                                ⚙️ Qual: {quality}
                              </button>
                              {showQualityMenu && (
                                <div className="absolute bottom-10 right-0 bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 z-40 space-y-1 w-24 text-center">
                                  {["Auto", "1080p", "720p", "360p"].map((q) => (
                                    <button
                                      key={q}
                                      onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                                      className={`w-full text-xs py-1 rounded font-bold hover:bg-yellow-400 hover:text-black transition ${
                                        quality === q ? "text-yellow-400" : "text-zinc-400"
                                      }`}
                                    >
                                      {q}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Fullscreen Button */}
                            <button
                              onClick={toggleFullscreen}
                              className="text-white hover:text-yellow-400 p-2 transition cursor-pointer"
                              title="Toggle Fullscreen (F)"
                            >
                              {isFullscreen ? (
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                              ) : (
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Exercise Completed Button Bar */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isCurrentDayCompleted() || completingDay}
                  className={`flex-1 py-4.5 rounded-2xl font-black text-lg transition flex items-center justify-center gap-2 border cursor-pointer ${
                    isCurrentDayCompleted()
                      ? "bg-green-500/10 border-green-500/20 text-green-400 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 hover:scale-[1.01] shadow-xl"
                  }`}
                >
                  {completingDay ? (
                    <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : isCurrentDayCompleted() ? (
                    "✅ Exercise Completed"
                  ) : (
                    "💪 Exercise Completed"
                  )}
                </button>
              </div>

              {/* Exercise Details Pane */}
              <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-[32px] p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-yellow-400">{currentExercise?.name}</h2>
                  <p className="text-zinc-400 text-sm mt-3 leading-relaxed">{currentExercise?.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Estimated Time</p>
                    <p className="text-lg font-black text-white mt-1">{(currentExercise?.duration / 60) || 3} mins</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Calories Burned</p>
                    <p className="text-lg font-black text-white mt-1">{currentExercise?.calories || 0} kcal</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Target Muscles</p>
                    <p className="text-sm font-black text-white mt-1.5 truncate">
                      {currentExercise?.targetMuscles?.join(", ") || "Full Body"}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Equipment Required</p>
                    <p className="text-sm font-black text-white mt-1.5 truncate">
                      {currentExercise?.equipmentRequired || "None"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-b border-zinc-800/60 py-5 text-center text-sm font-bold">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">Sets</p>
                    <span className="text-white text-base font-black">{currentExercise?.sets || 3} Sets</span>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">Target Reps</p>
                    <span className="text-white text-base font-black">{currentExercise?.reps || "10"}</span>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">Rest Interval</p>
                    <span className="text-white text-base font-black">{currentExercise?.restTime || 30} secs</span>
                  </div>
                </div>

                {/* Secondary Muscles & Difficulty */}
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  {currentExercise?.secondaryMuscles?.length > 0 && (
                    <div>
                      <h4 className="font-extrabold text-zinc-300">Secondary Muscles</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentExercise.secondaryMuscles.map((m: string) => (
                          <span key={m} className="bg-zinc-850 border border-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-extrabold text-zinc-300">Difficulty Grade</h4>
                    <span className="inline-block mt-2 bg-yellow-400/5 border border-yellow-400/25 text-yellow-300 text-xs px-3 py-1 rounded-full font-bold">
                      {currentExercise?.difficulty || "Beginner"}
                    </span>
                  </div>
                </div>

                {/* Play instructions details */}
                <div className="space-y-4 pt-2">
                  {currentExercise?.tips?.length > 0 && (
                    <div>
                      <h4 className="font-extrabold text-yellow-400 flex items-center gap-1.5">💡 Expert Pro-Tips</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1.5 text-zinc-400 text-sm">
                        {currentExercise.tips.map((tip: string, idx: number) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentExercise?.commonMistakes?.length > 0 && (
                    <div>
                      <h4 className="font-extrabold text-red-400 flex items-center gap-1.5">⚠️ Common Mistakes to Avoid</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1.5 text-zinc-400 text-sm">
                        {currentExercise.commonMistakes.map((mistake: string, idx: number) => (
                          <li key={idx}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentExercise?.safetyInstructions?.length > 0 && (
                    <div>
                      <h4 className="font-extrabold text-orange-400 flex items-center gap-1.5">🛡️ Safety Instructions</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1.5 text-zinc-400 text-sm">
                        {currentExercise.safetyInstructions.map((safety: string, idx: number) => (
                          <li key={idx}>{safety}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Right Column: Playlist & Daily Completion Progress */}
            <div className="space-y-6">
              
              {/* Day Progress overview Card */}
              <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-[32px] p-6 flex items-center justify-between group">
                <div>
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-wider">Today's Progress</p>
                  <h3 className="text-xl font-black mt-2 text-white">Day {activeDay?.dayNumber} Completion</h3>
                  <p className="text-zinc-400 text-xs mt-1.5">{exercises.filter(ex => progress?.completedExercises.includes(ex._id)).length} of {exercises.length} Exercises Done</p>
                </div>
                
                {/* Circular indicator */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" className="stroke-zinc-800 fill-none" strokeWidth="4" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      className="stroke-yellow-400 fill-none transition-all duration-700"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - getDayProgressPercentage() / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-yellow-400">{getDayProgressPercentage()}%</span>
                </div>
              </div>

              {/* Day's Exercises Playlist Sidebar */}
              <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-[32px] p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-white">Exercise Playlist</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase mt-0.5">Day {activeDay?.dayNumber} • {activeDay?.title}</p>
                  </div>
                  <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs px-2.5 py-1 rounded-lg font-bold">
                    {exercises.length} Exercises
                  </span>
                </div>

                <div 
                  ref={playlistContainerRef}
                  className="space-y-3 max-h-[500px] overflow-y-auto pr-1"
                >
                  {exercises.map((ex, index) => {
                    const isCompleted = isCurrentDayCompleted() || progress?.completedExercises.includes(ex._id);
                    const isUnlocked = isExerciseUnlocked(ex._id);
                    const isCurrentlyPlaying = currentExercise?._id === ex._id;

                    return (
                      <div
                        ref={el => { exerciseRefs.current[ex._id] = el; }}
                        key={ex._id}
                        onClick={() => isUnlocked && setCurrentExercise(ex)}
                        className={`flex gap-3 p-3 rounded-2xl border transition-all duration-350 relative ${
                          isUnlocked ? "cursor-pointer" : "opacity-45 cursor-not-allowed"
                        } ${
                          isCurrentlyPlaying
                            ? "bg-zinc-900 border-yellow-400/50 text-white"
                            : isCompleted
                            ? "bg-green-500/5 border-green-500/10 hover:border-green-500/30 text-zinc-300"
                            : "bg-zinc-950/20 border-zinc-850 hover:border-zinc-700"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                          <img
                            src={ex.thumbnailUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100"}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                          />
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs">
                              🔒
                            </div>
                          )}
                          {isCompleted && (
                            <div className="absolute top-1 right-1 bg-green-500 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                              ✓
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm truncate leading-snug">{ex.name}</h4>
                            <p className="text-[11px] text-zinc-500 font-bold uppercase mt-0.5">
                              🎯 {ex.targetMuscles[0] || "Strength"} • 🕒 {Math.round(ex.duration / 60)}m
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                            <span>🔥 {ex.calories} kcal</span>
                            <span>{ex.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Completion History Tab */
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-[32px] p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-black">Workout Achievement History</h2>
              <p className="text-zinc-400 text-sm mt-1">Review the completed splits and calories burned during your training.</p>
            </div>

            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-xs">
                      <th className="py-4">Program Day</th>
                      <th className="py-4">Title</th>
                      <th className="py-4">Time Spent</th>
                      <th className="py-4">Calories Burned</th>
                      <th className="py-4">Completed On</th>
                      <th className="py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {history.map((hist) => (
                      <tr key={hist._id} className="hover:bg-zinc-900/30 transition">
                        <td className="py-4 font-black text-yellow-400">Day {hist.dayNumber}</td>
                        <td className="py-4 font-bold">{hist.programId?.name || "Beginner Program"}</td>
                        <td className="py-4 text-zinc-350">{hist.timeSpent} mins</td>
                        <td className="py-4 text-orange-400 font-bold">🔥 {hist.caloriesBurned} kcal</td>
                        <td className="py-4 text-zinc-400">{new Date(hist.completedAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right font-black text-green-400">✓ Completed</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                <p className="text-lg">No workout history logged yet.</p>
                <p className="text-sm mt-1">Finish all exercises in your active day to log your first completed split!</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-gradient-to-b from-zinc-900 to-black border border-yellow-400/30 rounded-[32px] max-w-md w-full p-8 text-center shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-40 bg-radial-gradient from-yellow-400/10 to-transparent pointer-events-none" />
              
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h3 className="text-2xl font-black text-white mt-2">Finish Session</h3>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                Congratulations! Have you completed today's workout?
              </p>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-2xl font-bold text-sm transition border border-zinc-800 cursor-pointer"
                >
                  Not Yet
                </button>
                <button
                  onClick={handleCompleteWorkoutDay}
                  className="flex-1 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-2xl font-black text-sm transition shadow-lg shadow-yellow-400/20 cursor-pointer border-none"
                >
                  Yes, Completed!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Congratulation Success Overlay Popup Modal */}
      <AnimatePresence>
        {showCongrats && congratsData && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-gradient-to-b from-zinc-900 to-black border border-yellow-400/40 rounded-[36px] max-w-md w-full p-8 text-center shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-40 bg-radial-gradient from-yellow-400/20 to-transparent pointer-events-none" />

              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-black tracking-tight text-yellow-400">Workout Complete!</h2>
              <p className="text-lg font-bold mt-2">Day {congratsData.dayNumber} - {congratsData.dayTitle}</p>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                Outstanding effort! You completed the split program and unlocked your body potential.
              </p>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl">
                  <span className="block text-zinc-500 text-xs font-bold uppercase">Active Time</span>
                  <span className="block text-lg font-black text-white mt-1">{congratsData.minutes} mins</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl">
                  <span className="block text-zinc-500 text-xs font-bold uppercase">Energy Burned</span>
                  <span className="block text-lg font-black text-orange-400 mt-1">🔥 {congratsData.calories} kcal</span>
                </div>
              </div>

              <div className="space-y-3">
                {congratsData.hasNextDay ? (
                  <button
                    onClick={() => {
                      setShowCongrats(false);
                      selectDay(congratsData.dayNumber + 1);
                    }}
                    className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-2xl font-black tracking-wide text-base transition-all duration-200 cursor-pointer shadow-lg shadow-yellow-400/20 border-none"
                  >
                    🚀 UNLOCK & START DAY {congratsData.dayNumber + 1}
                  </button>
                ) : (
                  <div className="bg-yellow-400/10 border border-yellow-400/20 p-3.5 rounded-2xl text-yellow-400 font-bold text-sm">
                    🎉 You have finished the 7-day program track! Keep repeating or start advanced splits.
                  </div>
                )}
                
                <button
                  onClick={() => setShowCongrats(false)}
                  className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer border border-zinc-800"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}