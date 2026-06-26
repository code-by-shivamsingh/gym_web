"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { forgotPassword } from "@/src/dialogs/invoice_config/services";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const validateEmail = (emailStr: string) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailStr);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const data = await forgotPassword(email);

      if (data.success) {
        setSuccessMsg(data.message || "OTP sent successfully.");
        // Short delay before redirection for premium UX feel
        setTimeout(() => {
          router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to request OTP. Please try again later.");
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
        whileHover={{ scale: 1.01 }}
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
          <p className="text-gray-400 mt-3 text-sm">
            Reset your password using an OTP verification code.
          </p>
        </motion.div>

        {/* Message Blocks */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold"
          >
            {errorMsg}
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold"
          >
            {successMsg}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label className="text-gray-300 block mb-1 text-sm font-semibold">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 bg-black border border-zinc-700 text-white p-4 rounded-xl outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition"
              required
              disabled={loading || !!successMsg}
            />
          </div>

          {/* Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !!successMsg}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-yellow-400/40 transition cursor-pointer border-none mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending OTP...</span>
              </div>
            ) : (
              "Send OTP Verification Code"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-gray-400 text-sm">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-yellow-400 cursor-pointer font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}