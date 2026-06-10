"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
export default function JoinPage() {
  const searchParams = useSearchParams();
const isOffer = searchParams.get("offer") === "true";
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Glow Effects */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-yellow-500/20 blur-[150px] rounded-full" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-500/20 blur-[150px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
        relative z-10
        w-full max-w-2xl
        bg-white/5
        backdrop-blur-2xl
        border border-yellow-400/20
        rounded-[32px]
        p-10
        shadow-[0_0_50px_rgba(250,204,21,0.15)]
        "
      >
        {/* Offer Badge */}
        {isOffer && (
  <>
    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/20 border border-red-500 text-red-400 font-bold mb-6">
      🔥 Limited Time Offer
    </div>

    <p className="text-gray-300 mt-4 mb-8">
      Get <span className="text-yellow-400 font-bold">50% OFF</span>
      {" "}membership + Free Personal Trainer + Diet Plan
    </p>
  </>
)}

        {/* Heading */}
        <h1 className="text-5xl font-black text-white">
          Join
          <span className="text-yellow-400"> FORGE GYM</span>
        </h1>

        <p className="text-gray-300 mt-4 mb-8">
          Get <span className="text-yellow-400 font-bold">50% OFF</span>
          {" "}membership + Free Personal Trainer + Diet Plan
        </p>

        {/* Form */}
        <form className="space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            className="
            w-full p-4 rounded-2xl
            bg-black/40
            border border-zinc-700
            text-white
            outline-none
            focus:border-yellow-400
            "
          />

          <input
            type="email"
            placeholder="Email Address"
            className="
            w-full p-4 rounded-2xl
            bg-black/40
            border border-zinc-700
            text-white
            outline-none
            focus:border-yellow-400
            "
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="
            w-full p-4 rounded-2xl
            bg-black/40
            border border-zinc-700
            text-white
            outline-none
            focus:border-yellow-400
            "
          />

          <select
            className="
            w-full p-4 rounded-2xl
            bg-black/40
            border border-zinc-700
            text-white
            outline-none
            focus:border-yellow-400
            "
          >
            <option>Choose Membership Plan</option>
            <option>Basic Plan</option>
            <option>Premium Plan</option>
            <option>Elite Plan</option>
          </select>

          <textarea
            rows={4}
            placeholder="Tell us your fitness goal..."
            className="
            w-full p-4 rounded-2xl
            bg-black/40
            border border-zinc-700
            text-white
            outline-none
            focus:border-yellow-400
            "
          />

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow:
                "0px 0px 40px rgba(250,204,21,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="
            w-full
            py-5
            rounded-2xl
            font-black
            text-lg
            text-black
            bg-gradient-to-r
            from-yellow-400
            via-orange-500
            to-red-500
            "
          >
            🚀 CLAIM OFFER NOW
          </motion.button>

        </form>

        {/* Bottom Text */}
        <p className="text-center text-gray-400 mt-6">
          ⚡ 500+ Members Already Transformed Their Lives
        </p>
      </motion.div>
    </div>
  );
}