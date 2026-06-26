"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";

export default function GalleryPage() {
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    { id: "all", label: "Show All" },
    { id: "gym", label: "Gym Floor" },
    { id: "cardio", label: "Cardio Zone" },
    { id: "strength", label: "Strength & Weights" },
    { id: "transformations", label: "Transformations" }
  ];

  const galleryItems = [
    { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600", category: "gym", title: "Smart Machine Row" },
    { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600", category: "strength", title: "Heavy Dumbbell Racks" },
    { url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600", category: "cardio", title: "Smart Treadmills Grid" },
    { url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=600", category: "gym", title: "Main Exercise Deck" },
    { url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600", category: "cardio", title: "Cycling Spin Studio" },
    { url: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=600", category: "strength", title: "Barbell Bench Press Deck" },
    { url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600", category: "transformations", title: "Fat Burn Achievement" },
    { url: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=600", category: "transformations", title: "Muscle Hypertrophy Progress" }
  ];

  const filteredItems = filter === "all" ? galleryItems : galleryItems.filter(item => item.category === filter);

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
            Visual Showcase
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Forge <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Gallery</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            A visual inspection of our training floor, elite recovery zones, high-intensity classes, and member transformation stories.
          </motion.p>
        </div>
      </section>

      {/* Categories Filters Selector */}
      <section className="py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2.5 rounded-full font-bold transition duration-300 text-sm cursor-pointer border-none ${filter === cat.id ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20" : "bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry-Style Gallery Grid */}
      <section className="pb-28 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            layout 
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={item.url}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative h-[300px] overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-900 cursor-pointer shadow-lg"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
                    <span className="text-yellow-400 font-extrabold text-xs uppercase tracking-widest">{item.category}</span>
                    <h4 className="text-white font-bold text-lg mt-1">{item.title}</h4>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Fullscreen Lightbox Slider */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-white text-3xl font-black hover:text-yellow-400 transition bg-transparent border-none cursor-pointer p-2"
            >
              ✕
            </button>

            <button 
              onClick={() => setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : filteredItems.length - 1)}
              className="absolute left-6 text-white text-4xl font-bold hover:text-yellow-400 transition bg-transparent border-none cursor-pointer p-4 select-none"
            >
              ‹
            </button>

            <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
              <motion.img 
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={filteredItems[lightboxIndex].url}
                alt={filteredItems[lightboxIndex].title}
                className="max-w-full max-h-[70vh] rounded-2xl object-contain border border-zinc-800"
              />
              <h3 className="text-yellow-400 font-black text-xl mt-6">{filteredItems[lightboxIndex].title}</h3>
              <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">{filteredItems[lightboxIndex].category}</p>
            </div>

            <button 
              onClick={() => setLightboxIndex(lightboxIndex < filteredItems.length - 1 ? lightboxIndex + 1 : 0)}
              className="absolute right-6 text-white text-4xl font-bold hover:text-yellow-400 transition bg-transparent border-none cursor-pointer p-4 select-none"
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
