import type { ParticleNetworkConfig } from "particle-network-bg";

interface SettingsPanelProps {
  config: Partial<ParticleNetworkConfig>;
  onConfigChange: (key: keyof ParticleNetworkConfig, value: unknown) => void;
  onCopyJson: () => void;
  copyFeedback?: boolean;
  open: boolean;
  onClose: () => void;
}

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
  gradientSpin: false,
  gradientFlowAngle: 45,
  gradientOrbitRadius: 0.3,
};

export function SettingsPanel({
  config,
  onConfigChange,
  onCopyJson,
  copyFeedback = false,
  open,
  onClose,
}: SettingsPanelProps) {
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    right: 0,
    width: 340,
    maxHeight: "100%",
    background: "rgba(15, 15, 20, 0.95)",
    backdropFilter: "blur(20px)",
    borderLeft: "1px solid rgba(255,255,255,0.08)",
    transform: open ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1000,
    overflowY: "auto",
  };

  return (
    <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 500, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>Settings</h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            color: "rgba(255,255,255,0.5)",
            borderRadius: 8,
          }}
        >
          <CloseIcon />
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <ControlGroup title="Background">
          <ColorControl
            label="Color"
            color={config.backgroundColor ?? "#ffffff"}
            opacity={config.backgroundOpacity ?? 1}
            onColorChange={(c) => onConfigChange("backgroundColor", c)}
            onOpacityChange={(o) => onConfigChange("backgroundOpacity", o)}
          />
        </ControlGroup>

        <ControlGroup title="Particles">
          <Slider
            label="Count"
            value={config.particleCount ?? 100}
            min={10}
            max={300}
            onChange={(v) => onConfigChange("particleCount", v)}
          />
          <Slider
            label="Speed"
            value={config.moveSpeed ?? 1}
            min={0.1}
            max={2}
            step={0.001}
            onChange={(v) => onConfigChange("moveSpeed", v)}
          />
          <DualSlider
            label="Size Range"
            minVal={config.minRadius ?? 2}
            maxVal={config.maxRadius ?? 6}
            min={0.5}
            max={10}
            step={0.1}
            onChange={(min, max) => {
              onConfigChange("minRadius", min);
              onConfigChange("maxRadius", max);
            }}
          />
          <ColorControl
            label="Color"
            color={config.particleColor ?? "#000000"}
            opacity={config.particleOpacity ?? 1}
            onColorChange={(c) => onConfigChange("particleColor", c)}
            onOpacityChange={(o) => onConfigChange("particleOpacity", o)}
          />
        </ControlGroup>

        <ControlGroup title="Connections">
          <Slider
            label="Distance"
            value={config.maxDistance ?? 150}
            min={50}
            max={300}
            onChange={(v) => onConfigChange("maxDistance", v)}
          />
          <Slider
            label="Width"
            value={config.lineWidth ?? 1}
            min={0.5}
            max={5}
            step={0.5}
            onChange={(v) => onConfigChange("lineWidth", v)}
          />
          <ColorControl
            label="Color"
            color={config.lineColor ?? "#000000"}
            opacity={config.lineOpacity ?? 0.2}
            onColorChange={(c) => onConfigChange("lineColor", c)}
            onOpacityChange={(o) => onConfigChange("lineOpacity", o)}
          />
        </ControlGroup>

        <ControlGroup title="Effects">
          <Slider
            label="Mouse Radius"
            value={config.mouseRadius ?? 200}
            min={50}
            max={400}
            onChange={(v) => onConfigChange("mouseRadius", v)}
          />
          <Slider
            label="Pulse Speed"
            value={config.pulseSpeed ?? 0}
            min={0}
            max={0.2}
            step={0.001}
            format={(v) => Math.round((v / 0.2) * 100) + "%"}
            onChange={(v) => onConfigChange("pulseSpeed", v)}
          />
          <Slider
            label="Depth Speed"
            value={config.depthSpeed ?? 0.02}
            min={0.005}
            max={0.08}
            step={0.001}
            onChange={(v) => onConfigChange("depthSpeed", v)}
          />
          <Toggle
            label="Mouse Interaction"
            checked={config.mouseInteraction ?? true}
            onChange={(v) => onConfigChange("mouseInteraction", v)}
          />
          <Toggle
            label="Pulse Animation"
            checked={config.pulseEnabled ?? true}
            onChange={(v) => onConfigChange("pulseEnabled", v)}
          />
          <Toggle
            label="3D Depth Effect"
            checked={config.depthEffectEnabled ?? true}
            onChange={(v) => onConfigChange("depthEffectEnabled", v)}
          />
        </ControlGroup>

        <ControlGroup title="Gradient">
          <Toggle
            label="Enable Gradient"
            checked={config.gradientEnabled ?? false}
            onChange={(v) => onConfigChange("gradientEnabled", v)}
          />
          {config.gradientType === "radial" && (
            <Toggle
              label="Mouse Reaction"
              checked={config.gradientMouseReaction ?? true}
              onChange={(v) => onConfigChange("gradientMouseReaction", v)}
            />
          )}
          <Toggle
            label="Spin (rotate)"
            checked={config.gradientSpin ?? false}
            onChange={(v) => onConfigChange("gradientSpin", v)}
          />
          <Slider
            label="Flow Angle"
            value={config.gradientFlowAngle ?? 45}
            min={0}
            max={360}
            format={(v) => Math.round(v) + "°"}
            onChange={(v) => onConfigChange("gradientFlowAngle", v)}
          />
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Type</label>
            <select
              value={config.gradientType ?? "linear"}
              onChange={(e) =>
                onConfigChange("gradientType", e.target.value as "linear" | "radial")
              }
            style={{
              width: "100%",
              padding: "10px 36px 10px 12px",
              background: "rgba(30, 30, 40, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#fff",
              appearance: "none",
              WebkitAppearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1aa' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Colors</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="color"
                  value={config.gradientColors?.[i] ?? "#667eea"}
                  onChange={(e) => {
                    const colors = [...(config.gradientColors ?? ["#667eea", "#764ba2", "#f093fb"])];
                    colors[i] = e.target.value;
                    onConfigChange("gradientColors", colors);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    padding: 2,
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
          <Slider
            label="Speed"
            value={config.gradientSpeed ?? 0.02}
            min={0.001}
            max={0.1}
            step={0.001}
            onChange={(v) => onConfigChange("gradientSpeed", v)}
          />
          {config.gradientType === "radial" && (
            <Slider
              label="Mouse Influence"
              value={config.gradientMouseInfluence ?? 0.5}
              min={0}
              max={1}
              step={0.1}
              onChange={(v) => onConfigChange("gradientMouseInfluence", v)}
            />
          )}
        </ControlGroup>
      </div>

      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={() => {
            Object.entries(DEFAULT_CONFIG).forEach(([k, v]) =>
              onConfigChange(k as keyof ParticleNetworkConfig, v as never)
            );
          }}
          style={btnStyle}
        >
          Reset
        </button>
        <button
          onClick={() => {
            const count = Math.floor(Math.random() * 200) + 50;
            const c = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
            onConfigChange("particleCount", count);
            onConfigChange("particleColor", c);
            onConfigChange("lineColor", c);
            onConfigChange("minRadius", Math.random() * 4 + 1);
            onConfigChange("maxRadius", Math.random() * 6 + 4);
            onConfigChange("maxDistance", Math.random() * 200 + 100);
            onConfigChange("moveSpeed", Math.random() * 1.5 + 0.2);
            onConfigChange("mouseRadius", Math.random() * 200 + 100);
            onConfigChange("pulseSpeed", Math.random() * 0.2);
            onConfigChange("depthSpeed", Math.random() * 0.06 + 0.01);
            onConfigChange("lineOpacity", Math.random() * 0.8 + 0.1);
            onConfigChange("particleOpacity", Math.random() * 0.5 + 0.5);
          }}
          style={{ ...btnStyle, background: "#6366f1", color: "#fff", borderColor: "#6366f1" }}
        >
          Randomize
        </button>
        <button
          onClick={onCopyJson}
          style={{ ...btnStyle, background: "rgba(34, 197, 94, 0.2)", color: "#22c55e", borderColor: "rgba(34, 197, 94, 0.3)" }}
        >
          {copyFeedback ? "Copied!" : "Copy JSON"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: "0.8rem",
  color: "rgba(255,255,255,0.5)",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.9)",
  borderRadius: 8,
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer",
};

function ControlGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: "0.7rem", fontWeight: 600, margin: "0 0 12px 0", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const display = format ? format(value) : value.toFixed(step < 1 ? 3 : 0);
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelStyle}>
        {label} <span style={{ float: "right", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>{display}</span>
      </label>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function DualSlider({
  label,
  minVal,
  maxVal,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  minVal: number;
  maxVal: number;
  min: number;
  max: number;
  step: number;
  onChange: (min: number, max: number) => void;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelStyle}>
        {label}{" "}
        <span style={{ float: "right", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
          {minVal} - {maxVal}
        </span>
      </label>
      <input
        type="range"
        value={minVal}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value), maxVal)}
        style={{ width: "100%", marginBottom: "0.25rem" }}
      />
      <input
        type="range"
        value={maxVal}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(minVal, parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function ColorControl({
  label,
  color,
  opacity,
  onColorChange,
  onOpacityChange,
}: {
  label: string;
  color: string;
  opacity: number;
  onColorChange: (c: string) => void;
  onOpacityChange: (o: number) => void;
}) {
  return (
    <>
      <div style={{ marginBottom: "0.5rem" }}>
        <label style={labelStyle}>{label}</label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            style={{
              width: 36,
              height: 36,
              padding: 2,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{6}$/.test(v) || /^[0-9A-Fa-f]{6}$/.test(v))
                onColorChange(v.startsWith("#") ? v : "#" + v);
            }}
            style={{
              flex: 1,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.9)",
            }}
          />
        </div>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>
          Opacity{" "}
          <span style={{ float: "right", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
            {Math.round(opacity * 100)}%
          </span>
        </label>
        <input
          type="range"
          value={opacity * 100}
          min={0}
          max={100}
          onChange={(e) => onOpacityChange(parseInt(e.target.value) / 100)}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
        marginBottom: "0.5rem",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: 36,
          height: 20,
          accentColor: "#6366f1",
        }}
      />
      <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.9)" }}>{label}</span>
    </label>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
