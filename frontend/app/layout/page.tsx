"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/organisms/Navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/"); // better than push
    } else {
      setLoading(false);
    }
  }, [router]);

  // 🚫 prevent page flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Checking authentication...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}