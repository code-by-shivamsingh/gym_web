"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "general", label: "General & Hours" },
    { id: "membership", label: "Memberships & Bills" },
    { id: "coaching", label: "Personal Training" },
    { id: "nutrition", label: "Diet & Nutrition" }
  ];

  const faqs = [
    {
      question: "What are your gym timings?",
      answer: "We are open from 5:00 AM to 11:00 PM Monday through Friday, 6:00 AM to 10:00 PM on Saturdays, and 8:00 AM to 8:00 PM on Sundays.",
      category: "general"
    },
    {
      question: "Do you provide personal trainers?",
      answer: "Yes, our Premium and Elite membership plans include certified personal trainers. You can also book individual consultation slots via our trainers page.",
      category: "coaching"
    },
    {
      question: "Do I get a customized diet plan?",
      answer: "Yes, both Premium and Elite plans include fully customized diet and meal structures prepared by our certified nutritional consultants, retrievable directly from your member dashboard.",
      category: "nutrition"
    },
    {
      question: "Is there a free trial available?",
      answer: "Absolutely! New local residents can enjoy a free one-day trial workout pass to test our machines and locker amenities before signing up.",
      category: "general"
    },
    {
      question: "Do you have locker facilities?",
      answer: "Yes, smart keyless lockers and private changing stalls are provided to all active members at no extra cost.",
      category: "general"
    },
    {
      question: "Can I freeze or pause my membership subscription?",
      answer: "Yes, Elite membership plan holders can freeze their subscriptions once per calendar year for up to 30 days. Contact our front desk or support portal to register a freeze.",
      category: "membership"
    },
    {
      question: "What is your refund policy on membership signups?",
      answer: "Memberships are non-refundable after purchase, but you can cancel next month's auto-renewals anytime from your member billing settings.",
      category: "membership"
    },
    {
      question: "How do I download my payment invoice PDF?",
      answer: "Log into your Member Dashboard, navigate to the Payments section, and click 'Download PDF' on any of your billing logs to instantly obtain your invoice statement.",
      category: "membership"
    }
  ];

  // Filtering Logic
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-zinc-950" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-bold uppercase tracking-wider text-xs inline-block mb-6"
          >
            Support Center
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            FAQ & <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Help Desk</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Find immediate answers regarding gym timings, billing disputes, locker privileges, personal training sessions, and health plans.
          </motion.p>
        </div>
      </section>

      {/* Search & Category Filter Section */}
      <section className="py-12 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-white outline-none focus:border-yellow-400 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer text-sm font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Categories tags selector */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`px-5 py-2.5 rounded-full font-bold transition duration-300 text-xs cursor-pointer border-none ${activeCategory === cat.id ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/15" : "bg-zinc-900 text-gray-400 hover:text-white"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 inline-block">🔍</span>
              <h3 className="text-xl font-bold text-white mb-2">No matching questions found</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">Try refining your search keyword or switching the category tag filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      key={faq.question}
                      className="border border-zinc-800 bg-zinc-900/40 rounded-2xl overflow-hidden hover:border-yellow-400/25 transition duration-300"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full flex justify-between items-center p-6 text-left font-bold text-lg cursor-pointer bg-transparent border-none text-white select-none"
                      >
                        <span className="pr-4">{faq.question}</span>
                        <span className="text-yellow-400 text-2xl leading-none">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6 text-gray-300 text-sm leading-relaxed border-t border-zinc-800/40 pt-4"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Support Call-Out */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Still have questions?</span>
          <h2 className="text-3xl md:text-5xl font-black mt-3 mb-6">Contact Our Live Support Desk</h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Our member service desk is available to help resolve technical billing queries or coach changes instantly.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => window.location.href = "/contact"}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold transition duration-300 cursor-pointer border-none text-sm"
            >
              Inquire Support
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
