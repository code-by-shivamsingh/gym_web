import DashboardLayout from "@/src/components/organisms/DashboardLayout";

export default function WorkoutPage() {
  const workouts = [
    {
      day: "Monday",
      workout: "Chest & Triceps",
    },
    {
      day: "Tuesday",
      workout: "Back & Biceps",
    },
    {
      day: "Wednesday",
      workout: "Legs",
    },
    {
      day: "Thursday",
      workout: "Shoulders",
    },
    {
      day: "Friday",
      workout: "Arms",
    },
    {
      day: "Saturday",
      workout: "Cardio",
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Workout Plan
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {workouts.map((item, index) => (
          <div
            key={index}
            className="bg-black border border-zinc-800 rounded-3xl p-6"
          >
            <h2 className="text-yellow-400 text-xl font-bold">
              {item.day}
            </h2>

            <p className="mt-3 text-gray-300">
              {item.workout}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}