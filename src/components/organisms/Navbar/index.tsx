"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 
      flex justify-between items-center 
      px-10 py-5 
      bg-black/90 backdrop-blur-md 
      text-white border-b border-zinc-800"
    >
      {/* LOGO */}
      <h1 className="text-2xl font-extrabold tracking-wide cursor-pointer">
        <span className="text-yellow-400">FORGE</span>
        <span className="text-white">GYM</span>
      </h1>

      {/* MENU */}
      <div className="flex gap-8 items-center">

        {/* HOME */}
        <button
          onClick={() => scrollToSection("home")}
          className="text-gray-300 hover:text-white transition"
        >
          Home
        </button>

        {/* ABOUT */}
        <button
          onClick={() => scrollToSection("about")}
          className="text-gray-300 hover:text-white transition"
        >
          About
        </button>

        {/* FEATURES */}
        <button
          onClick={() => scrollToSection("features")}
          className="text-gray-300 hover:text-white transition"
        >
          Features
        </button>

        {/* TRAINERS */}
        <button
          onClick={() => scrollToSection("trainers")}
          className="text-gray-300 hover:text-white transition"
        >
          Trainers
        </button>

        {/* CONTACT */}
        <button
          onClick={() => scrollToSection("contact")}
          className="text-gray-300 hover:text-white transition"
        >
          Contact
        </button>

        {/* LOGIN */}
        <button
          onClick={() => router.push("/login")}
          className="bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition"
        >
          Login
        </button>

      </div>
    </nav>
  );
}