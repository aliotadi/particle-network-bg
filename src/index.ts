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
};

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

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

    this.boundHandleResize = this.handleResize.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseLeave = this.handleMouseLeave.bind(this);

    this.handleResize();
    this.createParticles();
    this.setupEventListeners();
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
    this.ctx.globalAlpha = this.config.backgroundOpacity;

    if (this.config.gradientEnabled) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const colors = this.config.gradientColors;
      const stops =
        this.config.gradientStops ??
        colors.map((_, i) => i / (colors.length - 1));

      // Update gradient angle (linear) or center (radial) for animation + mouse
      if (this.config.gradientType === "linear") {
        const baseAngleRad = (this.config.gradientFlowAngle * Math.PI) / 180;
        const diag = Math.sqrt(w * w + h * h);

        let angle: number;
        let offsetX = 0;
        let offsetY = 0;

        if (this.config.gradientSpin) {
          this.gradientAngle += this.config.gradientSpeed;
          angle = this.gradientAngle;
        } else {
          this.gradientFlowOffset = (this.gradientFlowOffset + this.config.gradientSpeed) % (Math.PI * 2);
          const t = this.gradientFlowOffset / (Math.PI * 2);
          offsetX = Math.cos(baseAngleRad) * t * diag;
          offsetY = Math.sin(baseAngleRad) * t * diag;
          angle = baseAngleRad;
        }

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const lineLen = this.config.gradientSpin ? diag / 2 : diag * 1.5;
        const cx = w / 2 + offsetX;
        const cy = h / 2 + offsetY;
        const x1 = cx - cos * lineLen;
        const y1 = cy - sin * lineLen;
        const x2 = cx + cos * lineLen;
        const y2 = cy + sin * lineLen;
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        if (this.config.gradientSpin) {
          colors.forEach((c, i) => gradient.addColorStop(stops[i], c));
        } else {
          const extColors = [...colors, colors[0]];
          for (let rep = 0; rep < 3; rep++) {
            extColors.forEach((c, i) => {
              gradient.addColorStop((rep + i / (extColors.length - 1)) / 3, c);
            });
          }
        }
        this.ctx.fillStyle = gradient;
      } else {
        const cx = w / 2;
        const cy = h / 2;
        const orbitR = Math.min(w, h) * this.config.gradientOrbitRadius;

        let targetX: number;
        let targetY: number;

        this.gradientAngle += this.config.gradientSpeed;
        targetX = cx + Math.cos(this.gradientAngle) * orbitR;
        targetY = cy + Math.sin(this.gradientAngle) * orbitR;

        if (this.config.gradientMouseReaction && this.mousePosition) {
          const influence = this.config.gradientMouseInfluence;
          targetX = targetX + (this.mousePosition.x - targetX) * influence;
          targetY = targetY + (this.mousePosition.y - targetY) * influence;
        }

        const lerpFactor = 0.03;
        this.gradientCenter.x += (targetX - this.gradientCenter.x) * lerpFactor;
        this.gradientCenter.y += (targetY - this.gradientCenter.y) * lerpFactor;

        this.gradientFlowOffset = (this.gradientFlowOffset + this.config.gradientSpeed) % (Math.PI * 2);
        const t = this.gradientFlowOffset / (Math.PI * 2);
        const r = Math.max(w, h) * this.config.gradientRadius * 2;
        const gradient = this.ctx.createRadialGradient(
          this.gradientCenter.x,
          this.gradientCenter.y,
          0,
          this.gradientCenter.x,
          this.gradientCenter.y,
          r
        );
        const extColors = [...colors, colors[0]];
        const entries: { stop: number; color: string }[] = [];
        for (let rep = 0; rep < 3; rep++) {
          extColors.forEach((c, i) => {
            const base = (rep + i / (extColors.length - 1)) / 3;
            entries.push({ stop: (base + t) % 1, color: c });
          });
        }
        entries.sort((a, b) => a.stop - b.stop);
        if (entries[0].stop > 0.001) {
          entries.unshift({ stop: 0, color: entries[entries.length - 1].color });
        }
        if (entries[entries.length - 1].stop < 0.999) {
          entries.push({ stop: 1, color: entries[0].color });
        }
        entries.forEach((e) => gradient.addColorStop(e.stop, e.color));
        this.ctx.fillStyle = gradient;
      }
    } else {
      this.ctx.fillStyle = this.config.backgroundColor;
    }

    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
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
