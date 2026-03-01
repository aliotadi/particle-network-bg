## Cursor Cloud specific instructions

This is a pure frontend TypeScript library (`particle-network-bg`) with no backend, no automated tests, and no linter configured in `package.json`. There are no Docker or external service dependencies.

### Build order

The root library **must be built before** the demo apps work, because both demos depend on the library via `file:../..` which reads from `dist/`.

```
npm run build          # root — builds dist/ via tsup
```

### Running demos

Both demos use Vite dev servers. The Vite configs set a `base` path for GitHub Pages, so local dev URLs include that path segment:

- **Vanilla:** `cd demo/vanilla && npm run dev` → `http://localhost:5173/particle-network-bg/vanilla/`
- **React:** `cd demo/react && npm run dev` → `http://localhost:5174/particle-network-bg/react/` (use `--port 5174` if running both)

### Verification

- **Type-check:** `npx tsc --noEmit` (runs against `tsconfig.json`)
- **Build:** `npm run build` (tsup, produces CJS + ESM + `.d.ts`)
- There are no test scripts or lint scripts — testing is manual/visual via the demo apps.
