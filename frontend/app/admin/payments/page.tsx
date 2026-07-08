"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/src/components/organisms/AdminLayout";
import { getPayments, downloadInvoicePdf } from "@/src/dialogs/invoice_config/services";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

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

  // Reset page when filter/search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOrder]);

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

  // 1. Search, Filter, and Sort Logic
  const filteredPayments = payments
    .filter((item) => {
      // Status Filter
      if (statusFilter !== "All" && item.status !== statusFilter) return false;

      // Search Query
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const memberName = (item.user?.name || "").toLowerCase();
      const memberEmail = (item.user?.email || "").toLowerCase();
      const txnId = (item.transactionId || "").toLowerCase();
      const orderId = (item.orderId || "").toLowerCase();
      const method = (item.method || "").toLowerCase();
      const amount = (item.amount || "").toString();
      const dateStr = new Date(item.createdAt)
        .toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toLowerCase();

      return (
        memberName.includes(query) ||
        memberEmail.includes(query) ||
        txnId.includes(query) ||
        orderId.includes(query) ||
        method.includes(query) ||
        amount.includes(query) ||
        dateStr.includes(query)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  // Calculate stats from payments array
  const totalRevenue = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTransactions = payments.length;

  // 2. Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPayments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / recordsPerPage));

  const startNum = filteredPayments.length > 0 ? indexOfFirstRecord + 1 : 0;
  const endNum = Math.min(indexOfLastRecord, filteredPayments.length);

  const getPageNumbers = () => {
    const range = [];
    const delta = 1;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    const pagesWithEllipsis = [];
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          pagesWithEllipsis.push(l + 1);
        } else if (i - l > 2) {
          pagesWithEllipsis.push("...");
        }
      }
      pagesWithEllipsis.push(i);
      l = i;
    }

    return pagesWithEllipsis;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-yellow-400 font-bold text-xl animate-pulse">
          Loading Transactions...
        </div>
      </AdminLayout>
    );
  }

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

      {/* Filters and Search Panel */}
      <div className="bg-black border border-zinc-800 rounded-3xl p-6 mb-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by Member, Transaction ID, Order ID, Method, Amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-yellow-400 text-white px-5 py-3 rounded-2xl outline-none transition text-sm"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-2xl outline-none focus:border-yellow-400 text-sm cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-900">
          {["All", "Completed", "Pending", "Failed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                statusFilter === status
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-zinc-900 text-gray-400 border-zinc-800 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black rounded-3xl p-6 border border-zinc-800">
        <h2 className="text-2xl font-bold text-white mb-4">
          All Transactions Log
        </h2>

        {currentRecords.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-zinc-700 text-gray-400 text-left">
                    <th className="py-3">Member</th>
                    <th className="py-3">Transaction ID</th>
                    <th className="py-3">Method</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Invoice</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRecords.map((item, index) => (
                    <tr key={item._id || index} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30 transition">
                      <td className="py-4 font-semibold text-white">
                        <div>{item.user?.name || "Member"}</div>
                        <div className="text-xs text-zinc-500 font-normal">{item.user?.email}</div>
                      </td>
                      <td className="py-4 text-zinc-300">
                        <div>{item.transactionId || item.orderId}</div>
                        <div className="text-xs text-zinc-600">
                          Date: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 text-zinc-300">{item.method}</td>
                      <td className="py-4 font-bold text-yellow-400">₹{item.amount}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === "Completed"
                              ? "bg-green-500/20 text-green-400"
                              : item.status === "Pending"
                              ? "bg-yellow-400/20 text-yellow-400"
                              : item.status === "Cancelled"
                              ? "bg-zinc-800 text-zinc-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {item.status === "Completed" ? (
                          <button
                            onClick={() => handleDownload(item._id, item.transactionId || item.orderId)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black px-3.5 py-1.5 rounded-xl text-xs font-bold transition border-none cursor-pointer"
                          >
                            📄 PDF
                          </button>
                        ) : (
                          <span className="text-zinc-600 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-6">
              <p className="text-gray-400 text-sm">
                Showing <span className="font-bold text-white">{startNum}</span>–<span className="font-bold text-white">{endNum}</span> of{" "}
                <span className="font-bold text-white">{filteredPayments.length}</span> records
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition text-xs font-bold cursor-pointer"
                >
                  Previous
                </button>
                
                {getPageNumbers().map((item, idx) => {
                  if (item === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="text-zinc-500 px-2 select-none">
                        ...
                      </span>
                    );
                  }
                  const num = item as number;
                  return (
                    <button
                      key={`page-${num}`}
                      onClick={() => setCurrentPage(num)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition border-none cursor-pointer ${
                        currentPage === num
                          ? "bg-yellow-400 text-black"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
                
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition text-xs font-bold cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center py-4">No transactions matched your filters.</p>
        )}
      </div>
    </AdminLayout>
  );
}