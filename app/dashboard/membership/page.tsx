import DashboardLayout from "@/src/components/organisms/DashboardLayout";

export default function MembershipPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Membership Details
        </h1>

        {/* Current Plan */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">

          <div className="flex flex-col md:flex-row justify-between gap-8">

            <div>
              <p className="text-gray-400">
                Current Plan
              </p>

              <h2 className="text-4xl font-bold text-yellow-400 mt-2">
                Premium Plan
              </h2>

              <p className="text-gray-400 mt-4">
                Access to all gym equipment,
                personal trainer support,
                and diet consultation.
              </p>
            </div>

            <div>
              <p className="text-gray-400">
                Membership Status
              </p>

              <span className="inline-block mt-3 px-5 py-2 rounded-full bg-green-500/20 text-green-400">
                Active
              </span>
            </div>

          </div>
        </div>

        {/* Membership Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-yellow-400 text-xl font-bold">
              Start Date
            </h3>

            <p className="mt-3 text-gray-300">
              01 Jan 2026
            </p>
          </div>

          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-yellow-400 text-xl font-bold">
              Expiry Date
            </h3>

            <p className="mt-3 text-gray-300">
              31 Dec 2026
            </p>
          </div>

          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-yellow-400 text-xl font-bold">
              Amount Paid
            </h3>

            <p className="mt-3 text-gray-300">
              ₹19,999
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Membership Actions
          </h2>

          <div className="flex flex-wrap gap-4">

            <button className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition">
              Renew Membership
            </button>

            <button className="border border-yellow-400 text-yellow-400 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition">
              Upgrade Plan
            </button>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}