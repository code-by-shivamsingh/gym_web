"use client";

import { motion } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";
import AboutSection from "@/src/components/organisms/AboutSection";

export default function AboutPage() {
  const coreValues = [
    { title: "Peak Performance", description: "Pushing limits to achieve physical excellence and unlock potential." },
    { title: "Discipline & Grit", description: "Consistency and dedication are the cornerstones of lasting transformations." },
    { title: "Empathetic Coaching", description: "Our trainers meet you where you are to guide you safely to where you want to be." },
    { title: "Inclusive Community", description: "A supportive environment where every level of fitness feels at home." }
  ];

  const timeline = [
    { year: "2016", title: "Forge Gym Founded", description: "Started as a single local powerlifting warehouse." },
    { year: "2019", title: "Expansion & Cardio Integration", description: "Upgraded facilities to 10,000 sq ft, introducing modern cardio machinery and amenities." },
    { year: "2022", title: "Elite Health App Launch", description: "Launched our full-stack coaching, diet scheduling, and digital tracking dashboard." },
    { year: "2026", title: "Global Expansion", description: "Voted #1 premium fitness experience across the metropolitan region." }
  ];

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-zinc-950" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-bold uppercase tracking-wider text-xs inline-block mb-6"
          >
            Our Story
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            We Forge <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Champions</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Since 2016, we have been more than a gym. We are a sanctuary of growth, strength, and transformation.
          </motion.p>
        </div>
      </section>

      {/* Main Story & Stats Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <AboutSection />
      </motion.div>

      {/* Timeline Section */}
      <section className="py-24 bg-zinc-900 border-t border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Milestones</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">The Journey So Far</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {timeline.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="relative bg-zinc-950 p-6 rounded-2xl border border-zinc-800 hover:border-yellow-400/40 transition duration-300 group"
              >
                <div className="text-3xl font-black text-yellow-400 group-hover:scale-110 transition duration-300 inline-block mb-3">
                  {item.year}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Our Core Values</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">What Drives Forge Gym</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl transition duration-300 hover:shadow-[0_8px_30px_rgb(250,204,21,0.05)]"
              >
                <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 font-bold text-xl mb-6">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">Are You Ready to Transform?</h2>
          <p className="text-black/85 font-semibold text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Claim your 50% discount and get immediate access to customized plans and coaching.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/join"}
            className="bg-black text-white px-10 py-5 rounded-2xl font-black tracking-wide text-lg shadow-2xl hover:bg-zinc-900 transition duration-300 cursor-pointer border-none"
          >
            START TRAINING TODAY
          </motion.button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
