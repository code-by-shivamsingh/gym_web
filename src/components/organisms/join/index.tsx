"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/src/dialogs/invoice_config/services";

export default function JoinPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[150px] top-0 left-0" />
      <div className="absolute w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[150px] bottom-0 right-0" />

      <div className="w-full max-w-xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl z-10">
        <h1 className="text-4xl font-extrabold text-center mb-2 text-yellow-400">
          FORGE GYM
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Start your transformation journey today
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter Full Name"
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
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Membership Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-yellow-400"
            >
              <option value="Basic">Basic Plan (₹999/mo)</option>
              <option value="Premium">Premium Plan (₹1999/mo)</option>
              <option value="Elite">Elite Plan (₹2999/mo)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold hover:scale-[1.02] transition duration-300 shadow-lg shadow-yellow-400/30 text-lg mt-6"
          >
            {loading ? "Processing..." : "Join Now"}
          </button>
        </form>
      </div>
    </div>
  );
}