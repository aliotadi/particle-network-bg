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

export default function App() {
  const [mode, setMode] = useState<DemoMode>("children");

  return mode === "classic" ? (
    <ClassicDemo onModeChange={setMode} />
  ) : (
    <ChildrenDemo onModeChange={setMode} />
  );
}

function ChildrenDemo({ onModeChange }: { onModeChange: (m: DemoMode) => void }) {
  const config = useMemo(() => DEFAULT_CONFIG, []);

  return (
    <>
      <ParticleNetworkBg
        config={config}
        style={{ display: "block", width: "100%", height: "100vh" }}
      >
        {/* Circular child particle */}
        <ChildParticle
          id="profile"
          x={200}
          y={250}
          radius={55}
          anchorForce={0.04}
          mouseInfluence={0.08}
        >
          <div style={cardStyle}>
            <div style={{ fontSize: 26 }}>A</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>Profile</div>
          </div>
        </ChildParticle>

        {/* Rectangular glass card */}
        <GlassChildParticle
          id="stats-card"
          x={500}
          y={220}
          radius={100}
          width={220}
          height={120}
          borderRadius={20}
          anchorForce={0.03}
          mouseInfluence={0.1}
        >
          <div style={{ ...cardStyle, gap: 4 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>42,891</div>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1 }}>ACTIVE USERS</div>
          </div>
        </GlassChildParticle>

        {/* Rectangular normal card with overflow scroll */}
        <ChildParticle
          id="feed"
          x={850}
          y={260}
          radius={90}
          width={200}
          height={160}
          borderRadius={16}
          overflow="auto"
          anchorForce={0.04}
          mouseInfluence={0.06}
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
        >
          <div style={{ padding: 14, color: "#fff", fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Activity Feed</div>
            <div style={{ opacity: 0.7 }}>Alice joined the team</div>
            <div style={{ opacity: 0.7 }}>Bob deployed v2.4.1</div>
            <div style={{ opacity: 0.7 }}>Carol fixed issue #128</div>
            <div style={{ opacity: 0.7 }}>Dave merged PR #42</div>
            <div style={{ opacity: 0.7 }}>Eve updated docs</div>
          </div>
        </ChildParticle>

        {/* Circular glass particle */}
        <GlassChildParticle
          id="notification"
          x={350}
          y={450}
          radius={50}
          anchorForce={0.05}
          mouseInfluence={0.12}
        >
          <div style={cardStyle}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>3</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>Alerts</div>
          </div>
        </GlassChildParticle>

        {/* Wide rectangular glass card */}
        <GlassChildParticle
          id="nav-bar"
          x={650}
          y={460}
          radius={80}
          width={280}
          height={60}
          borderRadius={30}
          anchorForce={0.04}
          mouseInfluence={0.08}
        >
          <div style={{ display: "flex", gap: 24, color: "#fff", fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>
            <span style={{ opacity: 1 }}>Home</span>
            <span style={{ opacity: 0.6 }}>Explore</span>
            <span style={{ opacity: 0.6 }}>Settings</span>
            <span style={{ opacity: 0.6 }}>About</span>
          </div>
        </GlassChildParticle>

        {/* Small circular icon */}
        <ChildParticle
          id="search"
          x={150}
          y={480}
          radius={35}
          anchorForce={0.06}
          mouseInfluence={0.06}
        >
          <div style={cardStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </ChildParticle>
      </ParticleNetworkBg>

      <button onClick={() => onModeChange("classic")} style={modeToggleStyle}>
        Classic Demo
      </button>

      <div style={labelStyle}>
        Child Particles &mdash; circles, glass rectangles, scrollable cards
      </div>
    </>
  );
}

function ClassicDemo({ onModeChange }: { onModeChange: (m: DemoMode) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<ParticleNetwork | null>(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [panelOpen, setPanelOpen] = useState(true);
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

      <button
        onClick={() => setPanelOpen((p) => !p)}
        style={{
          ...toggleStyle,
          ...(panelOpen && {
            background: "#6366f1",
            borderColor: "#6366f1",
            color: "#fff",
          }),
        }}
        aria-label="Toggle settings"
      >
        <SettingsIcon />
      </button>

      <SettingsPanel
        config={config}
        onConfigChange={updateConfig}
        onCopyJson={copyJson}
        copyFeedback={copied}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />

      <button onClick={() => onModeChange("children")} style={modeToggleStyle}>
        Child Particles Demo
      </button>
    </>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontFamily: "'Inter', system-ui, sans-serif",
  textAlign: "center",
  userSelect: "none",
};

const modeToggleStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  padding: "10px 18px",
  background: "rgba(99, 102, 241, 0.9)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 10,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  zIndex: 1001,
  transition: "all 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  left: 20,
  color: "rgba(255,255,255,0.5)",
  fontSize: 12,
  fontFamily: "'Inter', system-ui, sans-serif",
  zIndex: 1001,
};

const toggleStyle: React.CSSProperties = {
  position: "fixed",
  top: 20,
  right: 20,
  width: 44,
  height: 44,
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.9)",
  zIndex: 1001,
  transition: "all 0.2s ease",
};

function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
