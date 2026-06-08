# CLAUDE.md

Guidance for Claude Code working on this repo. Keep this file slim — when something deserves more than a paragraph, put it in `/docs/` and link.

## Project

Wendy's mobile app prototype — a web-based interactive prototype for exploring and validating UX/UI ideas, independent of the production Flutter app. Purpose is rapid UX/UI iteration and stakeholder demos.

The canonical specification is [`/assets/wendys-prototype-prd.md`](./assets/wendys-prototype-prd.md).

## Where to look

| Topic | Doc |
|---|---|
| App architecture (contexts, routing, data hooks, asset paths, MCP) | [`docs/architecture.md`](./docs/architecture.md) |
| Component conventions, design language, design framework, a11y, common mistakes | [`docs/component-guide.md`](./docs/component-guide.md) |
| What's built, SPP module/product matrix, screens, next session plan | [`docs/build-status.md`](./docs/build-status.md) |
| Component registry with props + use cases | [`COMPONENTS.md`](./COMPONENTS.md) |
| Voice ordering POC — full architecture, decisions, file map, open questions | [`src/features/voice-ordering/README.md`](./src/features/voice-ordering/README.md) |
| API proxy deployment + troubleshooting | [`api/README.md`](./api/README.md) |
| SPP module spec + product-type matrix | [`assets/menu-system-requirements.md`](./assets/menu-system-requirements.md) |

## Tech stack

React 19 + TypeScript, Vite 8, Tailwind CSS v4 (CSS-first via `@theme`), Framer Motion, Lottie React, React Router DOM, React Context + useReducer (no Redux/Zustand), Mapbox GL JS (`react-map-gl`) with Leaflet+OSM fallback, Storybook 10. Mobile viewport: 390×844 (iPhone 13/14) inside a device frame.

## Commands

```bash
npm run dev                  # Vite dev server on :5173
npm run storybook            # Storybook on :6006
npm run build                # Production build (tsc + vite build)
npm run refresh-voice-data   # Re-vendor voice ordering data after editing menu.json/ingredients.json
```

## Critical rules

### Figma is the source of truth

Always follow Figma specs over the PRD when they differ. The PRD is a planning document; Figma reflects actual decisions. When inspecting:

1. Use `figma_get_selection` or `figma_execute` to pull variant properties, layout, colors
2. Extract `boundVariables` to get token names — use those, not raw color values
3. Take a screenshot to visually verify
4. If something is ambiguous in Figma, **ask Adam before proceeding**

### Token-only styling

Every color, spacing, radius, border-width, and shadow must reference design tokens via CSS custom properties. Never hardcode hex/px/rgb in components.

- **Colors:** `var(--color-*)` from `tokens.css` or Tailwind utilities mapped in `@theme`
- **Spacing:** `p-wds-16`, `gap-wds-12`, etc.
- **Radii:** `rounded-wds-m`, `rounded-wds-full`, etc.
- **Shadows:** `shadow-wds-s`, `shadow-wds-m`, etc.

If a value doesn't exist in the token system, flag it rather than hardcoding.

### Tailwind v4 — no dynamic class interpolation

Tailwind v4's JIT scanner needs full static class strings in source. Template literals with interpolated segments produce no CSS output. Use explicit conditional returns with full strings:

```typescript
// ✅ scanner-visible
if (cs === 'primary') return 'bg-[var(--color-bg-brand-primary-default)]';
return 'bg-[var(--color-bg-brand-secondary-default)]';

// ❌ scanner can't resolve
return `bg-[var(--color-bg-brand-${brand}-default)]`;
```

### Token file: light theme only

Active token file is `src/styles/tokens.css`, sourced from `assets/tokens/css/tokens-light.css`. The original `assets/tokens/css/tokens.css` is dark theme — NOT used. Token variable names are **unprefixed** (`--color-blue-600`, NOT `--wds-color-blue-600`).

### Update docs after every component

After completing a new component or significant change:

1. Add to the components count in [`docs/build-status.md`](./docs/build-status.md). Add per-component conventions to [`docs/component-guide.md`](./docs/component-guide.md) only if they're non-obvious.
2. Add a component entry to [`COMPONENTS.md`](./COMPONENTS.md) (location, use cases, key props).
3. Copy any new assets from `assets/` to `public/`.
4. Note data quirks in [`docs/architecture.md`](./docs/architecture.md) data hooks section.

### Run a real build before pushing

`tsc --noEmit` is lenient; Vercel runs `tsc -b` and will fail-deploy on unused imports etc. Always `npm run build` locally before pushing to main.

### Commit incrementally

Small, focused commits as work progresses, not one batched commit at the end. Push to main when a feature lands cleanly; a stale main can mean stale code on the live site.
