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

export function init({ analogSvg, digitalDisplay, analogWrap, digitalWrap, settings }) {
  _analogSvg = analogSvg;
  _digitalDisplay = digitalDisplay;
  _analogWrap = analogWrap;
  _digitalWrap = digitalWrap;

  _resolvedTz = settings.timezone === 'auto' ? detectTimezone() : settings.timezone;

  _applyMode(settings.mode);

  Analog.init(_analogSvg, _getTime, settings);
  Digital.init(_digitalDisplay, _getTime, settings);
}

export function setMode(mode) {
  _applyMode(mode);
}

export function setTimezone(tz) {
  _resolvedTz = tz === 'auto' ? detectTimezone() : tz;
}

export function restartAnalog() {
  Analog.stop();
  Analog.init(_analogSvg, _getTime, Settings.get());
}

export function restartDigital() {
  Digital.stop();
  Digital.init(_digitalDisplay, _getTime, Settings.get());
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
