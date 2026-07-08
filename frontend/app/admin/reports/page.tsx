"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getReportsStats } from "@/src/dialogs/invoice_config/services";

export default function ReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getReportsStats();
        if (res.success) {
          setReports(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-yellow-400 font-bold text-xl animate-pulse">
          Loading Reports & Analytics...
        </div>
      </AdminLayout>
    );
  }

  const activeMembers = reports?.activeMembers ?? 0;
  const totalRevenue = reports?.totalRevenue ?? 0;
  const progressPercent = reports?.progressPercent ?? 0;
  const monthlyTarget = reports?.monthlyTarget ?? 700000;
  const breakdown = reports?.breakdown || [];

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-white mb-8">
        Reports & Analytics
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-yellow-400">
            {activeMembers}
          </h2>
          <p className="text-gray-400 mt-2">
            Active Members
          </p>
        </div>

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-green-400">
            ₹{totalRevenue.toLocaleString()}
          </h2>
          <p className="text-gray-400 mt-2">
            Cumulative Revenue
          </p>
        </div>

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-blue-400">
            {progressPercent}%
          </h2>
          <p className="text-gray-400 mt-2">
            Target Completion Rate
          </p>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-black rounded-3xl border border-zinc-800 p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Target Progress Overview</h2>
        <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden">
          <div
            className="bg-green-500 h-5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-4 text-sm text-gray-400">
          <p>Target: ₹{monthlyTarget.toLocaleString()}</p>
          <p className="text-green-400 font-bold">₹{totalRevenue.toLocaleString()} Cumulative</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-black rounded-3xl border border-zinc-800 p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Monthly Revenue Breakdown</h2>
        
        {breakdown.length > 0 ? (
          <div className="space-y-4">
            {breakdown.map((item: any, idx: number) => {
              const itemPercent = Math.min(Math.round((item.revenue / monthlyTarget) * 100), 100);
              return (
                <div key={idx} className="flex items-center justify-between gap-6">
                  <span className="w-12 text-gray-400 font-bold text-sm">{item.month}</span>
                  <div className="flex-1 bg-zinc-900 h-3 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full" style={{ width: `${itemPercent}%` }} />
                  </div>
                  <span className="w-24 text-right text-white font-bold text-sm">₹{item.revenue.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No monthly revenue logs found.</p>
        )}
      </div>
    </AdminLayout>
  );
}