"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/src/components/organisms/Navbar";
import Footer from "@/src/components/organisms/Footer";
import { getTrainers } from "@/src/dialogs/invoice_config/services";

interface Trainer {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  profileImage: string;
  specialization?: string;
  experience?: string;
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  // Appointment form states
  const [appointmentName, setAppointmentName] = useState("");
  const [appointmentEmail, setAppointmentEmail] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const res = await getTrainers();
      if (res.success && res.data?.length > 0) {
        setTrainers(res.data);
      } else {
        // Fallback default trainers if DB has none yet
        setTrainers([
          {
            _id: "t1",
            name: "John Carter",
            email: "john@forge.com",
            profileImage: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=400",
            specialization: "Hypertrophy & Weight Management",
            experience: "8 Years"
          },
          {
            _id: "t2",
            name: "Sarah Jenkins",
            email: "sarah@forge.com",
            profileImage: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=400",
            specialization: "Functional Strength & Yoga",
            experience: "6 Years"
          },
          {
            _id: "t3",
            name: "David Miller",
            email: "david@forge.com",
            profileImage: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=400",
            specialization: "Powerlifting & Injury Rehab",
            experience: "10 Years"
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentName || !appointmentEmail || !appointmentDate || !appointmentTime) {
      alert("Please fill in all booking fields.");
      return;
    }

    setBookingLoading(true);
    setTimeout(() => {
      alert(`Appointment successfully booked with Trainer ${selectedTrainer?.name} for ${appointmentDate} at ${appointmentTime}!`);
      // Clear booking form and close modal
      setAppointmentName("");
      setAppointmentEmail("");
      setAppointmentDate("");
      setAppointmentTime("");
      setSelectedTrainer(null);
      setBookingLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-zinc-950" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-bold uppercase tracking-wider text-xs inline-block mb-6"
          >
            Elite Mentorship
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Expert <span className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Coaches</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-300 mt-6 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Train under certified world champions, licensed nutritional experts, and physiotherapists focused on your personal progress.
          </motion.p>
        </div>
      </section>

      {/* Trainers Listing */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center">
              <p className="text-yellow-400 text-lg font-bold animate-pulse">Loading Trainer Portfolios...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainers.map((trainer, idx) => (
                <motion.div
                  key={trainer._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden hover:border-yellow-400/40 transition duration-300 flex flex-col justify-between"
                >
                  <div className="h-[360px] overflow-hidden relative group">
                    <img
                      src={trainer.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt={trainer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase">
                      {trainer.experience || "5+ Years"} Exp
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-black text-white">{trainer.name}</h3>
                    <p className="text-yellow-400 font-semibold text-sm mt-1 mb-4">
                      {trainer.specialization || "Certified Fitness Specialist"}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      Coached over 100+ members through weight training splits, calorie deficits, and lifestyle rehabilitations.
                    </p>

                    <button
                      onClick={() => setSelectedTrainer(trainer)}
                      className="w-full bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold py-4 rounded-xl transition duration-300 cursor-pointer"
                    >
                      Book Free Appointment
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Appointment Booking Modal */}
      <AnimatePresence>
        {selectedTrainer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedTrainer(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white font-black text-lg bg-transparent border-none cursor-pointer p-1"
              >
                ✕
              </button>

              <h3 className="text-2xl font-black text-yellow-400 mb-2">Book Consultation</h3>
              <p className="text-gray-400 text-sm mb-6">
                Consult with <span className="text-white font-bold">{selectedTrainer.name}</span> to kickstart your program.
              </p>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={appointmentName}
                    onChange={(e) => setAppointmentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-1">Your Email</label>
                  <input
                    type="email"
                    value={appointmentEmail}
                    onChange={(e) => setAppointmentEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-xs font-semibold mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs font-semibold mb-1">Time Slot</label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400 cursor-pointer"
                      required
                    >
                      <option value="">Select Time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-base hover:scale-[1.01] transition cursor-pointer border-none mt-4 disabled:opacity-50"
                >
                  {bookingLoading ? "Booking appointment..." : "Confirm Free Slot"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
