"use client";

import { forgotPassword } from "@/src/dialogs/invoice_config/services";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      const data = await forgotPassword(email);

      if (data.success) {
        alert("Reset link generated");
        console.log(data.resetUrl);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-[400px] shadow-xl">

    <h1 className="text-white text-3xl font-bold mb-2">
      Forgot Password
    </h1>

    <p className="text-gray-400 mb-6">
      Enter your registered email address
    </p>

    <input
      type="email"
      placeholder="Enter Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full bg-black border border-zinc-700 text-white placeholder:text-gray-500 p-3 rounded-xl outline-none focus:border-yellow-400"
    />

    <button
      onClick={handleForgotPassword}
      className="w-full mt-4 bg-yellow-400 text-black font-bold p-3 rounded-xl hover:bg-yellow-300 transition"
    >
      Send Reset Link
    </button>

  </div>
</div>
  );
}