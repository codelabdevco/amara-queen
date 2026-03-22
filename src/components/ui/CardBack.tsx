"use client";

import { THEME } from "@/constants/theme";

interface CardBackProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function CardBack({ width = 140, height = 224, className = "" }: CardBackProps) {
  // Use custom image if configured
  if (THEME.cardBackImage) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ width, height }}>
        <img
          src={THEME.cardBackImage}
          alt="Card back"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  // Default SVG design
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 140 224"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="140" height="224" rx="10" fill="#08090e" />
      <rect x="6" y="6" width="128" height="212" rx="7" fill="none" stroke="#e8d48b" strokeWidth=".5" opacity=".4" />
      <polygon points="70,28 126,112 70,196 14,112" fill="none" stroke="#e8d48b" strokeWidth=".8" opacity=".5" />
      <polygon points="70,44 114,112 70,180 26,112" fill="none" stroke="#e8d48b" strokeWidth=".4" opacity=".3" />
      <circle cx="70" cy="72" r="12" fill="none" stroke="#e8d48b" strokeWidth="1" />
      <circle cx="76" cy="69" r="10" fill="#08090e" />
      <g transform="translate(70,106)" fill="#e8d48b" opacity=".7">
        <polygon points="0,-8 2,-2.5 8,-2.5 3,1.5 5,7.5 0,3.5 -5,7.5 -3,1.5 -8,-2.5 -2,-2.5" />
      </g>
      <line x1="30" y1="142" x2="110" y2="142" stroke="#e8d48b" strokeWidth=".4" opacity=".3" />
      <circle cx="55" cy="158" r="2" fill="#e8d48b" opacity=".4" />
      <circle cx="70" cy="158" r="2.5" fill="#e8d48b" opacity=".6" />
      <circle cx="85" cy="158" r="2" fill="#e8d48b" opacity=".4" />
      <g fill="#e8d48b" opacity=".35">
        <circle cx="24" cy="50" r=".8" />
        <circle cx="116" cy="50" r=".8" />
        <circle cx="30" cy="90" r=".6" />
        <circle cx="110" cy="90" r=".6" />
        <circle cx="24" cy="170" r=".8" />
        <circle cx="116" cy="170" r=".8" />
        <circle cx="40" cy="196" r=".6" />
        <circle cx="100" cy="196" r=".6" />
      </g>
    </svg>
  );
}
