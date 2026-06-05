import DashboardLayout from "@/src/components/organisms/DashboardLayout";

export default function DietPage() {
  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Diet Plan
      </h1>

      <div className="bg-black border border-zinc-800 rounded-3xl p-8">

        <div className="space-y-6">

          <div>
            <h3 className="text-yellow-400 font-bold">
              Breakfast
            </h3>

            <p>Oats + Banana + Milk</p>
          </div>

          <div>
            <h3 className="text-yellow-400 font-bold">
              Lunch
            </h3>

            <p>Rice + Dal + Chicken + Salad</p>
          </div>

          <div>
            <h3 className="text-yellow-400 font-bold">
              Evening Snack
            </h3>

            <p>Protein Shake + Dry Fruits</p>
          </div>

          <div>
            <h3 className="text-yellow-400 font-bold">
              Dinner
            </h3>

            <p>Paneer + Vegetables + Roti</p>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}