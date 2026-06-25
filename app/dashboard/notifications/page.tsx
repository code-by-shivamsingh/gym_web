"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import { motion } from "framer-motion";
import { getUserNotifications } from "@/src/dialogs/invoice_config/services";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getUserNotifications();
        if (res.success) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Notifications...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-2">Notifications</h1>
        <p className="text-gray-400 mb-8">Stay updated with latest announcements and personal alerts.</p>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 hover:border-yellow-400/40 transition duration-300 flex items-start gap-4"
              >
                <div className="text-2xl mt-1">
                  {notif.type === "success" ? "✅" : notif.type === "trainer" ? "💪" : notif.type === "alert" ? "⚠️" : "📢"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1 gap-4">
                    <h3 className="text-lg font-bold text-white">{notif.title}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{notif.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            <span className="text-4xl">📭</span>
            <p className="text-gray-400 mt-4 font-semibold">You have no unread notifications.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
