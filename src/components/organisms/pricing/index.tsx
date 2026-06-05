import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      price: "₹999",
      popular: false,
      features: [
        "Unlimited Gym Access",
        "Locker Facility",
        "Free WiFi",
        "Basic Support",
      ],
    },
    {
      name: "Premium",
      price: "₹1999",
      popular: true,
      features: [
        "Unlimited Gym Access",
        "Personal Trainer",
        "Custom Diet Plan",
        "Locker Facility",
        "Body Assessment",
      ],
    },
    {
      name: "Elite",
      price: "₹2999",
      popular: false,
      features: [
        "Unlimited Gym Access",
        "Dedicated Trainer",
        "Custom Diet Plan",
        "24/7 Support",
        "VIP Access",
        "Monthly Progress Tracking",
      ],
    },
  ];

  return (
    <section className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            MEMBERSHIP PLANS
          </span>

          <h1 className="text-5xl font-bold mt-4">
            Choose Your Fitness Plan
          </h1>

          <p className="text-gray-400 mt-4">
            Select the plan that fits your goals and start
            your transformation today.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 border transition duration-300 hover:-translate-y-2
              ${
                plan.popular
                  ? "border-yellow-500 bg-zinc-900"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                  MOST POPULAR 🔥
                </div>
              )}

              <h2 className="text-3xl font-bold mb-4">
                {plan.name}
              </h2>

              <div className="mb-8">
                <span className="text-5xl font-extrabold text-yellow-400">
                  {plan.price}
                </span>
                <span className="text-gray-400">
                  {" "}
                  / month
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-gray-300"
                  >
                    ✓ {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/join"
                className="block text-center w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition"
              >
                Join Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}