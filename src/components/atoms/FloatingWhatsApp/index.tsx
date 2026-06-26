"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSettings } from "@/src/dialogs/invoice_config/services";

export default function FloatingWhatsApp() {
  const [whatsappNumber, setWhatsappNumber] = useState("+919876543210");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchSupportNumber = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data?.whatsapp) {
          // Clean the number for URL compatibility
          const cleanNum = res.data.whatsapp.replace(/[^0-9+]/g, "");
          setWhatsappNumber(cleanNum);
        }
      } catch (err) {
        console.error("Failed to load WhatsApp settings:", err);
      }
    };
    fetchSupportNumber();
  }, []);

  const handleClick = () => {
    // Format wa.me link
    const cleanNumberOnly = whatsappNumber.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanNumberOnly}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 bg-zinc-900 border border-zinc-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none select-none tracking-wide text-center shrink-0 min-w-[150px]"
          >
            💬 Chat with Support!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button Wrapper */}
      <div className="relative group">
        {/* Pulsing Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping" />

        {/* Floating Button */}
        <motion.button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-[#25D366] hover:bg-[#20ba59] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-[#25D366]/20 transition-colors duration-300 border-none cursor-pointer outline-none z-10"
        >
          {/* Official WhatsApp SVG Icon */}
          <svg
            className="w-8 h-8 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.063 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
