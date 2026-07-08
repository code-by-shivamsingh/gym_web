"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";
import { getSettings } from "@/src/dialogs/invoice_config/services";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [gymSettings, setGymSettings] = useState({
    address: "Gwalior, Madhya Pradesh (M.P.), India",
    mobile: "+123 456 7890",
    whatsapp: "+91 98765 43210",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          setGymSettings({
            address: res.data.address || "Gwalior, Madhya Pradesh (M.P.), India",
            mobile: res.data.mobile || "+123 456 7890",
            whatsapp: res.data.whatsapp || "+91 98765 43210",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      alert(`Message successfully sent! Our support team will reach you at ${email} shortly.`);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setLoading(false);
    }, 1500);
  };

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
            Get In Touch
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Contact <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Forge Gym</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Have inquiries about membership fees, corporate pricing packages, personal trainer availabilities, or group schedules? Send us a message!
          </motion.p>
        </div>
      </section>

      {/* Contact Grid details */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
          
          {/* Left Column: Details & Map */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">Reach Out</span>
              <h2 className="text-4xl font-black mt-2 mb-6">HQ & Operating Hours</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Drop by the gym floor for a tour. Our member support desks are open daily during our regular hours.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <h4 className="text-yellow-400 font-bold text-base mb-2">📍 Address</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {gymSettings.address}
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <h4 className="text-yellow-400 font-bold text-base mb-2">📞 Contacts</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Phone: {gymSettings.mobile}<br />
                    Email: support@forgegym.com
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between hover:border-green-500/40 transition duration-300">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 fill-[#25D366]"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.063 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <h4 className="text-[#25D366] font-bold text-base">WhatsApp</h4>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Chat directly with our support desk.
                    </p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const cleanNum = gymSettings.whatsapp.replace(/[^0-9]/g, "");
                      window.open(`https://wa.me/${cleanNum}`, "_blank");
                    }}
                    className="mt-4 w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 rounded-xl font-bold transition duration-300 cursor-pointer border-none text-xs flex items-center justify-center gap-1.5"
                  >
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.063 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>Start Chat</span>
                  </motion.button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black mb-4">Opening Hours</h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300 font-medium">Monday - Friday</span>
                  <span className="text-yellow-400 font-bold">5:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300 font-medium">Saturday</span>
                  <span className="text-yellow-400 font-bold">6:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300 font-medium">Sunday</span>
                  <span className="text-yellow-400 font-bold">8:00 AM - 8:00 PM</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 md:p-10 shadow-xl"
          >
            <h3 className="text-3xl font-black mb-2 text-white">Send Message</h3>
            <p className="text-gray-400 text-sm mb-8">We will review your query and get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Enter query subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-base hover:scale-[1.01] transition duration-300 cursor-pointer border-none disabled:opacity-50"
              >
                {loading ? "Sending Message..." : "Submit Inquiry"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Embedded Map Section Placeholder */}
      <section className="h-[400px] w-full bg-zinc-900 border-t border-zinc-800 relative">
        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center pointer-events-none">
          <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase bg-zinc-950 px-6 py-3 border border-zinc-800 rounded-full">
            🗺️ Google Maps Location Preview
          </p>
        </div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14318.257608146747!2d78.17551065!3d26.218287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c6e1aa71f54f%3A0x633519d1fa92df5e!2sGwalior%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="opacity-50 grayscale contrast-125"
        />
      </section>

      <Footer />
    </div>
  );
}
