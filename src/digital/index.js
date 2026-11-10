// Digital clock renderer — manages font cycling and time display
import { FONTS } from './fonts.js';
import * as Settings from '../settings.js';
import { formatTime } from '../timezone.js';

let _display = null;
let _getTime = null;
let _fontIndex = 0;
let _tickTimer = null;
let _cycleTimer = null;
// Picked once per page load, so restarting the renderer (e.g. on a mode
// switch) shows the same font rather than rolling a new one.
let _randomIndex = null;
// Length of the last rendered text; fit() reruns when it changes (9 PM -> 10 PM).
let _textLength = 0;

export function init(display, getTime, settings) {
  _display = display;
  _getTime = getTime;

  const { cycleMode, cycleInterval, pinnedFont, currentFont } = settings.digital;

  if (pinnedFont !== -1) {
    _fontIndex = clamp(pinnedFont, 0, FONTS.length - 1);
  } else if (cycleMode === 'random-on-load') {
    _randomIndex ??= Math.floor(Math.random() * FONTS.length);
    _fontIndex = _randomIndex;
  } else {
    _fontIndex = currentFont % FONTS.length;
  }

  _applyFont(_fontIndex);
  _startTick();

  if (cycleMode === 'timer' && pinnedFont === -1) {
    _cycleTimer = setInterval(() => {
      _fontIndex = (_fontIndex + 1) % FONTS.length;
      Settings.save({ digital: { currentFont: _fontIndex } });
      _applyFontFade(_fontIndex);
    }, cycleInterval * 1000);
  }
}

function _applyFont(index) {
  const font = FONTS[index];
  _display.style.fontFamily = `'${font.family}', monospace`;
  _display.style.fontWeight = String(font.weight);
  fit();
  // Wide fonts only measure correctly once their WOFF2 has loaded.
  document.fonts?.load(`${font.weight} 1em '${font.family}'`).then(fit, () => {});
}

// Shrink the text when it would be wider than the screen. Wide fonts (Press
// Start 2P, Syncopate) and 12-hour time overflow a portrait screen at the
// default size. Called on font, text length, size and window changes, never
// per tick, because it forces a layout.
export function fit() {
  // Measured against the screen, not the square clock box, so text that
  // already fits a wide screen keeps its size.
  const available = (_display?.ownerDocument.documentElement.clientWidth ?? 0) * 0.94;
  if (available <= 0) return;
  _display.style.setProperty('--digital-fit', '1');
  const natural = _display.scrollWidth;
  if (natural > available) _display.style.setProperty('--digital-fit', (available / natural).toFixed(3));
}

function _applyFontFade(index) {
  _display.classList.add('fade-out');
  setTimeout(() => {
    _applyFont(index);
    _display.classList.remove('fade-out');
  }, 350);
}

function _startTick() {
  if (_tickTimer) clearTimeout(_tickTimer);
  _tick();
  _scheduleTick();
}

// A fixed 1s interval keeps whatever phase the page loaded at, so the digits
// could change up to a second late. Instead, wake just after each whole second.
// Date.now() is only used for scheduling here; the displayed time still comes
// from _getTime().
function _scheduleTick() {
  _tickTimer = setTimeout(() => {
    _tick();
    _scheduleTick();
  }, 1000 - (Date.now() % 1000) + 10);
}

function _tick() {
  if (!_getTime || !_display) return;
  const { h, m, s } = _getTime();
  // Read hour12 dynamically so toggling it in settings takes effect immediately
  const text = formatTime(h, m, s, Settings.get().digital.hour12);
  // Wrap each digit in a fixed-width span so proportional fonts don't shift
  _display.innerHTML = text.replace(/\d/g, d => `<span class="clock-digit">${d}</span>`);
  if (text.length !== _textLength) {
    _textLength = text.length;
    fit();
  }
}

export function stop() {
  if (_tickTimer) { clearTimeout(_tickTimer); _tickTimer = null; }
  if (_cycleTimer) { clearInterval(_cycleTimer); _cycleTimer = null; }
  _textLength = 0;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
