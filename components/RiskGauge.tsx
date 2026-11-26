import type { RiskLevel } from "@/lib/detection/types";

const COLORS: Record<RiskLevel, string> = {
  low: "#35d399",
  medium: "#ffb020",
  high: "#ff5d6c",
};

const ARC_LENGTH = Math.PI * 80;

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  label: string;
  hint: string;
  scoreLabel: string;
}

export function RiskGauge({ score, level, label, hint, scoreLabel }: RiskGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const offset = ARC_LENGTH * (1 - clamped / 100);
  const color = COLORS[level];

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 122"
        className="w-full max-w-[220px]"
        role="img"
        aria-label={`${label}: ${clamped} / 100`}
      >
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          className="text-line-2"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1), stroke 300ms ease",
            filter: `drop-shadow(0 0 10px ${color}55)`,
          }}
        />
        <text
          x="100"
          y="86"
          textAnchor="middle"
          fill="currentColor"
          className="fill-chalk font-sans text-[38px] font-semibold tabular-nums"
        >
          {clamped}
        </text>
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fill="currentColor"
          className="fill-mist-2 font-sans text-[10px] uppercase tracking-[0.18em]"
        >
          / 100
        </text>
      </svg>

      <div className="-mt-1 text-center">
        <div className="text-[13px] font-semibold" style={{ color }}>
          {label}
        </div>
        <div className="mt-0.5 text-[11px] text-mist-2">{hint}</div>
        <div className="sr-only">{scoreLabel}</div>
      </div>
    </div>
  );
}
