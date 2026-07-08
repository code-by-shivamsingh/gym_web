"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  id: string;
  emoji: string;
  title: string;
  desc: string;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    id: "1",
    emoji: "🏋️‍♂️",
    title: "Unleash The Beast",
    desc: "Welcome to Forge Gym! Get ready to transform your strength, discipline, and energy with premium equipment and certified fitness coaches.",
  },
  {
    id: "2",
    emoji: "🥗",
    title: "Tailored Diet & Workouts",
    desc: "Follow custom workout schedules and high-performance meal plans assigned directly to your dashboard by your personal trainers.",
  },
  {
    id: "3",
    emoji: "📅",
    title: "Mobile Check-Ins & Billing",
    desc: "Seamlessly log your daily attendance check-ins, monitor active streaks, manage payments, and download secure invoices on the go.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      localStorage.setItem("onboarded", "true");
      router.push("/");
    }
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const slide = ONBOARDING_SLIDES[currentSlideIndex];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white px-4">
      {/* Background Glow Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-[150px] top-0 left-0" />
      <div className="absolute w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[150px] bottom-0 right-0" />

      {/* Slide Container */}
      <div className="relative z-10 w-full max-w-2xl bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800 rounded-[32px] p-8 md:p-12 shadow-2xl flex flex-col items-center min-h-[500px] justify-between">
        
        {/* Progress Bar Header */}
        <div className="w-full flex gap-2 justify-center mb-8">
          {ONBOARDING_SLIDES.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlideIndex
                  ? "w-10 bg-yellow-400"
                  : "w-2 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Slide Content with AnimatePresence */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="text-8xl md:text-9xl mb-8 animate-bounce select-none">
                {slide.emoji}
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-wide text-white">
                {slide.title}
              </h1>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-md">
                {slide.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons Controls */}
        <div className="w-full flex items-center justify-between mt-8 gap-4">
          <button
            onClick={handleBack}
            disabled={currentSlideIndex === 0}
            className="px-6 py-3.5 rounded-xl font-bold border border-zinc-700 hover:border-white text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-700 disabled:hover:text-gray-400 cursor-pointer"
          >
            ⬅️ BACK
          </button>
          
          <button
            onClick={handleNext}
            className="px-8 py-3.5 rounded-xl font-bold bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/20 hover:scale-105 transition cursor-pointer"
          >
            {currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? "GET STARTED 🚀" : "NEXT ➡️"}
          </button>
        </div>
      </div>
    </div>
  );
}
