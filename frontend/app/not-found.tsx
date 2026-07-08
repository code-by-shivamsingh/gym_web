"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute w-[400px] h-[400px] bg-yellow-400/20 rounded-full blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center z-10"
      >
        <h1 className="text-9xl font-extrabold text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">404</h1>
        <h2 className="text-3xl font-bold mt-4 mb-2">Lost in the Gym?</h2>
        <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
          The workout routine or page you are looking for has been moved, deleted, or does not exist.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition duration-300 shadow-lg shadow-yellow-400/20"
          >
            Dashboard
          </Link>
          <Link
            href="/home"
            className="border border-zinc-700 hover:border-yellow-400 px-8 py-3 rounded-xl font-bold hover:scale-105 transition duration-300"
          >
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
