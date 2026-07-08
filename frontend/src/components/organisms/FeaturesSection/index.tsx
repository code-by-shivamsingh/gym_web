export default function FeaturesSection() {
  const features = [
    {
      title: "Modern Equipment",
      description:
        "Train with the latest fitness machines and world-class equipment.",
      icon: "🏋️",
    },
    {
      title: "Expert Trainers",
      description:
        "Certified trainers to guide you through every fitness goal.",
      icon: "💪",
    },
    {
      title: "Nutrition Plans",
      description:
        "Personalized diet plans for weight loss and muscle gain.",
      icon: "🥗",
    },
    {
      title: "24/7 Support",
      description:
        "Fitness guidance and support whenever you need it.",
      icon: "⏰",
    },
  ];

  return (
<section
  id="features"
  className="scroll-mt-24 py-24"
>      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold">
            WHY CHOOSE US
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Everything You Need
            <span className="text-yellow-400">
              {" "}To Reach Your Goals
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-black p-8 rounded-3xl border border-zinc-800 hover:border-yellow-400 transition"
            >
              <div className="text-5xl mb-5">
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold mb-4">
                {item.title}
              </h3>

              <p className="text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}