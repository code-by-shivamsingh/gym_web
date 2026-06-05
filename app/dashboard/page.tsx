import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/home"
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            🏠 View Website
          </Link>

          <Link
            href="/admin"
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            👨‍💼 Admin Panel
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 mb-8 text-black shadow-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Welcome Back, Sukoon 👋
        </h1>

        <p className="mt-4 text-lg">
          Stay consistent. Every workout brings you
          closer to your goal.
        </p>

        <div className="flex flex-wrap gap-4 mt-6">
          <Link
  href="/dashboard/attendance"
  className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
>
  📅 Check In
</Link>

          <Link
            href="/dashboard/progress"
            className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            📈 View Progress
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
          <h2 className="text-4xl font-bold text-yellow-400">
            25
          </h2>

          <p className="text-gray-400 mt-2">
            Total Visits
          </p>
        </div>

        <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
          <h2 className="text-4xl font-bold text-green-400">
            7
          </h2>

          <p className="text-gray-400 mt-2">
            Day Streak
          </p>
        </div>

        <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
          <h2 className="text-4xl font-bold text-blue-400">
            85%
          </h2>

          <p className="text-gray-400 mt-2">
            Goal Progress
          </p>
        </div>

        <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
          <h2 className="text-3xl font-bold text-red-400">
            Premium
          </h2>

          <p className="text-gray-400 mt-2">
            Membership
          </p>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">

          <Link
            href="/dashboard/attendance"
            className="bg-yellow-400 text-black p-5 rounded-2xl text-center font-bold hover:scale-105 transition"
          >
            📅 Attendance
          </Link>

          <Link
            href="/dashboard/workout"
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-center hover:border-yellow-400 transition"
          >
            🏋 Workout Plan
          </Link>

          <Link
            href="/dashboard/diet"
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-center hover:border-yellow-400 transition"
          >
            🥗 Diet Plan
          </Link>

          <Link
            href="/dashboard/membership"
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-center hover:border-yellow-400 transition"
          >
            💳 Membership
          </Link>

          <Link
            href="/admin/members"
            className="bg-red-500 text-white p-5 rounded-2xl text-center font-bold hover:scale-105 transition"
          >
            👥 Members
          </Link>

        </div>
      </div>

      {/* Today's Workout */}
      <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Today's Workout
        </h2>

        <p className="text-yellow-400 text-xl font-bold">
          Chest & Triceps
        </p>

        <ul className="mt-4 space-y-2 text-gray-400">
          <li>✅ Bench Press - 4 Sets</li>
          <li>✅ Incline Dumbbell Press - 4 Sets</li>
          <li>✅ Chest Fly - 3 Sets</li>
          <li>✅ Tricep Pushdown - 3 Sets</li>
        </ul>
      </div>

      {/* Progress Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">

        <div className="bg-black border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            Attendance Progress
          </h2>

          <div className="w-full bg-zinc-800 rounded-full h-5">
            <div
              className="bg-yellow-400 h-5 rounded-full"
              style={{ width: "85%" }}
            />
          </div>

          <p className="mt-4 text-gray-400">
            You attended 25 out of 30 days this month.
          </p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            Current Goal
          </h2>

          <h3 className="text-5xl font-bold text-green-400">
            85%
          </h3>

          <p className="mt-3 text-gray-400">
            Muscle Gain Progress
          </p>
        </div>

      </div>

      {/* Achievements */}
      <div className="bg-black border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold mb-6">
          Achievements 🏆
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <div className="bg-zinc-900 p-5 rounded-2xl">
            🏅 7 Day Streak
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl">
            💪 25 Workouts Completed
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl">
            🔥 8 KG Weight Loss
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}