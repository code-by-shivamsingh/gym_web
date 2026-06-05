"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginUser } from "@/src/dialogs/invoice_config/services";

export default function LoginSection() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await loginUser({
        email,
        password,
      });

      if (data.success) {
        document.cookie = `token=${data.token}; path=/`;
        router.push("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Login Failed");
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
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
        }}
        className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold">
            <span className="text-yellow-400">
              FORGE
            </span>
            <span className="text-white">
              GYM
            </span>
          </h1>

          <p className="text-gray-400 mt-3">
            Transform Your Body. Transform Your Life.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="text-gray-300 block mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-black border border-zinc-700 text-white p-4 rounded-xl outline-none focus:border-yellow-400"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-black border border-zinc-700 text-white p-4 rounded-xl outline-none focus:border-yellow-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-lg hover:scale-105 transition duration-300 shadow-lg shadow-yellow-400/30"
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{" "}
          <span className="text-yellow-400 cursor-pointer font-semibold">
            Register
          </span>
        </p>
      </motion.div>
    </div>
  );
}