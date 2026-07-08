"use client";

import { useEffect, useState } from "react";
import AddMemberDialog from "@/src/components/organisms/AddMemberDialog";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getAllMembers, getDashboardStats, getUserProfile } from "@/src/dialogs/invoice_config/services";

export default function AdminDashboard() {
  const [openDialog, setOpenDialog] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [membersRes, statsRes, profileRes] = await Promise.all([
        getAllMembers(),
        getDashboardStats(),
        getUserProfile(),
      ]);

      if (membersRes.success) setMembers(membersRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (profileRes.success) setProfile(profileRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddMember = async (newMember: any) => {
    // Refresh dashboard stats and members list
    await fetchDashboardData();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-yellow-400 font-bold text-xl animate-pulse">
          Loading Admin Panel...
        </div>
      </AdminLayout>
    );
  }

  // Dashboard Stats values
  const totalMembers = stats?.totalMembers ?? members.length;
  const activeMembers = stats?.activeMembers ?? 0;
  const expiredMembers = stats?.expiredMembers ?? 0;
  const totalTrainers = stats?.totalTrainers ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const attendanceRate = stats?.attendanceRate ?? 92;
  const recentMembers = stats?.recentMembers || members.slice(0, 5);

  const revenueTarget = 700000;
  const revenuePercent = monthlyRevenue ? Math.min(Math.round((monthlyRevenue / revenueTarget) * 100), 100) : 75;

  return (
    <AdminLayout>
      <div className="text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Welcome back, {profile?.name || "Gym Owner"} 👋
            </p>
          </div>

          <button
            onClick={() => setOpenDialog(true)}
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            + Add Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-4xl font-bold text-yellow-400">{totalMembers}</h2>
            <p className="text-gray-400 mt-2">Total Members</p>
          </div>

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-4xl font-bold text-green-400">₹{monthlyRevenue.toLocaleString()}</h2>
            <p className="text-gray-400 mt-2">Monthly Revenue</p>
          </div>

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-4xl font-bold text-blue-400">{totalTrainers}</h2>
            <p className="text-gray-400 mt-2">Trainers</p>
          </div>

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-4xl font-bold text-red-400">{attendanceRate}%</h2>
            <p className="text-gray-400 mt-2">Attendance Rate</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Revenue Overview</h2>
          <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden">
            <div
              className="bg-green-500 h-5 rounded-full transition-all duration-500"
              style={{ width: `${revenuePercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 text-gray-400 text-sm">
            <p>Monthly Target: ₹{revenueTarget.toLocaleString()}</p>
            <p className="text-green-400 font-bold">{revenuePercent}% Reached</p>
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Signups</h2>
          
          {recentMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-gray-400 text-left">
                    <th className="py-4">Name</th>
                    <th className="py-4">Plan</th>
                    <th className="py-4">Status</th>
                    <th className="py-4">Join Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentMembers.map((member: any, index: number) => {
                    const joinDateStr = member.createdAt
                      ? new Date(member.createdAt).toLocaleDateString()
                      : new Date(member.joinedDate || Date.now()).toLocaleDateString();

                    return (
                      <tr
                        key={member._id || index}
                        className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition"
                      >
                        <td className="py-4 font-semibold text-white">{member.name}</td>
                        <td className="py-4 text-zinc-300">{member.plan}</td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              member.status === "Active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-4 text-zinc-400">{joinDateStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No member signups logged yet.</p>
          )}
        </div>
      </div>

      <AddMemberDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onAddMember={handleAddMember}
      />
    </AdminLayout>
  );
}
