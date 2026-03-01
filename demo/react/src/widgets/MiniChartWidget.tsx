import { useState, useEffect, useId } from "react";

function buildPath(pts: number[], w: number, h: number): string {
  if (pts.length < 2) return "";
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const pad = h * 0.12;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map((p) => h - pad - ((p - min) / range) * (h - pad * 2));
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  return d;
}

export interface MiniChartWidgetProps {
  label?: string;
  unit?: string;
  color?: string;
  tickMs?: number;
}

export function MiniChartWidget({
  label = "Network",
  unit = "ms",
  color = "#a78bfa",
  tickMs = 1100,
}: MiniChartWidgetProps) {
  const uid = useId().replace(/:/g, "");
  const [data, setData] = useState<number[]>(() => {
    const arr: number[] = [];
    let v = 50;
    for (let i = 0; i < 14; i++) {
      v = Math.max(8, Math.min(92, v + (Math.random() - 0.5) * 22));
      arr.push(v);
    }
    return arr;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.max(8, Math.min(92, last + (Math.random() - 0.5) * 18));
        return [...prev.slice(1), next];
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  const W = 176, H = 72;
  const line = buildPath(data, W, H);
  const fill = line + ` L ${W} ${H} L 0 ${H} Z`;
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const up = last >= prev;
  const trendColor = up ? "#4ade80" : "#f87171";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        userSelect: "none",
        width: "100%",
        height: "100%",
        padding: "12px 14px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              opacity: 0.45,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>
            {last.toFixed(1)}
            <span style={{ fontSize: 9, opacity: 0.5 }}> {unit}</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: trendColor, fontWeight: 600, marginTop: 4 }}>
          {up ? "▲" : "▼"} {Math.abs(last - prev).toFixed(1)}
        </div>
      </div>
      <svg
        width={W}
        height={H}
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`cg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#cg-${uid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* live dot */}
        <circle
          cx={(data.length - 1) / (data.length - 1) * W}
          cy={(() => {
            const min = Math.min(...data);
            const max = Math.max(...data);
            const range = max - min || 1;
            const pad = H * 0.12;
            return H - pad - ((last - min) / range) * (H - pad * 2);
          })()}
          r="3"
          fill={color}
        />
      </svg>
    </div>
  );
}
