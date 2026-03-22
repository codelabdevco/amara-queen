"use client";

import LaurelButton from "@/components/ui/LaurelButton";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "gold" | "outline" | "crimson";
  className?: string;
  href?: string;
  disabled?: boolean;
}

export default function Button({ children, onClick, variant = "gold", className = "", href, disabled }: ButtonProps) {
  const laurelVariant = variant === "crimson" || variant === "outline" ? "crimson" : "gold";

  if (disabled) {
    return (
      <button
        className={`inline-flex items-center justify-center px-8 py-3 rounded-sm text-sm font-medium tracking-wider opacity-30 cursor-not-allowed ${
          laurelVariant === "gold" ? "bg-[#5A4E34] text-[#2A0C10]" : "bg-[#2D0A0A] text-[#8B7A4A]"
        } ${className}`}
        disabled
      >
        {children}
      </button>
    );
  }

  return (
    <LaurelButton variant={laurelVariant} onClick={onClick} href={href} className={className}>
      {children}
    </LaurelButton>
  );
}
