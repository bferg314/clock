// Nautical analog clock — dive-watch look: navy face, count-up bezel, lume pips, sword hands
import { svgEl, rotateStr, handAngles } from './helpers.js';

const LUME = '#9fe8c0';
const STEEL = '#e8eef2';
const ORANGE = '#ff8c42';
const BEZEL_TEXT = '#c8d8e4';

export function init(svg) {
  // Bezel ring
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 97,
    fill: '#16324a', stroke: '#2c5378', 'stroke-width': 1.5,
  }));

  // Bezel minute ticks — every minute thin, every 5 minutes long
  for (let i = 0; i < 60; i++) {
    const rad = (i * 6) * Math.PI / 180;
    const isFive = i % 5 === 0;
    if (isFive && i % 10 === 0 && i !== 0) continue; // numeral goes here
    if (i === 0) continue;                           // pip triangle goes here
    svg.appendChild(svgEl('line', {
      x1: 100 + 94 * Math.sin(rad), y1: 100 - 94 * Math.cos(rad),
      x2: 100 + (isFive ? 86 : 89) * Math.sin(rad), y2: 100 - (isFive ? 86 : 89) * Math.cos(rad),
      stroke: isFive ? STEEL : BEZEL_TEXT,
      'stroke-width': isFive ? 1.4 : 0.5,
      opacity: isFive ? 0.9 : 0.5,
    }));
  }

  // Bezel numerals at 10 / 20 / 30 / 40 / 50 minutes
  for (const min of [10, 20, 30, 40, 50]) {
    const rad = (min * 6) * Math.PI / 180;
    const text = svgEl('text', {
      x: 100 + 90 * Math.sin(rad),
      y: 100 - 90 * Math.cos(rad) + 2.4,
      'text-anchor': 'middle',
      'font-size': 7,
      'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
      'font-weight': 'bold',
      fill: BEZEL_TEXT,
    });
    text.textContent = String(min);
    svg.appendChild(text);
  }

  // Bezel zero marker — luminous triangle at 12
  svg.appendChild(svgEl('polygon', { points: '100,4 95.5,14.5 104.5,14.5', fill: LUME }));

  // Dial
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 84, fill: '#0d2137' }));
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 79,
    fill: 'none', stroke: '#20415f', 'stroke-width': 0.8,
  }));

  // Dial minute track
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const rad = (i * 6) * Math.PI / 180;
    svg.appendChild(svgEl('line', {
      x1: 100 + 79 * Math.sin(rad), y1: 100 - 79 * Math.cos(rad),
      x2: 100 + 75.5 * Math.sin(rad), y2: 100 - 75.5 * Math.cos(rad),
      stroke: BEZEL_TEXT, 'stroke-width': 0.6, opacity: 0.55,
    }));
  }

  // Luminous hour pips — bar at 12, circles elsewhere
  svg.appendChild(svgEl('rect', {
    x: 96.5, y: 25, width: 7, height: 10, rx: 1.5,
    fill: LUME, stroke: STEEL, 'stroke-width': 0.6,
  }));
  for (let i = 1; i < 12; i++) {
    const rad = (i * 30) * Math.PI / 180;
    svg.appendChild(svgEl('circle', {
      cx: 100 + 70 * Math.sin(rad),
      cy: 100 - 70 * Math.cos(rad),
      r: i % 3 === 0 ? 3.4 : 2.8,
      fill: LUME, stroke: STEEL, 'stroke-width': 0.6,
    }));
  }

  // Hour hand — sword shape with lume insert
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('polygon', {
    points: '96,104 96,62 100,52 104,62 104,104',
    fill: STEEL, stroke: '#7f98ab', 'stroke-width': 0.5,
  }));
  hourHand.appendChild(svgEl('rect', { x: 97.6, y: 64, width: 4.8, height: 36, fill: LUME }));
  svg.appendChild(hourHand);

  // Minute hand — longer, slimmer sword
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('polygon', {
    points: '97.4,106 97.4,44 100,34 102.6,44 102.6,106',
    fill: STEEL, stroke: '#7f98ab', 'stroke-width': 0.5,
  }));
  minuteHand.appendChild(svgEl('rect', { x: 98.7, y: 46, width: 2.6, height: 54, fill: LUME }));
  svg.appendChild(minuteHand);

  // Second hand — orange lollipop with counterweight
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 118, x2: 100, y2: 34,
    stroke: ORANGE, 'stroke-width': 1.3, 'stroke-linecap': 'round',
  }));
  secondHand.appendChild(svgEl('circle', {
    cx: 100, cy: 46, r: 4,
    fill: 'none', stroke: ORANGE, 'stroke-width': 1.3,
  }));
  secondHand.appendChild(svgEl('circle', { cx: 100, cy: 114, r: 3.2, fill: ORANGE }));
  svg.appendChild(secondHand);

  // Center cap
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 4, fill: '#0d2137', stroke: STEEL, 'stroke-width': 1.2 }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 1.6, fill: ORANGE }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
