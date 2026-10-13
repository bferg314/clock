const KEY = 'clock-settings';

const SIZES = { small: '200px', medium: '300px', large: '400px', xl: '550px', fill: '100vmin' };

const DEFAULTS = {
  mode: 'analog',
  size: 'fill',
  timezone: 'auto',
  analog: {
    cycleMode: 'random-on-load', // 'random-on-load' | 'timer'
    cycleInterval: 300,          // seconds (timer mode only)
    currentStyle: 0,             // persisted index for timer mode
    pinnedStyle: -1,             // index to pin, -1 = cycle
  },
  digital: {
    cycleMode: 'random-on-load',
    cycleInterval: 300,
    currentFont: 0,
    pinnedFont: -1,
    hour12: false,
  },
};

// _stored is what lives in localStorage. _overrides come from the page URL and
// apply to this page view only. _current is the two merged, and is what the
// rest of the app reads.
let _stored = structuredClone(DEFAULTS);
let _overrides = {};
let _current = structuredClone(DEFAULTS);
const _subs = [];

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    _stored = raw ? merge(DEFAULTS, JSON.parse(raw)) : structuredClone(DEFAULTS);
  } catch {
    _stored = structuredClone(DEFAULTS);
  }
  _current = merge(_stored, _overrides);
  return _current;
}

/** Applies settings that take effect without being saved (e.g. from the URL). */
export function applyOverrides(overrides) {
  _overrides = overrides;
  _current = merge(_stored, _overrides);
  return _current;
}

export function get() {
  return _current;
}

export function save(patch) {
  // A value the user sets explicitly replaces any override for that key.
  _overrides = without(_overrides, patch);
  _stored = merge(_stored, patch);
  _current = merge(_stored, _overrides);
  try {
    localStorage.setItem(KEY, JSON.stringify(_stored));
  } catch {}
  _subs.forEach(fn => fn(_current));
}

export function subscribe(fn) {
  _subs.push(fn);
  return () => {
    const i = _subs.indexOf(fn);
    if (i > -1) _subs.splice(i, 1);
  };
}

export function applySize(size) {
  document.documentElement.style.setProperty('--clock-size', SIZES[size] ?? SIZES.fill);
}

export { SIZES };

function merge(base, patch) {
  return {
    ...base,
    ...patch,
    analog: { ...base.analog, ...patch.analog },
    digital: { ...base.digital, ...patch.digital },
  };
}

function without(overrides, patch) {
  const out = { ...overrides };
  for (const key of Object.keys(patch)) {
    if ((key === 'analog' || key === 'digital') && out[key]) {
      out[key] = { ...out[key] };
      for (const sub of Object.keys(patch[key])) delete out[key][sub];
    } else {
      delete out[key];
    }
  }
  return out;
}
