import { useState, useEffect } from "react";

export interface ProgressRingWidgetProps {
  label?: string;
  color?: string;
  speedMs?: number;
}

export function ProgressRingWidget({
  label = "CPU",
  color = "#818cf8",
  speedMs = 70,
}: ProgressRingWidgetProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"fill" | "drain">("fill");

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (phase === "fill") {
          if (p >= 100) {
            setPhase("drain");
            return 100;
          }
          return p + 1;
        } else {
          if (p <= 0) {
            setPhase("fill");
            return 0;
          }
          return p - 1;
        }
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [phase, speedMs]);

  const R = 34;
  const stroke = 5;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - progress / 100);

  const ringColor =
    progress < 50 ? color : progress < 80 ? "#fb923c" : "#f87171";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        userSelect: "none",
        width: "100%",
        height: "100%",
      }}
    >
      <svg width={90} height={90} viewBox="0 0 90 90">
        {/* Track */}
        <circle
          cx="45"
          cy="45"
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx="45"
          cy="45"
          r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 45 45)"
          style={{ transition: `stroke-dashoffset ${speedMs}ms linear, stroke 0.5s ease` }}
        />
        {/* Center text */}
        <text
          x="45"
          y="41"
          textAnchor="middle"
          fill="#fff"
          fontSize="16"
          fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {progress}
        </text>
        <text
          x="45"
          y="55"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="9"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
