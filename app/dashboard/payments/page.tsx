import DashboardLayout from "@/src/components/organisms/DashboardLayout";

export default function PaymentsPage() {
  const payments = [
    {
      date: "01 Jun 2026",
      amount: "₹1999",
      status: "Paid",
    },
    {
      date: "01 May 2026",
      amount: "₹1999",
      status: "Paid",
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Payments
      </h1>

      <div className="bg-black border border-zinc-800 rounded-3xl p-8">

        <table className="w-full">

          <thead>
            <tr>
              <th className="text-left py-4">
                Date
              </th>

              <th className="text-left py-4">
                Amount
              </th>

              <th className="text-left py-4">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {payments.map((item, index) => (
              <tr key={index}>
                <td className="py-4">
                  {item.date}
                </td>

                <td className="py-4">
                  {item.amount}
                </td>

                <td className="py-4">
                  <span className="text-green-400">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </DashboardLayout>
  );
}