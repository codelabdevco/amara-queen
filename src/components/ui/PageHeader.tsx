"use client";

import { motion } from "framer-motion";
import { EASE } from "@/constants/animation";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  divider?: boolean;
  animated?: boolean;
}

const goldGradientStyle = {
  background: "linear-gradient(135deg, #d4af37, #f0d78c, #d4af37)",
  backgroundSize: "200% 200%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  animation: "shimmer-text 4s ease-in-out infinite",
} as const;

export default function PageHeader({ title, subtitle, divider, animated = true }: PageHeaderProps) {
  const Wrapper = animated ? motion.div : "div";
  const motionProps = animated
    ? { initial: { opacity: 0, y: -15 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1, duration: 0.6, ease: EASE } }
    : {};

  return (
    <Wrapper className="text-center mb-5" {...motionProps}>
      <h2
        className="text-lg font-semibold tracking-[0.1em] mb-1"
        style={goldGradientStyle}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#8B7A4A]/50 text-xs mt-1">{subtitle}</p>
      )}
      {divider && (
        <motion.div
          className="w-16 h-[1px] mx-auto mt-3"
          style={{ background: "linear-gradient(90deg, transparent, #8B7A4A, transparent)" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      )}
    </Wrapper>
  );
}
