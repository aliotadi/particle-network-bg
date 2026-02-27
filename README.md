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
cd lib/demo/vanilla && npm install && npm run dev

# React
cd lib/demo/react && npm install && npm run dev
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
    highlightPosition: "top-left",
    highlightColor: "#ffffff",
    shadowStrength: 0.4,
    secondaryReflection: 0.25,
    secondaryHighlightPosition: "bottom-right",
  },
});
```

## Particle Types

Use `particleTypes` to mix circle, asset, and liquid glass particles with full control:

```js
new ParticleNetwork(canvas, {
  particleTypes: [
    { type: "circle", percentage: 50 },
    { type: "liquidGlass", percentage: 30 },
    { type: "asset", asset: "star", count: 20, liquidGlass: true },
  ],
  assets: { star: "https://..." },
  liquidGlass: { mergeDistance: 40, color: "#88ccff", ... },
});
```

- **`circle`**: Normal circles
- **`liquidGlass`**: Liquid glass blobs (merge when close)
- **`asset`**: Icons/images; use `liquidGlass: true` to combine with glass

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

## API

### React (`particle-network-bg/react`)

- `ParticleNetworkBg` – Wrapper component. Props: `config`, `style`, `className`
- `useParticleNetwork(config?)` – Hook that returns a canvas ref

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
  ParticleTypeEntry,
} from "particle-network-bg";
```

## Credits

Based on [particle-network-background](https://github.com/cloudwerxlabs/particle-network-background) by CloudWerx Labs.

## License

MIT
