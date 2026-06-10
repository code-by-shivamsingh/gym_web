"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function JoinPremiumPage() {
    const router = useRouter();
  return (
    
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/20 blur-[150px] rounded-full" />
<div className="absolute bottom-20 right-20 w-72 h-72 bg-orange-500/20 blur-[150px] rounded-full" />
        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black px-6 py-2 rounded-bl-2xl">
  BEST SELLER
</div>
<div className="mt-8 flex items-end gap-4">
  <span className="text-7xl font-black text-yellow-400">
    ₹1999
  </span>

  <div>
    <p className="line-through text-gray-500 text-2xl">
      ₹3999
    </p>

    <p className="text-green-400 font-bold">
      Save ₹2000
    </p>
  </div>
</div>
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-black to-orange-500/10" />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        className="
        relative z-10
        w-full max-w-3xl
        rounded-[32px]
        border border-yellow-400/20
        bg-white/5
        backdrop-blur-xl
        p-10
        "
      >
        <div className="inline-block px-5 py-2 rounded-full bg-yellow-400 text-black font-bold mb-6">
          ⭐ PREMIUM MEMBERSHIP
        </div>

        <h1 className="text-5xl font-black text-white">
          Premium Plan
        </h1>

        <p className="text-gray-300 mt-4">
          Personal Trainer + Diet Plan + Premium Support
        </p>

        <div className="mt-8 text-6xl font-black text-yellow-400">
          ₹1999
          <span className="text-xl text-gray-400">
            /month
          </span>
        </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
  {[
    "🏋️ Unlimited Gym Access",
    "💪 Personal Trainer",
    "🥗 Custom Diet Plan",
    "🔒 Locker Facility",
    "📊 Fitness Assessment",
    "📞 Priority Support",
  ].map((item, index) => (
    <motion.div
      key={index}
      whileHover={{ scale: 1.05 }}
      className="
      p-4
      rounded-2xl
      bg-white/5
      border border-yellow-400/20
      text-white
      "
    >
      {item}
    </motion.div>
  ))}
</div>

        <form className="mt-10 space-y-4">
        <input
  type="text"
  placeholder="Full Name"
  className="
  w-full
  p-4
  rounded-xl
  bg-zinc-900/80
  border border-zinc-700
  text-white
  placeholder:text-gray-400
  focus:outline-none
  focus:border-yellow-400
  "
/>

          <input
            type="email"
            placeholder="Email"
                 className="
  w-full
  p-4
  rounded-xl
  bg-zinc-900/80
  border border-zinc-700
  text-white
  placeholder:text-gray-400
  focus:outline-none
  focus:border-yellow-400
  "          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="
  w-full
  p-4
  rounded-xl
  bg-zinc-900/80
  border border-zinc-700
  text-white
  placeholder:text-gray-400
  focus:outline-none
  focus:border-yellow-400
  "
          />

         <motion.button
  whileHover={{
    scale: 1.05,
    boxShadow:
      "0px 0px 50px rgba(250,204,21,0.6)",
  }}
  whileTap={{ scale: 0.95 }}
  className="
  w-full
  py-5
  rounded-2xl
  font-black
  text-lg
  bg-gradient-to-r
  from-yellow-400
  via-orange-500
  to-red-500
  text-black
  "
>
  🚀 CLAIM PREMIUM MEMBERSHIP
</motion.button>
        </form>
      </motion.div>

    </div>
  );
}