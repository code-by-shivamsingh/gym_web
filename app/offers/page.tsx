"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";
import MembershipSection from "@/src/components/organisms/MembershipSection";

export default function OffersPage() {
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const coupons = [
    { code: "FORGE50", discount: "50% OFF", desc: "Applicable on Elite Annual Plan.", expiry: "Ends in 2 days" },
    { code: "FITLAUNCH", discount: "20% OFF", desc: "Applicable on Premium monthly signup.", expiry: "Valid till end of month" }
  ];

  const comparisons = [
    { feature: "Access to Gym Floor", basic: "✓", premium: "✓", elite: "✓" },
    { feature: "Locker Facilities", basic: "✓", premium: "✓", elite: "✓" },
    { feature: "Group Fitness Classes", basic: "✕", premium: "✓", elite: "✓" },
    { feature: "Personal Trainer", basic: "✕", premium: "1 session/mo", elite: "Unlimited Session" },
    { feature: "Custom Diet & Meal Plans", basic: "✕", premium: "✓", elite: "✓" },
    { feature: "Sauna & Steam Room Access", basic: "✕", premium: "✕", elite: "✓" },
    { feature: "Guest passes (per month)", basic: "0", premium: "1 pass", elite: "3 passes" }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-zinc-950" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-bold uppercase tracking-wider text-xs inline-block mb-6"
          >
            Hot Deals
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Exclusive <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Offers</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Select your membership path, apply coupon code, and claim up to 50% discounts on premium health programs.
          </motion.p>
        </div>
      </section>

      {/* Seasonal Campaigns Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Limited Offer Campaign</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">Active Promotional Deals</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coupons.map((coupon, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col justify-between hover:border-yellow-400/40 transition duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-yellow-400 text-black px-4 py-1.5 text-xs font-black uppercase rounded-bl-2xl">
                  {coupon.expiry}
                </div>
                
                <div>
                  <h3 className="text-yellow-400 text-3xl font-black mb-1">{coupon.discount}</h3>
                  <h4 className="text-white text-xl font-bold mb-4">{coupon.desc}</h4>
                </div>

                <div className="flex items-center justify-between bg-black border border-zinc-800 p-4 rounded-2xl mt-6">
                  <span className="font-mono text-xl tracking-wider text-white font-extrabold">{coupon.code}</span>
                  <button 
                    onClick={() => handleCopyCode(coupon.code)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl font-bold transition duration-300 cursor-pointer border-none text-sm"
                  >
                    {copiedCoupon === coupon.code ? "COPIED! ✓" : "COPY CODE"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="bg-zinc-900 border-t border-b border-zinc-800 py-6">
        <MembershipSection />
      </section>

      {/* Plans Comparison Table */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Features Comparison</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">Which Plan Is Right For You?</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-zinc-800 rounded-3xl bg-zinc-900/60 backdrop-blur-md">
              <thead>
                <tr className="border-b border-zinc-800 text-yellow-400 font-bold">
                  <th className="p-6 text-lg font-bold">Membership Benefits</th>
                  <th className="p-6 text-lg font-bold text-center">Basic Plan</th>
                  <th className="p-6 text-lg font-bold text-center">Premium Plan</th>
                  <th className="p-6 text-lg font-bold text-center">Elite Plan</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="border-b border-zinc-850 hover:bg-white/5 transition duration-300">
                    <td className="p-6 font-semibold text-gray-300">{row.feature}</td>
                    <td className="p-6 text-center text-gray-300 font-bold">{row.basic}</td>
                    <td className="p-6 text-center text-gray-300 font-bold">{row.premium}</td>
                    <td className="p-6 text-center text-yellow-400 font-black">{row.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Referral Program Section */}
      <section className="py-24 bg-zinc-900 text-white text-center border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Referral Perks</span>
          <h2 className="text-4xl md:text-5xl font-black mt-3 mb-6">Refer A Friend & Earn</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Share the Forge Gym transformation spirit. For every friend that signs up for a Premium or Elite annual membership, both you and your friend will receive <span className="text-yellow-400 font-bold">1 Month Free</span> credit!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => window.location.href = "/register"}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold transition duration-300 cursor-pointer border-none text-base"
            >
              Sign Up Now
            </button>
            <button 
              onClick={() => window.location.href = "/contact"}
              className="bg-transparent border border-zinc-700 hover:border-white text-white px-8 py-4 rounded-xl font-bold transition duration-300 cursor-pointer text-base"
            >
              Ask Support Team
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
