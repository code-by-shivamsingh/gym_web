"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
export default function OffersSection() {
    const router = useRouter();
  const offers = [
    {
      title: "50% OFF Membership",
      discount: "50%",
      desc: "Annual Membership Plan",
      color: "from-yellow-400 to-orange-500",
      icon: "🔥",
    },
    {
      title: "Free Personal Trainer",
      discount: "FREE",
      desc: "1 Month Personal Coaching",
      color: "from-green-400 to-emerald-500",
      icon: "💪",
    },
    {
      title: "Free Diet Plan",
      discount: "FREE",
      desc: "Customized Nutrition Guide",
      color: "from-pink-400 to-rose-500",
      icon: "🥗",
    },
    {
      title: "Refer & Earn",
      discount: "₹1000",
      desc: "For Every Successful Referral",
      color: "from-cyan-400 to-blue-500",
      icon: "🎁",
    },
  ];

  return (
    <section
      id="offers"
      className="relative py-28 bg-black overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 blur-[150px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Heading */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="inline-block px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-semibold"
          >
            LIMITED TIME DEALS
          </motion.span>

          <h2 className="text-5xl md:text-7xl font-black text-white mt-6">
            Exclusive
            <span className="text-yellow-400">
              {" "}Offers
            </span>
          </h2>

          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            Unlock premium fitness benefits with our
            special membership deals and rewards.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {offers.map((offer, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-white/10
                bg-white/5
                backdrop-blur-xl
                p-8
              "
            >
              {/* Ribbon */}
              <div
                className={`
                  absolute top-0 right-0
                  bg-gradient-to-r ${offer.color}
                  text-black
                  font-black
                  px-5 py-2
                  rounded-bl-2xl
                `}
              >
                {offer.discount}
              </div>

              {/* Icon */}
              <div className="text-6xl mb-6">
                {offer.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white">
                {offer.title}
              </h3>

              <p className="text-gray-400 mt-3">
                {offer.desc}
              </p>

              {/* Button */}
           <motion.button
  onClick={() => router.push("/join?offer=true")}
  whileHover={{
    scale: 1.08,
    boxShadow: "0px 0px 30px rgba(250,204,21,0.4)",
  }}
  whileTap={{ scale: 0.95 }}
  className="
  mt-8
  w-full
  py-4
  rounded-2xl
  font-bold
  bg-gradient-to-r
  from-yellow-400
  to-orange-500
  text-black
  transition-all
  "
>
  🚀 Claim Offer
</motion.button>

              {/* Glow */}
              <div
                className={`
                  absolute -bottom-10 -right-10
                  w-40 h-40
                  bg-gradient-to-r ${offer.color}
                  blur-[100px]
                  opacity-20
                `}
              />
            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}