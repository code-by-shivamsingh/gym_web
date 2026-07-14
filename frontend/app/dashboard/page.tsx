"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import Link from "next/link";
import { 
  getUserProfile, 
  getDashboardStats, 
  getTodayWorkout, 
  logLocationTelemetry, 
  completeWorkoutVideo 
} from "@/src/dialogs/invoice_config/services";
import OnboardingDialog from "@/src/components/organisms/OnboardingDialog";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // GPS & Telemetry states
  const [telemetry, setTelemetry] = useState<any>(null);
  const [simulatedCoords, setSimulatedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Workout Recommendation states
  const [recommendedWorkout, setRecommendedWorkout] = useState<any>(null);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [completionLoading, setCompletionLoading] = useState(false);

  const loadData = async () => {
    try {
      const [profileRes, statsRes, workoutRes] = await Promise.all([
        getUserProfile(),
        getDashboardStats(),
        getTodayWorkout()
      ]);

      if (profileRes.success) setProfile(profileRes.data);
      if (statsRes.success) setStats(statsRes.data);
      
      if (workoutRes.success && workoutRes.data) {
        setRecommendedWorkout(workoutRes.data);
        if (workoutRes.data.workout && workoutRes.data.workout.length > 0) {
          setActiveVideo(workoutRes.data.workout[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendLocation = async (lat: number, lng: number) => {
    try {
      const res = await logLocationTelemetry(lat, lng, "web");
      if (res.success && res.data) {
        setTelemetry(res.data);
        // Refresh stats to capture updated check-in status
        const statsRes = await getDashboardStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();

    // Trigger standard browser geolocation check
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendLocation(latitude, longitude);
        },
        (error) => {
          console.warn("Browser GPS permission denied or unavailable. Fallback to simulation allowed.");
        }
      );
    }
  }, []);

  const handleSimulateGPS = async (lat: number, lng: number) => {
    setGpsLoading(true);
    setSimulatedCoords({ lat, lng });
    try {
      const res = await logLocationTelemetry(lat, lng, "web");
      if (res.success && res.data) {
        setTelemetry(res.data);
        alert(res.message || "Simulated coordinates logged successfully!");
        
        // Refresh dashboard data
        const statsRes = await getDashboardStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeVideo || completionLoading) return;
    setCompletionLoading(true);
    try {
      const res = await completeWorkoutVideo(activeVideo._id);
      if (res.success) {
        alert("Awesome! Exercise marked as completed.");
        // Refresh workout recommendations and stats
        const workoutRes = await getTodayWorkout();
        if (workoutRes.success && workoutRes.data) {
          setRecommendedWorkout(workoutRes.data);
          const updatedActive = workoutRes.data.workout.find((w: any) => w._id === activeVideo._id);
          if (updatedActive) setActiveVideo(updatedActive);
        }
        const statsRes = await getDashboardStats();
        if (statsRes.success) setStats(statsRes.data);
      } else {
        alert(res.message || "Operation failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompletionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = profile?.name || "Member";
  const showAdmin = profile?.role === "Admin";
  const membershipPlan = stats?.membership || "Basic";
  const visits = stats?.totalVisits ?? 0;
  const streak = stats?.dayStreak ?? 0;
  const progress = stats?.goalProgress ?? 0;
  const isCheckedIn = stats?.isCheckedIn || false;

  return (
    <DashboardLayout>
      <OnboardingDialog />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/home"
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            🏠 View Website
          </Link>

          {showAdmin && (
            <Link
              href="/admin"
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
            >
              👨‍💼 Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 mb-8 text-black shadow-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Welcome Back, {displayName} 👋
        </h1>
        <p className="mt-4 text-lg">
          Stay consistent. Every workout brings you closer to your goal.
        </p>

        <div className="flex flex-wrap gap-4 mt-6">
          <Link
            href="/dashboard/attendance"
            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            {isCheckedIn ? "📅 Checked In" : "📅 Checked Out"}
          </Link>
          <Link
            href="/dashboard/profile"
            className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            👤 My Profile
          </Link>
        </div>
      </div>

      {/* Redesigned Premium Fitness Dashboard */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column: Today's Workout Card */}
        <div className="lg:col-span-2">
          <Link href="/dashboard/workout" className="block group">
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 group-hover:border-yellow-400/40 rounded-[32px] p-8 shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.01] flex flex-col justify-between min-h-[380px]">
              
              {/* Glassmorphism gradient glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-yellow-400/10 transition-all duration-500" />
              
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-yellow-400 text-black text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
                    Today's Split
                  </span>
                  <span className="text-zinc-500 text-sm font-bold">
                    {recommendedWorkout?.dayName || "Monday"}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black mt-5 tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                  {recommendedWorkout?.dayName ? `${recommendedWorkout.dayName}: ${recommendedWorkout?.description || "Full Body Workout"}` : "Rest & Recovery"}
                </h2>

                <p className="text-zinc-400 text-sm mt-3 leading-relaxed max-w-xl">
                  {recommendedWorkout?.workout ? "Follow this high-intensity beginner onboarding program routine to hit structural body alignment and optimize calorie burn." : "Enjoy your rest day! Focus on hydration and flexibility."}
                </p>

                {/* Exercise playlist preview */}
                {recommendedWorkout?.workout && recommendedWorkout.workout.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {recommendedWorkout.workout.map((item: any, i: number) => (
                      <span
                        key={item._id || i}
                        className="bg-zinc-900 border border-zinc-850 text-zinc-400 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5"
                      >
                        ⚡ {item.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Lower summary bar & Quick CTA button */}
              <div className="mt-8 pt-6 border-t border-zinc-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-extrabold tracking-wider">Duration</p>
                    <p className="text-lg font-black text-white mt-0.5">
                      {recommendedWorkout?.workout ? `${recommendedWorkout.workout.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0)} mins` : "0 mins"}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-extrabold tracking-wider">Target Burn</p>
                    <p className="text-lg font-black text-orange-400 mt-0.5">
                      {recommendedWorkout?.workout ? `${recommendedWorkout.workout.reduce((acc: number, curr: any) => acc + (curr.caloriesBurn || 0), 0)} kcal` : "0 kcal"}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <span className="inline-flex w-full justify-center bg-yellow-400 text-black font-black px-6 py-4 rounded-2xl group-hover:bg-yellow-300 transition duration-350 hover:scale-[1.02] active:scale-[0.98] items-center gap-2 text-sm shadow-lg shadow-yellow-400/10 cursor-pointer">
                    🚀 Start Today's Workout
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>

            </div>
          </Link>
        </div>

        {/* Right Column: Stats Panel */}
        <div className="flex flex-col gap-6">
          
          {/* Workout Progress Card */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-[32px] p-6 shadow-xl relative overflow-hidden flex items-center justify-between group">
            <div>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-wider">Program Progress</p>
              <h3 className="text-3xl font-black mt-2 text-white">{progress}% Completed</h3>
              <p className="text-zinc-400 text-xs mt-1.5">7-Day Beginner Split</p>
            </div>
            
            {/* Circular Indicator */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" className="stroke-zinc-800 fill-none" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-yellow-400 fill-none transition-all duration-1000"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - (progress || 85) / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-black text-yellow-400">{progress || 85}%</span>
            </div>
          </div>

          {/* Calories Burned Card */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-[32px] p-6 shadow-xl relative overflow-hidden flex items-center gap-5 group">
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl text-2xl shrink-0">
              🔥
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-wider">Calories Burned</p>
              <h3 className="text-3xl font-black mt-1 text-orange-400">
                {(stats?.goalProgress ? stats.goalProgress * 15 : 1275).toLocaleString()} kcal
              </h3>
              <p className="text-zinc-400 text-xs mt-1">Accumulated overall</p>
            </div>
          </div>

          {/* Workout Streak Card */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-[32px] p-6 shadow-xl relative overflow-hidden flex items-center gap-5 group">
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-2xl shrink-0">
              ⚡
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-wider">Workout Streak</p>
              <h3 className="text-3xl font-black mt-1 text-green-400">{streak} Days</h3>
              <p className="text-zinc-400 text-xs mt-1">Consistent consistency!</p>
            </div>
          </div>

        </div>
      </div>

      {/* GPS Status & Mock Telemetry Panel */}
      <div className="bg-black border border-zinc-850 rounded-[32px] p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
              📍 Gym Attendance Geofence Status
            </h3>
            <p className="text-zinc-500 text-xs mt-1">Verify your presence automatically when you step within 50 meters of the gym center.</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 ${isCheckedIn ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {isCheckedIn ? '🟢 Checked In' : '🔴 Checked Out'}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
            <p className="text-zinc-500 text-xs font-bold uppercase">Gym Distance</p>
            <p className="text-xl font-black text-white mt-1">
              {telemetry?.distance !== undefined ? `${telemetry.distance} meters` : 'Calculating...'}
            </p>
          </div>
          
          <div className="md:col-span-2 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex flex-wrap gap-2 items-center justify-between">
            <span className="text-zinc-400 text-xs">🛠️ Geolocation Simulation Simulator:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSimulateGPS(26.2669994, 78.2169687)}
                disabled={gpsLoading}
                className="bg-green-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                Simulate INSIDE Gym
              </button>
              <button
                onClick={() => handleSimulateGPS(26.2350, 78.2100)}
                disabled={gpsLoading}
                className="bg-zinc-800 text-zinc-300 text-xs px-3.5 py-2 rounded-xl font-bold hover:bg-zinc-750 active:scale-95 transition cursor-pointer"
              >
                Simulate OUTSIDE Gym
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}