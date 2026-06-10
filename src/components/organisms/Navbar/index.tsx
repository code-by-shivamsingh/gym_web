"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
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

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 text-white">

      <div className="flex justify-between items-center px-6 md:px-10 py-5">
        
        <h1 className="text-2xl font-extrabold">
          <span className="text-yellow-400">FORGE</span>
          <span>GYM</span>
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => scrollToSection("home")}>Home</button>
          <button onClick={() => scrollToSection("about")}>About Us</button>
          <button
  onClick={() => scrollToSection("offers")}
  className="text-gray-300 hover:text-yellow-400 transition"
>
  Offers
</button>
          <button onClick={() => scrollToSection("features")}>Features </button>
          <button onClick={() => scrollToSection("gallery")}>Gallery</button>
          <button onClick={() => scrollToSection("trainers")}>Trainers</button>
          <button onClick={() => scrollToSection("contact")}>Contact Us</button>
          <button onClick={() => scrollToSection("training")}>Training</button>
          <button
  onClick={() => scrollToSection("bmi")}
  className="hover:text-yellow-400 transition"
>
  BMI
</button>
          <button
  onClick={() => scrollToSection("faq")}
  className="hover:text-yellow-400 transition"
>
  FAQ
</button>
          <button
            onClick={() => router.push("/login")}
            className="bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-6 bg-black border-t border-zinc-800">
          <button onClick={() => scrollToSection("home")}>Home</button>
          <button onClick={() => scrollToSection("about")}>About Us</button>
          <button
  onClick={() => scrollToSection("offers")}
  className="text-gray-300 hover:text-yellow-400 transition"
>
  Offers
</button>
          <button onClick={() => scrollToSection("features")}>Features </button>
          <button onClick={() => scrollToSection("gallery")}>Gallery</button>
          <button onClick={() => scrollToSection("trainers")}>Trainers</button>
          <button onClick={() => scrollToSection("contact")}>Contact Us</button>
          <button onClick={() => scrollToSection("training")}>Training</button>
          <button
  onClick={() => scrollToSection("bmi")}
  className="hover:text-yellow-400 transition"
>
  BMI
</button>
          <button
  onClick={() => scrollToSection("faq")}
  className="hover:text-yellow-400 transition"
>
  FAQ
</button>
          <button
            onClick={() => router.push("/login")}
            className="bg-yellow-400 text-black py-2 rounded-xl font-bold"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
}