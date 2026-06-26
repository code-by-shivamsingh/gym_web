"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { resetPassword } from "@/src/dialogs/invoice_config/services";

interface StrengthCriteria {
  label: string;
  met: boolean;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Criteria validation
  const criteriaList: StrengthCriteria[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(password) },
    { label: "At least one special character (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = criteriaList.filter((c) => c.met).length;

  // Strength label & color
  const getStrengthInfo = () => {
    if (password.length === 0) return { label: "", color: "bg-zinc-700", textClass: "text-zinc-500", percent: 0 };
    switch (metCount) {
      case 1:
        return { label: "Very Weak", color: "bg-red-500", textClass: "text-red-500", percent: 20 };
      case 2:
        return { label: "Weak", color: "bg-orange-500", textClass: "text-orange-500", percent: 40 };
      case 3:
        return { label: "Medium", color: "bg-yellow-500", textClass: "text-yellow-500", percent: 60 };
      case 4:
        return { label: "Strong", color: "bg-green-400", textClass: "text-green-400", percent: 80 };
      case 5:
        return { label: "Very Strong", color: "bg-green-500 animate-pulse", textClass: "text-green-500", percent: 100 };
      default:
        return { label: "", color: "bg-zinc-700", textClass: "text-zinc-500", percent: 0 };
    }
  };

  const strength = getStrengthInfo();

  // Redirect if token is missing
  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (metCount < 5) {
      setErrorMsg("Please satisfy all password complexity criteria.");
      return;
    }

    try {
      setLoading(true);
      const data = await resetPassword(password, token);

      if (data.success) {
        setSuccessMsg("Password reset successfully!");
        setShowSuccessModal(true);
      } else {
        setErrorMsg(data.message || "Failed to reset password. The link may have expired.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
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
        {/* Branding & Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl font-extrabold tracking-widest mb-2">
            <span className="text-yellow-400 drop-shadow-lg">NEW</span>
            <span className="text-white"> PASSWORD</span>
          </h1>
          <p className="text-gray-400 text-sm mt-3">
            Resetting password for:
          </p>
          <p className="text-yellow-400 font-medium text-sm break-all mt-1">{email}</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="text-gray-300 block mb-1 text-sm font-semibold">New Password</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-700 text-white p-4 pr-16 rounded-xl outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition"
                required
                disabled={loading || showSuccessModal}
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

          {/* Strength Meter Bar */}
          {password.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Password Strength:</span>
                <span className={`font-bold ${strength.textClass}`}>{strength.label}</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Strength Checklist */}
          <div className="bg-black/40 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Security Requirements:
            </span>
            {criteriaList.map((criteria, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className={criteria.met ? "text-green-500 font-bold" : "text-gray-600"}>
                  {criteria.met ? "✓" : "○"}
                </span>
                <span className={criteria.met ? "text-gray-300" : "text-gray-500"}>
                  {criteria.label}
                </span>
              </div>
            ))}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-300 block mb-1 text-sm font-semibold">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-2 bg-black border border-zinc-700 text-white p-4 rounded-xl outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition"
              required
              disabled={loading || showSuccessModal}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || showSuccessModal}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-yellow-400/40 transition cursor-pointer border-none mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </motion.button>
        </form>

        {/* Back Link */}
        <p className="text-center mt-6 text-gray-400 text-sm">
          <Link href="/login" className="text-yellow-400 cursor-pointer font-semibold hover:underline">
            ✕ Cancel and back to Login
          </Link>
        </p>
      </motion.div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center"
            >
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/25 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-3xl font-bold">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Your password has been successfully updated. You can now login to your Forge Gym dashboard with your new password.
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-xl font-bold hover:shadow-yellow-400/30 transition cursor-pointer border-none"
              >
                Go to Login
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
