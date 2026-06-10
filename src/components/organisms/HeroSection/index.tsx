"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function HeroSection() {
    const router = useRouter();

  const [timeLeft, setTimeLeft] = useState({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

useEffect(() => {
  const targetDate = new Date("2026-07-01T00:00:00");

  const timer = setInterval(() => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),
        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),
        seconds: Math.floor(
          (difference / 1000) % 60
        ),
      });
    }
  }, 1000);

  return () => clearInterval(timer);
}, []);
  return (
<section
  id="home"
  className="relative min-h-screen pt-24 overflow-hidden"
>      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920')",
        }}
      />
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-yellow-500/20 blur-[150px]" />

<div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-orange-500/20 blur-[150px]" />

      {/* Overlay */}
     

{/* Golden Particles */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  {[...Array(25)].map((_, i) => (
    <motion.div
      key={i}
      className="absolute text-yellow-400 text-xl"
      initial={{
        y: -100,
        x: Math.random() * 1500,
        opacity: 0,
      }}
      animate={{
        y: 1200,
        opacity: [0, 1, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration: 6 + Math.random() * 5,
        repeat: Infinity,
        delay: Math.random() * 5,
      }}
    >
      ✨
    </motion.div>
  ))}
</div>

      {/* Content */}
    <div className="relative z-10 flex min-h-screen items-center">
  <div className="mx-auto max-w-7xl px-6 lg:px-12">
{/* OFFER BANNER */}
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="relative mb-10 max-w-4xl"
>
  <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 blur-3xl opacity-30 animate-pulse" />

  <div className="relative overflow-hidden rounded-[32px] border border-yellow-500/30 bg-black/50 backdrop-blur-2xl p-8">

    <motion.div
      animate={{ x: ["-100%", "200%"] }}
      transition={{
        repeat: Infinity,
        duration: 4,
        ease: "linear",
      }}
      className="absolute top-0 left-0 h-full w-32 bg-white/10 skew-x-12"
    />

    <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-red-500/20 border border-red-500 text-red-400 font-bold">
      🔥 LIMITED TIME OFFER
    </div>

    <h2 className="mt-6 text-5xl md:text-7xl font-black leading-none">
      <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
        50% OFF
      </span>

      <span className="block text-white mt-2">
        SUMMER SALE
      </span>
    </h2>

    <p className="text-gray-300 text-lg mt-5">
      Free Personal Trainer + Custom Diet Plan + Fitness Assessment
    </p>


{/* YAHAN COUNTDOWN ADD KARNA HAI */}
<div className="flex flex-wrap gap-4 mt-8">
  {[
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ].map((item, index) => (
    <motion.div
      key={index}
      animate={{ y: [0, -8, 0] }}
      transition={{
        repeat: Infinity,
        duration: 2,
        delay: index * 0.2,
      }}
className="
bg-gradient-to-b
from-yellow-500/20
to-orange-500/10
border border-yellow-400/30
backdrop-blur-xl
rounded-3xl
p-5
min-w-[95px]
text-center
shadow-[0_0_25px_rgba(250,204,21,0.15)]
"    >
      <h3 className="text-3xl font-bold text-yellow-400">
        {String(item.value).padStart(2, "0")}
      </h3>

      <p className="text-gray-400 text-sm">
        {item.label}
      </p>
    </motion.div>
  ))}
</div>
<motion.button
  onClick={() => router.push("/join")}
  whileHover={{
    scale: 1.08,
    boxShadow: "0px 0px 50px rgba(250,204,21,0.7)",
  }}
  whileTap={{ scale: 0.95 }}
  className="
  mt-8
  bg-gradient-to-r
  from-yellow-400
  via-orange-500
  to-red-500
  text-black
  px-10
  py-5
  rounded-2xl
  font-black
  text-lg
  shadow-xl
  "
>
  🚀 CLAIM OFFER NOW
</motion.button>

   
  </div>
</motion.div>
```

  </div>
</div>

    </section>
  );
}
