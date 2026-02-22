import { ParticleNetwork } from "particle-network-bg";

const DEFAULT_CONFIG = {
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

const canvas = document.getElementById("canvas");
const network = new ParticleNetwork(canvas, { ...DEFAULT_CONFIG });
network.start();

// Panel toggle
const controlToggle = document.getElementById("controlToggle");
const controlPanel = document.querySelector(".control-panel");
const closePanel = document.querySelector(".close-panel");

controlToggle.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  controlPanel.classList.toggle("active");
  controlToggle.classList.toggle("active");
});

closePanel.addEventListener("click", () => {
  controlPanel.classList.remove("active");
  controlToggle.classList.remove("active");
});

document.addEventListener("click", (e) => {
  if (!controlPanel.contains(e.target) && !controlToggle.contains(e.target)) {
    controlPanel.classList.remove("active");
    controlToggle.classList.remove("active");
  }
});

controlPanel.addEventListener("click", (e) => e.stopPropagation());

// Helpers
function updateValueDisplay(input) {
  const displays = input.parentElement.querySelectorAll(".value-display");
  displays.forEach((el) => {
    if (el.dataset.for && el.dataset.for !== input.id) return;
    if (!el.dataset.for && input.id !== "minRadius" && input.id !== "maxRadius") {
      let val = input.value;
      if (input.type === "range") {
        if (input.id.includes("Opacity")) val = Math.round(val) + "%";
        else if (input.id === "pulseSpeed") val = Math.round((val / 0.2) * 100) + "%";
        else if (input.id === "gradientFlowAngle") val = Math.round(parseFloat(val)) + "°";
        else val = parseFloat(val).toFixed(input.step?.includes(".") ? 3 : 0);
      }
      el.textContent = val;
    }
  });
  if (input.id === "minRadius" || input.id === "maxRadius") {
    const minEl = input.parentElement.querySelector('[data-for="minRadius"]');
    const maxEl = input.parentElement.querySelector('[data-for="maxRadius"]');
    if (minEl) minEl.textContent = document.getElementById("minRadius").value;
    if (maxEl) maxEl.textContent = document.getElementById("maxRadius").value;
  }
}

function validateHex(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3 || hex.length === 6) return "#" + hex;
  return null;
}

function updateColor(colorInput, opacityInput, prop) {
  const color = colorInput.value;
  const opacity = parseInt(opacityInput?.value || 100) / 100;
  if (prop === "backgroundColor") {
    network.updateConfig("backgroundColor", color);
    network.updateConfig("backgroundOpacity", opacity);
  } else if (prop === "particleColor") {
    network.updateConfig("particleColor", color);
    network.updateConfig("particleOpacity", opacity);
  } else if (prop === "lineColor") {
    network.updateConfig("lineColor", color);
    network.updateConfig("lineOpacity", opacity);
  }
}

// Color inputs
[
  { color: "backgroundColor", hex: "backgroundHex", opacity: "backgroundOpacity" },
  { color: "particleColor", hex: "particleHex", opacity: "particleOpacity" },
  { color: "lineColor", hex: "lineHex", opacity: "lineOpacity" },
].forEach(({ color, hex, opacity }) => {
  const colorInput = document.getElementById(color);
  const hexInput = document.getElementById(hex);
  const opacityInput = document.getElementById(opacity);

  colorInput.addEventListener("input", () => {
    hexInput.value = colorInput.value.toUpperCase();
    updateColor(colorInput, opacityInput, color);
  });

  hexInput.addEventListener("input", (e) => {
    const v = validateHex(e.target.value);
    if (v) {
      colorInput.value = v;
      hexInput.value = v.toUpperCase();
      updateColor(colorInput, opacityInput, color);
    }
  });

  opacityInput.addEventListener("input", () => {
    updateValueDisplay(opacityInput);
    updateColor(colorInput, opacityInput, color);
  });

  hexInput.addEventListener("blur", () => {
    const v = validateHex(hexInput.value);
    hexInput.value = v ? v.toUpperCase() : colorInput.value.toUpperCase();
  });
});

// Numeric & checkbox inputs
document.querySelectorAll("input").forEach((input) => {
  if (input.id.includes("Color") || input.id.includes("Hex") || input.id.includes("Opacity")) return;
  if (input.id.startsWith("gradientColor")) return;
  if (input.id === "gradientType") return;

  input.addEventListener("input", (e) => {
    let val = e.target.value;
    if (e.target.type === "range" || e.target.type === "number") val = parseFloat(val);
    if (e.target.type === "checkbox") val = e.target.checked;
    updateValueDisplay(e.target);
    const key = e.target.id;
    if (key in DEFAULT_CONFIG) network.updateConfig(key, val);
  });
});

// Show/hide radial-only controls based on gradient type
function updateGradientTypeUI(type) {
  const isRadial = type === "radial";
  document.getElementById("gradientMouseReactionRow").style.display = isRadial ? "" : "none";
  document.getElementById("gradientMouseInfluenceRow").style.display = isRadial ? "" : "none";
}

// Gradient type
document.getElementById("gradientType").addEventListener("change", (e) => {
  network.updateConfig("gradientType", e.target.value);
  updateGradientTypeUI(e.target.value);
});

// Gradient flow angle display
document.getElementById("gradientFlowAngle").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  updateValueDisplay(e.target);
  network.updateConfig("gradientFlowAngle", val);
});

// Gradient colors
[0, 1, 2].forEach((i) => {
  document.getElementById(`gradientColor${i}`).addEventListener("input", (e) => {
    const colors = [...network.config.gradientColors];
    colors[i] = e.target.value;
    if (colors.length < 3) colors.length = 3;
    network.updateConfig("gradientColors", colors);
  });
});

// Reset
document.getElementById("reset").addEventListener("click", () => {
  Object.entries(DEFAULT_CONFIG).forEach(([key, value]) => {
    const el = document.getElementById(key);
    if (!el) return;
    if (el.type === "range" || el.type === "number") {
      el.value = value;
      updateValueDisplay(el);
    }
    if (el.type === "checkbox") el.checked = value;
    if (el.type === "color") el.value = value;
    if (key === "gradientType") el.value = value;
    if (key === "gradientFlowAngle") {
      el.value = value;
      updateValueDisplay(el);
    }
  });
  document.getElementById("backgroundHex").value = DEFAULT_CONFIG.backgroundColor;
  document.getElementById("particleHex").value = DEFAULT_CONFIG.particleColor;
  document.getElementById("lineHex").value = DEFAULT_CONFIG.lineColor;
  [0, 1, 2].forEach((i) => {
    document.getElementById(`gradientColor${i}`).value =
      DEFAULT_CONFIG.gradientColors[i] || "#667eea";
  });
  const gradientSpinEl = document.getElementById("gradientSpin");
  if (gradientSpinEl) gradientSpinEl.checked = DEFAULT_CONFIG.gradientSpin;
  const gradientFlowEl = document.getElementById("gradientFlowAngle");
  if (gradientFlowEl) {
    gradientFlowEl.value = DEFAULT_CONFIG.gradientFlowAngle;
    updateValueDisplay(gradientFlowEl);
  }
  network.reset(DEFAULT_CONFIG);
  updateGradientTypeUI(DEFAULT_CONFIG.gradientType);
});

// Randomize
document.getElementById("randomize").addEventListener("click", () => {
  const count = Math.floor(Math.random() * 200) + 50;
  document.getElementById("particleCount").value = count;
  updateValueDisplay(document.getElementById("particleCount"));
  network.updateConfig("particleCount", count);

  const c = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  document.getElementById("particleColor").value = c;
  document.getElementById("lineColor").value = c;
  document.getElementById("particleHex").value = c;
  document.getElementById("lineHex").value = c;
  network.updateConfig("particleColor", c);
  network.updateConfig("lineColor", c);

  const rnd = {
    minRadius: Math.random() * 4 + 1,
    maxRadius: Math.random() * 6 + 4,
    maxDistance: Math.random() * 200 + 100,
    moveSpeed: Math.random() * 1.5 + 0.2,
    mouseRadius: Math.random() * 200 + 100,
    pulseSpeed: Math.random() * 0.2,
    depthSpeed: Math.random() * 0.06 + 0.01,
    lineOpacity: Math.random() * 80 + 10,
    particleOpacity: Math.random() * 50 + 50,
  };
  Object.entries(rnd).forEach(([key, value]) => {
    const el = document.getElementById(key);
    if (el) {
      el.value = value;
      updateValueDisplay(el);
      network.updateConfig(key, value);
    }
  });
});

// Copy JSON
document.getElementById("copyJson").addEventListener("click", async () => {
  const config = { ...network.config };
  const json = JSON.stringify(config, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    const btn = document.getElementById("copyJson");
    const orig = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = orig), 1500);
  } catch (err) {
    console.error("Copy failed:", err);
  }
});
