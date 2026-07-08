"use client";

import { motion } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";
import MembershipSection from "@/src/components/organisms/MembershipSection";
import { useRouter } from "next/navigation";

export default function MembershipPage() {
  const router = useRouter();

  const faqs = [
    { q: "Is there a registration or startup fee?", a: "No, we do not charge any registration or activation fees. You only pay for your selected subscription plan." },
    { q: "Can I upgrade or downgrade my tier anytime?", a: "Yes, you can upgrade or downgrade your plan directly from your dashboard billing settings." },
    { q: "What is your refund policy?", a: "We offer a 7-day money-back guarantee for first-time memberships if you're not fully satisfied with our facilities." },
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
            Flexible Tiers
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Choose Your <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Membership</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Select a tier that matches your commitment. No hidden charges, cancel anytime, and enjoy complete access to premium workout amenities.
          </motion.p>
        </div>
      </section>

      {/* Membership Tiers Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <MembershipSection />
      </motion.div>

      {/* Plan Features & Comparison Matrix */}
      <section className="py-24 bg-zinc-900 border-t border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Comparison</span>
            <h2 className="text-4xl font-black mt-3">Compare Package Inclusions</h2>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-gray-300 font-bold text-sm uppercase">
                  <th className="p-6">Features</th>
                  <th className="p-6 text-center">Basic</th>
                  <th className="p-6 text-center text-yellow-400">Premium</th>
                  <th className="p-6 text-center">Elite</th>
                </tr>
              </thead>
              <tbody className="text-gray-400 divide-y divide-zinc-800">
                <tr>
                  <td className="p-6 font-semibold text-white">Gym Floor Access</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="p-6 font-semibold text-white">Locker & Showers</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="p-6 font-semibold text-white">Customized Diet Plan</td>
                  <td className="p-6 text-center text-red-500">✗</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="p-6 font-semibold text-white">Personal Trainer Sessions</td>
                  <td className="p-6 text-center text-red-500">✗</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                  <td className="p-6 text-center text-green-500">✓ (Dedicated)</td>
                </tr>
                <tr>
                  <td className="p-6 font-semibold text-white">Steam Room Access</td>
                  <td className="p-6 text-center text-red-500">✗</td>
                  <td className="p-6 text-center text-red-500">✗</td>
                  <td className="p-6 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="p-6 font-semibold text-white">24/7 Support Desk</td>
                  <td className="p-6 text-center text-gray-500">Basic</td>
                  <td className="p-6 text-center text-gray-300">Priority</td>
                  <td className="p-6 text-center text-yellow-400 font-bold">24/7 VIP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Membership FAQ Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Membership Help</span>
            <h2 className="text-4xl font-black mt-3">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-white mb-2">❓ {faq.q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
