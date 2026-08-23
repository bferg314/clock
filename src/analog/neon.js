// Neon analog clock — dark face, glowing cyan/magenta tubing, no numerals
import { svgEl, rotateStr, handAngles } from './helpers.js';

const CYAN = '#00e5ff';
const PINK = '#ff2fd0';
const VIOLET = '#b06bff';

/**
 * Builds a blur-and-merge glow filter; larger stdDeviation = softer halo.
 * Uses userSpaceOnUse — hands and ticks are vertical lines whose bounding box
 * has zero width, which would collapse a percentage-based filter region.
 */
function glowFilter(id, stdDeviation) {
  const filter = svgEl('filter', {
    id, filterUnits: 'userSpaceOnUse',
    x: -20, y: -20, width: 240, height: 240,
  });
  filter.appendChild(svgEl('feGaussianBlur', { stdDeviation, result: 'blur' }));
  const merge = svgEl('feMerge', {});
  merge.appendChild(svgEl('feMergeNode', { in: 'blur' }));
  merge.appendChild(svgEl('feMergeNode', { in: 'blur' }));
  merge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  filter.appendChild(merge);
  return filter;
}

export function init(svg) {
  const defs = svgEl('defs', {});

  const bg = svgEl('radialGradient', { id: 'neo-bg', cx: '50%', cy: '45%', r: '65%' });
  bg.appendChild(svgEl('stop', { offset: '0%', 'stop-color': '#161632' }));
  bg.appendChild(svgEl('stop', { offset: '100%', 'stop-color': '#05050f' }));
  defs.appendChild(bg);

  defs.appendChild(glowFilter('neo-glow', 2.5));
  defs.appendChild(glowFilter('neo-glow-soft', 1.2));
  svg.appendChild(defs);

  // Face
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 96, fill: 'url(#neo-bg)' }));

  // Outer neon ring + faint inner echo
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 92,
    fill: 'none', stroke: CYAN, 'stroke-width': 2,
    filter: 'url(#neo-glow)',
  }));
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 86,
    fill: 'none', stroke: PINK, 'stroke-width': 0.8, opacity: 0.35,
  }));

  // Minute ticks (hour positions get bars instead)
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const rad = (i * 6) * Math.PI / 180;
    svg.appendChild(svgEl('line', {
      x1: 100 + 84 * Math.sin(rad), y1: 100 - 84 * Math.cos(rad),
      x2: 100 + 80 * Math.sin(rad), y2: 100 - 80 * Math.cos(rad),
      stroke: CYAN, 'stroke-width': 0.7, opacity: 0.45,
    }));
  }

  // Hour bars — quarters glow pink, the rest cyan
  for (let i = 0; i < 12; i++) {
    const rad = (i * 30) * Math.PI / 180;
    const isQuarter = i % 3 === 0;
    const r2 = isQuarter ? 72 : 76;
    svg.appendChild(svgEl('line', {
      x1: 100 + 84 * Math.sin(rad), y1: 100 - 84 * Math.cos(rad),
      x2: 100 + r2 * Math.sin(rad), y2: 100 - r2 * Math.cos(rad),
      stroke: isQuarter ? PINK : CYAN,
      'stroke-width': isQuarter ? 3 : 2,
      'stroke-linecap': 'round',
      filter: 'url(#neo-glow-soft)',
    }));
  }

  // Hour hand
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('line', {
    x1: 100, y1: 106, x2: 100, y2: 58,
    stroke: PINK, 'stroke-width': 5, 'stroke-linecap': 'round',
    filter: 'url(#neo-glow)',
  }));
  svg.appendChild(hourHand);

  // Minute hand
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('line', {
    x1: 100, y1: 110, x2: 100, y2: 38,
    stroke: CYAN, 'stroke-width': 3.2, 'stroke-linecap': 'round',
    filter: 'url(#neo-glow)',
  }));
  svg.appendChild(minuteHand);

  // Second hand
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 116, x2: 100, y2: 32,
    stroke: VIOLET, 'stroke-width': 1.4, 'stroke-linecap': 'round',
    filter: 'url(#neo-glow)',
  }));
  svg.appendChild(secondHand);

  // Center cap
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 5,
    fill: '#05050f', stroke: CYAN, 'stroke-width': 1.5,
    filter: 'url(#neo-glow-soft)',
  }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 2, fill: PINK }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
