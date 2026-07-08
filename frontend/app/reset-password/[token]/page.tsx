"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resetPassword } from "@/src/dialogs/invoice_config/services";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();

  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);

 const handleResetPassword = async () => {
  const data = await resetPassword(
    token,
    password
  );

  if (data.success) {
    alert("Password Reset Successfully");
  }
};

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-3xl border border-zinc-800">

        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Reset Password
        </h1>

        <form
          onSubmit={handleResetPassword}
          className="space-y-4"
        >

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold"
          >
            {loading
              ? "Updating..."
              : "Reset Password"}
          </button>

        </form>

      </div>

    </div>
  );
}