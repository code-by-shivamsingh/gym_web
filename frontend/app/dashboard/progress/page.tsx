"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import { getDashboardStats } from "@/src/dialogs/invoice_config/services";

export default function ProgressPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Progress...</p>
        </div>
      </DashboardLayout>
    );
  }

  const progress = stats?.goalProgress ?? 85;
  const visits = stats?.totalVisits ?? 25;
  const streak = stats?.dayStreak ?? 7;

  return (
    <DashboardLayout>
      <div className="text-white">

        <h1 className="text-4xl font-bold mb-8">
          Progress Tracker 📈
        </h1>

        {/* Stats Summary Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
            <h2 className="text-4xl font-bold text-green-400">
              -8 KG
            </h2>
            <p className="text-gray-400 mt-2">
              Weight Loss
            </p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
            <h2 className="text-4xl font-bold text-blue-400">
              {progress}%
            </h2>
            <p className="text-gray-400 mt-2">
              Goal Progress
            </p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
            <h2 className="text-4xl font-bold text-yellow-400">
              {visits}
            </h2>
            <p className="text-gray-400 mt-2">
              Workouts Completed
            </p>
          </div>

        </div>

        {/* Current Goal Progress Bar */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Current Goal 🎯
          </h2>

          <p className="text-xl text-yellow-400 font-bold">
            Muscle Gain Program
          </p>

          <div className="w-full bg-zinc-800 rounded-full h-5 mt-6">
            <div
              className="bg-yellow-400 h-5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-gray-400 mt-4 font-semibold">
            {progress}% completed
          </p>

        </div>

        {/* Body Measurements Grid */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">
            Body Measurements 📏
          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <div className="bg-zinc-900 p-5 rounded-2xl">
              <h3 className="text-gray-400 text-sm">
                Weight
              </h3>
              <p className="text-3xl font-bold text-green-400 mt-1">
                74.5 KG
              </p>
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl">
              <h3 className="text-gray-400 text-sm">
                BMI
              </h3>
              <p className="text-3xl font-bold text-blue-400 mt-1">
                23.5
              </p>
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl">
              <h3 className="text-gray-400 text-sm">
                Body Fat
              </h3>
              <p className="text-3xl font-bold text-red-400 mt-1">
                14.2%
              </p>
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl">
              <h3 className="text-gray-400 text-sm">
                Muscle Mass Goal Target
              </h3>
              <p className="text-3xl font-bold text-yellow-400 mt-1">
                80.0 KG
              </p>
            </div>

          </div>

        </div>

        {/* Achievements list */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Achievements 🏆
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-zinc-900 p-5 rounded-2xl font-semibold">
              🔥 {streak} Day Streak
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl font-semibold">
              💪 {visits} Workouts Completed
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl font-semibold">
              🏅 Hypertrophy Progress {progress}%
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}