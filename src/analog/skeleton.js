// Skeleton analog clock — transparent face, outline hands, decorative gear at center
import { svgEl, rotateStr, handAngles } from './helpers.js';

/** Generates polygon points for a simple gear shape. */
function gearPoints(cx, cy, outerR, innerR, teeth) {
  const step = (2 * Math.PI) / teeth;
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step - step * 0.25;
    const a1 = i * step + step * 0.25;
    const a2 = i * step + step * 0.5 - step * 0.25;
    const a3 = i * step + step * 0.5 + step * 0.25;
    pts.push(`${cx + innerR * Math.cos(a0)},${cy + innerR * Math.sin(a0)}`);
    pts.push(`${cx + outerR * Math.cos(a0)},${cy + outerR * Math.sin(a0)}`);
    pts.push(`${cx + outerR * Math.cos(a1)},${cy + outerR * Math.sin(a1)}`);
    pts.push(`${cx + innerR * Math.cos(a1)},${cy + innerR * Math.sin(a1)}`);
    pts.push(`${cx + innerR * Math.cos(a2)},${cy + innerR * Math.sin(a2)}`);
    pts.push(`${cx + innerR * Math.cos(a3)},${cy + innerR * Math.sin(a3)}`);
  }
  return pts.join(' ');
}

export function init(svg) {
  const S = '#d8d8d8'; // stroke color

  // Outer ring
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 93,
    fill: 'none', stroke: S, 'stroke-width': 1,
  }));
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 89,
    fill: 'none', stroke: S, 'stroke-width': 0.4, opacity: 0.4,
  }));

  // 12 hour tick marks
  for (let i = 0; i < 12; i++) {
    const rad = (i * 30) * Math.PI / 180;
    const isQuarter = i % 3 === 0;
    const r1 = 89, r2 = isQuarter ? 78 : 83;
    svg.appendChild(svgEl('line', {
      x1: 100 + r1 * Math.sin(rad), y1: 100 - r1 * Math.cos(rad),
      x2: 100 + r2 * Math.sin(rad), y2: 100 - r2 * Math.cos(rad),
      stroke: S, 'stroke-width': isQuarter ? 1.8 : 1,
    }));
  }

  // Minute tick marks (thin, at 5-min intervals skipped above)
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const rad = (i * 6) * Math.PI / 180;
    svg.appendChild(svgEl('line', {
      x1: 100 + 89 * Math.sin(rad), y1: 100 - 89 * Math.cos(rad),
      x2: 100 + 86 * Math.sin(rad), y2: 100 - 86 * Math.cos(rad),
      stroke: S, 'stroke-width': 0.6, opacity: 0.5,
    }));
  }

  // Hour hand — hollow rectangle outline
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('rect', {
    x: 97.5, y: 46, width: 5, height: 54,
    rx: 2.5,
    fill: 'none', stroke: S, 'stroke-width': 1.5,
  }));
  svg.appendChild(hourHand);

  // Minute hand — thinner outline
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('rect', {
    x: 98.5, y: 32, width: 3, height: 68,
    rx: 1.5,
    fill: 'none', stroke: S, 'stroke-width': 1,
  }));
  svg.appendChild(minuteHand);

  // Second hand — dashed blue accent line
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 120, x2: 100, y2: 28,
    stroke: '#4a9eff', 'stroke-width': 1, 'stroke-linecap': 'round',
    'stroke-dasharray': '3,4',
  }));
  svg.appendChild(secondHand);

  // Decorative gear at center
  svg.appendChild(svgEl('polygon', {
    points: gearPoints(100, 100, 13, 9, 8),
    fill: 'none', stroke: S, 'stroke-width': 0.8,
  }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 7, fill: 'none', stroke: S, 'stroke-width': 0.8 }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 3, fill: 'none', stroke: '#4a9eff', 'stroke-width': 1.2 }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
