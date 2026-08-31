// Chalkboard analog clock — wood-framed slate face, hand-drawn chalk numerals and hands
import { svgEl, rotateStr, handAngles } from './helpers.js';

const FRAME = '#6b4423';
const BOARD = '#213d2c';
const CHALK = '#f0ead6';
const CHALK_DIM = '#cfd8c8';
const PINK_CHALK = '#f2a3b3';

const NUMERALS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

/** Small deterministic wobble so hand-drawn marks don't look perfectly mechanical. */
function jitter(i, spread) {
  return (((i * 37 + 11) % 13) / 12 - 0.5) * 2 * spread;
}

export function init(svg) {
  // Wooden frame + slate board
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 97, fill: FRAME, stroke: '#4a2f18', 'stroke-width': 1.5 }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 89, fill: BOARD }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 89, fill: 'none', stroke: CHALK_DIM, 'stroke-width': 0.4, opacity: 0.3 }));

  // Faint chalk dust flecks scattered across the board
  const DUST = [
    [62, 48], [140, 55], [50, 130], [150, 120], [95, 40], [110, 160],
    [40, 90], [160, 90], [75, 155], [125, 45], [100, 170], [155, 60],
  ];
  for (const [x, y] of DUST) {
    svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 0.5 + (x % 3) * 0.2, fill: CHALK, opacity: 0.15 }));
  }

  // Hand-drawn minute ticks
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const rad = (i * 6) * Math.PI / 180;
    svg.appendChild(svgEl('line', {
      x1: 100 + 84 * Math.sin(rad), y1: 100 - 84 * Math.cos(rad),
      x2: 100 + 81 * Math.sin(rad), y2: 100 - 81 * Math.cos(rad),
      stroke: CHALK, 'stroke-width': 0.6, opacity: 0.4, 'stroke-linecap': 'round',
    }));
  }

  // Hand-drawn hour numerals, each nudged and tilted slightly for a chalk-scrawl feel
  for (let h = 0; h < 12; h++) {
    const rad = (h * 30) * Math.PI / 180;
    const jx = jitter(h, 2), jy = jitter(h + 5, 2);
    const rot = jitter(h + 2, 6);
    const x = 100 + 70 * Math.sin(rad) + jx;
    const y = 100 - 70 * Math.cos(rad) + 4.5 + jy;
    const text = svgEl('text', {
      x, y,
      'text-anchor': 'middle',
      'font-size': 13,
      'font-family': '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive',
      fill: CHALK,
      opacity: 0.9,
      transform: `rotate(${rot},${x},${y})`,
    });
    text.textContent = NUMERALS[h];
    svg.appendChild(text);
  }

  // Hour hand — thick chalk stroke, doubled slightly for texture
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('line', {
    x1: 100, y1: 104, x2: 99, y2: 58,
    stroke: CHALK, 'stroke-width': 4.5, 'stroke-linecap': 'round', opacity: 0.9,
  }));
  hourHand.appendChild(svgEl('line', {
    x1: 101, y1: 103, x2: 100, y2: 60,
    stroke: CHALK, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.35,
  }));
  svg.appendChild(hourHand);

  // Minute hand — thinner chalk stroke, doubled slightly for texture
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('line', {
    x1: 100, y1: 108, x2: 101, y2: 40,
    stroke: CHALK, 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0.9,
  }));
  minuteHand.appendChild(svgEl('line', {
    x1: 99, y1: 106, x2: 100, y2: 42,
    stroke: CHALK, 'stroke-width': 1, 'stroke-linecap': 'round', opacity: 0.3,
  }));
  svg.appendChild(minuteHand);

  // Second hand — pink chalk, slightly wobbly
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 116, x2: 100, y2: 34,
    stroke: PINK_CHALK, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: 0.85,
  }));
  svg.appendChild(secondHand);

  // Center smudge
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 3.5, fill: CHALK, opacity: 0.8 }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 1.4, fill: PINK_CHALK }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
