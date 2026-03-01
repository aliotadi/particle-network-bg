import { useEffect, useMemo, useRef, useState } from "react";
import {
  ParticleNetwork,
  type ParticleNetworkConfig,
} from "particle-network-bg";
import {
  ParticleNetworkBg,
  ChildParticle,
  GlassChildParticle,
} from "particle-network-bg/react";
import { SettingsPanel } from "./SettingsPanel";
import {
  ChildBuilder,
  WIDGET_PRESETS,
  type ChildParticleDef,
  type PendingPlacement,
  type WidgetType,
} from "./ChildBuilder";
import {
  ClockWidget,
  CounterWidget,
  MiniChartWidget,
  StockTickerWidget,
  ProgressRingWidget,
  MusicPlayerWidget,
} from "./widgets";

// ─── Shared config ──────────────────────────────────────────────────────────

const DEFAULT_CONFIG: Partial<ParticleNetworkConfig> = {
  particleCount: 100,
  minRadius: 2,
  maxRadius: 6,
  particleColor: "#a1a1aa",
  lineColor: "#71717a",
  lineWidth: 1,
  lineOpacity: 0.2,
  maxDistance: 150,
  moveSpeed: 1,
  backgroundColor: "#0f0f14",
  backgroundOpacity: 1,
  particleOpacity: 1,
  mouseRadius: 200,
  mouseInteraction: true,
  pulseEnabled: true,
  pulseSpeed: 0,
  depthEffectEnabled: true,
  depthSpeed: 0.02,
  gradientEnabled: true,
  gradientType: "linear",
  gradientColors: ["#667eea", "#764ba2", "#f093fb"],
  gradientSpeed: 0.02,
  gradientMouseReaction: true,
  gradientMouseInfluence: 0.5,
  gradientAngle: 0,
  gradientRadius: 1,
  gradientSpin: false,
  gradientDithering: true,
  gradientSmoothStops: 4,
  gradientFlowAngle: 45,
  gradientOrbitRadius: 0.3,
  liquidGlassPercentage: 40,
  liquidGlass: {
    color: "#88ccff",
    opacity: 0.6,
    shadowStrength: 0.4,
    minRadius: 20,
    maxRadius: 40,
  },
};

type DemoMode = "classic" | "children";

// ─── Default child particle layout ──────────────────────────────────────────

const DEFAULT_PARTICLES: ChildParticleDef[] = [
  {
    id: "clock",
    widgetType: "clock",
    x: 160, y: 210,
    radius: 65,
    glass: true, anchorForce: 0.04, mouseInfluence: 0.09,
  },
  {
    id: "counter",
    widgetType: "counter",
    x: 430, y: 205,
    radius: 100, width: 200, height: 100, borderRadius: 18,
    glass: true, anchorForce: 0.03, mouseInfluence: 0.1,
  },
  {
    id: "chart",
    widgetType: "chart",
    x: 730, y: 225,
    radius: 110, width: 200, height: 130, borderRadius: 18,
    glass: true, anchorForce: 0.03, mouseInfluence: 0.08,
  },
  {
    id: "ring",
    widgetType: "ring",
    x: 255, y: 435,
    radius: 55,
    glass: true, anchorForce: 0.05, mouseInfluence: 0.12,
  },
  {
    id: "player",
    widgetType: "player",
    x: 590, y: 445,
    radius: 80, width: 280, height: 65, borderRadius: 33,
    glass: true, anchorForce: 0.04, mouseInfluence: 0.08,
  },
  {
    id: "ticker",
    widgetType: "ticker",
    x: 930, y: 415,
    radius: 100, width: 190, height: 170, borderRadius: 16,
    glass: false, anchorForce: 0.04, mouseInfluence: 0.06, overflow: "hidden",
  },
];

function renderWidget(type: WidgetType) {
  switch (type) {
    case "clock":   return <ClockWidget />;
    case "counter": return <CounterWidget />;
    case "chart":   return <MiniChartWidget />;
    case "ticker":  return <StockTickerWidget />;
    case "ring":    return <ProgressRingWidget />;
    case "player":  return <MusicPlayerWidget />;
  }
}

// ─── Top navigation bar ──────────────────────────────────────────────────────

interface TopBarProps {
  mode: DemoMode;
  onModeChange: (m: DemoMode) => void;
  /** Right-side slot — differs per mode */
  rightContent: React.ReactNode;
}

function TopBar({ mode, onModeChange, rightContent }: TopBarProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        background: "rgba(8,8,16,0.72)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        zIndex: 1100,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          color: "rgba(255,255,255,0.9)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 0.2,
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        <span style={{ color: "#818cf8", fontSize: 16 }}>✦</span>
        Particle Network
      </div>

      {/* Mode tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: 3,
        }}
      >
        {(["classic", "children"] as DemoMode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              style={{
                padding: "5px 16px",
                borderRadius: 7,
                border: "none",
                background: active ? "rgba(99,102,241,0.85)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: "all 0.18s ease",
                letterSpacing: 0.1,
              }}
            >
              {m === "classic" ? "Classic" : "Widgets"}
            </button>
          );
        })}
      </div>

      {/* Right slot */}
      <div style={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
        {rightContent}
      </div>
    </div>
  );
}

// ─── Canvas click-to-place overlay ───────────────────────────────────────────

interface PlacementOverlayProps {
  pending: PendingPlacement;
  onPlace: (x: number, y: number) => void;
  onCancel: () => void;
}

function PlacementOverlay({ pending, onPlace, onCancel }: PlacementOverlayProps) {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const preset = WIDGET_PRESETS[pending.widgetType];
  const isRect = pending.width != null && pending.height != null;
  const w = isRect ? pending.width! : pending.radius * 2;
  const h = isRect ? pending.height! : pending.radius * 2;
  const br = isRect ? (pending.borderRadius ?? 12) : pending.radius;

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        cursor: "crosshair",
      }}
      onClick={() => onPlace(pos.x, pos.y)}
    >
      {/* Ghost preview */}
      <div
        style={{
          position: "absolute",
          left: pos.x - w / 2,
          top: pos.y - h / 2,
          width: w,
          height: h,
          borderRadius: br,
          background: "rgba(99,102,241,0.18)",
          border: "2px dashed rgba(139,92,246,0.85)",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          transition: "left 0.05s linear, top 0.05s linear",
          boxShadow: "0 0 0 4px rgba(99,102,241,0.1)",
        }}
      >
        <span style={{ fontSize: Math.min(w, h) > 80 ? 22 : 14 }}>
          {preset.emoji}
        </span>
        {Math.min(w, h) > 60 && (
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.65)",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            {preset.label}
          </span>
        )}
      </div>

      {/* Coordinates tooltip */}
      <div
        style={{
          position: "absolute",
          left: pos.x + w / 2 + 12,
          top: pos.y - 16,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 6,
          padding: "4px 9px",
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
          fontFamily: "monospace",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {Math.round(pos.x)}, {Math.round(pos.y)}
      </div>

      {/* Instruction hint */}
      <div
        style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 9,
          color: "#fff",
          padding: "8px 18px",
          fontSize: 12,
          fontFamily: "'Inter', system-ui, sans-serif",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span>Click to place <strong style={{ color: "#a5b4fc" }}>{preset.label}</strong></span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
        <span style={{ color: "rgba(255,255,255,0.45)" }}>ESC to cancel</span>
      </div>
    </div>
  );
}

// ─── Root app ────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<DemoMode>("children");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleModeChange = (m: DemoMode) => {
    setMode(m);
    setEditMode(false);
    setSettingsOpen(m === "classic"); // auto-open settings on classic
  };

  const rightContent =
    mode === "classic" ? (
      <button
        onClick={() => setSettingsOpen((o) => !o)}
        style={{
          ...iconBtnStyle,
          ...(settingsOpen && { background: "rgba(99,102,241,0.7)", borderColor: "#6366f1" }),
        }}
        aria-label="Toggle settings"
      >
        <SettingsIcon active={settingsOpen} />
        <span style={{ fontSize: 12, fontWeight: settingsOpen ? 700 : 500 }}>
          Settings
        </span>
      </button>
    ) : (
      <button
        onClick={() => setEditMode((o) => !o)}
        style={{
          ...iconBtnStyle,
          ...(editMode && { background: "rgba(251,146,60,0.25)", borderColor: "rgba(251,146,60,0.7)", color: "#fb923c" }),
        }}
        aria-label="Toggle edit mode"
      >
        <span style={{ fontSize: 13 }}>{editMode ? "✓" : "✎"}</span>
        <span style={{ fontSize: 12, fontWeight: editMode ? 700 : 500 }}>
          {editMode ? "Done" : "Edit"}
        </span>
      </button>
    );

  return (
    <>
      <TopBar mode={mode} onModeChange={handleModeChange} rightContent={rightContent} />

      {mode === "classic" ? (
        <ClassicDemo
          settingsOpen={settingsOpen}
          onSettingsToggle={() => setSettingsOpen((o) => !o)}
          onSettingsClose={() => setSettingsOpen(false)}
        />
      ) : (
        <ChildrenDemo editMode={editMode} />
      )}
    </>
  );
}

// ─── Classic demo ─────────────────────────────────────────────────────────────

interface ClassicDemoProps {
  settingsOpen: boolean;
  onSettingsToggle: () => void;
  onSettingsClose: () => void;
}

function ClassicDemo({ settingsOpen, onSettingsClose }: ClassicDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<ParticleNetwork | null>(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = new ParticleNetwork(canvas, config);
    instanceRef.current = instance;
    instance.start();
    return () => {
      instance.cleanup();
      instanceRef.current = null;
    };
  }, []);

  const updateConfig = (key: keyof ParticleNetworkConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    instanceRef.current?.updateConfig(key, value as never);
  };

  const copyJson = async () => {
    const json = JSON.stringify(instanceRef.current?.config ?? config, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100vh" }}
      />
      <SettingsPanel
        config={config}
        onConfigChange={updateConfig}
        onCopyJson={copyJson}
        copyFeedback={copied}
        open={settingsOpen}
        onClose={onSettingsClose}
      />
    </>
  );
}

// ─── Children / Widgets demo ──────────────────────────────────────────────────

interface ChildrenDemoProps {
  editMode: boolean;
}

function ChildrenDemo({ editMode }: ChildrenDemoProps) {
  const config = useMemo(() => DEFAULT_CONFIG, []);
  const [particles, setParticles] = useState<ChildParticleDef[]>(DEFAULT_PARTICLES);
  const [pendingPlacement, setPendingPlacement] = useState<PendingPlacement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragSavedForce = useRef<number>(0.04);

  const handleDragStart = (e: React.MouseEvent, particleId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const p = particles.find((x) => x.id === particleId);
    if (!p) return;

    dragSavedForce.current = p.anchorForce;
    setDraggingId(particleId);

    // Snap strongly to cursor while dragging
    setParticles((prev) =>
      prev.map((x) => (x.id === particleId ? { ...x, anchorForce: 0.65 } : x))
    );

    const onMove = (ev: MouseEvent) => {
      setParticles((prev) =>
        prev.map((x) =>
          x.id === particleId ? { ...x, x: ev.clientX, y: ev.clientY } : x
        )
      );
    };

    const onUp = () => {
      setDraggingId(null);
      setParticles((prev) =>
        prev.map((x) =>
          x.id === particleId
            ? { ...x, anchorForce: dragSavedForce.current }
            : x
        )
      );
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handlePlace = (x: number, y: number) => {
    if (!pendingPlacement) return;
    setParticles((prev) => [...prev, { ...pendingPlacement, x, y }]);
    setPendingPlacement(null);
  };

  return (
    <>
      {/* Edit mode banner */}
      {editMode && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(251,146,60,0.15)",
            border: "1px solid rgba(251,146,60,0.4)",
            borderRadius: 8,
            padding: "6px 16px",
            fontSize: 11,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "rgba(251,146,60,0.9)",
            fontWeight: 600,
            zIndex: 1050,
            pointerEvents: "none",
            letterSpacing: 0.3,
          }}
        >
          ✎ Edit mode — drag widgets to reposition · click Done when finished
        </div>
      )}

      <ParticleNetworkBg
        config={config}
        style={{ display: "block", width: "100%", height: "100vh" }}
      >
        {particles.map((p) => {
          const isRect = p.width != null && p.height != null;
          const Wrapper = p.glass ? GlassChildParticle : ChildParticle;
          const isDraggingThis = draggingId === p.id;

          const wrapperStyle: React.CSSProperties = p.glass
            ? {}
            : {
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(14px)",
              };

          return (
            <Wrapper
              key={p.id}
              id={p.id}
              x={p.x}
              y={p.y}
              radius={p.radius}
              width={isRect ? p.width : undefined}
              height={isRect ? p.height : undefined}
              borderRadius={isRect ? p.borderRadius : undefined}
              anchorForce={p.anchorForce}
              mouseInfluence={p.mouseInfluence}
              overflow={p.overflow}
              style={p.glass ? undefined : wrapperStyle}
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                {renderWidget(p.widgetType)}

                {/* Drag overlay — only in edit mode */}
                {editMode && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "inherit",
                      background: isDraggingThis
                        ? "rgba(251,146,60,0.35)"
                        : "rgba(251,146,60,0.18)",
                      cursor: isDraggingThis ? "grabbing" : "grab",
                      zIndex: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      transition: "background 0.15s ease",
                    }}
                    onMouseDown={(e) => handleDragStart(e, p.id)}
                  >
                    <span style={{ fontSize: 18, pointerEvents: "none" }}>
                      {WIDGET_PRESETS[p.widgetType].emoji}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 600,
                        pointerEvents: "none",
                        letterSpacing: 0.3,
                        textTransform: "uppercase",
                      }}
                    >
                      {isDraggingThis ? "dropping…" : "drag to move"}
                    </span>
                  </div>
                )}
              </div>
            </Wrapper>
          );
        })}
      </ParticleNetworkBg>

      {/* Placement overlay */}
      {pendingPlacement && (
        <PlacementOverlay
          pending={pendingPlacement}
          onPlace={handlePlace}
          onCancel={() => setPendingPlacement(null)}
        />
      )}

      {/* Builder panel (hidden while in placement or edit mode) */}
      <ChildBuilder
        particles={particles}
        onStartPlacement={setPendingPlacement}
        onRemove={(id) => setParticles((prev) => prev.filter((p) => p.id !== id))}
        disabled={editMode || pendingPlacement != null}
      />
    </>
  );
}

// ─── Shared styles & icons ────────────────────────────────────────────────────

const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 13px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "rgba(255,255,255,0.85)",
  cursor: "pointer",
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: "all 0.2s ease",
};

function SettingsIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#fff" : "currentColor"}
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
