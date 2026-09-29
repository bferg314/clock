# AGENTS.md

Operations manual for coding agents working in this repository.

> **Keep this file at 200 lines or fewer.** When adding a rule, consolidate or remove another. Keep only
> what an agent cannot learn quickly from the code itself.

## Repository overview

Self-hosted web clock: a single static page with an analog (SVG) mode and a digital (web-font) mode.
Vanilla JavaScript ES modules bundled by Vite; **no framework and no runtime dependencies** — the only
npm `dependencies` are `@fontsource/*` packages, which are bundled into the build so the app works fully
offline. The production artifact is static files served by nginx from a Docker image.

```
index.html        Full DOM: clock containers + settings panel. Element ids are the contract with main.js.
src/main.js       Bootstrap, DOM event wiring, settings-panel behavior. The only event-wiring layer.
src/clock.js      Orchestrator: owns resolved timezone, mode switching, restart of the two renderers.
src/settings.js   Single source of truth for persisted state (localStorage) + size tokens.
src/timezone.js   Intl-based time source and formatting. All displayed time originates here.
src/analog/       index.js (style registry, rAF loop, cycling), helpers.js (shared SVG utils), one file per face.
src/digital/      index.js (1-second tick + font cycling), fonts.js (@fontsource imports + font registry).
src/style.css     All styling. Analog faces style themselves inline in SVG; CSS covers layout and the panel.
test/             Vitest suites (jsdom). See Testing.
nginx/, Dockerfile, docker-compose.yml, DOCKER.md   Deployment only.
dist/             Generated build output. Gitignored. Never hand-edit or commit.
```

## Commands

Node `^20.19.0 || >=22.12.0` (enforced by `engines`; Vite 8 requires it). No database, services, or env vars.

```bash
npm ci                          # install from lockfile (not `npm install`)
npm run dev                     # dev server with HMR at http://localhost:5173
npm run build                   # production build -> dist/ (about 1s)
npm run preview                 # serve the built dist/ at http://localhost:4173
npm test                        # headless test suite, jsdom (about 1s warm)
npx vitest run test/faces.test.js               # one file
npx vitest run -t 'rotates each hand'           # one test by name
```

There is **no lint, format, or type-check tooling.** Do not invent commands for it or add it as a side
effect of an unrelated task. `npm test` and `npm run build` are the two automated checks; run both for any
change touching `src/` or `index.html`.

CI (`.github/workflows/ci.yml`) runs install, test, and build on every pull request.
`.github/workflows/publish.yml` builds and pushes the Docker image only on `v*` tag pushes, releases, and
manual dispatch.

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

**Dependencies.** Do not add runtime dependencies. If a task appears to need a library, solve it with
platform APIs or report the constraint. New `devDependencies` need a clear reason and must not reach the
browser bundle.

## Change discipline

- Read the existing implementation first and mirror the nearest example (a new face should read like
  `src/analog/minimal.js`). Reuse existing helpers, the settings module, and the time source.
- Prefer the smallest change that fully solves the task. Preserve behavior, exports, settings keys, DOM ids,
  and CSS class names unless the task requires changing them.
- Unless asked, do not reformat unrelated code, upgrade dependencies, regenerate `package-lock.json`,
  add single-caller abstractions, or hand-edit `dist/`.
- Never silence an error, delete a check, add a broad `try/catch`, or weaken validation or security
  controls (timezone validation, nginx headers) to make something pass.
- Never claim a command or build succeeded unless it actually ran and succeeded.

## Testing

Vitest with jsdom. Tests in `test/*.test.js` import from `src/` directly; nothing is mocked beyond
`vi.useFakeTimers()`.

- `test/faces.test.js` — registry invariants plus the init/update contract, run against **every** face
  module on disk via `import.meta.glob`. A new face needs no new test, but one left unregistered fails.
- `test/time.test.js` — hand angles and time formatting, against a frozen clock.
- `test/smoke.test.js` — boots the real `index.html` + `src/main.js`; asserts both modes render, hands
  advance across frames, and settings persist.

Changes to time handling, formatting, settings shape, or registry order need assertions; a bug fix adds
the case that was broken. If a "locked order" assertion fails, move your new entry to the end of the
array — do not edit the expected list.

The suite does not cover appearance. For anything visual, run `npm run dev` and confirm the face renders
at every size including **Fill**, and that switching mode, style, font, size, or timezone leaves no stray
timer (time must not speed up or double-tick). Clear the `clock-settings` localStorage entry to check
first-run defaults.

## Security and configuration

- No secrets, tokens, or credentials belong in this repository. Publishing uses the built-in
  `GITHUB_TOKEN`; do not add secrets to workflows.
- The app is fully client-side: no backend, no auth, no user data beyond `localStorage`.
- Do not weaken the headers or caching rules in `nginx/default.conf`; the `no-cache` rule on `index.html`
  is what lets deployed containers pick up updates.

## Documentation

- Adding or removing a face or font: update its `README.md` table and the count in Features.
- Changing settings, sizes, or default behavior: update the relevant `README.md` section.
- Changing the Dockerfile, nginx config, compose file, or publish workflow: update `DOCKER.md`.

## Git workflow

- **Ask before anything that leaves the machine**: commit, push, PR, merge, tag, or branch deletion.
  Permission for one of these does not cover the next.
- **Never commit to or force-push `main`.** Branch from a fresh `origin/main` (`git fetch origin &&
  git switch -c <kebab-case-name> origin/main`), one topic per branch. GitHub does not enforce this; you must.
- Do not stash, reset, or discard uncommitted work you did not make. Look before any `reset --hard`,
  `clean`, or `branch -D`.
- **Commits:** imperative, capitalized subject with no trailing period, about 72 characters max
  (e.g. `Add Blueprint and Mondrian analog faces`). For anything non-trivial, add a body explaining *why*,
  wrapped at about 72 characters. Stage files by name and review `git diff --staged`; no `--no-verify`, and
  no `--amend` after pushing.
- **Updating a pushed branch:** merge `origin/main` into it, or rebase and push with `--force-with-lease`
  (never a bare `--force`).
- **Merging:** only once the `build` check is green (`gh pr view <n> --json mergeStateStatus,statusCheckRollup`).
  Use a merge commit (`gh pr merge <n> --merge`), not squash or rebase. Then delete the branch locally
  (`git branch -d`) and on the remote.
- **Checking whether a branch landed:** run `git fetch origin` first, then `git log origin/main..<branch>`.
  Empty output means it is merged.

**Releases.** Pushing a `v*` tag publishes the image to GHCR as `X.Y.Z`, `X.Y`, and `latest`. Tag only
when asked.

1. Land a version-bump PR (`npm version <x.y.z> --no-git-tag-version`); publish fails if tag ≠ `package.json`.
2. Check the tag is new (`git ls-remote --tags origin v<x.y.z>`), then on an up-to-date `main`:
   `git tag -a v<x.y.z> -m "v<x.y.z> - <summary>" && git push origin v<x.y.z>` (never `--tags`).
3. **A pushed tag is permanent.** Never move or delete one. If a release is wrong, cut the next patch.

## Definition of done

Scale to the change:

- Documentation-only: content is accurate and consistent with the code it describes.
- Any change to `src/` or `index.html`:
  - [ ] `npm test` passes, with assertions added for new or fixed behavior.
  - [ ] `npm run build` succeeds.
  - [ ] Anything visual checked in the browser via `npm run dev` — the suite does not cover appearance.
  - [ ] `git diff` reviewed; only intended files changed and no debug logging left behind.
  - [ ] `README.md` / `DOCKER.md` updated if the change is user- or deploy-visible.
  - [ ] Anything you could not verify is stated explicitly, along with remaining assumptions and risks.
