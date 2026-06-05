import DashboardLayout from "@/src/components/organisms/DashboardLayout";

export default function AttendancePage() {
  const attendanceHistory = [
    {
      date: "03 Jun 2026",
      time: "06:10 AM",
      status: "Present",
    },
    {
      date: "02 Jun 2026",
      time: "06:20 AM",
      status: "Present",
    },
    {
      date: "01 Jun 2026",
      time: "06:15 AM",
      status: "Present",
    },
    {
      date: "31 May 2026",
      time: "06:25 AM",
      status: "Present",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-4xl font-bold mb-8">
          Attendance
        </h1>

        {/* Today's Attendance */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">
          
          <h2 className="text-2xl font-bold mb-4">
            Today's Attendance
          </h2>

          <p className="text-gray-400 mb-6">
            Mark your attendance for today.
          </p>

          <button className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition">
            Check In
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-4xl font-bold text-yellow-400">
              25
            </h3>

            <p className="text-gray-400 mt-2">
              Total Visits
            </p>
          </div>

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-4xl font-bold text-yellow-400">
              92%
            </h3>

            <p className="text-gray-400 mt-2">
              Attendance Rate
            </p>
          </div>

          <div className="bg-black p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-4xl font-bold text-yellow-400">
              7
            </h3>

            <p className="text-gray-400 mt-2">
              Current Streak
            </p>
          </div>

        </div>

        {/* Attendance History */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Attendance History
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4">
                    Date
                  </th>

                  <th className="text-left py-4">
                    Time
                  </th>

                  <th className="text-left py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendanceHistory.map(
                  (item, index) => (
                    <tr
                      key={index}
                      className="border-b border-zinc-900"
                    >
                      <td className="py-4">
                        {item.date}
                      </td>

                      <td className="py-4">
                        {item.time}
                      </td>

                      <td className="py-4">
                        <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}