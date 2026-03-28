# Clock

A minimal, self-hosted web clock with analog and digital modes. No frameworks, no external dependencies at runtime — just a small nginx container serving static assets.

---

## Features

### Modes
- **Analog** — four distinct SVG clock faces
- **Digital** — fourteen bundled fonts, no CDN required

### Analog styles

| Style | Description |
|-------|-------------|
| Classic | Cream face, Arabic numerals, filled hands, drop shadow |
| Minimal | No numerals, four dot markers, hairline hands (Bauhaus inspired) |
| Retro | Dark amber face, Roman numerals, CRT scanline overlay |
| Skeleton | Transparent face, outline hands, gear motif at center |

### Digital fonts (all bundled, offline-capable)

| Font | Character |
|------|-----------|
| Orbitron | Tech / space |
| Share Tech Mono | Mono tech |
| VT323 | Retro pixel |
| Press Start 2P | 8-bit game |
| Audiowide | Sci-fi |
| Oxanium | Geometric tech |
| Chakra Petch | Angular |
| Syncopate | Bold minimal |
| Major Mono Display | Artistic mono |
| Space Mono | Typewriter |
| Roboto Mono | Neutral |
| Rajdhani | Geometric |
| Nova Mono | Elegant mono |
| Exo 2 | Modern |

### Style and font cycling
- **Random on load** — a new style or font is chosen randomly on each page visit
- **Timer** — cycles through all options sequentially on a configurable interval (default: 5 minutes)
- **Pinned** — lock to a specific style or font

Analog and digital cycle independently.

### Other settings
- **Size** — Small (200 px), Medium (300 px), Large (400 px)
- **Timezone** — auto-detected from the browser; override with any IANA timezone (type to filter ~600 options)
- **12 / 24-hour format** — digital mode toggle
- All settings are persisted to `localStorage`

---

## Development

**Requirements:** Node.js 20+

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

---

## Deployment

See [DOCKER.md](DOCKER.md) for full Docker, Compose, and GitHub Actions instructions.

Quick start with Docker Compose (after updating the image name):

```bash
docker compose up -d
# open http://localhost:8080
```

---

## Tech stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Vanilla JS + Vite | Single widget, no component lifecycle needed |
| Fonts | `@fontsource/*` npm packages | Bundled into the image — no CDN, fully offline |
| SVG clocks | Programmatic DOM | No libraries, precise control, ~60 fps via `requestAnimationFrame` |
| Server | nginx:stable-alpine | ~25 MB final image, zero Node.js at runtime |
| Container | Docker + Compose | Single-service, label-based Watchtower opt-in |
| Registry | ghcr.io | Free for public repos, integrated with `GITHUB_TOKEN` |
| CI | GitHub Actions | Builds `linux/amd64` + `linux/arm64` on tag push |
