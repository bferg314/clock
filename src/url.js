// Reads display settings from the page URL, e.g. ?mode=digital&font=vt323,
// so a kiosk or wall display can be set up without the settings panel.
// Values apply to this page view only and are never saved. Anything that
// does not match a known value is ignored.
import { isValidTimezone } from './timezone.js';

const TRUE = ['1', 'true', 'yes', 'on'];
const FALSE = ['0', 'false', 'no', 'off'];

/**
 * @param {string} search - location.search
 * @param {{ styleNames: string[], fontNames: string[], sizes: string[] }} known
 * @returns {object} a settings patch for Settings.applyOverrides
 */
export function parseUrlSettings(search, { styleNames, fontNames, sizes }) {
  const params = new URLSearchParams(search);
  const out = {};
  const analog = {};
  const digital = {};

  const mode = params.get('mode');
  if (mode === 'analog' || mode === 'digital') out.mode = mode;

  const size = params.get('size');
  if (sizes.includes(size)) out.size = size;

  const tz = params.get('tz');
  if (tz === 'auto' || (tz && isValidTimezone(tz))) out.timezone = tz;

  const style = pick(params.get('style'), styleNames);
  if (style !== null) analog.pinnedStyle = style;

  const font = pick(params.get('font'), fontNames);
  if (font !== null) digital.pinnedFont = font;

  const hour12 = params.get('hour12')?.toLowerCase();
  if (TRUE.includes(hour12)) digital.hour12 = true;
  else if (FALSE.includes(hour12)) digital.hour12 = false;

  if (Object.keys(analog).length) out.analog = analog;
  if (Object.keys(digital).length) out.digital = digital;
  return out;
}

// Matches a registry name loosely, so "share-tech-mono", "ShareTechMono" and
// "Share Tech Mono" all work. "cycle" means not pinned.
function pick(value, names) {
  if (!value) return null;
  const want = normalize(value);
  if (want === 'cycle') return -1;
  const i = names.findIndex(name => normalize(name) === want);
  return i === -1 ? null : i;
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}
