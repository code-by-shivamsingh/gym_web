"use client";

import { useEffect, useState } from "react";

interface Toast {
  id: number;
  message: string;
}

export default function GlobalToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Save original alert
    const originalAlert = window.alert;

    // Override global alert
    window.alert = (message: any) => {
      const id = Date.now() + Math.random();
      const msgStr = typeof message === "object" ? JSON.stringify(message) : String(message);

      setToasts((prev) => [...prev, { id, message: msgStr }]);

      // Remove after 3.5 seconds automatically
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 pointer-events-auto border border-zinc-800"
          style={{
            animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            background: "rgba(24, 24, 27, 0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex-1 text-sm font-semibold tracking-wide leading-relaxed">
            {toast.message}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-gray-400 hover:text-white font-bold text-xs p-1 cursor-pointer transition"
          >
            ✕
          </button>
        </div>
      ))}
      <style jsx global>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
