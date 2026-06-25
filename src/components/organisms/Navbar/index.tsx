"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleNavClick = (id: string) => {
    if (pathname === "/" || pathname === "/home") {
      scrollToSection(id);
    } else {
      router.push(`/#${id}`);
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
      <h1 className="text-2xl font-extrabold tracking-wide cursor-pointer" onClick={() => handleNavClick("home")}>
        <span className="text-yellow-400">FORGE</span>
        <span className="text-white">GYM</span>
      </h1>

      {/* MENU */}
      <div className="flex gap-8 items-center">

        {/* HOME */}
        <button
          onClick={() => handleNavClick("home")}
          className="text-gray-300 hover:text-white transition cursor-pointer"
        >
          Home
        </button>

        {/* ABOUT */}
        <button
          onClick={() => handleNavClick("about")}
          className="text-gray-300 hover:text-white transition cursor-pointer"
        >
          About
        </button>

        {/* FEATURES */}
        <button
          onClick={() => handleNavClick("features")}
          className="text-gray-300 hover:text-white transition cursor-pointer"
        >
          Features
        </button>

        {/* TRAINERS */}
        <button
          onClick={() => handleNavClick("trainers")}
          className="text-gray-300 hover:text-white transition cursor-pointer"
        >
          Trainers
        </button>

        {/* CONTACT */}
        <button
          onClick={() => handleNavClick("contact")}
          className="text-gray-300 hover:text-white transition cursor-pointer"
        >
          Contact
        </button>

        {/* LOGIN */}
        <button
          onClick={() => router.push("/login")}
          className="bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition cursor-pointer"
        >
          Login
        </button>

      </div>
    </nav>
  );
}