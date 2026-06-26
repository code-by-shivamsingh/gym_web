"use client";

import { motion } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";
import TrainingSection from "../TrainingSection/page";
import FeaturesSection from "@/src/components/organisms/FeaturesSection";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-zinc-950" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-bold uppercase tracking-wider text-xs inline-block mb-6"
          >
            What We Offer
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Our Elite <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Services</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Explore our state-of-the-art training programs, modern amenities, and customized workout splits designed to help you succeed.
          </motion.p>
        </div>
      </section>

      {/* Training Programs Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <TrainingSection />
      </motion.div>

      {/* Features & Amenities Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-zinc-900 border-t border-b border-zinc-800"
      >
        <FeaturesSection />
      </motion.div>

      {/* Additional Professional Services Details */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">More Perks</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">Included with All Memberships</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl hover:border-yellow-400/40 transition duration-300">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 font-bold text-2xl mb-6">
                🍏
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Custom Diet & Meal Plans</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Receive personalized calorie and macronutrient breakdowns aligned with your fat loss or muscle gaining targets.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl hover:border-yellow-400/40 transition duration-300">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 font-bold text-2xl mb-6">
                🥤
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Juice & Protein Bar Access</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Refuel immediately post-workout with our premium selection of whey shakes, fresh juices, and pre-workout blends.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl hover:border-yellow-400/40 transition duration-300">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 font-bold text-2xl mb-6">
                🚿
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Premium Locker & Steam Rooms</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enjoy hot showers, private lockers, and steam bath facilities to relax and rejuvenate your muscles after heavy training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">Elevate Your Fitness Level</h2>
          <p className="text-black/85 font-semibold text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Get personalized schedules, diet plans, and access to all facilities. Join today.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/membership")}
            className="bg-black text-white px-10 py-5 rounded-2xl font-black tracking-wide text-lg shadow-2xl hover:bg-zinc-900 transition duration-300 cursor-pointer border-none"
          >
            CHOOSE YOUR MEMBERSHIP
          </motion.button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
