"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { verifyOtp, forgotPassword } from "@/src/dialogs/invoice_config/services";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(59); // 59 seconds expiry

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  // Countdown timer - counts from 600 down to 0
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleChange = (val: string, index: number) => {
    // Only allow numbers
    if (val && !/^\d$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setErrorMsg("");

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      // If current input is empty, clear previous input and focus it
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Just clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
      setErrorMsg("");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && /^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      setErrorMsg("");
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    if (timeLeft <= 0) {
      setErrorMsg("Verification code has expired. Please request a new one.");
      return;
    }

    try {
      setLoading(true);
      const data = await verifyOtp(email, otpStr);

      if (data.success && data.token) {
        setSuccessMsg("OTP Verified! Redirecting...");
        setTimeout(() => {
          router.push(
            `/forgot-password/reset?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
              data.token
            )}`
          );
        }, 1500);
      } else {
        setErrorMsg(data.message || "Invalid verification code. Please check and try again.");
      }
    } catch (err: any) {
      setErrorMsg("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;

    setErrorMsg("");
    setSuccessMsg("");
    try {
      setResending(true);
      const data = await forgotPassword(email);

      if (data.success) {
        setSuccessMsg("A new verification code has been sent to your email.");
        setOtp(new Array(6).fill(""));
        setTimeLeft(59); // Reset countdown timer to 59 seconds
        inputRefs.current[0]?.focus();
      } else {
        setErrorMsg(data.message || "Failed to resend code. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg("Error sending new code. Please try again later.");
    } finally {
      setResending(false);
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
        className="w-full max-w-md bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-8 shadow-2xl z-10 text-center"
      >
        {/* Branding & Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-extrabold tracking-widest mb-2">
            <span className="text-yellow-400 drop-shadow-lg">VERIFY</span>
            <span className="text-white"> OTP</span>
          </h1>
          <p className="text-gray-400 text-sm mt-3">
            We sent a 6-digit verification code to
          </p>
          <p className="text-yellow-400 font-medium text-sm break-all mt-1">{email}</p>
        </motion.div>

        {/* Message Blocks */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold text-left"
          >
            {errorMsg}
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold text-left"
          >
            {successMsg}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input Grid */}
          <div className="flex justify-between gap-2 my-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                disabled={loading || !!successMsg}
                className="w-12 h-14 bg-black border border-zinc-700 text-white text-2xl font-bold text-center rounded-xl outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(250,204,21,0.25)] transition disabled:opacity-50"
              />
            ))}
          </div>

          {/* Timer displaying countdown */}
          <div className="text-gray-400 text-sm font-semibold flex items-center justify-center gap-2">
            <span>Code expires in:</span>
            <span className={timeLeft > 15 ? "text-yellow-400" : "text-red-500 animate-pulse"}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Verify Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !!successMsg}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-yellow-400/40 transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </motion.button>
        </form>

        {/* Resend Action */}
        <div className="mt-8 text-sm">
          <span className="text-gray-400">Didn't receive the code? </span>
          <button
            onClick={handleResend}
            disabled={timeLeft > 0 || resending || loading}
            className="text-yellow-400 font-semibold cursor-pointer hover:underline bg-transparent border-none outline-none disabled:text-gray-600 disabled:no-underline disabled:cursor-not-allowed"
          >
          {resending ? "Resending..." : timeLeft > 0 ? `Resend OTP (${formatTime(timeLeft)})` : "Resend OTP"}
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-sm">
          <Link href="/login" className="text-gray-400 hover:text-white transition">
            ✕ Cancel and return to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}
