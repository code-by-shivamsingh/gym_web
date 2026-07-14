"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser, getUserProfile } from "@/src/dialogs/invoice_config/services";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getUserProfile();
        if (!res.success) {
          router.push("/login");
        } else if (res.data.role !== "Admin") {
          router.push("/dashboard");
        } else {
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/login");
    } catch (err) {
      console.error(err);
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/login");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-yellow-400 font-bold text-xl animate-pulse">Verifying Authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-black border-r border-zinc-800 p-6 flex flex-col justify-between">

        <div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-10">
            FORGE GYM
          </h1>

          <nav className="space-y-3">

            <Link
              href="/admin"
              className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
            >
              📊 Dashboard
            </Link>

            <Link
              href="/admin/members"
              className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
            >
              👥 Members
            </Link>

            <Link
              href="/admin/trainers"
              className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
            >
              🏋 Trainers
            </Link>

            <Link
              href="/admin/payments"
              className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
            >
              💳 Payments
            </Link>

            <Link
              href="/admin/attendance"
              className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
            >
              📅 Attendance
            </Link>

            <Link
              href="/admin/workouts"
              className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
            >
              🏋️ Workouts
            </Link>

            <Link
              href="/admin/reports"
              className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
            >
              📈 Reports
            </Link>

            <Link
              href="/admin/settings"
              className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
            >
              ⚙ Settings
            </Link>

            <Link
              href="/home"
              className="block p-4 rounded-xl bg-zinc-900 text-center font-bold hover:bg-yellow-400 hover:text-black transition text-gray-300"
            >
              🏠 View Website
            </Link>

          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 transition font-bold py-3 rounded-xl"
        >
          Logout
        </button>

      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  );
}