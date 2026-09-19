// Blueprint analog clock — engineering drafting look: deep blue ground, cyan grid, white technical hands
import { svgEl, rotateStr, handAngles } from './helpers.js';

const INK = '#0d2b52';       // blueprint paper blue
const LINE = '#8fd3ff';      // cyan drafting line
const WHITE = '#eaf6ff';     // annotation white

export function init(svg) {
  // Paper ground
  svg.appendChild(svgEl('rect', { x: 4, y: 4, width: 192, height: 192, rx: 4, fill: INK }));

  // Fine graph grid clipped to the dial circle
  const defs = svgEl('defs', {});
  const clip = svgEl('clipPath', { id: 'bp-clip' });
  clip.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 92 }));
  defs.appendChild(clip);
  svg.appendChild(defs);

  const grid = svgEl('g', { 'clip-path': 'url(#bp-clip)' });
  for (let p = 12; p <= 188; p += 8) {
    grid.appendChild(svgEl('line', { x1: p, y1: 8, x2: p, y2: 192, stroke: LINE, 'stroke-width': 0.3, opacity: 0.18 }));
    grid.appendChild(svgEl('line', { x1: 8, y1: p, x2: 192, y2: p, stroke: LINE, 'stroke-width': 0.3, opacity: 0.18 }));
  }
  svg.appendChild(grid);

  // Concentric construction circles
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 92, fill: 'none', stroke: LINE, 'stroke-width': 1.5 }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 78, fill: 'none', stroke: LINE, 'stroke-width': 0.5, opacity: 0.45, 'stroke-dasharray': '2 3' }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 30, fill: 'none', stroke: LINE, 'stroke-width': 0.5, opacity: 0.45, 'stroke-dasharray': '2 3' }));

  // Center crosshair extending past the dial (construction axes)
  svg.appendChild(svgEl('line', { x1: 100, y1: 8, x2: 100, y2: 192, stroke: LINE, 'stroke-width': 0.4, opacity: 0.35, 'stroke-dasharray': '4 3' }));
  svg.appendChild(svgEl('line', { x1: 8, y1: 100, x2: 192, y2: 100, stroke: LINE, 'stroke-width': 0.4, opacity: 0.35, 'stroke-dasharray': '4 3' }));

  // Tick marks + degree annotations at each hour
  for (let i = 0; i < 60; i++) {
    const isHour = i % 5 === 0;
    const rad = (i * 6) * Math.PI / 180;
    const r1 = 92;
    const r2 = isHour ? 84 : 88;
    svg.appendChild(svgEl('line', {
      x1: 100 + r1 * Math.sin(rad), y1: 100 - r1 * Math.cos(rad),
      x2: 100 + r2 * Math.sin(rad), y2: 100 - r2 * Math.cos(rad),
      stroke: LINE, 'stroke-width': isHour ? 1.2 : 0.5, opacity: isHour ? 0.9 : 0.5,
    }));
  }

  // Monospace numerals 1–12 at r=66
  for (let h = 1; h <= 12; h++) {
    const rad = (h * 30) * Math.PI / 180;
    const text = svgEl('text', {
      x: 100 + 66 * Math.sin(rad),
      y: 100 - 66 * Math.cos(rad) + 4,
      'text-anchor': 'middle',
      'font-size': 11,
      'font-family': '"Courier New", "Consolas", monospace',
      'font-weight': '700',
      fill: WHITE,
    });
    text.textContent = String(h);
    svg.appendChild(text);
  }

  // Hour hand — open drafted outline
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('polygon', {
    points: '100,108 95,60 100,52 105,60',
    fill: 'none', stroke: WHITE, 'stroke-width': 1.2, 'stroke-linejoin': 'round',
  }));
  svg.appendChild(hourHand);

  // Minute hand — longer open outline
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('polygon', {
    points: '100,112 96,42 100,32 104,42',
    fill: 'none', stroke: WHITE, 'stroke-width': 1, 'stroke-linejoin': 'round',
  }));
  svg.appendChild(minuteHand);

  // Second hand — thin cyan needle with tail
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 118, x2: 100, y2: 26,
    stroke: LINE, 'stroke-width': 0.8, 'stroke-linecap': 'round',
  }));
  svg.appendChild(secondHand);

  // Center hub — open circle over crosshair, drafting style
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 4, fill: INK, stroke: WHITE, 'stroke-width': 1 }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
