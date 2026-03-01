import { useState } from "react";

export type WidgetType =
  | "clock"
  | "counter"
  | "chart"
  | "ticker"
  | "ring"
  | "player";

export interface ChildParticleDef {
  id: string;
  widgetType: WidgetType;
  x: number;
  y: number;
  radius: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  glass: boolean;
  anchorForce: number;
  mouseInfluence: number;
  overflow?: string;
}

/** A configured widget ready to be placed — position chosen by clicking canvas. */
export type PendingPlacement = Omit<ChildParticleDef, "x" | "y">;

interface WidgetPreset {
  label: string;
  emoji: string;
  defaults: Partial<ChildParticleDef>;
}

export const WIDGET_PRESETS: Record<WidgetType, WidgetPreset> = {
  clock: {
    label: "Clock",
    emoji: "🕐",
    defaults: { radius: 65, glass: true, anchorForce: 0.04, mouseInfluence: 0.09 },
  },
  counter: {
    label: "Counter",
    emoji: "📊",
    defaults: {
      radius: 100, width: 200, height: 100, borderRadius: 18,
      glass: true, anchorForce: 0.03, mouseInfluence: 0.1,
    },
  },
  chart: {
    label: "Chart",
    emoji: "📈",
    defaults: {
      radius: 110, width: 200, height: 130, borderRadius: 18,
      glass: true, anchorForce: 0.03, mouseInfluence: 0.08,
    },
  },
  ticker: {
    label: "Ticker",
    emoji: "💹",
    defaults: {
      radius: 100, width: 190, height: 170, borderRadius: 16,
      glass: false, anchorForce: 0.04, mouseInfluence: 0.06, overflow: "hidden",
    },
  },
  ring: {
    label: "Progress Ring",
    emoji: "⭕",
    defaults: { radius: 55, glass: true, anchorForce: 0.05, mouseInfluence: 0.12 },
  },
  player: {
    label: "Music Player",
    emoji: "🎵",
    defaults: {
      radius: 80, width: 280, height: 65, borderRadius: 33,
      glass: true, anchorForce: 0.04, mouseInfluence: 0.08,
    },
  },
};

let nextId = 100;
function makeId() {
  return `widget-${nextId++}`;
}

interface AddFormProps {
  onStartPlacement: (pending: PendingPlacement) => void;
}

function AddForm({ onStartPlacement }: AddFormProps) {
  const [type, setType] = useState<WidgetType>("clock");
  const [glass, setGlass] = useState(true);
  const [anchorForce, setAnchorForce] = useState(0.04);
  const [mouseInfluence, setMouseInfluence] = useState(0.09);

  const preset = WIDGET_PRESETS[type];

  const handlePlace = () => {
    onStartPlacement({
      id: makeId(),
      widgetType: type,
      radius: (preset.defaults.radius as number) ?? 60,
      width: preset.defaults.width,
      height: preset.defaults.height,
      borderRadius: preset.defaults.borderRadius,
      overflow: preset.defaults.overflow,
      glass,
      anchorForce,
      mouseInfluence,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Widget type grid */}
      <div>
        <label style={labelStyle}>Widget Type</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5 }}>
          {(Object.entries(WIDGET_PRESETS) as [WidgetType, WidgetPreset][]).map(
            ([key, p]) => (
              <button
                key={key}
                onClick={() => {
                  setType(key);
                  const d = p.defaults;
                  setGlass(d.glass ?? true);
                  setAnchorForce(d.anchorForce ?? 0.04);
                  setMouseInfluence(d.mouseInfluence ?? 0.09);
                }}
                style={{
                  ...chipStyle,
                  background:
                    type === key
                      ? "rgba(99,102,241,0.6)"
                      : "rgba(255,255,255,0.05)",
                  border:
                    type === key
                      ? "1px solid rgba(99,102,241,0.9)"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: type === key ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                {p.emoji} {p.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Glass toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={labelStyle}>Liquid Glass</label>
        <div
          role="switch"
          aria-checked={glass}
          onClick={() => setGlass((g) => !g)}
          style={{
            width: 38, height: 20, borderRadius: 10,
            background: glass ? "#6366f1" : "rgba(255,255,255,0.12)",
            cursor: "pointer", position: "relative", transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute", top: 2, left: glass ? 20 : 2,
              width: 16, height: 16, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s",
            }}
          />
        </div>
      </div>

      {/* Sliders */}
      <SliderRow
        label="Anchor Force"
        value={anchorForce}
        min={0.01} max={0.15} step={0.01}
        onChange={setAnchorForce}
      />
      <SliderRow
        label="Mouse Influence"
        value={mouseInfluence}
        min={0} max={0.3} step={0.01}
        onChange={setMouseInfluence}
      />

      {/* Place button */}
      <button onClick={handlePlace} style={placeBtnStyle}>
        {preset.emoji} Place on canvas
        <span style={{ marginLeft: 4, opacity: 0.7 }}>→</span>
      </button>
      <div
        style={{
          fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center",
          marginTop: -4,
        }}
      >
        Click anywhere on the canvas to position it
      </div>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <label style={labelStyle}>{label}</label>
        <span style={{ ...labelStyle, color: "rgba(255,255,255,0.55)" }}>
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#6366f1" }}
      />
    </div>
  );
}

interface ChildBuilderProps {
  particles: ChildParticleDef[];
  onStartPlacement: (pending: PendingPlacement) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function ChildBuilder({
  particles,
  onStartPlacement,
  onRemove,
  disabled,
}: ChildBuilderProps) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          padding: "9px 15px",
          background: open ? "rgba(99,102,241,0.85)" : "rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          border: open
            ? "1px solid rgba(99,102,241,0.7)"
            : "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          color: disabled ? "rgba(255,255,255,0.3)" : "#fff",
          fontSize: 12,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          zIndex: 1002,
          fontFamily: "'Inter', system-ui, sans-serif",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ fontSize: 14 }}>✦</span> Builder
        {particles.length > 0 && (
          <span
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: "1px 7px",
              fontSize: 11,
            }}
          >
            {particles.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && !disabled && (
        <div
          style={{
            position: "fixed",
            bottom: 64,
            left: 20,
            width: 300,
            maxHeight: "72vh",
            background: "rgba(8,8,16,0.94)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            zIndex: 1002,
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Inter', system-ui, sans-serif",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "13px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
              Child Particle Builder
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
              {particles.length} active
            </div>
          </div>

          <div
            style={{
              overflowY: "auto",
              flex: 1,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {/* Active list */}
            {particles.length === 0 ? (
              <div
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 12,
                  textAlign: "center",
                  padding: "8px 0",
                }}
              >
                No widgets yet — add one below.
              </div>
            ) : (
              particles.map((p) => {
                const preset = WIDGET_PRESETS[p.widgetType];
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 10px",
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 9,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{preset.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
                        {preset.label}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>
                        {Math.round(p.x)}, {Math.round(p.y)}
                        {p.glass ? " · glass" : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(p.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,100,100,0.55)",
                        cursor: "pointer",
                        fontSize: 18,
                        padding: "0 2px",
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "3px 0" }} />

            {/* Add toggle */}
            <button
              onClick={() => setShowForm((s) => !s)}
              style={{
                ...chipStyle,
                justifyContent: "center",
                padding: "8px",
                width: "100%",
                background: showForm
                  ? "rgba(99,102,241,0.18)"
                  : "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {showForm ? "▲ Collapse" : "+ Add Widget"}
            </button>

            {showForm && (
              <AddForm
                onStartPlacement={(pending) => {
                  onStartPlacement(pending);
                  setShowForm(false);
                  setOpen(false);
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.4)",
  fontWeight: 500,
};

const chipStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 9px",
  borderRadius: 7,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: "all 0.15s ease",
  border: "1px solid transparent",
};

const placeBtnStyle: React.CSSProperties = {
  padding: "9px 0",
  background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: "opacity 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};
