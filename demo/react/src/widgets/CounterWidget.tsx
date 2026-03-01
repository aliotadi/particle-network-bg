import { useState, useEffect, useRef } from "react";

export interface CounterWidgetProps {
  label?: string;
  initialValue?: number;
  maxDelta?: number;
  tickMs?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

export function CounterWidget({
  label = "Active Users",
  initialValue = 24891,
  maxDelta = 45,
  tickMs = 2200,
  prefix = "",
  suffix = "",
  color = "#60a5fa",
}: CounterWidgetProps) {
  const [value, setValue] = useState(initialValue);
  const [trend, setTrend] = useState<1 | -1>(1);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(initialValue);

  useEffect(() => {
    const id = setInterval(() => {
      const change = Math.round((Math.random() - 0.48) * maxDelta * 2);
      setValue((v) => {
        const next = Math.max(0, v + change);
        setTrend(change >= 0 ? 1 : -1);
        setFlash(true);
        setTimeout(() => setFlash(false), 300);
        prevRef.current = next;
        return next;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [maxDelta, tickMs]);

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
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 10,
          opacity: 0.45,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: -0.5,
          color: flash ? "#fff" : color,
          fontVariantNumeric: "tabular-nums",
          transition: "color 0.3s ease",
        }}
      >
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          fontWeight: 600,
          color: trend === 1 ? "#4ade80" : "#f87171",
        }}
      >
        <span>{trend === 1 ? "▲" : "▼"}</span>
        <span style={{ opacity: 0.7 }}>live</span>
      </div>
    </div>
  );
}
