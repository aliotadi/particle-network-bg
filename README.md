# particle-network-bg

Interactive particle network animation for backgrounds. Typed, zero dependencies (core), works with vanilla JS, React, or any framework.

> **Note:** The demos are in the [`demo/`](./demo) directory.

## Demo

Live demos (after enabling [GitHub Pages](https://docs.github.com/en/pages)):

- **[Vanilla JS](https://YOUR_USERNAME.github.io/particle-network-bg/vanilla/)**
- **[React](https://YOUR_USERNAME.github.io/particle-network-bg/react/)**

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

> **Note:** Config is applied on mount. The canvas resizes to the window.

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `particleCount` | number | 100 | Number of particles |
| `minRadius` | number | 2 | Min particle size (px) |
| `maxRadius` | number | 6 | Max particle size (px) |
| `particleColor` | string | `#000000` | Particle color (hex) |
| `lineColor` | string | `#000000` | Connection line color (hex) |
| `lineWidth` | number | 1 | Line width |
| `lineOpacity` | number | 0.2 | Line opacity (0–1) |
| `maxDistance` | number | 150 | Max connection distance (px) |
| `moveSpeed` | number | 1 | Particle movement speed |
| `backgroundColor` | string | `#ffffff` | Background color (hex) |
| `backgroundOpacity` | number | 1 | Background opacity (0–1) |
| `particleOpacity` | number | 1 | Particle opacity (0–1) |
| `mouseRadius` | number | 200 | Mouse interaction radius |
| `mouseInteraction` | boolean | true | Enable mouse repel effect |
| `pulseEnabled` | boolean | true | Enable pulse animation |
| `pulseSpeed` | number | 0 | Pulse speed |
| `depthEffectEnabled` | boolean | true | 3D depth effect |
| `depthSpeed` | number | 0.02 | Depth animation speed |
| `gradientEnabled` | boolean | false | Use gradient background |
| `gradientType` | `"linear" \| "radial"` | `"linear"` | Gradient type |
| `gradientColors` | string[] | `["#667eea", "#764ba2"]` | Gradient colors (hex) |
| `gradientStops` | number[] | auto | Color stops (0–1), optional |
| `gradientSpeed` | number | 0.02 | Gradient animation speed |
| `gradientMouseReaction` | boolean | true | **Radial only:** Gradient center follows mouse |
| `gradientMouseInfluence` | number | 0.5 | **Radial only:** Mouse influence strength (0–1) |
| `gradientAngle` | number | 0 | **Linear spin mode:** Initial rotation angle (degrees) |
| `gradientRadius` | number | 1 | **Radial:** Gradient radius multiplier |
| `gradientSpin` | boolean | false | **Linear:** `true` = rotate, `false` = flow continuously |
| `gradientFlowAngle` | number | 45 | **Linear flow mode:** Direction of color flow (degrees) |
| `gradientOrbitRadius` | number | 0.3 | **Radial:** Orbit radius for center movement (0–1) |

## Gradient Examples

### Linear Gradient (Continuous Flow)

```js
new ParticleNetwork(canvas, {
  gradientEnabled: true,
  gradientType: "linear",
  gradientColors: ["#667eea", "#764ba2", "#f093fb"],
  gradientSpeed: 0.02,
  gradientSpin: false,          // Flow mode (colors slide continuously)
  gradientFlowAngle: 45,        // Flow direction in degrees
});
```

### Linear Gradient (Spin/Rotate)

```js
new ParticleNetwork(canvas, {
  gradientEnabled: true,
  gradientType: "linear",
  gradientColors: ["#667eea", "#764ba2"],
  gradientSpeed: 0.01,
  gradientSpin: true,           // Rotate the gradient angle
  gradientAngle: 0,             // Starting angle
});
```

### Radial Gradient (Mouse Interactive)

```js
new ParticleNetwork(canvas, {
  gradientEnabled: true,
  gradientType: "radial",
  gradientColors: ["#667eea", "#764ba2", "#f093fb"],
  gradientSpeed: 0.02,
  gradientMouseReaction: true,  // Center follows mouse
  gradientMouseInfluence: 0.5,  // 0 = no effect, 1 = full follow
  gradientOrbitRadius: 0.3,     // Orbit radius when no mouse
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
} from "particle-network-bg";
```

## License

MIT
