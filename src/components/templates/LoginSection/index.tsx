"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { loginUser } from "@/src/dialogs/invoice_config/services";

export default function LoginSection() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await loginUser({ email, password });

      if (data.success) {
        document.cookie = `token=${data.token}; path=/`;
        router.push("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black px-4">

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />

      {/* Floating Orbs */}
      <div className="absolute w-[400px] h-[400px] bg-yellow-400/20 blur-[140px] rounded-full top-10 left-10 animate-pulse" />
      <div className="absolute w-[350px] h-[350px] bg-orange-500/20 blur-[140px] rounded-full bottom-10 right-10 animate-pulse" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        whileHover={{ scale: 1.02 }}
        className="w-full max-w-md bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-8 shadow-2xl z-10"
      >

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-extrabold tracking-widest">
            <span className="text-yellow-400 drop-shadow-lg">FORGE</span>
            <span className="text-white">GYM</span>
          </h1>

          <p className="text-gray-400 mt-3">
            Transform Your Body. Transform Your Life.
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="text-gray-300 block mb-1 text-sm font-semibold">Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 bg-black border border-zinc-700 text-white p-4 rounded-xl outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 block mb-1 text-sm font-semibold">Password</label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-700 text-white p-4 pr-16 rounded-xl outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 font-semibold text-sm cursor-pointer bg-transparent border-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-yellow-400 rounded cursor-pointer"
              />
              Remember Me
            </label>

            <Link
              href="/forgot-password"
              className="text-yellow-400 text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-yellow-400/40 transition cursor-pointer border-none mt-6"
          >
            {loading ? "Logging In..." : "Login"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-yellow-400 cursor-pointer font-semibold hover:underline">
            Register
          </Link>
        </p>

      </motion.div>
    </div>
  );
}