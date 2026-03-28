// Timezone utilities using native Intl API — no external deps, fully offline

export function detectTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getAllTimezones() {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return [detectTimezone()];
  }
}

/**
 * Returns current time parts for a given IANA timezone.
 * @param {string} tz - IANA timezone string, e.g. 'America/Chicago'
 * @returns {{ h: number, m: number, s: number, ms: number }}
 */
export function getTimeParts(tz) {
  const now = new Date();
  const ms = now.getMilliseconds();

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const get = type => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);
  let h = get('hour');
  if (h === 24) h = 0; // some Intl impls return 24 for midnight

  return { h, m: get('minute'), s: get('second'), ms };
}

export function formatTime(h, m, s, hour12 = false) {
  if (hour12) {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${pad(m)}:${pad(s)} ${period}`;
  }
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}
