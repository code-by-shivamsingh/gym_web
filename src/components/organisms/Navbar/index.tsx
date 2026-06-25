"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setMenuOpen(false);
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
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 text-white">
      <div className="flex justify-between items-center px-6 md:px-10 py-5">
        {/* LOGO */}
        <h1 
          className="text-2xl font-extrabold tracking-wide cursor-pointer" 
          onClick={() => handleNavClick("home")}
        >
          <span className="text-yellow-400">FORGE</span>
          <span className="text-white">GYM</span>
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => handleNavClick("home")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">Home</button>
          <button onClick={() => handleNavClick("about")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">About Us</button>
          <button onClick={() => handleNavClick("offers")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">Offers</button>
          <button onClick={() => handleNavClick("features")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">Features</button>
          <button onClick={() => handleNavClick("gallery")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">Gallery</button>
          <button onClick={() => handleNavClick("trainers")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">Trainers</button>
          <button onClick={() => handleNavClick("contact")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">Contact Us</button>
          <button onClick={() => handleNavClick("training")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">Training</button>
          <button onClick={() => handleNavClick("bmi")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">BMI</button>
          <button onClick={() => handleNavClick("faq")} className="hover:text-yellow-400 transition cursor-pointer bg-transparent border-none text-white">FAQ</button>
          <button
            onClick={() => router.push("/login")}
            className="bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition cursor-pointer border-none"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-3xl cursor-pointer bg-transparent border-none text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-6 bg-black border-t border-zinc-800">
          <button onClick={() => handleNavClick("home")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">Home</button>
          <button onClick={() => handleNavClick("about")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">About Us</button>
          <button onClick={() => handleNavClick("offers")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">Offers</button>
          <button onClick={() => handleNavClick("features")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">Features</button>
          <button onClick={() => handleNavClick("gallery")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">Gallery</button>
          <button onClick={() => handleNavClick("trainers")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">Trainers</button>
          <button onClick={() => handleNavClick("contact")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">Contact Us</button>
          <button onClick={() => handleNavClick("training")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">Training</button>
          <button onClick={() => handleNavClick("bmi")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">BMI</button>
          <button onClick={() => handleNavClick("faq")} className="text-left py-1 hover:text-yellow-400 bg-transparent border-none text-white cursor-pointer">FAQ</button>
          <button
            onClick={() => {
              setMenuOpen(false);
              router.push("/login");
            }}
            className="bg-yellow-400 text-black py-2 rounded-xl font-bold text-center border-none cursor-pointer"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
}