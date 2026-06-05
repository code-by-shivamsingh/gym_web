import DashboardLayout from "@/src/components/organisms/DashboardLayout";

export default function ProgressPage() {
  return (
    <DashboardLayout>
      <div className="text-white">

        <h1 className="text-4xl font-bold mb-8">
          Progress Tracker 📈
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-black border border-zinc-800 p-6 rounded-3xl">
            <h2 className="text-4xl font-bold text-green-400">
              -8 KG
            </h2>
            <p className="text-gray-400 mt-2">
              Weight Loss
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
            <h2 className="text-4xl font-bold text-yellow-400">
              25
            </h2>
            <p className="text-gray-400 mt-2">
              Workouts Completed
            </p>
          </div>

        </div>

        {/* Current Goal */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Current Goal 🎯
          </h2>

          <p className="text-xl text-yellow-400 font-bold">
            Muscle Gain Program
          </p>

          <div className="w-full bg-zinc-800 rounded-full h-5 mt-6">
            <div
              className="bg-yellow-400 h-5 rounded-full"
              style={{ width: "85%" }}
            />
          </div>

          <p className="text-gray-400 mt-4">
            85% completed
          </p>

        </div>

        {/* Body Measurements */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">
            Body Measurements 📏
          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <div className="bg-zinc-900 p-5 rounded-2xl">
              <h3 className="text-gray-400">
                Weight
              </h3>

              <p className="text-3xl font-bold text-green-400">
                72 KG
              </p>
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl">
              <h3 className="text-gray-400">
                BMI
              </h3>

              <p className="text-3xl font-bold text-blue-400">
                23.5
              </p>
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl">
              <h3 className="text-gray-400">
                Body Fat
              </h3>

              <p className="text-3xl font-bold text-red-400">
                18%
              </p>
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl">
              <h3 className="text-gray-400">
                Muscle Mass
              </h3>

              <p className="text-3xl font-bold text-yellow-400">
                42 KG
              </p>
            </div>

          </div>

        </div>

        {/* Achievements */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Achievements 🏆
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-zinc-900 p-5 rounded-2xl">
              🔥 30 Day Streak
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl">
              💪 100 Workouts Completed
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl">
              🏅 Lost 8 KG Weight
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}