"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSettings } from "@/src/dialogs/invoice_config/services";

export default function LocationSection() {
  const [settings, setSettings] = useState({
    gymName: "FORGE Fitness & Fuel",
    address: "Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India",
    mobile: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          setSettings({
            gymName: res.data.gymName || "FORGE Fitness & Fuel",
            address: res.data.address || "Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India",
            mobile: res.data.mobile || "+91 98765 43210",
            whatsapp: res.data.whatsapp || "+91 98765 43210",
          });
        }
      } catch (err) {
        console.error("Failed to load settings in LocationSection:", err);
      }
    };
    fetchSettings();
  }, []);

  const getDirectionsUrl = `https://maps.google.com/?q=${encodeURIComponent(settings.gymName + " " + settings.address)}`;

  return (
    <section id="location" className="scroll-mt-24 py-24 px-6 bg-zinc-950 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-yellow-400 font-bold uppercase tracking-widest text-xs px-4 py-1.5 rounded-full border border-yellow-400/25 bg-yellow-400/5 inline-block"
          >
            Find Our Gym
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mt-4 tracking-tight"
          >
            Visit Us & <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Start Training</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
          >
            Find us in Gwalior. Drop by for a trial session, consult our elite trainers, and check out our premium amenities first hand.
          </motion.p>
        </div>

        {/* Section Body */}
        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          {/* Details Column (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-6"
          >
            {/* Info Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-zinc-700/60 transition duration-300 flex-grow">
              <h3 className="text-3xl font-black mb-6 tracking-tight text-white flex items-center gap-3">
                <span className="text-yellow-400">⚡</span> {settings.gymName}
              </h3>

              <div className="space-y-6">
                {/* Address block */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-zinc-800/80 rounded-xl text-yellow-400 shrink-0 mt-0.5 border border-zinc-750">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Gym Address</h4>
                    <p className="text-gray-300 text-sm leading-relaxed mt-1">{settings.address}</p>
                  </div>
                </div>

                {/* Opening Hours Block */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-zinc-800/80 rounded-xl text-yellow-400 shrink-0 mt-0.5 border border-zinc-750">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="w-full">
                    <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">Opening Hours</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-300">
                      <span className="font-medium text-gray-400">Mon - Fri:</span>
                      <span className="font-bold text-right text-yellow-400/90">5:00 AM - 11:00 PM</span>
                      <span className="font-medium text-gray-400">Saturday:</span>
                      <span className="font-bold text-right text-yellow-400/90">6:00 AM - 10:00 PM</span>
                      <span className="font-medium text-gray-400">Sunday:</span>
                      <span className="font-bold text-right text-yellow-400/90">8:00 AM - 8:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Contact numbers Block */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-zinc-800/80 rounded-xl text-yellow-400 shrink-0 mt-0.5 border border-zinc-750">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Contact Number</h4>
                    <p className="text-gray-300 text-sm leading-relaxed mt-1">
                      Phone: <a href={`tel:${settings.mobile}`} className="hover:text-yellow-400 transition">{settings.mobile}</a>
                    </p>
                    {settings.whatsapp && (
                      <p className="text-gray-400 text-xs mt-1">
                        WhatsApp: <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">{settings.whatsapp}</a>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Get Directions CTA */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <a
                  href={getDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-yellow-400 text-black font-extrabold py-4 px-6 rounded-2xl transition duration-300 hover:bg-yellow-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/btn cursor-pointer shadow-lg shadow-yellow-500/10"
                >
                  <span>Get Directions</span>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Map Column (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3 shadow-2xl relative overflow-hidden group hover:border-zinc-700/60 transition duration-300 w-full min-h-[450px] flex">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.8355760587824!2d78.2120977803729!3d26.266999317831875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c11c74047d41%3A0xa8c5a70276f502e!2sFORGE%20Fitness%20%26%20Fuel!5e0!3m2!1sen!2sin!4v1783508398789!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "20px" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full min-h-[450px] opacity-90 hover:opacity-100 transition duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
