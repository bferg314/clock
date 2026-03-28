// Minimal analog clock — Swiss/Bauhaus inspired, no numerals, 4 dot markers
import { svgEl, rotateStr, handAngles } from './helpers.js';

export function init(svg) {
  // White face, subtle border
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 94,
    fill: '#f8f8f8', stroke: '#d0d0d0', 'stroke-width': 1,
  }));

  // 4 dot markers at 12 / 3 / 6 / 9
  for (const deg of [0, 90, 180, 270]) {
    const rad = deg * Math.PI / 180;
    svg.appendChild(svgEl('circle', {
      cx: 100 + 80 * Math.sin(rad),
      cy: 100 - 80 * Math.cos(rad),
      r: 3.5,
      fill: '#333',
    }));
  }

  // 8 small dots at remaining hour positions
  for (const deg of [30, 60, 120, 150, 210, 240, 300, 330]) {
    const rad = deg * Math.PI / 180;
    svg.appendChild(svgEl('circle', {
      cx: 100 + 82 * Math.sin(rad),
      cy: 100 - 82 * Math.cos(rad),
      r: 1.5,
      fill: '#bbb',
    }));
  }

  // Hour hand — thick, medium length
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('line', {
    x1: 100, y1: 108, x2: 100, y2: 56,
    stroke: '#222', 'stroke-width': 5, 'stroke-linecap': 'round',
  }));
  svg.appendChild(hourHand);

  // Minute hand — thin, long
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('line', {
    x1: 100, y1: 110, x2: 100, y2: 38,
    stroke: '#444', 'stroke-width': 2.5, 'stroke-linecap': 'round',
  }));
  svg.appendChild(minuteHand);

  // Second hand — hairline red, extends past center
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 118, x2: 100, y2: 33,
    stroke: '#e63535', 'stroke-width': 1.2, 'stroke-linecap': 'round',
  }));
  svg.appendChild(secondHand);

  // Center dot
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 4, fill: '#222' }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 2, fill: '#e63535' }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
