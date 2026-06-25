"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import { getWorkoutPlans } from "@/src/dialogs/invoice_config/services";

export default function WorkoutPage() {
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "weekly">("active");

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const res = await getWorkoutPlans();
        if (res.success) {
          setWorkout(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, []);

  const toggleExercise = (index: number) => {
    if (!workout?.exercises) return;
    const updatedExercises = [...workout.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      done: !updatedExercises[index].done,
    };
    setWorkout((prev: any) => ({
      ...prev,
      exercises: updatedExercises,
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Workouts...</p>
        </div>
      </DashboardLayout>
    );
  }

  const weeklySchedule = [
    { day: "Monday", workout: "Chest & Triceps" },
    { day: "Tuesday", workout: "Back & Biceps" },
    { day: "Wednesday", workout: "Legs" },
    { day: "Thursday", workout: "Shoulders" },
    { day: "Friday", workout: "Arms" },
    { day: "Saturday", workout: "Cardio Split" },
  ];

  const exercises = workout?.exercises || [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Workout Plan</h1>

        {/* Tab Toggle buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              activeTab === "active"
                ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            🏋️ Current Exercises
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              activeTab === "weekly"
                ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            📅 Weekly Split
          </button>
        </div>

        {activeTab === "active" ? (
          <div className="bg-black border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">
              {workout?.title || "My Active Gym Plan"}
            </h2>
            <p className="text-gray-400 text-sm mb-6">Track your daily exercises. Click on any item to mark it completed.</p>

            {exercises.length > 0 ? (
              <div className="space-y-4">
                {exercises.map((ex: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => toggleExercise(index)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition cursor-pointer ${
                      ex.done
                        ? "bg-zinc-900/50 border-zinc-800 text-gray-500 line-through"
                        : "bg-zinc-900 border-zinc-800 text-white hover:border-yellow-400/50"
                    }`}
                  >
                    <span className="text-2xl">{ex.done ? "✅" : "⬜"}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{ex.name}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {ex.sets} sets x {ex.reps || "8-12"} reps
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No custom exercises assigned yet. Follow your standard weekly schedule.</p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {weeklySchedule.map((item, index) => (
              <div
                key={index}
                className="bg-black border border-zinc-800 rounded-3xl p-6 hover:border-yellow-400 transition"
              >
                <h2 className="text-yellow-400 text-xl font-bold">{item.day}</h2>
                <p className="mt-3 text-white text-lg font-semibold">{item.workout}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}