"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getAdminAttendanceOverview } from "@/src/dialogs/invoice_config/services";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await getAdminAttendanceOverview();
        if (res.success) {
          setAttendance(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-yellow-400 font-bold text-xl animate-pulse">
          Loading Attendance Log...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-white mb-8">
        Attendance Management
      </h1>

      <div className="bg-black rounded-3xl p-6 border border-zinc-800">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Today's Member Check-Ins
        </h2>

        {attendance.length > 0 ? (
          <table className="w-full text-white text-left">
            <thead>
              <tr className="border-b border-zinc-700 text-gray-400">
                <th className="py-3">Member</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Check In Date</th>
                <th className="py-3">Check In Time</th>
                <th className="py-3">Check Out Time</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((item, index) => {
                const checkInDate = new Date(item.checkIn);
                const dateStr = checkInDate.toLocaleDateString();
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
                  <tr key={item._id || index} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition">
                    <td className="py-4 font-semibold text-white">
                      {item.user?.name || "Deleted User"}
                    </td>
                    <td className="py-4 text-zinc-400">{item.user?.mobile || item.user?.email || "N/A"}</td>
                    <td className="py-4 text-zinc-300">{dateStr}</td>
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
                        {item.checkOut ? "Completed" : "In Gym"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-4">No check-ins logged for today.</p>
        )}
      </div>
    </AdminLayout>
  );
}