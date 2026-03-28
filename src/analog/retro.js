// Retro analog clock — dark amber face, Roman numerals, CRT scanline overlay
import { svgEl, rotateStr, handAngles } from './helpers.js';

const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

export function init(svg) {
  // Defs: scanline pattern + face clip
  const defs = svgEl('defs', {});

  const pattern = svgEl('pattern', {
    id: 'ret-scan', x: 0, y: 0, width: 4, height: 4,
    patternUnits: 'userSpaceOnUse',
  });
  pattern.appendChild(svgEl('rect', { x: 0, y: 0, width: 4, height: 2, fill: '#000' }));
  defs.appendChild(pattern);

  const clip = svgEl('clipPath', { id: 'ret-clip' });
  clip.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 90 }));
  defs.appendChild(clip);

  svg.appendChild(defs);

  // Outer bezel (double ring)
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 96,
    fill: '#2a1400', stroke: '#7a5a10', 'stroke-width': 2,
  }));
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 91,
    fill: 'none', stroke: '#9a7820', 'stroke-width': 0.75,
  }));

  // Dark amber face
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 90, fill: '#1a0a00' }));

  // Minute tick marks (skip hour positions — numerals go there)
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const rad = (i * 6) * Math.PI / 180;
    svg.appendChild(svgEl('line', {
      x1: 100 + 87 * Math.sin(rad), y1: 100 - 87 * Math.cos(rad),
      x2: 100 + 82 * Math.sin(rad), y2: 100 - 82 * Math.cos(rad),
      stroke: '#7a5a10', 'stroke-width': 0.8,
    }));
  }

  // Hour marks (small amber rectangles)
  for (let i = 0; i < 12; i++) {
    if (i === 0) continue; // XII position has thicker mark
    const rad = (i * 30) * Math.PI / 180;
    svg.appendChild(svgEl('line', {
      x1: 100 + 87 * Math.sin(rad), y1: 100 - 87 * Math.cos(rad),
      x2: 100 + 79 * Math.sin(rad), y2: 100 - 79 * Math.cos(rad),
      stroke: '#9a7820', 'stroke-width': 1.5,
    }));
  }

  // Roman numerals at r=70
  for (let i = 0; i < 12; i++) {
    const rad = (i * 30) * Math.PI / 180;
    const fontSize = (i === 0 || i === 6) ? 8.5 : 8; // XII and VI slightly larger
    const text = svgEl('text', {
      x: 100 + 70 * Math.sin(rad),
      y: 100 - 70 * Math.cos(rad) + 3,
      'text-anchor': 'middle',
      'font-size': fontSize,
      'font-family': 'Georgia, "Times New Roman", serif',
      'font-weight': 'bold',
      fill: '#D4A017',
      'letter-spacing': '-0.5',
    });
    text.textContent = ROMAN[i];
    svg.appendChild(text);
  }

  // CRT scanline overlay (clipped to face circle)
  svg.appendChild(svgEl('rect', {
    x: 10, y: 10, width: 180, height: 180,
    fill: 'url(#ret-scan)',
    opacity: 0.07,
    'clip-path': 'url(#ret-clip)',
  }));

  // Hour hand — tapered polygon
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('polygon', {
    points: '96.5,103 100,52 103.5,103',
    fill: '#D4A017', opacity: 0.95,
  }));
  svg.appendChild(hourHand);

  // Minute hand — slimmer polygon
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('polygon', {
    points: '98.5,107 100,38 101.5,107',
    fill: '#D4A017', opacity: 0.88,
  }));
  svg.appendChild(minuteHand);

  // Second hand — thin amber-orange line with counterbalance
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 118, x2: 100, y2: 32,
    stroke: '#FF6B35', 'stroke-width': 1.5, 'stroke-linecap': 'round',
  }));
  svg.appendChild(secondHand);

  // Center jewel
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 6, fill: '#2a1400', stroke: '#D4A017', 'stroke-width': 1.5 }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 2.5, fill: '#D4A017' }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
