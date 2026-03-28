// Analog clock orchestrator — manages style selection, RAF loop, and cycling
import * as classic from './classic.js';
import * as minimal from './minimal.js';
import * as retro from './retro.js';
import * as skeleton from './skeleton.js';
import * as Settings from '../settings.js';

const STYLES = [classic, minimal, retro, skeleton];
export const STYLE_NAMES = ['Classic', 'Minimal', 'Retro', 'Skeleton'];

let _svg = null;
let _getTime = null;
let _styleIndex = 0;
let _handRefs = null;
let _rafId = null;
let _cycleTimer = null;

export function init(svg, getTime, settings) {
  _svg = svg;
  _getTime = getTime;

  const { cycleMode, cycleInterval, pinnedStyle, currentStyle } = settings.analog;

  if (pinnedStyle !== -1) {
    _styleIndex = clamp(pinnedStyle, 0, STYLES.length - 1);
  } else if (cycleMode === 'random-on-load') {
    _styleIndex = Math.floor(Math.random() * STYLES.length);
  } else {
    // timer mode — resume from persisted index
    _styleIndex = currentStyle % STYLES.length;
  }

  _buildStyle();
  _startRaf();

  if (cycleMode === 'timer' && pinnedStyle === -1) {
    _cycleTimer = setInterval(() => {
      _styleIndex = (_styleIndex + 1) % STYLES.length;
      Settings.save({ analog: { currentStyle: _styleIndex } });
      _buildStyle();
    }, cycleInterval * 1000);
  }
}

function _buildStyle() {
  _svg.innerHTML = '';
  _handRefs = STYLES[_styleIndex].init(_svg);
}

function _startRaf() {
  if (_rafId) cancelAnimationFrame(_rafId);

  function frame() {
    if (_getTime && _handRefs) {
      const { h, m, s, ms } = _getTime();
      STYLES[_styleIndex].update(_handRefs, h, m, s, ms);
    }
    _rafId = requestAnimationFrame(frame);
  }

  _rafId = requestAnimationFrame(frame);
}

export function stop() {
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  if (_cycleTimer) { clearInterval(_cycleTimer); _cycleTimer = null; }
}

export function getCurrentStyleIndex() { return _styleIndex; }

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
