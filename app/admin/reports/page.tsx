import AdminLayout from "@/src/components/organisms/AdminLayout";

export default function ReportsPage() {
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-white mb-8">
        Reports & Analytics
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-yellow-400">
            250
          </h2>

          <p className="text-gray-400 mt-2">
            Active Members
          </p>
        </div>

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-green-400">
            ₹5L
          </h2>

          <p className="text-gray-400 mt-2">
            Revenue This Month
          </p>
        </div>

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-blue-400">
            92%
          </h2>

          <p className="text-gray-400 mt-2">
            Attendance Rate
          </p>
        </div>

      </div>

      <div className="bg-black rounded-3xl border border-zinc-800 p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Monthly Summary
        </h2>

        <p className="text-gray-400">
          Revenue increased by 15% compared to last month.
          Member attendance is consistently above 90%.
        </p>
      </div>

    </AdminLayout>
  );
}