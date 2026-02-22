export type GradientType = "linear" | "radial";

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

export class ParticleNetwork {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  config: ParticleNetworkConfig;
  private particles: Particle[] = [];
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
    this.setupEventListeners();
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
    for (let i = 0; i < this.config.particleCount; i++) {
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
          const repelX = Math.cos(angle) * force * 0.5;
          const repelY = Math.sin(angle) * force * 0.5;
          particle.dx -= repelX;
          particle.dy -= repelY;
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

  private drawParticles(): void {
    this.ctx.fillStyle = this.config.particleColor;
    this.particles.forEach((particle) => {
      let opacity = this.config.particleOpacity;
      if (this.config.depthEffectEnabled) {
        opacity *= 0.6 + 0.4 * particle.z;
      }
      this.ctx.globalAlpha = opacity;
      this.ctx.beginPath();
      this.ctx.arc(
        particle.x,
        particle.y,
        particle.currentRadius ?? particle.radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }

  private drawConnections(): void {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.maxDistance) {
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
    this.createParticles();
    this.stop();
    this.start();
  }
}
