"use client";

import { motion } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";
import FeaturesSection from "@/src/components/organisms/FeaturesSection";

export default function FeaturesPage() {
  const premiumAmenities = [
    { title: "Steam Room & Sauna", icon: "🧖‍♀️", desc: "Flush out toxins and speed up recovery in our dry rock saunas and hot steam rooms." },
    { title: "Luxury Locker Rooms", icon: "🚿", desc: "Private showers, keyless smart lockers, vanity desks, and premium grooming products." },
    { title: "24/7 Access Pass", icon: "🔑", desc: "Elite membership holders get unrestricted scan-in keyless access to work out anytime." },
    { title: "Nutrition & Protein Bar", icon: "🥤", desc: "Post-workout hydration, customized shakes, protein cookies, and performance supplements." },
    { title: "Expert Diet Consultation", icon: "🍎", desc: "Bi-weekly meal checks and biometric body scans with our licensed nutritionists." },
    { title: "Complimentary Valet Parking", icon: "🚗", desc: "Drive in and drop your keys at our secure valet parking desk at no additional cost." }
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
            Amenities
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Premium <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Facilities</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            We supply more than free weights. Experience state-of-the-art cardiovascular engines, smart lockers, recovery lounges, and specialized diet bars.
          </motion.p>
        </div>
      </section>

      {/* Core Features Overview (Reused Section) */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <FeaturesSection />
      </motion.div>

      {/* Premium Amenities Cards Grid */}
      <section className="py-24 bg-zinc-900 border-t border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Unmatched Perks</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">Recovery & Lifestyle Services</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumAmenities.map((amenity, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.03 }}
                className="bg-zinc-950 border border-zinc-800 p-8 rounded-[24px] hover:border-yellow-400/40 transition duration-300"
              >
                <div className="text-4xl mb-4">{amenity.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{amenity.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{amenity.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Banner Section */}
      <section className="py-24 bg-zinc-950 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Designed For Real Performance</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Join the Forge Gym family and unlock unlimited access to the region's finest fitness facility. Start your journey today!
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/join"}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black tracking-wide text-lg shadow-2xl transition duration-300 cursor-pointer border-none"
          >
            CLAIM 50% OFF SUBSCRIPTION
          </motion.button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
