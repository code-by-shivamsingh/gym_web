"use client";

import { motion } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";
import TrainingSection from "../TrainingSection/page";

export default function TrainingPage() {
  const extraPrograms = [
    { title: "Yoga & Flexibility", icon: "🧘‍♂️", desc: "Develop mindfulness, flexibility, balance, and core stability in our instructor-guided dynamic flow sessions." },
    { title: "CrossFit Circuit", icon: "🔥", desc: "High-intensity functional conditioning using ropes, kettlebells, rowing machine challenges, and sandbags." },
    { title: "Powerlifting Setup", icon: "💪", desc: "Master barbell mechanics on compound moves: Squat, Bench Press, and Deadlift under specialized guidance." },
    { title: "HIIT Conditioning", icon: "⏱️", desc: "Short intervals of max exertion followed by brief rests to elevate metabolic burn rate for up to 24 hours." }
  ];

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-zinc-950" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-bold uppercase tracking-wider text-xs inline-block mb-6"
          >
            Programs
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Training <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Tracks</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Explore diverse training categories that fit your body goals, from strength hypertrophies to high-intensity cardiovascular conditioning.
          </motion.p>
        </div>
      </section>

      {/* Main Training Programs Overview (Reused Section) */}
      <TrainingSection />

      {/* Additional Tracks */}
      <section className="py-24 bg-zinc-900 border-t border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">More Disciplines</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">Specialized Workout Splits</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {extraPrograms.map((prog, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-zinc-950 border border-zinc-800 p-8 rounded-[24px] flex items-start gap-6 hover:border-yellow-400/40 transition duration-300"
              >
                <div className="text-4xl bg-zinc-900 p-4 rounded-2xl border border-zinc-850 flex items-center justify-center shrink-0">
                  {prog.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{prog.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{prog.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-zinc-950 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Need Personalized Guidance?</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Book a one-on-one personal trainer session. Let our experts build a specific plan tailored exactly for your body.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => window.location.href = "/trainers"}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black tracking-wide text-lg shadow-2xl transition duration-300 cursor-pointer border-none"
            >
              CHOOSE YOUR TRAINER
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
