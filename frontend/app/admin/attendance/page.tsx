"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getAdminAttendanceOverview } from "@/src/dialogs/invoice_config/services";

export default function AttendancePage() {
  const [data, setData] = useState<any>({ liveUsers: [], todayCount: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAttendance = async () => {
    try {
      const res = await getAdminAttendanceOverview();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleExportCSV = () => {
    const list = data.history || [];
    if (list.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Member Name,Email,Mobile,Check-In,Check-Out,Duration (mins),Status,Source\n";

    list.forEach((item: any) => {
      const name = item.user?.name || "Deleted User";
      const email = item.user?.email || "N/A";
      const mobile = item.user?.mobile || "N/A";
      const checkIn = item.checkIn ? new Date(item.checkIn).toLocaleString() : "N/A";
      const checkOut = item.checkOut ? new Date(item.checkOut).toLocaleString() : "Active Session";
      const duration = item.totalDuration ?? "N/A";
      const status = item.checkOut ? "Completed" : "In Progress";
      const source = item.source || "GPS Automated";

      csvContent += `"${name.replace(/"/g, '""')}","${email.replace(/"/g, '""')}","${mobile.replace(/"/g, '""')}","${checkIn}","${checkOut}","${duration}","${status}","${source}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ForgeGym_Attendance_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-yellow-400 font-bold text-xl animate-pulse">
          Loading Attendance Data...
        </div>
      </AdminLayout>
    );
  }

  const liveUsers = data.liveUsers || [];
  const todayCount = data.todayCount || 0;
  const historyList = data.history || [];

  const filteredHistory = historyList.filter((item: any) =>
    (item.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.source || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto text-white">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white">Attendance Management</h1>
            <p className="text-zinc-400 text-sm mt-1">Monitor live check-ins, download reports, and track GPS presence.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            📥 Export CSV Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
            <h3 className="text-zinc-500 text-xs font-bold uppercase">Active Inside Gym</h3>
            <p className="text-4xl font-black mt-2 text-green-400">{liveUsers.length} Members</p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
            <h3 className="text-zinc-500 text-xs font-bold uppercase">Today's Total Check-Ins</h3>
            <p className="text-4xl font-black mt-2 text-yellow-400">{todayCount} Check-ins</p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
            <h3 className="text-zinc-500 text-xs font-bold uppercase">Total Attendance Logged</h3>
            <p className="text-4xl font-black mt-2 text-blue-400">{historyList.length} Sessions</p>
          </div>
        </div>

        {/* Live Active Tracker */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
            Live Gym Tracker
          </h2>

          {liveUsers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveUsers.map((item: any) => (
                <div key={item._id} className="bg-zinc-950 p-5 rounded-2xl border border-zinc-905 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">{item.user?.name || "Member"}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{item.user?.email || "N/A"}</p>
                    <p className="text-xs text-zinc-400 mt-2">
                      🕒 In: {new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="bg-green-500/20 text-green-400 text-[10px] px-2.5 py-1 rounded font-bold uppercase">
                    In Gym
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm py-2">No members are currently checked in inside the gym.</p>
          )}
        </div>

        {/* Search & History Table */}
        <div className="bg-black rounded-3xl p-6 border border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Attendance Logs</h2>
            <input
              type="text"
              placeholder="Search by member name, email or source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-yellow-400 text-sm"
            />
          </div>

          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-white text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-gray-500">
                    <th className="py-4">Member</th>
                    <th className="py-4">Contact</th>
                    <th className="py-4">Check-In Time</th>
                    <th className="py-4">Check-Out Time</th>
                    <th className="py-4">Duration</th>
                    <th className="py-4">Source</th>
                    <th className="py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map((item: any, index: number) => {
                    const checkInDate = item.checkIn ? new Date(item.checkIn) : null;
                    const checkInStr = checkInDate && !isNaN(checkInDate.getTime())
                      ? checkInDate.toLocaleString([], {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--";
                    const checkOutDate = item.checkOut ? new Date(item.checkOut) : null;
                    const checkOutStr = checkOutDate && !isNaN(checkOutDate.getTime())
                      ? checkOutDate.toLocaleString([], {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--";

                    return (
                      <tr key={item._id || index} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/10 transition">
                        <td className="py-4 font-semibold text-white">
                          {item.user?.name || "Deleted User"}
                        </td>
                        <td className="py-4 text-zinc-400">{item.user?.mobile || item.user?.email || "N/A"}</td>
                        <td className="py-4 text-zinc-300">{checkInStr}</td>
                        <td className="py-4 text-zinc-300">{checkOutStr}</td>
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
            <p className="text-zinc-500 text-center py-4">No attendance logs match the search query.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}