import './style.css';
import * as Settings from './settings.js';
import * as Clock from './clock.js';
import { getAllTimezones } from './timezone.js';
import { FONT_NAMES } from './digital/fonts.js';

// ── Bootstrap ────────────────────────────────────────────────────────────────
const settings = Settings.load();
Settings.applySize(settings.size);
document.body.classList.add(`mode-${settings.mode}`);

Clock.init({
  analogSvg:      document.getElementById('analog-svg'),
  digitalDisplay: document.getElementById('digital-display'),
  analogWrap:     document.getElementById('analog-clock'),
  digitalWrap:    document.getElementById('digital-clock'),
  settings,
});

// ── Settings panel open/close ─────────────────────────────────────────────────
const panel      = document.getElementById('settings-panel');
const toggleBtn  = document.getElementById('settings-toggle');
const closeBtn   = document.getElementById('settings-close');

toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.toggle('open'); });
closeBtn.addEventListener('click',  () => panel.classList.remove('open'));
document.addEventListener('click', (e) => {
  if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== toggleBtn) {
    panel.classList.remove('open');
  }
});

// ── Mode buttons ──────────────────────────────────────────────────────────────
const modeBtns = document.getElementById('mode-btns');
modeBtns.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-mode]');
  if (!btn) return;
  const mode = btn.dataset.mode;
  modeBtns.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
  document.body.classList.remove('mode-analog', 'mode-digital');
  document.body.classList.add(`mode-${mode}`);
  Settings.save({ mode });
  Clock.setMode(mode);
});
modeBtns.querySelectorAll('.toggle-btn').forEach(b => {
  b.classList.toggle('active', b.dataset.mode === settings.mode);
});

// ── Size buttons ──────────────────────────────────────────────────────────────
const sizeBtns = document.getElementById('size-btns');
sizeBtns.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-size]');
  if (!btn) return;
  const size = btn.dataset.size;
  sizeBtns.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b === btn));
  Settings.applySize(size);
  Settings.save({ size });
});
sizeBtns.querySelectorAll('.size-btn').forEach(b => {
  b.classList.toggle('active', b.dataset.size === settings.size);
});

// ── Timezone ──────────────────────────────────────────────────────────────────
const tzInput = document.getElementById('tz-input');
const tzList  = document.getElementById('tz-list');

getAllTimezones().forEach(tz => {
  const opt = document.createElement('option');
  opt.value = tz;
  tzList.appendChild(opt);
});

if (settings.timezone !== 'auto') tzInput.value = settings.timezone;

tzInput.addEventListener('change', () => {
  const val = tzInput.value.trim();
  if (!val) {
    Settings.save({ timezone: 'auto' });
    Clock.setTimezone('auto');
    return;
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: val }); // validates the zone
    Settings.save({ timezone: val });
    Clock.setTimezone(val);
  } catch {
    tzInput.value = settings.timezone !== 'auto' ? settings.timezone : '';
  }
});

document.getElementById('tz-reset').addEventListener('click', () => {
  tzInput.value = '';
  Settings.save({ timezone: 'auto' });
  Clock.setTimezone('auto');
});

// ── Analog style select ───────────────────────────────────────────────────────
const analogStyleSel = document.getElementById('analog-style-select');
const analogCycleOpts = document.getElementById('analog-cycle-options');

// Options 0–3 are declared in HTML; just restore the saved value
analogStyleSel.value = String(settings.analog.pinnedStyle);
analogCycleOpts.style.display = settings.analog.pinnedStyle === -1 ? '' : 'none';

analogStyleSel.addEventListener('change', () => {
  const pinnedStyle = parseInt(analogStyleSel.value);
  analogCycleOpts.style.display = pinnedStyle === -1 ? '' : 'none';
  Settings.save({ analog: { pinnedStyle } });
  Clock.restartAnalog();
});

// Analog cycle radios
document.querySelectorAll('input[name="analog-cycle"]').forEach(radio => {
  radio.checked = radio.value === settings.analog.cycleMode;
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    Settings.save({ analog: { cycleMode: radio.value } });
    const intervalRow = document.getElementById('analog-interval-row');
    intervalRow.classList.toggle('visible', radio.value === 'timer');
    Clock.restartAnalog();
  });
});
document.getElementById('analog-interval-row').classList.toggle('visible', settings.analog.cycleMode === 'timer');

const analogIntervalInput = document.getElementById('analog-interval');
analogIntervalInput.value = settings.analog.cycleInterval;
analogIntervalInput.addEventListener('change', (e) => {
  const val = clampInterval(e.target.value);
  e.target.value = val;
  Settings.save({ analog: { cycleInterval: val } });
  Clock.restartAnalog();
});

// ── Digital font select ───────────────────────────────────────────────────────
const digitalFontSel  = document.getElementById('digital-font-select');
const digitalCycleOpts = document.getElementById('digital-cycle-options');

FONT_NAMES.forEach((name, i) => {
  const opt = document.createElement('option');
  opt.value = String(i);
  opt.textContent = name;
  digitalFontSel.appendChild(opt);
});
digitalFontSel.value = String(settings.digital.pinnedFont);
digitalCycleOpts.style.display = settings.digital.pinnedFont === -1 ? '' : 'none';

digitalFontSel.addEventListener('change', () => {
  const pinnedFont = parseInt(digitalFontSel.value);
  digitalCycleOpts.style.display = pinnedFont === -1 ? '' : 'none';
  Settings.save({ digital: { pinnedFont } });
  Clock.restartDigital();
});

// Digital cycle radios
document.querySelectorAll('input[name="digital-cycle"]').forEach(radio => {
  radio.checked = radio.value === settings.digital.cycleMode;
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    Settings.save({ digital: { cycleMode: radio.value } });
    const intervalRow = document.getElementById('digital-interval-row');
    intervalRow.classList.toggle('visible', radio.value === 'timer');
    Clock.restartDigital();
  });
});
document.getElementById('digital-interval-row').classList.toggle('visible', settings.digital.cycleMode === 'timer');

const digitalIntervalInput = document.getElementById('digital-interval');
digitalIntervalInput.value = settings.digital.cycleInterval;
digitalIntervalInput.addEventListener('change', (e) => {
  const val = clampInterval(e.target.value);
  e.target.value = val;
  Settings.save({ digital: { cycleInterval: val } });
  Clock.restartDigital();
});

// 12h toggle (takes effect on next tick — no restart needed)
const hour12Check = document.getElementById('hour12-check');
hour12Check.checked = settings.digital.hour12;
hour12Check.addEventListener('change', () => {
  Settings.save({ digital: { hour12: hour12Check.checked } });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function clampInterval(raw) {
  return Math.max(10, Math.min(3600, parseInt(raw) || 300));
}
