"use client";

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      
      {/* Sidebar */}
      <aside className="w-72 bg-black border-r border-zinc-800 p-6">
        
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

        <button
          className="w-full mt-10 bg-red-500 py-3 rounded-xl"
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