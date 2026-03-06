# particle-network-bg

Interactive particle network animation for backgrounds. Typed, zero dependencies (core), works with vanilla JS, React, or any framework.

> **Note:** The demos are in the `[demo/](./demo)` directory.

## Demo

Live demos:

- **[Vanilla JS](https://aliotadi.github.io/particle-network-bg/vanilla/)**
- **[React](https://aliotadi.github.io/particle-network-bg/react/)**

Run locally:

```bash
# Vanilla
cd demo/vanilla && npm install && npm run dev

# React
cd demo/react && npm install && npm run dev
```

## Install

```bash
npm install particle-network-bg
```

## Usage

### Vanilla JS

```js
import { ParticleNetwork } from "particle-network-bg";

const canvas = document.getElementById("canvas");
const network = new ParticleNetwork(canvas, {
  particleCount: 100,
  particleColor: "#000000",
  lineColor: "#000000",
  backgroundColor: "#ffffff",
});

network.start();

// Later: cleanup
network.cleanup();
```

### React – Component

```jsx
import { ParticleNetworkBg } from "particle-network-bg/react";

function App() {
  return (
    <ParticleNetworkBg
      config={{
        particleCount: 80,
        gradientEnabled: true,
        gradientColors: ["#667eea", "#764ba2"],
      }}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
```

### React – Hook

```jsx
import { useParticleNetwork } from "particle-network-bg/react";

function App() {
  const canvasRef = useParticleNetwork({
    particleCount: 80,
    gradientEnabled: true,
    gradientColors: ["#667eea", "#764ba2"],
  });

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100vh" }}
    />
  );
}
```

> **Note:** Config is applied on mount. The canvas resizes to the window. When gradients are enabled, a background `<div>` is automatically created behind the canvas for smooth CSS-based gradient rendering.

## Configuration

| Option                   | Type      | Default                  | Description                                              |
| ------------------------ | --------- | ------------------------ | -------------------------------------------------------- |
| `particleCount`          | number    | 100                      | Number of particles                                      |
| `minRadius`              | number    | 2                        | Min particle size (px)                                   |
| `maxRadius`              | number    | 6                        | Max particle size (px)                                   |
| `particleColor`          | string    | `#000000`                | Particle color (hex)                                     |
| `lineColor`              | string    | `#000000`                | Connection line color (hex)                              |
| `lineWidth`              | number    | 1                        | Line width                                               |
| `lineOpacity`            | number    | 0.2                      | Line opacity (0–1)                                       |
| `maxDistance`            | number    | 150                      | Max connection distance (px)                             |
| `moveSpeed`              | number    | 1                        | Particle movement speed                                  |
| `backgroundColor`        | string    | `#ffffff`                | Background color (hex)                                   |
| `backgroundOpacity`      | number    | 1                        | Background opacity (0–1)                                 |
| `particleOpacity`        | number    | 1                        | Particle opacity (0–1)                                   |
| `mouseRadius`            | number    | 200                      | Mouse interaction radius                                 |
| `mouseInteraction`       | boolean   | true                     | Enable mouse repel effect                                |
| `pulseEnabled`           | boolean   | true                     | Enable pulse animation                                   |
| `pulseSpeed`             | number    | 0                        | Pulse speed                                              |
| `depthEffectEnabled`     | boolean   | true                     | 3D depth effect                                          |
| `depthSpeed`             | number    | 0.02                     | Depth animation speed                                    |
| `gradientEnabled`        | boolean   | false                    | Use gradient background                                  |
| `gradientType`           | `"linear" | "radial"`                | `"linear"`                                               |
| `gradientColors`         | string[]  | `["#667eea", "#764ba2"]` | Gradient colors (hex)                                    |
| `gradientStops`          | number[]  | auto                     | Color stops (0–1), optional                              |
| `gradientSpeed`          | number    | 0.02                     | Gradient animation speed                                 |
| `gradientMouseReaction`  | boolean   | true                     | **Radial only:** Gradient center follows mouse           |
| `gradientMouseInfluence` | number    | 0.5                      | **Radial only:** Mouse influence strength (0–1)          |
| `gradientAngle`          | number    | 0                        | **Linear spin mode:** Initial rotation angle (degrees)   |
| `gradientRadius`         | number    | 1                        | **Radial:** Gradient radius multiplier                   |
| `gradientSpin`           | boolean   | false                    | **Linear:** `true` = rotate, `false` = flow continuously |
| `gradientFlowAngle`      | number    | 45                       | **Linear flow mode:** Direction of color flow (degrees)  |
| `gradientOrbitRadius`    | number    | 0.3                      | **Radial:** Orbit radius for center movement (0–1)       |
| `gradientDithering`      | boolean   | true                     | *(Deprecated)* No longer used with CSS gradients          |
| `gradientSmoothStops`    | number    | 4                        | *(Deprecated)* No longer used with CSS gradients          |
| `particleAssets`         | array     | —                        | Use icons/images as particles (see Asset Particles)       |
| `assets`                 | object    | —                        | Map of asset keys to URLs or SVG strings (required with `particleAssets`) |
| `assetColor`             | string    | —                        | Tint color for asset particles (hex). Omit to use original image colors |
| `assetOpacity`           | number    | 1                        | Opacity for asset particles (0–1)                         |
| `mouseAttractPercentage` | number    | —                        | % of particles that follow the mouse (0–100). Others repel |
| `mouseAttractAssets`     | string[]  | —                        | Asset keys whose particles follow the mouse. Others repel  |
| `minParticleDistance`    | number    | —                        | Min distance (px). Particles repel when closer              |
| `minParticleForce`       | number    | 0.5                      | Strength of particle repulsion (0–2)                       |
| `connectionRules`        | object    | —                        | Control which categories connect (see Connection Rules)     |
| `liquidGlass`            | object    | —                        | Liquid glass styling (see Liquid Glass)                      |
| `liquidGlassPercentage` | number    | —                        | % of particles that render as liquid glass (0–100)          |
| `liquidGlassCount`       | number    | —                        | Exact count of liquid glass particles                       |
| `particleTypes`          | array     | —                        | Mix circle, asset, liquidGlass (see Particle Types)          |

## Liquid Glass

3D fluid spheres with blur + contrast for a gooey liquid feel. Each particle is rendered as a 3D sphere with shading, highlights, and blur. Overlapping blobs merge visually via the contrast filter.

```js
new ParticleNetwork(canvas, {
  liquidGlassPercentage: 40,
  liquidGlass: {
    blur: 12,                 // blur radius (px) for fluid gooey effect
    contrast: 25,            // container contrast for gooey merge
    color: "#88ccff",
    opacity: 0.6,
    reflectionStrength: 0.85,
    highlightPosition: "top-left", // "top-left" | "top" | "top-right" | "center" | "bottom-right"
    highlightColor: "#ffffff",
    shadowStrength: 0.4,
    secondaryReflection: 0.25,
    secondaryHighlightPosition: "bottom-right",
    minRadius: 20,            // min size for liquid glass particles (overrides root minRadius)
    maxRadius: 40,            // max size for liquid glass particles (overrides root maxRadius)
  },
});
```

## Particle Types

Use `particleTypes` to mix circle, asset, and liquid glass particles with full control. Each entry can carry **per-type overrides** that shadow the global config:

```js
new ParticleNetwork(canvas, {
  particleCount: 100,
  particleColor: "#000000",
  particleOpacity: 1,
  pulseEnabled: false,
  particleTypes: [
    // 50% circles — override color and enable pulse just for these
    { type: "circle", percentage: 50, color: "#ff6600", pulse: true, pulseSpeed: 0.03 },
    // 30% liquid glass — override glass config just for these
    { type: "liquidGlass", percentage: 30, liquidGlass: { color: "#00ccff", opacity: 0.8 } },
    // 20 asset particles with custom opacity
    { type: "asset", asset: "star", count: 20, opacity: 0.7 },
  ],
  assets: { star: "https://..." },
  liquidGlass: { color: "#88ccff", blur: 12, contrast: 25 },
});
```

Per-type values are a **shallow override** on top of the root config. Omitted fields fall back to the global value, so existing usage without `particleTypes` stays unchanged.

### Circle type overrides

| Field        | Type    | Description                                  |
| ------------ | ------- | -------------------------------------------- |
| `color`      | string  | Particle color (hex). Overrides `particleColor` |
| `opacity`    | number  | Particle opacity (0–1). Overrides `particleOpacity` |
| `minRadius`  | number  | Min radius (px). Overrides root `minRadius`  |
| `maxRadius`  | number  | Max radius (px). Overrides root `maxRadius`  |
| `pulse`      | boolean | Enable pulse. Overrides `pulseEnabled`       |
| `pulseSpeed` | number  | Pulse speed. Overrides root `pulseSpeed`     |

### Liquid glass type overrides

| Field        | Type                      | Description                                                    |
| ------------ | ------------------------- | -------------------------------------------------------------- |
| `liquidGlass`| `Partial<LiquidGlassConfig>` | Shallow-merged over root `liquidGlass` (color, opacity, minRadius, etc.) |
| `pulse`      | boolean                   | Enable pulse. Overrides `pulseEnabled`                         |
| `pulseSpeed` | number                    | Pulse speed. Overrides root `pulseSpeed`                       |

### Asset type overrides

| Field        | Type                                     | Description                                                       |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------- |
| `liquidGlass`| `boolean \| Partial<LiquidGlassConfig>`  | `true` for glass rendering, or partial config for per-type glass  |
| `opacity`    | number                                   | Particle opacity (0–1). Overrides `particleOpacity`               |
| `pulse`      | boolean                                  | Enable pulse. Overrides `pulseEnabled`                            |
| `pulseSpeed` | number                                   | Pulse speed. Overrides root `pulseSpeed`                          |

## Connection Rules

Control which particle categories can connect to each other. Categories: `"default"` (normal circles) and asset keys (e.g. `"star"`, `"fa_solid_heart"`).

```js
new ParticleNetwork(canvas, {
  particleAssets: [
    { asset: "star", count: 20 },
    { asset: "heart", count: 20 },
  ],
  assets: { star: "...", heart: "..." },
  connectionRules: {
    allow: [["default", "star"], ["star", "heart"]],  // only these pairs connect
    deny: [["star", "heart"]],                         // or: all connect except these
  },
});
```

- **`allow`**: Only these category pairs connect. Omit or empty = all connect.
- **`deny`**: These pairs never connect (applied after allow).

## Asset Particles

Use custom icons or images (SVG, PNG, etc.) as particles:

```js
new ParticleNetwork(canvas, {
  particleCount: 100,
  particleAssets: [
    { asset: "star", count: 10 },           // exactly 10 particles with star icon
    { asset: "heart", percentage: 30 },    // 30% of particles with heart icon
  ],
  assets: {
    star: "https://example.com/star.svg",
    heart: "<svg>...</svg>",  // inline SVG string also supported
  },
});
```

Each entry in `particleAssets` must specify exactly one of `count` (exact number) or `percentage` (0–100). Remaining particles render as default circles.

## Mouse Attract

Control which particles follow vs repel the mouse. Use one or both:

```js
new ParticleNetwork(canvas, {
  mouseAttractPercentage: 30,           // 30% of particles follow the mouse
  mouseAttractAssets: ["fa_solid_star"], // particles with this asset follow
});
```

## Particle Repulsion

Keep particles from overlapping. When two particles are closer than `minParticleDistance`, they repel each other:

```js
new ParticleNetwork(canvas, {
  minParticleDistance: 20,
  minParticleForce: 0.5,
});
```

## Gradient Examples

Gradients are rendered via CSS (not canvas) for smooth, band-free appearance. A background `<div>` is automatically created behind the canvas.

### Linear Gradient (Continuous Flow)

```js
new ParticleNetwork(canvas, {
  gradientEnabled: true,
  gradientType: "linear",
  gradientColors: ["#667eea", "#764ba2", "#f093fb"],
  gradientSpeed: 0.02,
  gradientSpin: false, // Flow mode (colors slide continuously)
  gradientFlowAngle: 45, // Flow direction in degrees
});
```

### Linear Gradient (Spin/Rotate)

```js
new ParticleNetwork(canvas, {
  gradientEnabled: true,
  gradientType: "linear",
  gradientColors: ["#667eea", "#764ba2"],
  gradientSpeed: 0.01,
  gradientSpin: true, // Rotate the gradient angle
  gradientAngle: 0, // Starting angle
});
```

### Radial Gradient (Mouse Interactive)

```js
new ParticleNetwork(canvas, {
  gradientEnabled: true,
  gradientType: "radial",
  gradientColors: ["#667eea", "#764ba2", "#f093fb"],
  gradientSpeed: 0.02,
  gradientMouseReaction: true, // Center follows mouse
  gradientMouseInfluence: 0.5, // 0 = no effect, 1 = full follow
  gradientOrbitRadius: 0.3, // Orbit radius when no mouse
});
```

## Child Particles

Attach real UI components (React nodes or DOM elements) as physics particles. Each child particle has an anchor point it springs back to, reacts to the mouse, and can optionally render as a liquid glass blob.

### React

Use `ChildParticle` or `GlassChildParticle` as children of `ParticleNetworkBg`:

```jsx
import { ParticleNetworkBg, ChildParticle, GlassChildParticle } from "particle-network-bg/react";

function App() {
  return (
    <ParticleNetworkBg config={{ particleCount: 60 }} style={{ width: "100%", height: "100vh" }}>
      {/* Normal circle particle with a React child */}
      <ChildParticle id="card-1" x={300} y={200} radius={50}>
        <div style={{ color: "#fff", fontSize: 12 }}>Hello</div>
      </ChildParticle>

      {/* Liquid glass blob particle */}
      <GlassChildParticle id="clock" x={600} y={400} radius={60}>
        <span>🕐</span>
      </GlassChildParticle>

      {/* Rectangular child particle */}
      <ChildParticle id="widget" x={900} y={300} width={160} height={80} borderRadius={16}>
        <div>Widget content</div>
      </ChildParticle>
    </ParticleNetworkBg>
  );
}
```

### `ChildParticle` / `GlassChildParticle` Props

| Prop             | Type      | Default  | Description                                                   |
| ---------------- | --------- | -------- | ------------------------------------------------------------- |
| `id`             | string    | required | Unique identifier                                             |
| `x`              | number    | required | Anchor X position (px)                                        |
| `y`              | number    | required | Anchor Y position (px)                                        |
| `radius`         | number    | required | Particle radius (px). Used for physics and as size            |
| `width`          | number    | —        | Rectangular width (px). Set with `height` for rect shape      |
| `height`         | number    | —        | Rectangular height (px)                                       |
| `borderRadius`   | number    | —        | Border radius (px) for rectangular shapes. Default: fully round |
| `overflow`       | string    | `"hidden"` | CSS overflow for the child content container                |
| `anchorForce`    | number    | `0.05`   | Spring force pulling back to anchor (0–1). Lower = more floaty |
| `mouseInfluence` | number    | `0.1`    | Mouse influence multiplier (0–1). 0 = ignores mouse           |
| `children`       | ReactNode | —        | Content to render inside the particle                         |
| `style`          | CSSProperties | —   | Style applied to the inner wrapper div                        |
| `className`      | string    | —        | Class applied to the inner wrapper div                        |

### Vanilla JS

Use `addChildParticle` / `removeChildParticle` on the `ParticleNetwork` instance directly:

```js
const network = new ParticleNetwork(canvas, { particleCount: 60 });
network.start();

// Add a child particle
network.addChildParticle({
  id: "card-1",
  x: 300,
  y: 200,
  radius: 50,
  anchorForce: 0.05,
  mouseInfluence: 0.1,
  liquidGlass: false,
});

// Update its anchor (e.g. on scroll/resize)
network.updateChildParticle("card-1", { x: 400, y: 250 });

// Get current positions every frame via callback
network.onChildUpdate = (positions) => {
  const pos = positions.get("card-1");
  // pos.x, pos.y, pos.radius, pos.currentRadius, pos.width, pos.height, pos.rotation
  myDomEl.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
};

// Remove
network.removeChildParticle("card-1");
```

### Child Particle API

| Method / Property                              | Description                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| `addChildParticle(config)`                     | Register a child particle. Creates the particle with anchor physics. |
| `removeChildParticle(id)`                      | Remove a child particle by ID.                                       |
| `updateChildParticle(id, updates)`             | Update anchor position or any config property at runtime.            |
| `getChildParticlePositions()`                  | Returns a `Map<string, ChildParticlePosition>` with current state.   |
| `onChildUpdate`                                | Callback fired every frame: `(positions: Map<string, ChildParticlePosition>) => void` |
| `getChildOverlayElement(id)`                   | Returns the DOM div overlay for a child particle (for manual use).   |

### Types

```ts
import type { ChildParticleConfig, ChildParticlePosition } from "particle-network-bg";

interface ChildParticleConfig {
  id: string;
  x: number;
  y: number;
  radius: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  overflow?: string;
  anchorForce?: number;
  mouseInfluence?: number;
  liquidGlass?: boolean;
}

interface ChildParticlePosition {
  x: number;
  y: number;
  radius: number;
  currentRadius: number;
  width?: number;
  height?: number;
  rotation: number; // blob rotation in radians (liquid glass only, 0 for normal)
}
```

## API

### React (`particle-network-bg/react`)

- `ParticleNetworkBg` – Wrapper component. Props: `config`, `style`, `className`, `children` (for `ChildParticle` / `GlassChildParticle`)
- `useParticleNetwork(config?)` – Hook that returns a canvas ref
- `ChildParticle` – React child particle component (see [Child Particles](#child-particles))
- `GlassChildParticle` – Liquid glass variant of `ChildParticle`
- `ParticleNetworkContext` – React context exposing the `ParticleNetwork` instance; use `useContext(ParticleNetworkContext)` inside children of `ParticleNetworkBg` for direct instance access

### `ParticleNetwork` (vanilla)

- `start()` – Start animation
- `stop()` – Stop animation
- `cleanup()` – Remove listeners and stop (call on unmount)
- `updateConfig(property, value)` – Update a config value at runtime
- `reset(defaults)` – Reset to new defaults

### Types

```ts
import type {
  ParticleNetworkConfig,
  Particle,
  GradientType,
  ConnectionRules,
  LiquidGlassConfig,
  LiquidGlassHighlightPosition,
  ParticleTypeEntry,
  CircleTypeEntry,
  LiquidGlassTypeEntry,
  AssetTypeEntry,
  ParticleAssetConfig,
  ChildParticleConfig,
  ChildParticlePosition,
} from "particle-network-bg";
```

## Credits

Based on [particle-network-background](https://github.com/cloudwerxlabs/particle-network-background) by CloudWerx Labs.

## License

MIT
