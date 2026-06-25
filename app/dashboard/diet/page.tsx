"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import { getDietPlans } from "@/src/dialogs/invoice_config/services";

export default function DietPage() {
  const [diet, setDiet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const res = await getDietPlans();
        if (res.success) {
          setDiet(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiet();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Diet Plan...</p>
        </div>
      </DashboardLayout>
    );
  }

  const meals = diet?.meals || [];

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">Diet Plan</h1>

      <div className="bg-black border border-zinc-800 rounded-3xl p-8 max-w-4xl">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">
          {diet?.title || "My Daily Nutrition Schedule"}
        </h2>

        {meals.length > 0 ? (
          <div className="space-y-8">
            {meals.map((meal: any, index: number) => (
              <div
                key={index}
                className="border-b border-zinc-900 pb-6 last:border-0 last:pb-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
              >
                <div>
                  <h3 className="text-white font-bold text-lg">{meal.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">Scheduled time: {meal.time || "N/A"}</p>
                </div>
                <div className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-4 py-2 rounded-xl font-bold text-center self-start sm:self-center">
                  {meal.calories} kcal
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No specific meals assigned in your active plan yet.</p>
        )}
      </div>
    </DashboardLayout>
  );
}