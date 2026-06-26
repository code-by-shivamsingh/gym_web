"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Membership", path: "/membership" },
    { label: "Features", path: "/features" },
    { label: "Offers", path: "/offers" },
    { label: "Training", path: "/training" },
    { label: "Trainers", path: "/trainers" },
    { label: "Gallery", path: "/gallery" },
    { label: "BMI", path: "/bmi" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 text-white">
      <div className="flex justify-between items-center px-6 md:px-10 py-5">
        {/* LOGO */}
        <h1 
          className="text-2xl font-extrabold tracking-wide cursor-pointer select-none" 
          onClick={() => handleNavClick("/")}
        >
          <span className="text-yellow-400">FORGE</span>
          <span className="text-white">GYM</span>
        </h1>

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-3.5 xl:gap-5 items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <div key={item.path} className="relative py-2 shrink-0">
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`relative z-10 px-1 py-0.5 text-[13px] xl:text-sm font-semibold transition-colors duration-300 bg-transparent border-none cursor-pointer ${
                    isActive ? "text-yellow-400 font-bold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </div>
            );
          })}
          
          <button
            onClick={() => router.push("/login")}
            className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold hover:scale-105 transition cursor-pointer border-none text-sm ml-1 shrink-0"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-3xl cursor-pointer bg-transparent border-none text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden flex flex-col gap-2 px-6 pb-6 bg-black border-t border-zinc-800 animate-slideDown max-h-[80vh] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`text-left py-2.5 px-4 rounded-xl font-bold transition-all duration-300 cursor-pointer border-none flex items-center justify-between ${
                  isActive
                    ? "bg-yellow-400/10 text-yellow-400 border-l-4 border-yellow-400"
                    : "bg-transparent text-gray-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="text-yellow-400 text-xs">●</span>}
              </button>
            );
          })}
          
          <button
            onClick={() => {
              setMenuOpen(false);
              router.push("/login");
            }}
            className="bg-yellow-400 text-black py-2.5 rounded-xl font-bold text-center border-none cursor-pointer mt-2 text-sm"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
}