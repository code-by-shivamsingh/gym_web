"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser, getUserProfile } from "@/src/dialogs/invoice_config/services";

export default function DashboardLayout({
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
      // Fallback redirection
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/login");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-yellow-400 font-bold text-xl animate-pulse">Verifying Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      
      {/* Sidebar */}
      <aside className="w-72 bg-black border-r border-zinc-800 p-6 flex flex-col justify-between">
        
        <div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-10">
            FORGE
          </h1>

          <nav className="space-y-3">

            <Link
              href="/dashboard"
              className="block p-3 rounded-xl hover:bg-zinc-900"
            >
              📊 Dashboard
            </Link>

            <Link
              href="/dashboard/profile"
              className="block p-3 rounded-xl hover:bg-zinc-900"
            >
              👤 Profile
            </Link>

            <Link
              href="/dashboard/attendance"
              className="block p-3 rounded-xl hover:bg-zinc-900"
            >
              📅 Attendance
            </Link>

            <Link
              href="/dashboard/membership"
              className="block p-3 rounded-xl hover:bg-zinc-900"
            >
              💳 Membership
            </Link>

            <Link
              href="/dashboard/workout"
              className="block p-3 rounded-xl hover:bg-zinc-900"
            >
              🏋️ Workout Plan
            </Link>

            <Link
              href="/dashboard/diet"
              className="block p-3 rounded-xl hover:bg-zinc-900"
            >
              🥗 Diet Plan
            </Link>

            <Link
              href="/dashboard/payments"
              className="block p-3 rounded-xl hover:bg-zinc-900"
            >
              💰 Payments
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