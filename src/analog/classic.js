// Classic analog clock — cream face, Arabic numerals, filled hands, drop shadow
import { svgEl, rotateStr, handAngles } from './helpers.js';

export function init(svg) {
  // Drop-shadow filter
  const defs = svgEl('defs', {});
  const filter = svgEl('filter', { id: 'cls-shadow', x: '-20%', y: '-20%', width: '140%', height: '140%' });
  const fds = svgEl('feDropShadow', { dx: '2', dy: '3', stdDeviation: '3', 'flood-opacity': '0.25' });
  filter.appendChild(fds);
  defs.appendChild(filter);
  svg.appendChild(defs);

  // Face
  svg.appendChild(svgEl('circle', {
    cx: 100, cy: 100, r: 94,
    fill: '#FFFEF0', stroke: '#1a1a1a', 'stroke-width': 2.5,
    filter: 'url(#cls-shadow)',
  }));

  // Tick marks (60 total, hour marks longer)
  for (let i = 0; i < 60; i++) {
    const isHour = i % 5 === 0;
    const rad = (i * 6) * Math.PI / 180;
    const r1 = 89;
    const r2 = isHour ? 79 : 85;
    svg.appendChild(svgEl('line', {
      x1: 100 + r1 * Math.sin(rad), y1: 100 - r1 * Math.cos(rad),
      x2: 100 + r2 * Math.sin(rad), y2: 100 - r2 * Math.cos(rad),
      stroke: '#1a1a1a',
      'stroke-width': isHour ? 2 : 1,
      'stroke-linecap': 'round',
    }));
  }

  // Arabic numerals 1–12 at r=68
  for (let h = 1; h <= 12; h++) {
    const rad = (h * 30) * Math.PI / 180;
    const text = svgEl('text', {
      x: 100 + 68 * Math.sin(rad),
      y: 100 - 68 * Math.cos(rad) + 4.5, // +4.5 for vertical centering of text baseline
      'text-anchor': 'middle',
      'font-size': 12,
      'font-family': 'Georgia, "Times New Roman", serif',
      'font-weight': '500',
      fill: '#1a1a1a',
    });
    text.textContent = String(h);
    svg.appendChild(text);
  }

  // Hour hand
  const hourHand = svgEl('g', { transform: rotateStr(0) });
  hourHand.appendChild(svgEl('line', {
    x1: 100, y1: 105, x2: 100, y2: 57,
    stroke: '#1a1a1a', 'stroke-width': 5.5, 'stroke-linecap': 'round',
  }));
  svg.appendChild(hourHand);

  // Minute hand
  const minuteHand = svgEl('g', { transform: rotateStr(0) });
  minuteHand.appendChild(svgEl('line', {
    x1: 100, y1: 108, x2: 100, y2: 40,
    stroke: '#1a1a1a', 'stroke-width': 3, 'stroke-linecap': 'round',
  }));
  svg.appendChild(minuteHand);

  // Second hand (with counterbalance tail)
  const secondHand = svgEl('g', { transform: rotateStr(0) });
  secondHand.appendChild(svgEl('line', {
    x1: 100, y1: 116, x2: 100, y2: 36,
    stroke: '#cc2200', 'stroke-width': 1.5, 'stroke-linecap': 'round',
  }));
  svg.appendChild(secondHand);

  // Center cap
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 5, fill: '#1a1a1a' }));
  svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 2.5, fill: '#cc2200' }));

  return { hourHand, minuteHand, secondHand };
}

export function update(refs, h, m, s, ms) {
  const a = handAngles(h, m, s, ms);
  refs.hourHand.setAttribute('transform', rotateStr(a.hour));
  refs.minuteHand.setAttribute('transform', rotateStr(a.minute));
  refs.secondHand.setAttribute('transform', rotateStr(a.second));
}
