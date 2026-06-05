import AdminLayout from "@/src/components/organisms/AdminLayout";

export default function PaymentsPage() {
  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-white mb-8">
        Payments Management
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-green-400">
            ₹5,00,000
          </h2>
          <p className="text-gray-400 mt-2">
            Total Revenue
          </p>
        </div>

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-yellow-400">
            ₹50,000
          </h2>
          <p className="text-gray-400 mt-2">
            Pending Payments
          </p>
        </div>

        <div className="bg-black p-6 rounded-3xl border border-zinc-800">
          <h2 className="text-4xl font-bold text-blue-400">
            120
          </h2>
          <p className="text-gray-400 mt-2">
            Transactions
          </p>
        </div>

      </div>

      <div className="bg-black rounded-3xl p-6 border border-zinc-800">
        <h2 className="text-2xl font-bold text-white mb-4">
          Recent Payments
        </h2>

        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left py-3">Member</th>
              <th className="text-left py-3">Amount</th>
              <th className="text-left py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="py-4">Mukesh</td>
              <td>₹2000</td>
              <td className="text-green-400">Paid</td>
            </tr>

            <tr>
              <td className="py-4">Rahul</td>
              <td>₹1500</td>
              <td className="text-yellow-400">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}