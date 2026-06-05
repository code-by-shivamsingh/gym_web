import AdminLayout from "@/src/components/organisms/AdminLayout";

export default function AttendancePage() {
  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-white mb-8">
        Attendance Management
      </h1>

      <div className="bg-black rounded-3xl p-6 border border-zinc-800">

        <h2 className="text-2xl font-bold mb-4">
          Today's Attendance
        </h2>

        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left py-3">Member</th>
              <th className="text-left py-3">Check In</th>
              <th className="text-left py-3">Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td className="py-4">Mukesh</td>
              <td>08:00 AM</td>
              <td className="text-green-400">
                Present
              </td>
            </tr>

            <tr>
              <td className="py-4">Rahul</td>
              <td>09:15 AM</td>
              <td className="text-green-400">
                Present
              </td>
            </tr>

            <tr>
              <td className="py-4">Amit</td>
              <td>-</td>
              <td className="text-red-400">
                Absent
              </td>
            </tr>

          </tbody>

        </table>

      </div>
    </AdminLayout>
  );
}