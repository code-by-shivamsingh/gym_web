"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import { getPayments, downloadInvoicePdf } from "@/src/dialogs/invoice_config/services";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDownload = async (paymentId: string, txnId: string) => {
    try {
      const res = await downloadInvoicePdf(paymentId);
      if (res.success && res.data) {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Invoice-${txnId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } else {
        alert("Failed to download PDF invoice.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating invoice download");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Payments...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">Payments History</h1>

      <div className="bg-black border border-zinc-800 rounded-3xl p-8">
        {payments.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400">
                <th className="text-left py-4">Date</th>
                <th className="text-left py-4">Transaction ID</th>
                <th className="text-left py-4">Method</th>
                <th className="text-left py-4">Amount</th>
                <th className="text-left py-4">Status</th>
                <th className="text-right py-4">Invoice</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((item, index) => {
                const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={item._id || index} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition">
                    <td className="py-4 font-semibold text-white">{dateStr}</td>
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
                    <td className="py-4 text-right">
                      {item.status === "Completed" ? (
                        <button
                          onClick={() => handleDownload(item._id, item.transactionId)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl text-xs font-bold transition"
                        >
                          📄 Download PDF
                        </button>
                      ) : (
                        <span className="text-zinc-500 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-4">No payments records found.</p>
        )}
      </div>
    </DashboardLayout>
  );
}