import { ParticleNetwork } from "particle-network-bg";

const FA_ICONS = ["star", "heart", "circle", "bolt", "fire", "snowflake", "leaf", "sun", "moon", "cloud", "gem", "diamond", "crown", "music"];
const FA_BASE = "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs";

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
  minParticleDistance: 0,
  minParticleForce: 0.5,
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

// mouseAttractPercentage
document.getElementById("mouseAttractPercentage")?.addEventListener("input", (e) => {
  const val = parseInt(e.target.value);
  e.target.parentElement.querySelector(".value-display").textContent = val + "%";
  network.updateConfig("mouseAttractPercentage", val);
});

// Numeric & checkbox inputs
document.querySelectorAll("input").forEach((input) => {
  if (input.id.includes("Color") || input.id.includes("Hex") || input.id.includes("Opacity")) return;
  if (input.id.startsWith("gradientColor")) return;
  if (input.id === "gradientType") return;
  if (input.id === "mouseAttractPercentage") return;

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

// Gradient colors - dynamic add/remove
function renderGradientColors() {
  const container = document.getElementById("gradientColorsContainer");
  const colors = network.config.gradientColors;
  container.innerHTML = "";
  colors.forEach((color, i) => {
    const wrap = document.createElement("div");
    wrap.className = "gradient-color-item";
    const input = document.createElement("input");
    input.type = "color";
    input.value = color;
    input.dataset.index = String(i);
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "gradient-color-remove";
    removeBtn.textContent = "−";
    removeBtn.dataset.index = String(i);
    removeBtn.disabled = colors.length <= 2;
    removeBtn.setAttribute("aria-label", "Remove color");
    wrap.appendChild(input);
    wrap.appendChild(removeBtn);
    container.appendChild(wrap);
  });
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "gradient-color-add";
  addBtn.textContent = "+";
  addBtn.setAttribute("aria-label", "Add color");
  container.appendChild(addBtn);
}
renderGradientColors();

document.getElementById("gradientColorsContainer").addEventListener("input", (e) => {
  if (e.target.type === "color" && e.target.dataset.index != null) {
    const i = parseInt(e.target.dataset.index, 10);
    const colors = [...network.config.gradientColors];
    colors[i] = e.target.value;
    network.updateConfig("gradientColors", colors);
  }
});
document.getElementById("gradientColorsContainer").addEventListener("click", (e) => {
  if (e.target.classList.contains("gradient-color-remove") && !e.target.disabled) {
    const i = parseInt(e.target.dataset.index, 10);
    const colors = [...network.config.gradientColors];
    if (colors.length > 2) {
      colors.splice(i, 1);
      network.updateConfig("gradientColors", colors);
      renderGradientColors();
    }
  }
  if (e.target.classList.contains("gradient-color-add")) {
    const colors = [...network.config.gradientColors, "#667eea"];
    network.updateConfig("gradientColors", colors);
    renderGradientColors();
  }
});

// Asset particles
let assetEntries = [];

function buildAssetsConfig() {
  const assets = {};
  const particleAssets = [];
  for (const e of assetEntries) {
    let src = null;
    let key;
    if (e.source === "fa" && e.faIcon) {
      const style = e.faStyle || "solid";
      key = `fa_${style}_${e.faIcon}`;
      src = `${FA_BASE}/${style}/${e.faIcon}.svg`;
    } else if (e.source === "file" && e.fileUrl) {
      key = `file_${e.id}`;
      src = e.fileUrl;
    }
    if (src) {
      assets[key] = src;
      particleAssets.push(
        e.mode === "count"
          ? { asset: key, count: Math.max(0, Math.floor(e.value)) }
          : { asset: key, percentage: Math.max(0, Math.min(100, e.value)) }
      );
    }
  }
  return { assets, particleAssets };
}

function applyAssetConfig() {
  const { assets, particleAssets } = buildAssetsConfig();
  if (Object.keys(assets).length > 0) {
    network.updateConfig("assets", assets);
    network.updateConfig("particleAssets", particleAssets);
  } else {
    network.updateConfig("assets", undefined);
    network.updateConfig("particleAssets", undefined);
  }
  renderMouseAttractAssets();
}

function renderMouseAttractAssets() {
  const row = document.getElementById("mouseAttractAssetsRow");
  const container = document.getElementById("mouseAttractAssetsContainer");
  const assets = network.config.assets;
  const keys = assets ? Object.keys(assets) : [];
  if (keys.length === 0) {
    row.style.display = "none";
    container.innerHTML = "";
    return;
  }
  row.style.display = "";
  container.innerHTML = "";
  const attractAssets = network.config.mouseAttractAssets ?? [];
  keys.forEach((key) => {
    const label = document.createElement("label");
    label.className = "toggle";
    label.style.cursor = "pointer";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = key;
    input.checked = attractAssets.includes(key);
    input.addEventListener("change", () => {
      const current = network.config.mouseAttractAssets ?? [];
      const next = input.checked ? [...current, key] : current.filter((a) => a !== key);
      network.updateConfig("mouseAttractAssets", next.length ? next : undefined);
    });
    const span = document.createElement("span");
    span.className = "toggle-label";
    span.textContent = key;
    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
  });
}

function renderAssetEntries() {
  const colorControls = document.getElementById("assetColorControls");
  colorControls.style.display = assetEntries.length > 0 ? "block" : "none";

  const container = document.getElementById("assetEntriesContainer");
  container.innerHTML = "";
  assetEntries.forEach((entry) => {
    const wrap = document.createElement("div");
    wrap.className = "asset-entry";
    wrap.dataset.id = entry.id;
    const label = entry.source === "fa" ? `Font Awesome: ${entry.faIcon}` : entry.fileName || "File";
    wrap.innerHTML = `
      <div class="asset-entry-header">
        <span style="font-size:0.75rem;color:var(--text-muted)">${label}</span>
        <button type="button" class="asset-remove" data-id="${entry.id}" aria-label="Remove">×</button>
      </div>
      <div class="asset-entry-source">
        <select data-field="source" data-id="${entry.id}">
          <option value="fa" ${entry.source === "fa" ? "selected" : ""}>Font Awesome</option>
          <option value="file" ${entry.source === "file" ? "selected" : ""}>Upload PNG/SVG</option>
        </select>
        ${entry.source === "fa" ? `
          <select data-field="faStyle" data-id="${entry.id}">
            <option value="solid" ${(entry.faStyle || "solid") === "solid" ? "selected" : ""}>Solid</option>
            <option value="regular" ${entry.faStyle === "regular" ? "selected" : ""}>Regular</option>
          </select>
          <select data-field="faIcon" data-id="${entry.id}">
            ${FA_ICONS.map((icon) => `<option value="${icon}" ${entry.faIcon === icon ? "selected" : ""}>${icon}</option>`).join("")}
          </select>
        ` : `
          <input type="file" data-id="${entry.id}" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="font-size:0.75rem;color:var(--text-muted)">
        `}
      </div>
      <div class="asset-entry-mode">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="mode-${entry.id}" value="count" ${entry.mode === "count" ? "checked" : ""}>
          <span style="font-size:0.8rem">Count</span>
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="mode-${entry.id}" value="percentage" ${entry.mode === "percentage" ? "checked" : ""}>
          <span style="font-size:0.8rem">%</span>
        </label>
        <input type="number" data-field="value" data-id="${entry.id}" value="${entry.value}" min="0" max="${entry.mode === "percentage" ? 100 : 999}">
      </div>
    `;
    container.appendChild(wrap);
  });
}

function setupAssetEntryListeners() {
  const container = document.getElementById("assetEntriesContainer");
  container.addEventListener("change", (e) => {
    const id = e.target.dataset?.id;
    if (!id) return;
    const entry = assetEntries.find((a) => a.id === id);
    if (!entry) return;
    if (e.target.dataset?.field === "source") {
      entry.source = e.target.value;
      if (entry.source === "file") entry.fileUrl = null;
      renderAssetEntries();
    } else if (e.target.dataset?.field === "faStyle") {
      entry.faStyle = e.target.value;
    } else if (e.target.dataset?.field === "faIcon") {
      entry.faIcon = e.target.value;
    } else if (e.target.dataset?.field === "value") {
      entry.value = parseFloat(e.target.value) || 0;
    } else if (e.target.type === "radio" && e.target.name?.startsWith("mode-")) {
      entry.mode = e.target.value;
    } else if (e.target.type === "file" && e.target.files?.[0]) {
      const file = e.target.files[0];
      entry.fileUrl = URL.createObjectURL(file);
      entry.fileName = file.name;
      renderAssetEntries();
    }
    applyAssetConfig();
  });
  container.addEventListener("input", (e) => {
    if (e.target.dataset?.field === "value") {
      const id = e.target.dataset.id;
      const entry = assetEntries.find((a) => a.id === id);
      if (entry) {
        entry.value = parseFloat(e.target.value) || 0;
        applyAssetConfig();
      }
    }
  });
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("asset-remove")) {
      const id = e.target.dataset.id;
      assetEntries = assetEntries.filter((a) => a.id !== id);
      renderAssetEntries();
      applyAssetConfig();
    }
  });
}

document.getElementById("addAssetBtn").addEventListener("click", () => {
  assetEntries.push({
    id: crypto.randomUUID(),
    source: "fa",
    faIcon: "star",
    faStyle: "solid",
    mode: "count",
    value: 10,
  });
  renderAssetEntries();
  applyAssetConfig();
});

setupAssetEntryListeners();

// Asset color & opacity
[
  { color: "assetColor", hex: "assetHex", opacity: "assetOpacity" },
].forEach(({ color, hex, opacity }) => {
  const colorInput = document.getElementById(color);
  const hexInput = document.getElementById(hex);
  const opacityInput = document.getElementById(opacity);
  if (!colorInput || !hexInput || !opacityInput) return;

  colorInput.addEventListener("input", () => {
    hexInput.value = colorInput.value.toUpperCase();
    network.updateConfig(color, colorInput.value);
  });
  hexInput.addEventListener("input", (e) => {
    const v = validateHex(e.target.value);
    if (v) {
      colorInput.value = v;
      hexInput.value = v.toUpperCase();
      network.updateConfig(color, v);
    }
  });
  opacityInput.addEventListener("input", () => {
    const pct = parseInt(opacityInput.value) / 100;
    document.getElementById("assetOpacityDisplay").textContent = Math.round(opacityInput.value) + "%";
    network.updateConfig(opacity, pct);
  });
});

// Reset
document.getElementById("reset").addEventListener("click", () => {
  assetEntries = [];
  renderAssetEntries();
  network.updateConfig("assets", undefined);
  network.updateConfig("particleAssets", undefined);
  network.updateConfig("assetColor", undefined);
  network.updateConfig("assetOpacity", undefined);
  network.updateConfig("mouseAttractPercentage", undefined);
  network.updateConfig("mouseAttractAssets", undefined);
  renderMouseAttractAssets();
  const assetColorEl = document.getElementById("assetColor");
  const assetHexEl = document.getElementById("assetHex");
  const assetOpacityEl = document.getElementById("assetOpacity");
  if (assetColorEl) assetColorEl.value = "#a1a1aa";
  if (assetHexEl) assetHexEl.value = "#a1a1aa";
  if (assetOpacityEl) {
    assetOpacityEl.value = 100;
    document.getElementById("assetOpacityDisplay").textContent = "100%";
  }
  const mouseAttractPctEl = document.getElementById("mouseAttractPercentage");
  if (mouseAttractPctEl) {
    mouseAttractPctEl.value = 0;
    mouseAttractPctEl.parentElement.querySelector(".value-display").textContent = "0%";
  }
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
  const gradientSpinEl = document.getElementById("gradientSpin");
  if (gradientSpinEl) gradientSpinEl.checked = DEFAULT_CONFIG.gradientSpin;
  const gradientFlowEl = document.getElementById("gradientFlowAngle");
  if (gradientFlowEl) {
    gradientFlowEl.value = DEFAULT_CONFIG.gradientFlowAngle;
    updateValueDisplay(gradientFlowEl);
  }
  network.reset(DEFAULT_CONFIG);
  renderGradientColors();
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
