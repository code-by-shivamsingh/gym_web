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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-4xl font-bold mb-8">
          Attendance
        </h1>

        {/* Today's Attendance */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">
          
          <h2 className="text-2xl font-bold mb-4">
            Today's Attendance
          </h2>

          <p className="text-gray-400 mb-6">
            {isCheckedIn
              ? "You are currently checked in. Don't forget to check out when you leave!"
              : "Mark your attendance for today. Check in when you arrive at the gym."}
          </p>

          <button
            onClick={handleAttendanceAction}
            disabled={actionLoading}
            className={`px-8 py-3 rounded-xl font-bold hover:scale-105 transition ${
              isCheckedIn
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >
            {actionLoading
              ? "Processing..."
              : isCheckedIn
              ? "Check Out"
              : "Check In"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-4xl font-bold text-yellow-400">
              {visits}
            </h3>

            <p className="text-gray-400 mt-2">
              Total Visits
            </p>
          </div>

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-4xl font-bold text-yellow-400">
              {visits > 0 ? `${Math.min(Math.round((visits / 30) * 100), 100)}%` : "0%"}
            </h3>

            <p className="text-gray-400 mt-2">
              Attendance Rate (Monthly)
            </p>
          </div>

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-4xl font-bold text-yellow-400">
              {streak}
            </h3>

            <p className="text-gray-400 mt-2">
              Current Streak
            </p>
          </div>

        </div>

        {/* Attendance History */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Attendance History
          </h2>

          {history.length > 0 ? (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-zinc-800 text-gray-400">
                    <th className="text-left py-4">Date</th>
                    <th className="text-left py-4">Check In</th>
                    <th className="text-left py-4">Check Out</th>
                    <th className="text-left py-4">Status</th>
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
                      <tr key={item._id || index} className="border-b border-zinc-900">
                        <td className="py-4 font-semibold text-white">{dateStr}</td>
                        <td className="py-4 text-zinc-300">{checkInTime}</td>
                        <td className="py-4 text-zinc-300">{checkOutTime}</td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.checkOut
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-400/20 text-yellow-400 animate-pulse"
                            }`}
                          >
                            {item.checkOut ? "Completed" : "In Progress"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>
          ) : (
            <p className="text-gray-400">No attendance logs recorded yet. Start training today!</p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}