"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import {
  getAttendanceHistory,
  getDashboardStats,
  checkInAttendance,
  checkOutAttendance,
} from "@/src/dialogs/invoice_config/services";

export default function AttendancePage() {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        getAttendanceHistory(),
        getDashboardStats(),
      ]);
      if (historyRes.success) setHistory(historyRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAttendanceAction = async () => {
    try {
      setActionLoading(true);
      const isCheckedIn = stats?.isCheckedIn;
      
      let res;
      if (isCheckedIn) {
        res = await checkOutAttendance();
      } else {
        res = await checkInAttendance();
      }

      if (res.success) {
        alert(isCheckedIn ? "Checked out successfully!" : "Checked in successfully!");
        await loadData();
      } else {
        alert(res.message || "Attendance action failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error marking attendance.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Attendance...</p>
        </div>
      </DashboardLayout>
    );
  }

  const visits = stats?.totalVisits ?? 0;
  const streak = stats?.dayStreak ?? 0;
  const isCheckedIn = stats?.isCheckedIn || false;

  // Calculate weekly attendance split (last 7 days of the current week)
  const getWeeklySplit = () => {
    const split = [];
    const now = new Date();
    // Start from 6 days ago
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { weekday: "short" });
      const fullDateStr = d.toDateString();

      const wasPresent = history.some(log => {
        const checkInDate = new Date(log.checkIn);
        return checkInDate.toDateString() === fullDateStr;
      });

      split.push({ dayLabel: dateStr, present: wasPresent });
    }
    return split;
  };

  const weeklySplit = getWeeklySplit();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto text-white">
        
        <h1 className="text-4xl font-bold mb-8">
          Attendance Status
        </h1>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Action */}
          <div className="lg:col-span-2 bg-black border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                Live Gym Check-In
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {isCheckedIn
                  ? "🟢 You are currently inside the gym. Enjoy your workout session! Remember to check out when you leave to log your workout hours."
                  : "🔴 You are outside the gym. Once you reach within 50m of the gym boundary, you will be automatically checked in present."}
              </p>
            </div>
            
            <div>
              <button
                onClick={handleAttendanceAction}
                disabled={actionLoading}
                className={`px-8 py-4 rounded-xl font-bold hover:scale-[1.02] transition ${
                  isCheckedIn
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/10"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : isCheckedIn
                  ? "Check Out (Manual)"
                  : "Check In (Manual)"}
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-black p-8 rounded-3xl border border-zinc-800 space-y-6">
            <div>
              <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Gym Hits</h3>
              <p className="text-4xl font-black text-yellow-400 mt-1">{visits}</p>
            </div>
            <div className="border-t border-zinc-900 pt-4">
              <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Attendance Rate (Monthly)</h3>
              <p className="text-4xl font-black text-green-400 mt-1">
                {visits > 0 ? `${Math.min(Math.round((visits / 30) * 100), 100)}%` : "0%"}
              </p>
            </div>
            <div className="border-t border-zinc-900 pt-4">
              <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Active Streak</h3>
              <p className="text-4xl font-black text-blue-400 mt-1">{streak} Days 🔥</p>
            </div>
          </div>
        </div>

        {/* Weekly Split Tracker */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-2">Weekly Attendance Split</h2>
          <p className="text-zinc-500 text-xs mb-6">Visual tracking of your attendance split over the last 7 days.</p>
          
          <div className="grid grid-cols-7 gap-4 text-center">
            {weeklySplit.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border transition ${
                  item.present
                    ? "bg-green-500/10 border-green-500/30 text-green-400 font-bold"
                    : "bg-zinc-900/50 border-zinc-850 text-zinc-500"
                }`}
              >
                <p className="text-xs uppercase font-semibold">{item.dayLabel}</p>
                <p className="text-xl mt-3">{item.present ? "✅" : "⬜"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-4">Detailed Attendance Session Logs</h2>
          <p className="text-zinc-500 text-xs mb-6">A complete historical breakdown of your check-in times and tracking sources.</p>

          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-550">
                    <th className="py-4 font-bold text-zinc-400">Date</th>
                    <th className="py-4 font-bold text-zinc-400">Check In</th>
                    <th className="py-4 font-bold text-zinc-400">Check Out</th>
                    <th className="py-4 font-bold text-zinc-400">Duration</th>
                    <th className="py-4 font-bold text-zinc-400">Source</th>
                    <th className="py-4 font-bold text-zinc-400">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item, index) => {
                    const checkInDate = new Date(item.checkIn);
                    const dateStr = checkInDate.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const checkInTime = checkInDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const checkOutTime = item.checkOut
                      ? new Date(item.checkOut).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Active Session";

                    return (
                      <tr key={item._id || index} className="border-b border-zinc-900 hover:bg-zinc-900/10 transition">
                        <td className="py-4 font-semibold text-white">{dateStr}</td>
                        <td className="py-4 text-zinc-300">{checkInTime}</td>
                        <td className="py-4 text-zinc-300">{checkOutTime}</td>
                        <td className="py-4 text-zinc-300">
                          {item.totalDuration !== undefined ? `${item.totalDuration} mins` : "--"}
                        </td>
                        <td className="py-4 text-zinc-400 text-xs font-semibold">{item.source || "GPS Automated"}</td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.checkOut
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-400/20 text-yellow-400 animate-pulse"
                            }`}
                          >
                            {item.checkOut ? "Completed" : "In Gym"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-4">No attendance logs recorded yet. Start training today!</p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}