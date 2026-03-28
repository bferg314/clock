const KEY = 'clock-settings';

const SIZES = { small: '200px', medium: '300px', large: '400px', xl: '550px', fill: '100vmin' };

const DEFAULTS = {
  mode: 'analog',
  size: 'medium',
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

let _current = structuredClone(DEFAULTS);
const _subs = [];

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      _current = {
        ...DEFAULTS,
        ...stored,
        analog: { ...DEFAULTS.analog, ...stored.analog },
        digital: { ...DEFAULTS.digital, ...stored.digital },
      };
    }
  } catch {
    _current = structuredClone(DEFAULTS);
  }
  return _current;
}

export function get() {
  return _current;
}

export function save(patch) {
  if (patch.analog) {
    patch = { ...patch, analog: { ..._current.analog, ...patch.analog } };
  }
  if (patch.digital) {
    patch = { ...patch, digital: { ..._current.digital, ...patch.digital } };
  }
  _current = { ..._current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(_current));
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
  document.documentElement.style.setProperty('--clock-size', SIZES[size] ?? SIZES.medium);
}

export { SIZES };
