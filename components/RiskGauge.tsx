"use client";

import { useEffect, useState } from "react";
import type { RiskLevel } from "@/lib/detection/types";

const COLORS: Record<RiskLevel, string> = {
  low: "#35d399",
  medium: "#ffb020",
  high: "#ff5d6c",
};

const ARC_LENGTH = Math.PI * 80;

function pointOnArc(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: 100 + radius * Math.cos(rad),
    y: 100 + radius * Math.sin(rad),
  };
}

const TICKS = Array.from({ length: 11 }, (_, index) => {
  const angle = 180 + index * 18;
  const inner = pointOnArc(angle, 64);
  const outer = pointOnArc(angle, 71);
  return { angle, inner, outer };
});

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  label: string;
  hint: string;
  scoreLabel: string;
}

export function RiskGauge({ score, level, label, hint, scoreLabel }: RiskGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const color = COLORS[level];
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setValue(clamped);
      return;
    }

    let frame = 0;
    const started = performance.now();
    const duration = 950;

    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(clamped * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const offset = ARC_LENGTH * (1 - value / 100);

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 124"
        className="w-full max-w-[230px] overflow-visible"
        role="img"
        aria-label={`${label}: ${Math.round(clamped)} / 100`}
      >
        <defs>
          <radialGradient id="gauge-halo" cx="50%" cy="78%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="72" fill="url(#gauge-halo)" />

        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          className="text-line-2"
          strokeWidth={14}
          strokeLinecap="round"
        />

        {TICKS.map((tick) => (
          <line
            key={tick.angle}
            x1={tick.inner.x}
            y1={tick.inner.y}
            x2={tick.outer.x}
            y2={tick.outer.y}
            stroke="currentColor"
            className="text-line-2"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.7}
          />
        ))}

        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 10px ${color}66)` }}
        />

        <text
          x="100"
          y="84"
          textAnchor="middle"
          className="fill-chalk font-sans text-[40px] font-semibold tabular-nums"
        >
          {Math.round(value)}
        </text>
        <text
          x="100"
          y="103"
          textAnchor="middle"
          className="fill-mist-2 font-sans text-[10px] uppercase tracking-[0.18em]"
        >
          / 100
        </text>
      </svg>

      <div className="-mt-1 text-center">
        <div className="text-[13px] font-semibold transition-colors duration-500" style={{ color }}>
          {label}
        </div>
        <div className="mt-0.5 text-[11px] text-mist-2">{hint}</div>
        <div className="sr-only">{scoreLabel}</div>
      </div>
    </div>
  );
}
