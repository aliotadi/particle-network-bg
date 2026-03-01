import { useState, useEffect } from "react";

const base: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontFamily: "'Inter', system-ui, sans-serif",
  userSelect: "none",
  width: "100%",
  height: "100%",
  gap: 5,
};

export function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div style={base}>
      <div
        style={{
          fontSize: 10,
          opacity: 0.45,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {dateStr}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 1,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {pad(time.getHours())}:{pad(time.getMinutes())}
        <span style={{ opacity: 0.4, fontSize: 15 }}>
          :{pad(time.getSeconds())}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background:
                i === time.getSeconds() % 3 ? "#818cf8" : "rgba(255,255,255,0.2)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
