import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-black border-r border-zinc-800 p-6">

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
            href="/admin/reports"
            className="block p-4 rounded-xl bg-zinc-900 hover:bg-yellow-400 hover:text-black transition"
          >
            📈 Reports
          </Link>

          <Link
            href="/home"
            className="block p-4 rounded-xl bg-red-500 text-center font-bold"
          >
            🏠 Back To Website
          </Link>

        </nav>

      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  );
}