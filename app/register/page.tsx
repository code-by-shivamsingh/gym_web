"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/src/dialogs/invoice_config/services";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Member"); // Member, Trainer, Admin
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser({
        name,
        email,
        mobile,
        password,
        role,
      });

      if (data.success) {
        document.cookie = `token=${data.token}; path=/`;
        alert("Registration Successful!");
        router.push("/dashboard");
      } else {
        alert(data.message || "Registration Failed");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-[150px] top-0 left-0" />
      <div className="absolute w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[150px] bottom-0 right-0" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl z-10 my-8"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-extrabold">
            <span className="text-yellow-400">FORGE</span>
            <span className="text-white">GYM</span>
          </h1>
          <p className="text-gray-400 mt-2">Create your account to start your journey</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-gray-300 block mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-1">Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
            >
              <option value="Member">Member</option>
              <option value="Trainer">Trainer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 block mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold text-lg hover:scale-105 transition duration-300 shadow-lg shadow-yellow-400/30"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-400 cursor-pointer font-semibold">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
