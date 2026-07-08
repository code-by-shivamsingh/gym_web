"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  emoji: string;
  title: string;
  desc: string;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    emoji: "🏋️‍♂️",
    title: "Unleash The Beast",
    desc: "Welcome to Forge Gym! Get ready to transform your strength, discipline, and energy with premium equipment and certified fitness coaches.",
  },
  {
    emoji: "🥗",
    title: "Tailored Diet & Workouts",
    desc: "Follow custom workout schedules and high-performance meal plans assigned directly to your dashboard by your personal trainers.",
  },
  {
    emoji: "📅",
    title: "Seamless Check-Ins & Billing",
    desc: "Seamlessly log your daily attendance check-ins, monitor active streaks, manage payments, and download secure invoices on the go.",
  },
];

export default function OnboardingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if user has already seen onboarding
    const onboarded = localStorage.getItem("onboarded");
    if (onboarded !== "true") {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("onboarded", "true");
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarded", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const slide = ONBOARDING_SLIDES[currentSlide];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
        {/* Glow Backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-xl bg-zinc-900/90 border border-zinc-800 rounded-[32px] p-8 md:p-10 shadow-[0_0_50px_rgba(250,204,21,0.1)] text-center overflow-hidden"
        >
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-8 text-sm text-zinc-500 hover:text-white font-bold bg-transparent border-none cursor-pointer transition"
          >
            SKIP
          </button>

          {/* Slide Content */}
          <div className="my-8 flex flex-col items-center">
            {/* Animated Emoji */}
            <motion.div
              key={currentSlide}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-8xl mb-8 select-none"
            >
              {slide.emoji}
            </motion.div>

            {/* Slide Title */}
            <motion.h2
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-black text-white tracking-tight"
            >
              {slide.title}
            </motion.h2>

            {/* Slide Description */}
            <motion.p
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 mt-4 leading-relaxed text-sm md:text-base max-w-sm"
            >
              {slide.desc}
            </motion.p>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {ONBOARDING_SLIDES.map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "bg-yellow-400 w-8" : "bg-zinc-700 w-2.5"
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full py-4 rounded-2xl font-black text-lg text-black bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition cursor-pointer shadow-lg shadow-yellow-400/10 border-none"
          >
            {currentSlide === ONBOARDING_SLIDES.length - 1 ? "GET STARTED 🚀" : "NEXT ➡️"}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
