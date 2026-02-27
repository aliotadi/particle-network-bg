export type GradientType = "linear" | "radial";

export interface ParticleAssetConfig {
  asset: string;
  count?: number;
  percentage?: number;
}

/** Pairs of category names. "default" = normal particles; asset keys = asset types. */
export interface ConnectionRules {
  /** Only these category pairs connect. Omit or empty = all connect. */
  allow?: [string, string][];
  /** These pairs never connect (applied after allow). */
  deny?: [string, string][];
}

export type LiquidGlassHighlightPosition = "top-left" | "top" | "top-right" | "center" | "bottom-right";

/** 3D fluid droplet styling. Blur + contrast for gooey feel; 3D shading for sphere look. */
export interface LiquidGlassConfig {
  /** Base color (hex). */
  color?: string;
  /** Overall opacity (0–1). */
  opacity?: number;
  /** Blur radius (px) for fluid gooey effect. */
  blur?: number;
  /** Contrast on container for gooey merge. */
  contrast?: number;
  /** Main highlight strength (0–1) – 3D specular. */
  reflectionStrength?: number;
  /** Position of main highlight (light direction). */
  highlightPosition?: LiquidGlassHighlightPosition;
  /** Highlight color (hex). */
  highlightColor?: string;
  /** Shadow/dark side strength (0–1) for 3D depth. */
  shadowStrength?: number;
  /** Secondary reflection strength (0–1). */
  secondaryReflection?: number;
  /** Secondary highlight position. */
  secondaryHighlightPosition?: LiquidGlassHighlightPosition;
  /** Minimum radius (px) for liquid glass particles (overrides root minRadius). */
  minRadius?: number;
  /** Maximum radius (px) for liquid glass particles (overrides root maxRadius). */
  maxRadius?: number;
}

/** Particle type entry for mixing circle, asset, liquidGlass. */
export type ParticleTypeEntry =
  | { type: "circle"; count?: number; percentage?: number }
  | { type: "asset"; asset: string; count?: number; percentage?: number; liquidGlass?: boolean }
  | { type: "liquidGlass"; count?: number; percentage?: number };

export interface ParticleNetworkConfig {
  particleCount: number;
  minRadius: number;
  maxRadius: number;
  particleColor: string;
  lineColor: string;
  lineWidth: number;
  lineOpacity: number;
  maxDistance: number;
  moveSpeed: number;
  backgroundColor: string;
  backgroundOpacity: number;
  particleOpacity: number;
  mouseRadius: number;
  mouseInteraction: boolean;
  pulseEnabled: boolean;
  pulseSpeed: number;
  depthEffectEnabled: boolean;
  depthSpeed: number;
  // Gradient
  gradientEnabled: boolean;
  gradientType: GradientType;
  gradientColors: string[];
  gradientStops?: number[];
  gradientSpeed: number;
  gradientMouseReaction: boolean;
  gradientMouseInfluence: number;
  gradientAngle: number;
  gradientRadius: number;
  gradientSpin: boolean;
  gradientFlowAngle: number;
  gradientOrbitRadius: number;
  gradientDithering: boolean;
  gradientSmoothStops: number;
  // Asset particles
  particleAssets?: ParticleAssetConfig[];
  assets?: Record<string, string>;
  assetColor?: string;
  assetOpacity?: number;
  // Mouse attract: particles follow (vs repel) the pointer
  mouseAttractPercentage?: number;
  mouseAttractAssets?: string[];
  // Particle repulsion: minimum distance, repel when closer
  minParticleDistance?: number;
  minParticleForce?: number;
  // Connection rules: which categories can connect to each other
  connectionRules?: ConnectionRules;
  // Particle type mix: circle, asset, liquidGlass (overrides particleAssets when set)
  particleTypes?: ParticleTypeEntry[];
  // Liquid glass config
  liquidGlass?: LiquidGlassConfig;
  /** % of particles that render as liquid glass (0–100). Works with particleAssets. */
  liquidGlassPercentage?: number;
  /** Or exact count of liquid glass particles. */
  liquidGlassCount?: number;
}

/** Blob deformation state for a liquid glass particle. */
interface BlobState {
  pointCount: number;
  freqs: number[];
  amps: number[];
  phases: number[];
  phaseSpeeds: number[];
  rotSpeed: number;
  rotation: number;
  /** Per-drop highlight angle (radians) — slowly drifts for living light feel. */
  hlAngle: number;
  hlAngleSpeed: number;
  /** Mouse-induced directional stretch (smoothed). */
  mouseStretchX: number;
  mouseStretchY: number;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  z: number;
  dz: number;
  currentRadius?: number;
  assetId?: string;
  mouseAttract?: boolean;
  /** Render as liquid glass (merge + glass styling). */
  liquidGlass?: boolean;
  /** Blob deformation state — single shape, not layers. */
  blob?: BlobState;
}

const DEFAULT_CONFIG: ParticleNetworkConfig = {
  particleCount: 100,
  minRadius: 2,
  maxRadius: 6,
  particleColor: "#000000",
  lineColor: "#000000",
  lineWidth: 1,
  lineOpacity: 0.2,
  maxDistance: 150,
  moveSpeed: 1,
  backgroundColor: "#ffffff",
  backgroundOpacity: 1,
  particleOpacity: 1,
  mouseRadius: 200,
  mouseInteraction: true,
  pulseEnabled: true,
  pulseSpeed: 0,
  depthEffectEnabled: true,
  depthSpeed: 0.02,
  gradientEnabled: false,
  gradientType: "linear",
  gradientColors: ["#667eea", "#764ba2"],
  gradientSpeed: 0.02,
  gradientMouseReaction: true,
  gradientMouseInfluence: 0.5,
  gradientAngle: 0,
  gradientRadius: 1,
  gradientSpin: false,
  gradientFlowAngle: 45,
  gradientOrbitRadius: 0.3,
  gradientDithering: true,
  gradientSmoothStops: 4,
};

const DEFAULT_LIQUID_GLASS: Required<LiquidGlassConfig> = {
  color: "#88ccff",
  opacity: 0.6,
  blur: 12,
  contrast: 25,
  reflectionStrength: 0.85,
  highlightPosition: "top-left",
  highlightColor: "#ffffff",
  shadowStrength: 0.4,
  secondaryReflection: 0.25,
  secondaryHighlightPosition: "bottom-right",
  minRadius: 20,
  maxRadius: 40,
};

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

function lerpHex(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function interpolateColorStops(
  colors: string[],
  stops: number[],
  segmentsPerGap: number
): { colors: string[]; stops: number[] } {
  if (segmentsPerGap <= 0 || colors.length < 2) {
    return { colors: [...colors], stops: [...stops] };
  }
  const outColors: string[] = [];
  const outStops: number[] = [];
  for (let i = 0; i < colors.length - 1; i++) {
    const s0 = stops[i];
    const s1 = stops[i + 1];
    outColors.push(colors[i]);
    outStops.push(s0);
    for (let j = 1; j <= segmentsPerGap; j++) {
      const t = j / (segmentsPerGap + 1);
      outColors.push(lerpHex(colors[i], colors[i + 1], t));
      outStops.push(s0 + (s1 - s0) * t);
    }
  }
  outColors.push(colors[colors.length - 1]);
  outStops.push(stops[stops.length - 1]);
  return { colors: outColors, stops: outStops };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 50)}...`));
    if (src.trim().startsWith("<")) {
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(src)));
    } else {
      img.src = src;
    }
  });
}

export class ParticleNetwork {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  config: ParticleNetworkConfig;
  private particles: Particle[] = [];
  private assetImages: Map<string, HTMLImageElement> = new Map();
  private assetTintCache: Map<string, HTMLCanvasElement> = new Map();
  private animationId: number | null = null;
  private isRunning = false;
  private mousePosition: { x: number; y: number } | null = null;
  private pulseAngle = 0;
  private gradientAngle = 0;
  private gradientFlowOffset = 0;
  private gradientCenter = { x: 0, y: 0 };
  private smoothedMouseAngle = 0;
  private gradientDiv: HTMLDivElement | null = null;
  private boundHandleResize: () => void;
  private boundHandleMouseMove: (e: MouseEvent) => void;
  private boundHandleMouseLeave: () => void;

  constructor(canvas: HTMLCanvasElement, config: Partial<ParticleNetworkConfig> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Could not initialize canvas context");
    }
    this.ctx = ctx;

    this.config = this.validateConfig({ ...DEFAULT_CONFIG, ...config });

    this.createGradientDiv();

    this.boundHandleResize = this.handleResize.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseLeave = this.handleMouseLeave.bind(this);

    this.handleResize();
    this.createParticles();
    this.assignParticleTypes();
    this.loadAssets();
    this.setupEventListeners();
  }

  private loadAssets(): void {
    const { particleAssets, assets } = this.config;
    if (!particleAssets?.length || !assets) return;
    const toLoad = new Set<string>();
    for (const pa of particleAssets) {
      toLoad.add(pa.asset);
    }
    for (const key of toLoad) {
      const src = assets[key];
      if (!src) continue;
      loadImage(src)
        .then((img) => {
          this.assetImages.set(key, img);
        })
        .catch(() => {});
    }
  }

  private createGradientDiv(): void {
    this.gradientDiv = document.createElement("div");
    this.gradientDiv.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;";
    this.canvas.parentElement?.insertBefore(this.gradientDiv, this.canvas);
  }


  private validateConfig(config: ParticleNetworkConfig): ParticleNetworkConfig {
    const numericParams: (keyof ParticleNetworkConfig)[] = [
      "particleCount",
      "minRadius",
      "maxRadius",
      "lineWidth",
      "lineOpacity",
      "maxDistance",
      "moveSpeed",
      "backgroundOpacity",
      "particleOpacity",
      "mouseRadius",
      "pulseSpeed",
      "depthSpeed",
      "gradientSpeed",
      "gradientMouseInfluence",
      "gradientAngle",
      "gradientRadius",
      "gradientFlowAngle",
      "gradientOrbitRadius",
      "gradientSmoothStops",
    ];
    for (const param of numericParams) {
      const val = config[param];
      if (typeof val !== "number" || isNaN(val)) {
        throw new Error(`Invalid ${param}: must be a number`);
      }
    }

    const booleanParams: (keyof ParticleNetworkConfig)[] = [
      "mouseInteraction",
      "pulseEnabled",
      "depthEffectEnabled",
      "gradientEnabled",
      "gradientMouseReaction",
      "gradientSpin",
      "gradientDithering",
    ];
    for (const param of booleanParams) {
      if (typeof config[param] !== "boolean") {
        throw new Error(`Invalid ${param}: must be a boolean`);
      }
    }

    const colorParams: (keyof ParticleNetworkConfig)[] = [
      "backgroundColor",
      "particleColor",
      "lineColor",
    ];
    for (const param of colorParams) {
      if (!HEX_COLOR_REGEX.test(config[param] as string)) {
        throw new Error(`Invalid ${param}: must be a valid hex color`);
      }
    }

    if (config.gradientEnabled) {
      if (
        !Array.isArray(config.gradientColors) ||
        config.gradientColors.length < 2
      ) {
        throw new Error(
          "gradientColors must be an array of at least 2 hex colors"
        );
      }
      for (const c of config.gradientColors) {
        if (!HEX_COLOR_REGEX.test(c)) {
          throw new Error(`Invalid gradient color: ${c} must be valid hex`);
        }
      }
      if (config.gradientType !== "linear" && config.gradientType !== "radial") {
        throw new Error("gradientType must be 'linear' or 'radial'");
      }
      if (config.gradientStops) {
        if (config.gradientStops.length !== config.gradientColors.length) {
          throw new Error(
            "gradientStops length must match gradientColors length"
          );
        }
        for (let i = 0; i < config.gradientStops.length; i++) {
          const s = config.gradientStops[i];
          if (typeof s !== "number" || s < 0 || s > 1) {
            throw new Error(`gradientStops[${i}] must be a number 0-1`);
          }
          if (i > 0 && s <= config.gradientStops[i - 1]) {
            throw new Error("gradientStops must be strictly increasing");
          }
        }
      }
    }

    if (config.particleAssets && config.particleAssets.length > 0) {
      if (!config.assets || typeof config.assets !== "object") {
        throw new Error("assets map is required when using particleAssets");
      }
      for (let i = 0; i < config.particleAssets.length; i++) {
        const pa = config.particleAssets[i];
        if (typeof pa.asset !== "string" || !pa.asset) {
          throw new Error(`particleAssets[${i}].asset must be a non-empty string`);
        }
        const hasCount = pa.count !== undefined;
        const hasPct = pa.percentage !== undefined;
        if (hasCount === hasPct) {
          throw new Error(
            `particleAssets[${i}]: specify exactly one of count or percentage`
          );
        }
        if (hasCount && (typeof pa.count !== "number" || pa.count < 0)) {
          throw new Error(`particleAssets[${i}].count must be a non-negative number`);
        }
        if (hasPct && (typeof pa.percentage !== "number" || pa.percentage < 0 || pa.percentage > 100)) {
          throw new Error(`particleAssets[${i}].percentage must be 0-100`);
        }
        if (!config.assets[pa.asset]) {
          throw new Error(`particleAssets[${i}]: asset "${pa.asset}" not found in assets map`);
        }
      }
    }

    if (config.assetColor != null && !HEX_COLOR_REGEX.test(config.assetColor)) {
      throw new Error("assetColor must be a valid hex color");
    }
    if (config.assetOpacity != null && (typeof config.assetOpacity !== "number" || config.assetOpacity < 0 || config.assetOpacity > 1)) {
      throw new Error("assetOpacity must be a number 0-1");
    }

    if (config.mouseAttractPercentage != null && (typeof config.mouseAttractPercentage !== "number" || config.mouseAttractPercentage < 0 || config.mouseAttractPercentage > 100)) {
      throw new Error("mouseAttractPercentage must be 0-100");
    }
    if (config.mouseAttractAssets != null && (!Array.isArray(config.mouseAttractAssets) || config.mouseAttractAssets.some((a) => typeof a !== "string"))) {
      throw new Error("mouseAttractAssets must be an array of strings");
    }

    if (config.minParticleDistance != null && (typeof config.minParticleDistance !== "number" || config.minParticleDistance < 0)) {
      throw new Error("minParticleDistance must be a non-negative number");
    }
    if (config.minParticleForce != null && (typeof config.minParticleForce !== "number" || config.minParticleForce < 0 || config.minParticleForce > 2)) {
      throw new Error("minParticleForce must be 0-2");
    }

    if (config.connectionRules != null) {
      const { allow, deny } = config.connectionRules;
      const validatePairs = (arr: unknown, name: string) => {
        if (!Array.isArray(arr)) throw new Error(`connectionRules.${name} must be an array`);
        for (let i = 0; i < arr.length; i++) {
          const pair = arr[i];
          if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== "string" || typeof pair[1] !== "string") {
            throw new Error(`connectionRules.${name}[${i}] must be [string, string]`);
          }
        }
      };
      if (allow != null) validatePairs(allow, "allow");
      if (deny != null) validatePairs(deny, "deny");
    }

    if (config.particleTypes != null) {
      if (!Array.isArray(config.particleTypes)) {
        throw new Error("particleTypes must be an array");
      }
      if (!config.assets || typeof config.assets !== "object") {
        throw new Error("assets map is required when using particleTypes with asset entries");
      }
      for (let i = 0; i < config.particleTypes.length; i++) {
        const pt = config.particleTypes[i];
        if (!pt || typeof pt.type !== "string") {
          throw new Error(`particleTypes[${i}].type must be "circle", "asset", or "liquidGlass"`);
        }
        if (pt.type !== "circle" && pt.type !== "asset" && pt.type !== "liquidGlass") {
          throw new Error(`particleTypes[${i}].type must be "circle", "asset", or "liquidGlass"`);
        }
        const hasCount = pt.count !== undefined;
        const hasPct = pt.percentage !== undefined;
        if (hasCount === hasPct) {
          throw new Error(`particleTypes[${i}]: specify exactly one of count or percentage`);
        }
        if (pt.type === "asset") {
          if (typeof (pt as { asset?: string }).asset !== "string" || !(pt as { asset?: string }).asset) {
            throw new Error(`particleTypes[${i}].asset must be a non-empty string`);
          }
          if (!config.assets[(pt as { asset: string }).asset]) {
            throw new Error(`particleTypes[${i}]: asset "${(pt as { asset: string }).asset}" not found in assets`);
          }
        }
      }
    }

    if (config.liquidGlass != null) {
      const lg = config.liquidGlass;
      if (lg.color != null && !HEX_COLOR_REGEX.test(lg.color)) {
        throw new Error("liquidGlass.color must be a valid hex color");
      }
      if (lg.opacity != null && (typeof lg.opacity !== "number" || lg.opacity < 0 || lg.opacity > 1)) {
        throw new Error("liquidGlass.opacity must be 0-1");
      }
      if (lg.blur != null && (typeof lg.blur !== "number" || lg.blur < 0)) {
        throw new Error("liquidGlass.blur must be a non-negative number");
      }
      if (lg.contrast != null && (typeof lg.contrast !== "number" || lg.contrast < 1)) {
        throw new Error("liquidGlass.contrast must be >= 1");
      }
      if (lg.highlightColor != null && !HEX_COLOR_REGEX.test(lg.highlightColor)) {
        throw new Error("liquidGlass.highlightColor must be a valid hex color");
      }
      if (lg.minRadius != null && (typeof lg.minRadius !== "number" || lg.minRadius <= 0)) {
        throw new Error("liquidGlass.minRadius must be a positive number");
      }
      if (lg.maxRadius != null && (typeof lg.maxRadius !== "number" || lg.maxRadius <= 0)) {
        throw new Error("liquidGlass.maxRadius must be a positive number");
      }
    }
    if (config.liquidGlassPercentage != null && (typeof config.liquidGlassPercentage !== "number" || config.liquidGlassPercentage < 0 || config.liquidGlassPercentage > 100)) {
      throw new Error("liquidGlassPercentage must be 0-100");
    }
    if (config.liquidGlassCount != null && (typeof config.liquidGlassCount !== "number" || config.liquidGlassCount < 0)) {
      throw new Error("liquidGlassCount must be a non-negative number");
    }

    return config;
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", this.boundHandleResize);
    this.canvas.addEventListener("mousemove", this.boundHandleMouseMove);
    this.canvas.addEventListener("mouseleave", this.boundHandleMouseLeave);
  }

  cleanup(): void {
    window.removeEventListener("resize", this.boundHandleResize);
    this.canvas.removeEventListener("mousemove", this.boundHandleMouseMove);
    this.canvas.removeEventListener("mouseleave", this.boundHandleMouseLeave);
    this.gradientDiv?.remove();
    this.gradientDiv = null;
    this.stop();
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private handleMouseLeave(): void {
    this.mousePosition = null;
  }

  private handleResize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gradientCenter = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };
  }

  private createParticles(): void {
    this.particles = [];
    const total = this.config.particleCount;
    for (let i = 0; i < total; i++) {
      const sizeRange = this.config.maxRadius - this.config.minRadius;
      const randomSize = Math.random() * sizeRange + this.config.minRadius;
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        dx: (Math.random() - 0.5) * this.config.moveSpeed,
        dy: (Math.random() - 0.5) * this.config.moveSpeed,
        radius: randomSize,
        z: Math.random(),
        dz: (Math.random() - 0.5) * this.config.depthSpeed * 2,
      });
    }
    this.assignParticleTypes();
  }

  private assignParticleTypes(): void {
    const { particleTypes, particleAssets, particleCount } = this.config;
    this.particles.forEach((p) => {
      delete p.assetId;
      delete p.liquidGlass;
    });

    if (particleTypes?.length) {
      const counts: { assetId?: string; liquidGlass: boolean; count: number }[] = [];
      for (const pt of particleTypes) {
        let count: number;
        if (pt.count !== undefined) {
          count = Math.floor(pt.count);
        } else {
          count = Math.floor((particleCount * (pt.percentage ?? 0)) / 100);
        }
        if (count > 0) {
          if (pt.type === "circle") {
            counts.push({ liquidGlass: false, count });
          } else if (pt.type === "asset") {
            counts.push({
              assetId: pt.asset,
              liquidGlass: pt.liquidGlass ?? false,
              count,
            });
          } else {
            counts.push({ liquidGlass: true, count });
          }
        }
      }

      const indices: number[] = [];
      for (let i = 0; i < particleCount; i++) indices.push(i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      let idx = 0;
      for (const { assetId, liquidGlass, count } of counts) {
        for (let c = 0; c < count && idx < indices.length; c++, idx++) {
          const p = this.particles[indices[idx]];
          if (assetId) p.assetId = assetId;
          p.liquidGlass = liquidGlass;
          if (liquidGlass) this.resizeAsLiquidGlass(p);
        }
      }
    } else if (particleAssets?.length) {
      const counts: { assetId: string; count: number }[] = [];
      for (const pa of particleAssets) {
        let count: number;
        if (pa.count !== undefined) {
          count = Math.floor(pa.count);
        } else {
          count = Math.floor((particleCount * (pa.percentage ?? 0)) / 100);
        }
        if (count > 0) counts.push({ assetId: pa.asset, count });
      }

      const indices: number[] = [];
      for (let i = 0; i < particleCount; i++) indices.push(i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      let idx = 0;
      for (const { assetId, count } of counts) {
        for (let c = 0; c < count && idx < indices.length; c++, idx++) {
          this.particles[indices[idx]].assetId = assetId;
        }
      }
    }

    if (!particleTypes?.length && (this.config.liquidGlassPercentage != null || this.config.liquidGlassCount != null)) {
      this.assignLiquidGlass();
    }
    this.assignMouseBehavior();
  }

  private assignLiquidGlass(): void {
    const { liquidGlassPercentage, liquidGlassCount, particleCount } = this.config;
    this.particles.forEach((p) => (p.liquidGlass = false));
    let count = 0;
    if (liquidGlassCount != null && liquidGlassCount > 0) {
      count = Math.min(Math.floor(liquidGlassCount), particleCount);
    } else if (liquidGlassPercentage != null && liquidGlassPercentage > 0) {
      count = Math.floor((particleCount * Math.min(100, Math.max(0, liquidGlassPercentage))) / 100);
    }
    if (count <= 0) return;

    const indices: number[] = [];
    for (let i = 0; i < particleCount; i++) indices.push(i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (let i = 0; i < count && i < indices.length; i++) {
      const p = this.particles[indices[i]];
      p.liquidGlass = true;
      this.resizeAsLiquidGlass(p);
    }
  }

  private resizeAsLiquidGlass(p: Particle): void {
    const lg = this.getLiquidGlassConfig();
    const min = lg.minRadius ?? DEFAULT_LIQUID_GLASS.minRadius;
    const max = lg.maxRadius ?? DEFAULT_LIQUID_GLASS.maxRadius;
    p.radius = Math.random() * (max - min) + min;
    delete p.currentRadius;
    this.initBlob(p);
  }

  private initBlob(p: Particle): void {
    const pointCount = 12;
    const modeCount = 3;
    const freqs: number[] = [];
    const amps: number[] = [];
    const phases: number[] = [];
    const phaseSpeeds: number[] = [];
    for (let m = 0; m < modeCount; m++) {
      freqs.push(2 + m);
      amps.push((0.03 + Math.random() * 0.03) / (1 + m * 0.4));
      phases.push(Math.random() * Math.PI * 2);
      phaseSpeeds.push((0.006 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1));
    }
    const hlAngle = Math.random() * Math.PI * 2;
    p.blob = {
      pointCount,
      freqs,
      amps,
      phases,
      phaseSpeeds,
      rotSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.001 + Math.random() * 0.003),
      rotation: Math.random() * Math.PI * 2,
      hlAngle,
      hlAngleSpeed: (0.002 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1),
      mouseStretchX: 0,
      mouseStretchY: 0,
    };
  }

  private assignMouseBehavior(): void {
    const { mouseAttractPercentage, mouseAttractAssets, particleCount } = this.config;
    this.particles.forEach((p) => (p.mouseAttract = false));

    const attractAssets = new Set(mouseAttractAssets ?? []);
    if (attractAssets.size > 0) {
      this.particles.forEach((p) => {
        if (p.assetId && attractAssets.has(p.assetId)) p.mouseAttract = true;
      });
    }

    if (mouseAttractPercentage != null && mouseAttractPercentage > 0) {
      const count = Math.floor((particleCount * Math.min(100, Math.max(0, mouseAttractPercentage))) / 100);
      const indices: number[] = [];
      for (let i = 0; i < particleCount; i++) indices.push(i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      for (let i = 0; i < count && i < indices.length; i++) {
        this.particles[indices[i]].mouseAttract = true;
      }
    }
  }

  private updateParticles(): void {
    this.particles.forEach((particle) => {
      if (this.config.depthEffectEnabled) {
        particle.z += particle.dz;
        if (particle.z <= 0) {
          particle.z = 0;
          particle.dz = Math.abs(particle.dz);
        } else if (particle.z >= 1) {
          particle.z = 1;
          particle.dz = -Math.abs(particle.dz);
        }
      }

      if (this.config.pulseEnabled) {
        this.pulseAngle += this.config.pulseSpeed;
        const pulseScale = Math.sin(this.pulseAngle) * 0.5 + 1;
        particle.currentRadius = particle.radius * pulseScale;
      } else {
        particle.currentRadius = particle.radius;
      }

      if (this.config.depthEffectEnabled) {
        const depthScale = 0.4 + 0.6 * particle.z;
        particle.currentRadius =
          (particle.currentRadius ?? particle.radius) * depthScale;
      }

      particle.x += particle.dx;
      particle.y += particle.dy;

      if (this.config.mouseInteraction && this.mousePosition) {
        const dx = this.mousePosition.x - particle.x;
        const dy = this.mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.mouseRadius) {
          const force =
            (this.config.mouseRadius - distance) / this.config.mouseRadius;
          const angle = Math.atan2(dy, dx);
          const fx = Math.cos(angle) * force * 0.5;
          const fy = Math.sin(angle) * force * 0.5;
          if (particle.mouseAttract) {
            particle.dx += fx;
            particle.dy += fy;
          } else {
            particle.dx -= fx;
            particle.dy -= fy;
          }
        }
      }

      const minDist = this.config.minParticleDistance ?? 0;
      const minForce = this.config.minParticleForce ?? 0.5;
      if (minDist > 0 && minForce > 0) {
        const r1 = particle.currentRadius ?? particle.radius;
        for (const other of this.particles) {
          if (other === particle) continue;
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const r2 = other.currentRadius ?? other.radius;
          const gap = dist - r1 - r2;
          if (gap < minDist && dist > 0.001) {
            const strength = ((minDist - gap) / minDist) * minForce;
            const ux = -dx / dist;
            const uy = -dy / dist;
            particle.dx += ux * strength;
            particle.dy += uy * strength;
          }
        }
      }

      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.dx = -particle.dx;
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.dy = -particle.dy;
      }

      const speed = Math.sqrt(
        particle.dx * particle.dx + particle.dy * particle.dy
      );
      if (speed > this.config.moveSpeed) {
        particle.dx = (particle.dx / speed) * this.config.moveSpeed;
        particle.dy = (particle.dy / speed) * this.config.moveSpeed;
      }
    });
  }

  private getLiquidGlassConfig(): LiquidGlassConfig {
    return { ...DEFAULT_LIQUID_GLASS, ...this.config.liquidGlass };
  }

  private getHighlightOffset(pos: LiquidGlassHighlightPosition, r: number): { x: number; y: number } {
    switch (pos) {
      case "top-left":
        return { x: r * -0.35, y: r * -0.35 };
      case "top":
        return { x: 0, y: r * -0.4 };
      case "top-right":
        return { x: r * 0.35, y: r * -0.35 };
      case "bottom-right":
        return { x: r * 0.3, y: r * 0.3 };
      case "center":
      default:
        return { x: r * -0.2, y: r * -0.2 };
    }
  }

  private traceBlobPath(cx: number, cy: number, r: number, blob: BlobState): void {
    const n = blob.pointCount;
    const sx = blob.mouseStretchX;
    const sy = blob.mouseStretchY;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const ra = angle + blob.rotation;
      let deform = 0;
      for (let m = 0; m < blob.freqs.length; m++) {
        deform += blob.amps[m] * Math.sin(blob.freqs[m] * ra + blob.phases[m]);
      }
      const pr = r * (1 + deform);
      let px = cx + Math.cos(angle) * pr;
      let py = cy + Math.sin(angle) * pr;
      px += sx * Math.cos(angle) * Math.max(0, Math.cos(angle));
      py += sy * Math.sin(angle) * Math.max(0, Math.sin(angle));
      pts.push({ x: px, y: py });
    }

    this.ctx.beginPath();
    const last = pts[n - 1];
    const first = pts[0];
    this.ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
    for (let i = 0; i < n; i++) {
      const next = pts[(i + 1) % n];
      this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + next.x) / 2, (pts[i].y + next.y) / 2);
    }
    this.ctx.closePath();
  }

  private updateBlobMouse(particle: Particle): void {
    const blob = particle.blob;
    if (!blob) return;
    const r = particle.currentRadius ?? particle.radius;
    const smoothing = 0.08;

    if (this.config.mouseInteraction && this.mousePosition) {
      const dx = this.mousePosition.x - particle.x;
      const dy = this.mousePosition.y - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mouseR = this.config.mouseRadius;

      if (dist < mouseR && dist > 0.01) {
        const influence = ((mouseR - dist) / mouseR);
        const stretch = influence * r * 0.4;
        const ux = dx / dist;
        const uy = dy / dist;
        const targetX = ux * stretch;
        const targetY = uy * stretch;
        blob.mouseStretchX += (targetX - blob.mouseStretchX) * smoothing;
        blob.mouseStretchY += (targetY - blob.mouseStretchY) * smoothing;
        return;
      }
    }
    blob.mouseStretchX *= (1 - smoothing);
    blob.mouseStretchY *= (1 - smoothing);
  }

  private draw3DFluidSphere(particle: Particle): void {
    const lg = this.getLiquidGlassConfig();
    const r = particle.currentRadius ?? particle.radius;
    if (r <= 0) return;
    if (!particle.blob) this.initBlob(particle);
    const blob = particle.blob!;
    const cx = particle.x;
    const cy = particle.y;

    let opacity = (lg.opacity ?? DEFAULT_LIQUID_GLASS.opacity) * this.config.particleOpacity;
    if (this.config.depthEffectEnabled) {
      opacity *= 0.6 + 0.4 * particle.z;
    }
    if (opacity <= 0) return;

    blob.rotation += blob.rotSpeed;
    for (let m = 0; m < blob.phases.length; m++) {
      blob.phases[m] += blob.phaseSpeeds[m];
    }
    blob.hlAngle += blob.hlAngleSpeed;
    this.updateBlobMouse(particle);

    const color = lg.color ?? DEFAULT_LIQUID_GLASS.color;
    const baseR = parseInt(color.slice(1, 3), 16);
    const baseG = parseInt(color.slice(3, 5), 16);
    const baseB = parseInt(color.slice(5, 7), 16);
    const shadowStr = lg.shadowStrength ?? DEFAULT_LIQUID_GLASS.shadowStrength;

    // Per-drop drifting highlight position
    const hlDist = r * 0.35;
    const hlX = cx + Math.cos(blob.hlAngle) * hlDist;
    const hlY = cy + Math.sin(blob.hlAngle) * hlDist;

    const lr = Math.min(255, baseR + Math.round((255 - baseR) * 0.55));
    const lgr = Math.min(255, baseG + Math.round((255 - baseG) * 0.55));
    const lb = Math.min(255, baseB + Math.round((255 - baseB) * 0.55));
    const dr = Math.max(0, Math.round(baseR * (1 - shadowStr * 0.35)));
    const dg = Math.max(0, Math.round(baseG * (1 - shadowStr * 0.35)));
    const db = Math.max(0, Math.round(baseB * (1 - shadowStr * 0.35)));

    this.ctx.save();

    const grad = this.ctx.createRadialGradient(
      hlX, hlY, r * 0.05,
      cx, cy, r * 1.05
    );
    grad.addColorStop(0,    `rgba(${lr},${lgr},${lb}, ${opacity * 0.95})`);
    grad.addColorStop(0.4,  `rgba(${baseR},${baseG},${baseB}, ${opacity * 0.8})`);
    grad.addColorStop(0.8,  `rgba(${dr},${dg},${db}, ${opacity * 0.6})`);
    grad.addColorStop(1,    `rgba(${dr},${dg},${db}, ${opacity * 0.25})`);

    this.ctx.fillStyle = grad;
    this.traceBlobPath(cx, cy, r, blob);
    this.ctx.fill();

    this.ctx.restore();
  }

  private getTintedCanvas(img: HTMLImageElement, color: string): HTMLCanvasElement {
    const key = `${img.src}_${color}`;
    const cached = this.assetTintCache.get(key);
    if (cached) return cached;

    const size = 128;
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(img, 0, 0, size, size);

    this.assetTintCache.set(key, offscreen);
    return offscreen;
  }

  private drawParticles(): void {
    const defaultColor = this.config.particleColor;
    const assetColor = this.config.assetColor;
    const assetOpacity = this.config.assetOpacity ?? 1;

    this.particles.forEach((particle) => {
      if (particle.liquidGlass) {
        this.draw3DFluidSphere(particle);
        return;
      }

      let opacity = this.config.particleOpacity;
      if (this.config.depthEffectEnabled) {
        opacity *= 0.6 + 0.4 * particle.z;
      }
      const r = particle.currentRadius ?? particle.radius;
      const img = particle.assetId ? this.assetImages.get(particle.assetId) : null;

      if (img) {
        this.ctx.globalAlpha = opacity * assetOpacity;
        const size = r * 2;
        const x = particle.x - r;
        const y = particle.y - r;

        if (assetColor && HEX_COLOR_REGEX.test(assetColor)) {
          this.ctx.drawImage(this.getTintedCanvas(img, assetColor), x, y, size, size);
        } else {
          this.ctx.drawImage(img, x, y, size, size);
        }
      } else {
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = defaultColor;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, r, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
    this.ctx.globalAlpha = 1;
  }

  private getCategory(p: Particle): string {
    return p.assetId ?? "default";
  }

  private canConnect(a: Particle, b: Particle): boolean {
    const rules = this.config.connectionRules;
    if (!rules) return true;

    const catA = this.getCategory(a);
    const catB = this.getCategory(b);
    const pair = [catA, catB].sort().join("|");

    if (rules.deny?.length) {
      const denied = rules.deny.some(
        ([x, y]) => [x, y].sort().join("|") === pair
      );
      if (denied) return false;
    }

    if (rules.allow && rules.allow.length > 0) {
      return rules.allow.some(
        ([x, y]) => [x, y].sort().join("|") === pair
      );
    }

    return true;
  }

  private drawConnections(): void {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.maxDistance && this.canConnect(this.particles[i], this.particles[j])) {
          const opacity = 1 - distance / this.config.maxDistance;
          const color = this.hexToRgb(this.config.lineColor);
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(${color}, ${opacity * this.config.lineOpacity})`;
          this.ctx.lineWidth = this.config.lineWidth;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  private drawBackground(): void {
    if (this.config.gradientEnabled && this.gradientDiv) {
      this.gradientDiv.style.display = "";
      this.gradientDiv.style.opacity = String(this.config.backgroundOpacity);
      this.updateGradientCSS();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      if (this.gradientDiv) this.gradientDiv.style.display = "none";
      this.ctx.globalAlpha = this.config.backgroundOpacity;
      this.ctx.fillStyle = this.config.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
    }
  }

  private updateGradientCSS(): void {
    if (!this.gradientDiv) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const colors = this.config.gradientColors;

    if (this.config.gradientType === "linear") {
      if (this.config.gradientSpin) {
        this.gradientAngle += this.config.gradientSpeed;
        const deg = (this.gradientAngle * 180) / Math.PI;
        this.gradientDiv.style.background =
          `linear-gradient(${deg}deg, ${colors.join(", ")})`;
        this.gradientDiv.style.backgroundSize = "";
        this.gradientDiv.style.backgroundPosition = "";
      } else {
        const angle = this.config.gradientFlowAngle;
        const cycle = [...colors, ...colors, ...colors, colors[0]];
        this.gradientDiv.style.background =
          `linear-gradient(${angle}deg, ${cycle.join(", ")})`;
        this.gradientDiv.style.backgroundSize = "300% 300%";

        this.gradientFlowOffset = (this.gradientFlowOffset + this.config.gradientSpeed * 0.5) % 100;
        const pct = this.gradientFlowOffset;
        this.gradientDiv.style.backgroundPosition = `${pct}% ${pct}%`;
      }
    } else {
      const cx = w / 2;
      const cy = h / 2;
      const orbitR = Math.min(w, h) * this.config.gradientOrbitRadius;

      this.gradientAngle += this.config.gradientSpeed;
      let targetX = cx + Math.cos(this.gradientAngle) * orbitR;
      let targetY = cy + Math.sin(this.gradientAngle) * orbitR;

      if (this.config.gradientMouseReaction && this.mousePosition) {
        const influence = this.config.gradientMouseInfluence;
        targetX += (this.mousePosition.x - targetX) * influence;
        targetY += (this.mousePosition.y - targetY) * influence;
      }

      this.gradientCenter.x += (targetX - this.gradientCenter.x) * 0.03;
      this.gradientCenter.y += (targetY - this.gradientCenter.y) * 0.03;

      const r = Math.max(w, h) * this.config.gradientRadius;
      const cycle = [...colors, ...colors, colors[0]];
      const step = (r * 2) / (cycle.length - 1);
      const stops = cycle.map((c, i) => `${c} ${i * step}px`).join(", ");
      this.gradientDiv.style.background =
        `radial-gradient(circle at ${this.gradientCenter.x}px ${this.gradientCenter.y}px, ${stops})`;
      this.gradientDiv.style.backgroundSize = "";
      this.gradientDiv.style.backgroundPosition = "";
    }
  }

  private hexToRgb(hex: string): string {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "255,255,255";
    return result
      .slice(1)
      .map((n) => parseInt(n, 16))
      .join(",");
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  private animate(): void {
    this.drawBackground();

    this.updateParticles();
    this.drawParticles();
    this.drawConnections();

    if (this.isRunning) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }

  updateConfig<K extends keyof ParticleNetworkConfig>(
    property: K,
    value: ParticleNetworkConfig[K]
  ): void {
    this.config[property] = value;

    if (property === "particleCount") {
      this.createParticles();
    }

    if (property === "particleAssets" || property === "assets" || property === "particleTypes") {
      this.assetImages.clear();
      this.assetTintCache.clear();
      this.loadAssets();
      this.assignParticleTypes();
    }

    if (property === "liquidGlassPercentage" || property === "liquidGlassCount") {
      if (!this.config.particleTypes?.length) {
        this.assignLiquidGlass();
      }
    }

    if (property === "mouseAttractPercentage" || property === "mouseAttractAssets") {
      this.assignMouseBehavior();
    }

    if (property === "assetColor") {
      this.assetTintCache.clear();
    }

    if (property === "moveSpeed") {
      this.particles.forEach((particle) => {
        const currentSpeed = Math.sqrt(
          particle.dx * particle.dx + particle.dy * particle.dy
        );
        if (currentSpeed > 0) {
          particle.dx = (particle.dx / currentSpeed) * (value as number);
          particle.dy = (particle.dy / currentSpeed) * (value as number);
        }
      });
    }

    if (property === "minRadius" || property === "maxRadius") {
      this.particles.forEach((particle) => {
        const sizeRange =
          this.config.maxRadius - this.config.minRadius;
        const randomSize =
          Math.random() * sizeRange + this.config.minRadius;
        particle.radius = randomSize;
      });
    }

    if (property === "depthSpeed") {
      this.particles.forEach((particle) => {
        const sign = particle.dz >= 0 ? 1 : -1;
        particle.dz =
          sign * (Math.random() * 0.5 + 0.5) * (value as number) * 2;
      });
    }

  }

  reset(defaults: Partial<ParticleNetworkConfig>): void {
    this.config = this.validateConfig({
      ...DEFAULT_CONFIG,
      ...defaults,
    });
    this.assetImages.clear();
    this.assetTintCache.clear();
    this.createParticles();
    this.loadAssets();
    this.stop();
    this.start();
  }
}
