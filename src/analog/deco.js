// Deco analog clock — Art Deco glamour: black face, gold sunburst rays, blade hands
import { svgEl, rotateStr, handAngles } from './helpers.js';

const BLACK = '#0a0a0a';
const GOLD = '#d4af37';
const GOLD_LIGHT = '#f2dd9a';

const CARDINALS = { 0: '12', 3: '3', 6: '6', 9: '9' };

export function init(svg) {
  // Outer gold bezel + black face
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 96,
    fill: BLACK, stroke: GOLD, 'stroke-width': 2.5,
  }));
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 90,
    fill: 'none', stroke: GOLD, 'stroke-width': 0.75, opacity: 0.5,
  }));

  // Sunburst rays fanning out from the center, alternating length
  for (let i = 0; i < 32; i++) {
    const rad = (i * 11.25) * Math.PI / 180;
    const r2 = i % 2 === 0 ? 87 : 80;
    svg.appendChild(svgEl('line', {
      x1: 100 + 22 * Math.sin(rad), y1: 100 - 22 * Math.cos(rad),
      x2: 100 + r2 * Math.sin(rad), y2: 100 - r2 * Math.cos(rad),
      stroke: GOLD, 'stroke-width': 0.5, opacity: 0.22,
    }));
  }

  // Hour marks — tapered gold trapezoids
  for (let i = 0; i < 12; i++) {
    if (CARDINALS[i]) continue; // numeral goes here instead
    const rad = (i * 30) * Math.PI / 180;
    const s = Math.sin(rad), c = Math.cos(rad);
    const r1 = 87, r2 = 78, half = 2;
    const px = c, py = s; // perpendicular unit vector
    svg.appendChild(svgEl('polygon', {
      points: [
        [100 + r1 * s + half * px, 100 - r1 * c + half * py],
        [100 + r1 * s - half * px, 100 - r1 * c - half * py],
        [100 + r2 * s - half * 0.5 * px, 100 - r2 * c - half * 0.5 * py],
        [100 + r2 * s + half * 0.5 * px, 100 - r2 * c + half * 0.5 * py],
      ].map(p => p.join(',')).join(' '),
      fill: GOLD,
    }));
  }

  // Cardinal numerals — bold geometric sans, deco style
  for (const [i, label] of Object.entries(CARDINALS)) {
    const rad = (Number(i) * 30) * Math.PI / 180;
    const text = svgEl('text', {
      x: 100 + 70 * Math.sin(rad),
      y: 100 - 70 * Math.cos(rad) + 6.5,
      'text-anchor': 'middle',
      'font-size': 17,
      'font-family': '"Century Gothic", Futura, "Trebuchet MS", sans-serif',
      'font-weight': '700',
      'letter-spacing': '0.5',
      fill: GOLD_LIGHT,
    });
    text.textContent = label;
    svg.appendChild(text);
  }

  // Hour hand — gold blade
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('polygon', {
    points: '100,105 96,72 100,54 104,72',
    fill: GOLD, stroke: BLACK, 'stroke-width': 0.6,
  }));
  svg.appendChild(hourHand);

  // Minute hand — longer, slimmer blade
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('polygon', {
    points: '100,110 97,60 100,36 103,60',
    fill: GOLD, stroke: BLACK, 'stroke-width': 0.6,
  }));
  svg.appendChild(minuteHand);

  // Second hand — thin gold needle with tail
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 118, x2: 100, y2: 30,
    stroke: GOLD_LIGHT, 'stroke-width': 1, 'stroke-linecap': 'round',
  }));
  svg.appendChild(secondHand);

  // Center cap
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 5.5, fill: GOLD, stroke: BLACK, 'stroke-width': 1 }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 2, fill: BLACK }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
