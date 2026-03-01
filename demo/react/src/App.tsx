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
        <ChildParticle
          id="profile"
          x={300}
          y={300}
          radius={70}
          anchorForce={0.04}
          mouseInfluence={0.08}
        >
          <div style={cardStyle}>
            <div style={{ fontSize: 28 }}>A</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Profile</div>
          </div>
        </ChildParticle>

        <GlassChildParticle
          id="stats"
          x={600}
          y={250}
          radius={80}
          anchorForce={0.03}
          mouseInfluence={0.12}
        >
          <div style={cardStyle}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>42k</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Users</div>
          </div>
        </GlassChildParticle>

        <ChildParticle
          id="settings"
          x={900}
          y={350}
          radius={55}
          anchorForce={0.06}
          mouseInfluence={0.05}
        >
          <div style={cardStyle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <div style={{ fontSize: 10, marginTop: 2 }}>Settings</div>
          </div>
        </ChildParticle>

        <GlassChildParticle
          id="notification"
          x={450}
          y={500}
          radius={60}
          anchorForce={0.05}
          mouseInfluence={0.15}
        >
          <div style={cardStyle}>
            <div style={{ fontSize: 20 }}>3</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Alerts</div>
          </div>
        </GlassChildParticle>

        <ChildParticle
          id="search"
          x={750}
          y={500}
          radius={50}
          anchorForce={0.07}
          mouseInfluence={0.06}
        >
          <div style={cardStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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
        Child Particles Demo &mdash; UI components floating in the particle system
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
