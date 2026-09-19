// Mondrian analog clock — De Stijl: white dial, thick black grid, primary-color blocks
import { svgEl, rotateStr, handAngles } from './helpers.js';

const BLACK = '#141414';
const WHITE = '#f7f4ec';
const RED = '#d62828';
const BLUE = '#1d4ed8';
const YELLOW = '#f6c700';

export function init(svg) {
  // Everything clipped to the dial circle so the composition reads as a round clock
  const defs = svgEl('defs', {});
  const clip = svgEl('clipPath', { id: 'md-clip' });
  clip.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 94 }));
  defs.appendChild(clip);
  svg.appendChild(defs);

  const art = svgEl('g', { 'clip-path': 'url(#md-clip)' });

  // White ground
  art.appendChild(svgEl('rect', { x: 6, y: 6, width: 188, height: 188, fill: WHITE }));

  // Primary-color blocks (drawn before the grid lines that border them)
  art.appendChild(svgEl('rect', { x: 128, y: 6, width: 66, height: 58, fill: RED }));
  art.appendChild(svgEl('rect', { x: 6, y: 140, width: 54, height: 54, fill: BLUE }));
  art.appendChild(svgEl('rect', { x: 140, y: 150, width: 54, height: 44, fill: YELLOW }));

  // Thick black grid lines — asymmetric, Neo-Plasticist spacing
  const bars = [
    // vertical
    { x: 60, y: 6, w: 8, h: 188 },
    { x: 124, y: 6, w: 8, h: 188 },
    // horizontal
    { x: 6, y: 64, w: 188, h: 8 },
    { x: 6, y: 136, w: 188, h: 8 },
    { x: 124, y: 108, w: 70, h: 6 },
  ];
  for (const b of bars) {
    art.appendChild(svgEl('rect', { x: b.x, y: b.y, width: b.w, height: b.h, fill: BLACK }));
  }

  svg.appendChild(art);

  // Dial rim
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 94, fill: 'none', stroke: BLACK, 'stroke-width': 4 }));

  // Short black hour ticks so the time stays readable over the composition
  for (let i = 0; i < 12; i++) {
    const rad = (i * 30) * Math.PI / 180;
    svg.appendChild(svgEl('line', {
      x1: 100 + 90 * Math.sin(rad), y1: 100 - 90 * Math.cos(rad),
      x2: 100 + 82 * Math.sin(rad), y2: 100 - 82 * Math.cos(rad),
      stroke: BLACK, 'stroke-width': 2.5, 'stroke-linecap': 'butt',
    }));
  }

  // Hour hand — thick black bar
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('rect', { x: 96, y: 54, width: 8, height: 56, fill: BLACK }));
  svg.appendChild(hourHand);

  // Minute hand — slimmer black bar
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('rect', { x: 97.5, y: 34, width: 5, height: 78, fill: BLACK }));
  svg.appendChild(minuteHand);

  // Second hand — red needle
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('rect', { x: 99, y: 30, width: 2, height: 88, fill: RED }));
  svg.appendChild(secondHand);

  // Center cap — black square
  svg.appendChild(svgEl('rect', { x: 93, y: 93, width: 14, height: 14, fill: BLACK }));
  svg.appendChild(svgEl('rect', { x: 97, y: 97, width: 6, height: 6, fill: RED }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
