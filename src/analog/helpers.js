// Shared SVG utilities for analog clock styles.
// Kept in a separate file to avoid circular imports between index.js and style modules.

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates a namespaced SVG element with the given attributes.
 */
export function svgEl(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

/**
 * Returns an SVG rotate transform string around the clock center (100, 100).
 */
export function rotateStr(angle, cx = 100, cy = 100) {
  return `rotate(${angle},${cx},${cy})`;
}

/**
 * Computes hand rotation angles (degrees) from time parts.
 * Includes sub-second interpolation for smooth second hand via rAF.
 */
export function handAngles(h, m, s, ms) {
  return {
    hour:   ((h % 12) + m / 60) * 30,
    minute: (m + s / 60) * 6,
    second: (s + ms / 1000) * 6,
  };
}
