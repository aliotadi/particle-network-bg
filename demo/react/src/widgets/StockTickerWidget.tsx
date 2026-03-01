import { useState, useEffect } from "react";

interface Stock {
  ticker: string;
  price: number;
  change: number;
}

const INITIAL: Stock[] = [
  { ticker: "BTC", price: 67432.1, change: 2.4 },
  { ticker: "ETH", price: 3821.55, change: -0.8 },
  { ticker: "SOL", price: 184.22, change: 5.1 },
  { ticker: "ARB", price: 1.247, change: -1.3 },
];

function fmtPrice(p: number) {
  if (p >= 1000) return p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(3);
}

export function StockTickerWidget() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL);
  const [changed, setChanged] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const pct = (Math.random() - 0.5) * 0.6;
          const newPrice = Math.max(0.001, s.price * (1 + pct / 100));
          const newChange = s.change + (Math.random() - 0.5) * 0.15;
          return { ...s, price: newPrice, change: newChange };
        })
      );
      setChanged(new Set(INITIAL.map((s) => s.ticker)));
      setTimeout(() => setChanged(new Set()), 400);
    }, 1800);
    return () => clearInterval(id);
  }, []);

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
          fontSize: 9,
          opacity: 0.45,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Live Prices
      </div>
      {stocks.map((s) => {
        const flash = changed.has(s.ticker);
        return (
          <div
            key={s.ticker}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              transition: "background 0.2s",
              background: flash ? "rgba(255,255,255,0.04)" : "transparent",
              borderRadius: 4,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, minWidth: 32 }}>{s.ticker}</div>
            <div
              style={{
                fontSize: 11,
                fontVariantNumeric: "tabular-nums",
                flex: 1,
                textAlign: "center",
              }}
            >
              ${fmtPrice(s.price)}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: s.change >= 0 ? "#4ade80" : "#f87171",
                minWidth: 48,
                textAlign: "right",
              }}
            >
              {s.change >= 0 ? "+" : ""}
              {s.change.toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
