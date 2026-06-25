"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getPayments } from "@/src/dialogs/invoice_config/services";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getPayments();
        if (res.success) {
          setPayments(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-yellow-400 font-bold text-xl animate-pulse">
          Loading Transactions...
        </div>
      </AdminLayout>
    );
  }

  // Calculate stats from payments array
  const totalRevenue = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTransactions = payments.length;

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-white mb-8">
        Payments Management
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-green-400">
            ₹{totalRevenue.toLocaleString()}
          </h2>
          <p className="text-gray-400 mt-2">
            Total Revenue (Completed)
          </p>
        </div>

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-yellow-400">
            ₹{pendingRevenue.toLocaleString()}
          </h2>
          <p className="text-gray-400 mt-2">
            Pending Payments
          </p>
        </div>

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-blue-400">
            {totalTransactions}
          </h2>
          <p className="text-gray-400 mt-2">
            Total Transactions
          </p>
        </div>
      </div>

      <div className="bg-black rounded-3xl p-6 border border-zinc-800">
        <h2 className="text-2xl font-bold text-white mb-4">
          All Transactions Log
        </h2>

        {payments.length > 0 ? (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-zinc-700 text-gray-400 text-left">
                <th className="py-3">Member</th>
                <th className="py-3">Transaction ID</th>
                <th className="py-3">Method</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((item, index) => (
                <tr key={item._id || index} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition">
                  <td className="py-4 font-semibold text-white">{item.user?.name || "Member"}</td>
                  <td className="py-4 text-zinc-300">{item.transactionId}</td>
                  <td className="py-4 text-zinc-300">{item.method}</td>
                  <td className="py-4 font-bold text-yellow-400">₹{item.amount}</td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === "Completed"
                          ? "bg-green-500/20 text-green-400"
                          : item.status === "Pending"
                          ? "bg-yellow-400/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-4">No transactions recorded yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}