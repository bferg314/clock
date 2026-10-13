// Clock orchestrator — wires analog/digital renderers to the DOM
import * as Settings from './settings.js';
import { getTimeParts, detectTimezone } from './timezone.js';
import * as Analog from './analog/index.js';
import * as Digital from './digital/index.js';

let _analogSvg = null;
let _digitalDisplay = null;
let _analogWrap = null;
let _digitalWrap = null;
let _resolvedTz = detectTimezone();
let _mode = 'analog';

export function init({ analogSvg, digitalDisplay, analogWrap, digitalWrap, settings }) {
  _analogSvg = analogSvg;
  _digitalDisplay = digitalDisplay;
  _analogWrap = analogWrap;
  _digitalWrap = digitalWrap;

  _resolvedTz = settings.timezone === 'auto' ? detectTimezone() : settings.timezone;

  _mode = settings.mode;
  _applyMode(_mode);
  _start(_mode, settings);
}

// Only the visible renderer runs; the hidden one is stopped so it does not
// keep animating behind the scenes.
export function setMode(mode) {
  if (mode === _mode) return;
  _stop(_mode);
  _mode = mode;
  _applyMode(mode);
  _start(mode, Settings.get());
}

export function setTimezone(tz) {
  _resolvedTz = tz === 'auto' ? detectTimezone() : tz;
}

export function restartAnalog() {
  Analog.stop();
  if (_mode === 'analog') Analog.init(_analogSvg, _getTime, Settings.get());
}

export function restartDigital() {
  Digital.stop();
  if (_mode === 'digital') Digital.init(_digitalDisplay, _getTime, Settings.get());
}

function _start(mode, settings) {
  if (mode === 'analog') Analog.init(_analogSvg, _getTime, settings);
  else Digital.init(_digitalDisplay, _getTime, settings);
}

function _stop(mode) {
  if (mode === 'analog') Analog.stop();
  else Digital.stop();
}

function _getTime() {
  return getTimeParts(_resolvedTz);
}

function _applyMode(mode) {
  if (mode === 'analog') {
    _analogWrap.classList.remove('hidden');
    _digitalWrap.classList.add('hidden');
  } else {
    _analogWrap.classList.add('hidden');
    _digitalWrap.classList.remove('hidden');
  }
}
