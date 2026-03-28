// All fonts bundled via @fontsource — no CDN, works fully offline.
// Vite bundles the WOFF2 files into /assets/. The browser only fetches
// a font's WOFF2 when font-family is actually applied to a DOM element.

import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/share-tech-mono/400.css';
import '@fontsource/vt323/400.css';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/audiowide/400.css';
import '@fontsource/oxanium/400.css';
import '@fontsource/oxanium/600.css';
import '@fontsource/chakra-petch/400.css';
import '@fontsource/syncopate/400.css';
import '@fontsource/syncopate/700.css';
import '@fontsource/major-mono-display/400.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/rajdhani/400.css';
import '@fontsource/rajdhani/600.css';
import '@fontsource/nova-mono/400.css';
import '@fontsource/exo-2/400.css';
import '@fontsource/exo-2/600.css';

export const FONTS = [
  { name: 'Orbitron',           family: 'Orbitron',           weight: 700 },
  { name: 'Share Tech Mono',    family: 'Share Tech Mono',    weight: 400 },
  { name: 'VT323',              family: 'VT323',              weight: 400 },
  { name: 'Press Start 2P',     family: 'Press Start 2P',     weight: 400 },
  { name: 'Audiowide',          family: 'Audiowide',          weight: 400 },
  { name: 'Oxanium',            family: 'Oxanium',            weight: 600 },
  { name: 'Chakra Petch',       family: 'Chakra Petch',       weight: 400 },
  { name: 'Syncopate',          family: 'Syncopate',          weight: 700 },
  { name: 'Major Mono Display', family: 'Major Mono Display', weight: 400 },
  { name: 'Space Mono',         family: 'Space Mono',         weight: 400 },
  { name: 'Roboto Mono',        family: 'Roboto Mono',        weight: 400 },
  { name: 'Rajdhani',           family: 'Rajdhani',           weight: 600 },
  { name: 'Nova Mono',          family: 'Nova Mono',          weight: 400 },
  { name: 'Exo 2',              family: 'Exo 2',              weight: 600 },
];

export const FONT_NAMES = FONTS.map(f => f.name);
