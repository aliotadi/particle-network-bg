import { useEffect, useRef, useState } from "react";
import {
  ParticleNetwork,
  type ParticleNetworkConfig,
} from "particle-network-bg";
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
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<ParticleNetwork | null>(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [panelOpen, setPanelOpen] = useState(false);
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
    </>
  );
}

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
