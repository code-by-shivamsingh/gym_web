"use client";

import { motion } from "framer-motion";

export default function TrainingSection() {
  const training = [
    {
      title: "Cardio Training",
      icon: "🏃",
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a",
      description:
        "Improve stamina, burn calories, boost heart health and increase endurance with world-class cardio equipment.",
      features: [
        "Treadmills",
        "Cycling",
        "HIIT Workouts",
        "Fat Burn Programs",
      ],
    },
    {
      title: "Strength Training",
      icon: "🏋️",
      image:
        "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f",
      description:
        "Build muscle, gain strength and transform your physique with expert-guided strength programs.",
      features: [
        "Free Weights",
        "Powerlifting",
        "Muscle Building",
        "Functional Training",
      ],
    },
  ];

  return (
    <section className="relative py-28 bg-black overflow-hidden">
        <section
  id="training"
  className="relative py-28 bg-black overflow-hidden"
></section>
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 blur-[150px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="text-center mb-20">
          <span className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-semibold">
            TRAINING PROGRAMS
          </span>

          <h2 className="text-5xl md:text-7xl font-black text-white mt-6">
            Train Like A
            <span className="text-yellow-400"> Champion</span>
          </h2>

          <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
            Discover specialized training programs designed to
            improve endurance, build strength and unlock your
            full potential.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {training.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="
              overflow-hidden
              rounded-[32px]
              border border-white/10
              bg-white/5
              backdrop-blur-xl
              "
            >
              <div className="overflow-hidden h-[320px]">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8">
                <div className="text-5xl mb-4">
                  {item.icon}
                </div>

                <h3 className="text-3xl font-black text-white">
                  {item.title}
                </h3>

                <p className="text-gray-400 mt-4">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-8">
                  {item.features.map((feature, i) => (
                    <div
                      key={i}
                      className="
                      bg-yellow-400/10
                      border border-yellow-400/20
                      rounded-xl
                      px-4
                      py-3
                      text-yellow-300
                      "
                    >
                      ✓ {feature}
                    </div>
                  ))}
                </div>

                <button
                  className="
                  mt-8
                  w-full
                  py-4
                  rounded-2xl
                  font-bold
                  bg-gradient-to-r
                  from-yellow-400
                  via-orange-500
                  to-red-500
                  text-black
                  "
                >
                  Start Training
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}