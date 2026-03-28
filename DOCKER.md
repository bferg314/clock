# Docker & Deployment

This document covers the Dockerfile, Docker Compose setup, GitHub Actions pipeline, and how to trigger a new release build.

---

## Dockerfile

The build uses two stages so that Node.js is never present in the final image.

```
Stage 1 (builder)   node:20-alpine
  npm ci → vite build → dist/

Stage 2 (server)    nginx:stable-alpine
  Copy dist/ → /usr/share/nginx/html
  Copy nginx/default.conf
  Expose port 80
```

**Final image size:** ~25 MB.

### nginx caching strategy

| Path | Cache policy | Reason |
|------|-------------|--------|
| `/assets/*` | `Cache-Control: public, immutable` (1 year) | Vite hashes filenames — stale content is impossible |
| `/index.html` | `Cache-Control: no-cache, no-store` | Must always be fresh so browsers pick up a new bundle after Watchtower restarts the container |

---

## Docker Compose

```yaml
services:
  clock:
    image: ghcr.io/bferg314/clock:latest
    container_name: clock
    restart: unless-stopped
    ports:
      - "8080:80"
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
```

The image name matches the GitHub repository — GitHub Actions derives it from `github.repository` automatically.

### Running

```bash
docker compose up -d
```

The clock is then available at `http://localhost:8080` (or whichever host/port you expose).

### Pulling a specific version

```bash
# latest
docker pull ghcr.io/bferg314/clock:latest

# specific release
docker pull ghcr.io/bferg314/clock:1.2.3

# major.minor only
docker pull ghcr.io/bferg314/clock:1.2
```

---

## GitHub Actions

The workflow lives at `.github/workflows/publish.yml`. It builds a multi-platform image (`linux/amd64` + `linux/arm64`) and pushes it to the GitHub Container Registry.

### Triggers

The workflow runs on **either** of these events:

| Event | How to trigger |
|-------|---------------|
| Tag push matching `v*` | `git tag v1.0.0 && git push --tags` |
| GitHub Release published | Create a release in the GitHub UI or via `gh release create` |

Both methods produce the same result. Using tags directly is faster for automated pipelines; using the GitHub UI is easier to attach release notes to.

### Tags produced

`docker/metadata-action` automatically derives these tags from the triggering event:

| Tag | Example | When |
|-----|---------|------|
| Full semver | `1.2.3` | Always |
| Major.minor | `1.2` | Always |
| `latest` | `latest` | When the trigger is on the default branch |

### Authentication

The workflow uses `GITHUB_TOKEN` — no additional secrets or credentials are required. The token is automatically available to all GitHub Actions runs and has `packages: write` permission granted in the job definition.

### Build cache

The workflow uses GitHub Actions cache (`cache-from: type=gha`) to speed up repeated builds. The Node dependency layer is typically restored from cache on subsequent pushes, making builds significantly faster after the first run.

---

## Triggering a release build

### Option 1 — Tag push (recommended for scripted releases)

```bash
git tag v1.0.0
git push origin v1.0.0
```

The Actions workflow starts immediately. Monitor it at:

```
https://github.com/bferg314/clock/actions
```

### Option 2 — GitHub CLI

```bash
gh release create v1.0.0 --title "v1.0.0" --notes "Initial release"
```

This creates a GitHub Release and publishes it in one step, which triggers the workflow.

### Option 3 — GitHub UI

1. Go to your repository → **Releases** → **Draft a new release**
2. Click **Choose a tag**, type a new tag (e.g. `v1.0.0`), select **Create new tag on publish**
3. Fill in the release title and notes
4. Click **Publish release**

---

## Watchtower auto-update

[Watchtower](https://containrrr.dev/watchtower/) monitors running containers and pulls updated images automatically.

The `docker-compose.yml` includes this label:

```yaml
labels:
  - "com.centurylinklabs.watchtower.enable=true"
```

When Watchtower runs with `--label-enable`, it watches **only** containers that carry this label. This is the recommended mode — it prevents Watchtower from accidentally restarting unrelated containers.

### Example Watchtower Compose service

Add this alongside your clock service (or in a separate stack) to enable auto-updates:

```yaml
services:
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      # Mount Docker config so Watchtower can pull from ghcr.io
      - ~/.docker/config.json:/config.json
    environment:
      - WATCHTOWER_LABEL_ENABLE=true
      - WATCHTOWER_POLL_INTERVAL=300   # check every 5 minutes
      - WATCHTOWER_CLEANUP=true        # remove old images after update
```

### Authenticating Watchtower with ghcr.io

Watchtower reads credentials from the host's Docker config. Log in once on the host:

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u bferg314 --password-stdin
```

Docker writes the credentials to `~/.docker/config.json`. The volume mount in the Watchtower service above makes these available inside the container.

### Update flow

1. You push a `v*` tag to GitHub
2. Actions builds and pushes `ghcr.io/bferg314/clock:latest`
3. Watchtower polls ghcr.io, detects the new digest, pulls the image, and restarts the `clock` container
4. nginx serves the new `dist/` assets
5. Because `index.html` is served with `no-cache`, browsers fetch the new HTML on their next load and get the updated JS/CSS bundle hashes automatically
