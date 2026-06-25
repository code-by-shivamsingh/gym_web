"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { registerUser } from "@/src/dialogs/invoice_config/services";

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOffer = searchParams.get("offer") === "true";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("Basic");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        plan,
      });

      if (res.success) {
        document.cookie = `token=${res.token}; path=/`;
        alert("Registration successful! Welcome to Forge Gym.");
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 px-4">
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
        className="relative z-10 w-full max-w-xl bg-white/5 backdrop-blur-2xl border border-yellow-400/20 rounded-[32px] p-8 md:p-10 shadow-[0_0_50px_rgba(250,204,21,0.15)]"
      >
        {/* Offer Badge / Heading */}
        {isOffer ? (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/20 border border-red-500 text-red-400 font-bold mb-4 animate-pulse">
              🔥 Limited Time Offer
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Join <span className="text-yellow-400">FORGE GYM</span>
            </h1>
            <p className="text-gray-300 mt-2 text-sm md:text-base">
              Get <span className="text-yellow-400 font-bold">50% OFF</span> membership + Free Personal Trainer + Diet Plan
            </p>
          </div>
        ) : (
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Join <span className="text-yellow-400">FORGE GYM</span>
            </h1>
            <p className="text-gray-300 mt-2 text-sm md:text-base">
              Start your fitness transformation journey today
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-2xl bg-black/40 border border-zinc-700 text-white outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.2)] transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-black/40 border border-zinc-700 text-white outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.2)] transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-4 rounded-2xl bg-black/40 border border-zinc-700 text-white outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.2)] transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              placeholder="Create secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-black/40 border border-zinc-700 text-white outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.2)] transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Membership Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full p-4 rounded-2xl bg-black/40 border border-zinc-700 text-white outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.2)] transition cursor-pointer"
            >
              <option value="Basic" className="bg-zinc-900">Basic Plan (₹999/mo)</option>
              <option value="Premium" className="bg-zinc-900">Premium Plan (₹1999/mo)</option>
              <option value="Elite" className="bg-zinc-900">Elite Plan (₹2999/mo)</option>
            </select>
          </div>

          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0px 0px 40px rgba(250,204,21,0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-lg text-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "PROCESSING..." : "🚀 JOIN NOW & CLAIM OFFER"}
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