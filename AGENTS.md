# AGENTS.md

Operations manual for coding agents working in this repository.

## Repository overview

Self-hosted web clock: a single static page with an analog (SVG) mode and a digital (web-font) mode.
Vanilla JavaScript ES modules bundled by Vite; **no framework and no runtime dependencies** — the only
npm `dependencies` are `@fontsource/*` packages, which are bundled into the build so the app works fully
offline. The production artifact is static files served by nginx from a Docker image.

Four things drive almost every change:

- `index.html` — the whole DOM, including every settings control. There is no templating.
- `src/main.js` — binds those DOM ids to settings and the clock; the bootstrap and only event-wiring layer.
- `src/analog/` — one module per clock face plus an orchestrator that owns style selection and the rAF loop.
- `src/digital/` — font list plus a renderer that owns the 1-second tick.

## Setup

Node `^20.19.0 || >=22.12.0` (enforced by `engines` in `package.json`; Vite 8 requires it). No database,
no local services, no environment variables.

```bash
npm ci
```

Use `npm ci` rather than `npm install` so the lockfile stays authoritative.

## Repository structure

```
index.html        Full DOM: clock containers + settings panel. Element ids are the contract with main.js.
src/main.js       Bootstrap, DOM event wiring, settings-panel behavior.
src/clock.js      Orchestrator: owns resolved timezone, mode switching, restart of the two renderers.
src/settings.js   Single source of truth for persisted state (localStorage) + size tokens.
src/timezone.js   Intl-based time source and formatting. All displayed time originates here.
src/analog/       index.js (style registry, rAF loop, cycling), helpers.js (shared SVG utils), one file per face.
src/digital/      index.js (tick + font cycling), fonts.js (@fontsource imports + font registry).
src/style.css     All styling. Analog faces style themselves inline in SVG; CSS covers layout and the panel.
nginx/, Dockerfile, docker-compose.yml, DOCKER.md   Deployment only.
dist/             Generated build output. Gitignored. Never hand-edit or commit.
```

## Commands

```bash
npm ci            # install from lockfile
npm run dev       # dev server with HMR at http://localhost:5173
npm run build     # production build -> dist/ (about 1-2s)
npm run preview   # serve the built dist/ at http://localhost:4173
```

There is **no lint, format, type-check, or test tooling in this repository.** Do not invent commands for
them, and do not add such tooling as a side effect of an unrelated task.

`npm run build` is the only automated check available. Run it for any change that touches `src/` or
`index.html`, then verify behavior in a browser via `npm run dev`.

CI (`.github/workflows/publish.yml`) only builds and pushes the Docker image on version-tag pushes,
releases, and manual dispatch. **Nothing runs on pull requests**, so local verification is the only gate.

## Architecture rules

**Analog face contract.** Every module in `src/analog/` exports exactly:

```js
export function init(svg)                     // append elements, return hand refs
export function update(refs, h, m, s, ms)     // set transforms only; called every frame
```

`init` receives an emptied `<svg viewBox="0 0 200 200">`; the dial center is `(100, 100)`. Return
`{ hourHand, minuteHand, secondHand }`. Keep `update` to attribute writes on those refs — it runs at
frame rate, so never allocate DOM or recompute geometry there.

- Use `svgEl`, `rotateStr`, and `handAngles` from `src/analog/helpers.js` instead of re-deriving
  namespaces, transform strings, or hand angles.
- Give any `<defs>` child a face-specific id prefix (existing faces use `cls-`, `ret-`, `bp-`, `md-`, `neo-`).
- Faces style themselves with inline SVG attributes, not CSS classes.

**Registries are index-addressed and persisted.** `STYLES` / `STYLE_NAMES` in `src/analog/index.js` and
`FONTS` in `src/digital/fonts.js` are positional; their indices are written to `localStorage` as
`pinnedStyle`, `currentStyle`, `pinnedFont`, and `currentFont`.

- **Append new entries to the end. Never insert or reorder**, or an existing user's pinned selection
  silently changes to a different face or font.
- `STYLES` and `STYLE_NAMES` must stay in the same order and length.
- Registering a face or font is all that is required — the select, cycling, and pinning read from these arrays.

**Settings.** All persisted state goes through `src/settings.js`. Add new keys to `DEFAULTS`; `load()`
shallow-merges stored values over `DEFAULTS` (one level deep for `analog` and `digital`), so a new key is
automatically backward compatible. Do not read or write `localStorage` from anywhere else, and do not
change the `clock-settings` storage key or the shape of existing keys without a migration.

**Time.** Every displayed time comes from `getTimeParts(tz)` in `src/timezone.js`. `src/clock.js` owns
resolving `'auto'` to the browser zone and passes a `_getTime` closure down. Do not call `new Date()` for
display in renderers, and do not add a second timezone-resolution path.

**Renderer lifecycle.** Analog updates via `requestAnimationFrame`; digital via a 1-second `setInterval`.
Any timer or rAF handle a renderer starts must be cleared in its `stop()`. Settings changes that affect a
renderer go through `Clock.restartAnalog()` / `Clock.restartDigital()`, which call `stop()` then `init()`;
do not start loops outside `init()`.

**DOM.** Controls live in `index.html` and are wired by id in `src/main.js`. Adding a control means editing
both files. `src/main.js` is the only module that looks elements up by id or registers event listeners;
every other module operates on elements handed to it (the one exception is `applySize` in
`src/settings.js`, which sets the `--clock-size` custom property on `documentElement`).

**Offline is a hard requirement.** Fonts are imported from `@fontsource/*` in `src/digital/fonts.js` so
Vite bundles the WOFF2 files. Never add a CDN link, Google Fonts URL, analytics, or any other runtime
network request.

**Dependencies.** Do not add npm dependencies. The stack is deliberately framework-free and library-free;
if a task appears to need a library, solve it with platform APIs or report the constraint.

## Development principles

- Read the existing implementation before changing it; the faces and renderers follow tight conventions.
- Mirror the nearest existing example. A new face should read like `src/analog/minimal.js`.
- Prefer the smallest change that fully solves the task.
- Reuse the existing helpers, settings module, and time source before writing new ones.
- Preserve existing behavior, module exports, settings keys, and DOM ids unless the task requires changing them.
- Never weaken validation or security controls (timezone validation, nginx headers) to make something pass.
- Never claim a command or build succeeded unless it actually ran and succeeded.

## Change discipline

Do not, unless the task explicitly asks:

- reformat, restyle, or "clean up" code you were not asked to change;
- reorder or renumber the style/font registries;
- rename exports, settings keys, DOM ids, or CSS class names;
- upgrade dependencies or regenerate `package-lock.json`;
- introduce abstractions for a single caller;
- hand-edit anything under `dist/`;
- silence an error, delete a check, or add a broad `try/catch` instead of fixing the cause.

## Testing

There is no test framework. Verify changes by running the app and exercising the affected paths:

```bash
npm run dev
```

For a UI or rendering change, confirm in the browser:

- both modes render (Analog / Digital toggle) and the second hand or seconds digit advances smoothly;
- a new or edited face renders at every size, including **Fill**, and the hands point at the correct time;
- settings survive a reload (they are persisted to `localStorage`);
- pinning a specific style or font still selects the intended one after adding a registry entry;
- switching mode, style, font, size, or timezone leaves no stray timer running (time must not speed up or
  double-tick after several switches).

Clear the `clock-settings` localStorage entry when testing first-run defaults.

## Security and configuration

- No secrets, tokens, or credentials belong in this repository. It has none today; do not add any.
- The app is fully client-side — there is no backend, no auth, and no user data beyond `localStorage`.
- Publishing uses the workflow's built-in `GITHUB_TOKEN`. Do not add secrets to the workflow.
- Do not weaken the response headers or caching rules in `nginx/default.conf`; the `no-cache` rule on
  `index.html` is what lets deployed containers pick up updates.

## Documentation

- Adding or removing an analog face or a digital font requires updating the corresponding table in
  `README.md`, including the count in the Features section.
- Changing settings, sizes, or default behavior requires updating the relevant `README.md` section.
- Changing the Dockerfile, nginx config, compose file, or publish workflow requires updating `DOCKER.md`.

## Commits and pull requests

- Imperative, capitalized subject line with no trailing period (e.g. `Add Blueprint and Mondrian analog faces`).
- Add a body explaining *why* for anything beyond a trivial change; wrap at roughly 72 characters.
- Work on a feature branch and merge into `main` via pull request.
- Releases are cut by pushing a `v*` tag, which triggers the image publish. Do not tag unless asked.

## Definition of done

Scale to the change:

- Documentation-only: content is accurate and consistent with the code it describes.
- Any change to `src/` or `index.html`:
  - [ ] `npm run build` succeeds.
  - [ ] Behavior verified in the browser via `npm run dev`, including the checks under **Testing**.
  - [ ] `git diff` reviewed; only intended files changed and no debug logging left behind.
  - [ ] `README.md` / `DOCKER.md` updated if the change is user- or deploy-visible.
  - [ ] Anything you could not verify is stated explicitly, along with remaining assumptions and risks.
