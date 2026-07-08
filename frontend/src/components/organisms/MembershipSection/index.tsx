"use client";
import { useRouter } from "next/navigation";

export default function MembershipSection() {
  const router = useRouter();
  
  const plans = [
    {
      name: "Basic",
      price: "₹999",
      features: [
        "Gym Access",
        "Locker Facility",
        "Basic Support",
      ],
    },
    {
      name: "Silver",
      price: "₹1499",
      features: [
        "Gym Access",
        "Locker Facility",
        "Standard Support",
        "General Trainer",
      ],
    },
    {
      name: "Gold",
      price: "₹2499",
      features: [
        "Gym Access",
        "Personal Trainer",
        "Diet Plan",
        "Locker Facility",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "₹4999",
      features: [
        "Gym Access",
        "Personal Trainer",
        "Diet Plan",
        "Workout Plan",
        "Priority Support",
      ],
    },
  ];

  return (
    <section className="bg-zinc-950 text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            MEMBERSHIP PLANS
          </span>

          <h2 className="text-5xl font-bold mt-4">
            Choose Your
            <span className="text-yellow-400">
              {" "}Fitness Plan
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl p-8 border flex flex-col justify-between ${
                plan.popular
                  ? "border-yellow-400 bg-black shadow-[0_0_30px_rgba(250,204,21,0.1)]"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <div>
                {plan.popular && (
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold inline-block">
                    MOST POPULAR
                  </span>
                )}

                <h3 className="text-3xl font-bold mt-6">
                  {plan.name}
                </h3>

                <p className="text-5xl font-bold text-yellow-400 mt-4">
                  {plan.price}
                  <span className="text-lg text-gray-400">
                    /month
                  </span>
                </p>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      ✅ {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => router.push(`/join?plan=${plan.name}`)}
                className="
                w-full mt-8
                bg-yellow-400
                text-black
                py-3
                rounded-xl
                font-bold
                hover:scale-105
                transition
                cursor-pointer
                border-none
                "
              >
                Join Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}