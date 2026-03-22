"use client";

import { memo } from "react";

function Candle({ scale = 1 }: { scale?: number }) {
  const s = scale;
  return (
    <div className="candle-unit flex flex-col items-center relative" style={{ transform: `scale(${s})` }}>
      {/* Light cone */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0 h-0 pointer-events-none"
        style={{
          borderLeft: "30px solid transparent",
          borderRight: "30px solid transparent",
          borderBottom: "120px solid rgba(255,160,60,0.02)",
          filter: "blur(8px)",
          animation: "candle-cone 3s ease-in-out infinite alternate",
        }}
      />

      {/* Flame group */}
      <div className="relative w-7 h-14 -mb-1 z-10">
        {/* Smoke wisps */}
        {[0, 1.3, 2.6].map((d, i) => (
          <div key={`s${i}`} className="absolute -top-1 left-1/2 w-1 h-1 rounded-full opacity-0 pointer-events-none"
            style={{
              background: "rgba(180,180,200,0.08)",
              filter: "blur(3px)",
              animation: `candle-smoke 4s ease-out ${d}s infinite`,
              marginLeft: `${(i - 1) * 2}px`,
            }}
          />
        ))}

        {/* Glow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,160,50,0.35) 0%, transparent 70%)",
            animation: "candle-glow 1s ease-in-out infinite alternate",
          }}
        />

        {/* Outer flame */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-10"
          style={{
            background: "linear-gradient(to top, rgba(255,106,0,0.95) 0%, rgba(255,160,20,0.8) 30%, rgba(255,200,50,0.4) 60%, transparent 100%)",
            borderRadius: "50% 50% 30% 30% / 80% 80% 20% 20%",
            filter: "blur(1px)",
            animation: "candle-f1 0.7s ease-in-out infinite alternate",
            transformOrigin: "bottom center",
          }}
        />

        {/* Mid flame */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-7"
          style={{
            background: "linear-gradient(to top, rgba(255,220,100,0.95) 0%, rgba(255,240,160,0.7) 40%, transparent 100%)",
            borderRadius: "50% 50% 30% 30% / 80% 80% 20% 20%",
            filter: "blur(0.5px)",
            animation: "candle-f2 0.55s ease-in-out infinite alternate-reverse",
            transformOrigin: "bottom center",
          }}
        />

        {/* Inner flame */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-5"
          style={{
            background: "linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,250,220,0.8) 30%, transparent 100%)",
            borderRadius: "50% 50% 30% 30% / 80% 80% 20% 20%",
            animation: "candle-f3 0.45s ease-in-out infinite alternate",
            transformOrigin: "bottom center",
          }}
        />

        {/* Ember */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full z-20"
          style={{
            background: "#fff",
            boxShadow: "0 0 6px 2px rgba(255,200,100,0.8), 0 0 12px 4px rgba(255,150,50,0.4)",
          }}
        />

        {/* Wick */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-3 rounded-sm z-0"
          style={{ background: "linear-gradient(to top, #555, #1a1a1a)" }}
        />
      </div>

      {/* Candle body */}
      <div className="relative overflow-hidden z-0" style={{
        width: 30, height: 140,
        background: "linear-gradient(180deg, #FFFBF0 0%, #F5E6C8 20%, #EBDAB5 50%, #E0CFA5 80%, #D8C498 100%)",
        borderRadius: "4px 4px 2px 2px",
        boxShadow: "inset 6px 0 12px rgba(255,255,255,0.4), inset -4px 0 12px rgba(0,0,0,0.06), 3px 6px 20px rgba(0,0,0,0.6)",
      }}>
        {/* Wax drips */}
        <div className="absolute left-1 top-1 w-1 h-5 rounded-b-full opacity-60"
          style={{ background: "linear-gradient(to bottom, #FFF4E0, #F0DFC0)" }} />
        <div className="absolute right-1 top-0.5 w-1 h-7 rounded-b-full opacity-60"
          style={{ background: "linear-gradient(to bottom, #FFF4E0, #F0DFC0)" }} />
      </div>

      {/* Base */}
      <div style={{
        width: 40, height: 8,
        background: "linear-gradient(to bottom, #9a7744, #6b4f2a, #4a3518)",
        borderRadius: "2px 2px 5px 5px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.6)",
      }} />

      {/* Light pool */}
      <div className="mt-1.5 rounded-full" style={{
        width: 80, height: 10,
        background: "radial-gradient(ellipse, rgba(255,160,60,0.1) 0%, transparent 70%)",
        animation: "candle-pool 2.5s ease-in-out infinite alternate",
      }} />
    </div>
  );
}

export default memo(Candle);
