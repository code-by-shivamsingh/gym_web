import AdminLayout from "@/src/components/organisms/AdminLayout";

export default function TrainersPage() {
  const trainers = [
    {
      name: "John Carter",
      specialization: "Strength Training",
      experience: "8 Years",
    },
    {
      name: "Sarah Wilson",
      specialization: "Weight Loss",
      experience: "6 Years",
    },
    {
      name: "Mike Johnson",
      specialization: "Bodybuilding",
      experience: "10 Years",
    },
  ];

  return (
    <AdminLayout>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Trainers Management
        </h1>

        <button className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold">
          + Add Trainer
        </button>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {trainers.map((trainer, index) => (
          <div
            key={index}
            className="bg-black border border-zinc-800 rounded-3xl p-6"
          >

            <div className="w-24 h-24 rounded-full bg-zinc-800 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-center">
              {trainer.name}
            </h2>

            <p className="text-yellow-400 text-center mt-2">
              {trainer.specialization}
            </p>

            <p className="text-gray-400 text-center mt-2">
              {trainer.experience}
            </p>

            <div className="flex gap-3 mt-6">

              <button className="flex-1 bg-blue-500 py-2 rounded-xl">
                Edit
              </button>

              <button className="flex-1 bg-red-500 py-2 rounded-xl">
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </AdminLayout>
  );
}