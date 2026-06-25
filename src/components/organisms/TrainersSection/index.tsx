"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Trainer {
  name: string;
  specialization: string;
  experience: string;
  image: string;
  certifications: string[];
  bio: string;
}

export default function TrainersSection() {
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const trainers: Trainer[] = [
    {
      name: "John Carter",
      specialization: "Strength Training",
      experience: "8 Years Experience",
      image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800",
      certifications: ["NASM Certified Personal Trainer", "USA Weightlifting Level 1 Coach", "CPR/AED Certified"],
      bio: "John specializes in hypertrophy, powerlifting coaching, and functional strength conditioning. He believes in building a solid foundational form to ensure long-term, injury-free muscle and strength gains.",
    },
    {
      name: "Sarah Wilson",
      specialization: "Weight Loss Coach",
      experience: "6 Years Experience",
      image: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=800",
      certifications: ["ACE Health & Wellness Specialist", "Certified Sports Nutritionist (CSN)", "FMS Level 2 Certified"],
      bio: "Sarah designs customized, holistic fat loss and athletic conditioning systems. Her training combines metabolic circuits with lifestyle habit-coaching to achieve sustainable transformations.",
    },
    {
      name: "Mike Johnson",
      specialization: "Bodybuilding Expert",
      experience: "10 Years Experience",
      image: "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=800",
      certifications: ["IFBB Pro Card Holder", "ISSA Master Trainer Certification", "Hypertrophy Specialist (ISSA)"],
      bio: "Mike brings elite bodybuilding training protocols directly to gym members. From muscle gain to contest prep and aesthetic conditioning, he provides the ultimate science-backed routine.",
    },
  ];

  return (
    <section
      id="trainers"
      className="scroll-mt-24 bg-black text-white py-24 px-6 relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-yellow-400 font-semibold tracking-wider uppercase">
            OUR TRAINERS
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Meet Our
            <span className="text-yellow-400"> Fitness Experts</span>
          </h2>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Our certified trainers help members achieve their fitness goals with personalized guidance, tailored programs, and elite coaching.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer, index) => (
            <div
              key={index}
              className="bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-900 hover:border-yellow-400/50 transition duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div className="overflow-hidden">
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition duration-300">
                    {trainer.name}
                  </h3>

                  <p className="text-yellow-400 mt-2 font-semibold">
                    {trainer.specialization}
                  </p>

                  <p className="text-gray-400 mt-3 text-sm">
                    {trainer.experience}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTrainer(trainer)}
                  className="mt-6 w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-300 hover:scale-[1.02] active:scale-[0.98] transition duration-300 shadow-md shadow-yellow-400/10 cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trainer Profile Modal */}
      <AnimatePresence>
        {selectedTrainer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTrainer(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative cursor-default max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTrainer(null)}
                className="absolute top-4 right-4 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-yellow-400 hover:text-black transition cursor-pointer z-10"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Trainer Image */}
                <div className="md:w-1/2">
                  <img
                    src={selectedTrainer.image}
                    alt={selectedTrainer.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>

                {/* Trainer Details */}
                <div className="p-8 md:w-1/2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-yellow-400 font-bold tracking-widest uppercase">
                      FITNESS COACH
                    </span>
                    <h2 className="text-3xl font-extrabold text-white mt-1">
                      {selectedTrainer.name}
                    </h2>
                    <p className="text-yellow-400 font-semibold text-sm mt-1">
                      {selectedTrainer.specialization} ({selectedTrainer.experience})
                    </p>

                    <hr className="border-zinc-800 my-4" />

                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                      Expertise & Bio
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {selectedTrainer.bio}
                    </p>

                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                      Certifications
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedTrainer.certifications.map((cert, i) => (
                        <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                          <span className="text-yellow-400 font-bold">✓</span>
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Link
                      href="/join"
                      onClick={() => setSelectedTrainer(null)}
                      className="block text-center w-full bg-yellow-400 text-black py-3.5 rounded-xl font-bold hover:bg-yellow-300 transition duration-300 shadow-lg shadow-yellow-400/20"
                    >
                      Start Training with {selectedTrainer.name.split(" ")[0]}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}