"use client";

import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "gold" | "outline";
  className?: string;
}

export default function Button({ children, onClick, variant = "gold", className = "" }: ButtonProps) {
  const base = "px-10 py-3.5 rounded-full font-semibold text-sm tracking-wider transition-all";
  const variants = {
    gold: "bg-gradient-to-br from-[#e8d48b] to-[#c4a850] text-[#08090e] shadow-[0_4px_24px_rgba(232,212,139,.25)]",
    outline: "border border-gold/15 bg-transparent text-gold hover:bg-gold/5",
  };

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}
