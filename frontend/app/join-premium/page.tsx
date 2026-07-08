"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { registerUser } from "@/src/dialogs/invoice_config/services";

export default function JoinPremiumPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !mobile || !password) {
      alert("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      const res = await registerUser({
        name,
        email,
        mobile,
        password,
        role: "Member",
        plan: "Premium",
      });

      if (res.success) {
        document.cookie = `token=${res.token}; path=/`;
        alert("Premium Registration successful! Welcome to Forge Gym.");
        router.push("/dashboard");
      } else {
        alert(res.message || "Failed to register.");
      }
    } catch (err) {
      console.error(err);
      alert("Error joining. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/20 blur-[150px] rounded-full" />
<div className="absolute bottom-20 right-20 w-72 h-72 bg-orange-500/20 blur-[150px] rounded-full" />
        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black px-6 py-2 rounded-bl-2xl">
  BEST SELLER
</div>
<div className="mt-8 flex items-end gap-4">
  <span className="text-7xl font-black text-yellow-400">
    ₹4999
  </span>

  <div>
    <p className="line-through text-gray-500 text-2xl">
      ₹6999
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
          ₹4999
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

        <form onSubmit={handleRegister} className="mt-10 space-y-4">
        <input
  type="text"
  placeholder="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
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
  required
/>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
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
            required
          />

          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            required
          />

         <motion.button
  whileHover={{
    scale: 1.05,
    boxShadow:
      "0px 0px 50px rgba(250,204,21,0.6)",
  }}
  whileTap={{ scale: 0.95 }}
  type="submit"
  disabled={loading}
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
  cursor-pointer
  transition
  disabled:opacity-50
  disabled:cursor-not-allowed
  "
>
  {loading ? "PROCESSING..." : "🚀 CLAIM PREMIUM MEMBERSHIP"}
</motion.button>
        </form>
      </motion.div>

    </div>
  );
}