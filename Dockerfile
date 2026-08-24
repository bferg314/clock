# Stage 1: build
# Pinned to the *build* platform so the Node/Vite build always runs natively.
# Without this, multi-arch builds run npm under QEMU emulation, which is orders
# of magnitude slower and previously blew past the 6h GitHub Actions job limit.
# The output is plain static assets, so it is architecture-independent anyway.
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: serve
# Built per target architecture, but only performs COPY, so no emulation is needed.
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
