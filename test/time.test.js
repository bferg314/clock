import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handAngles } from '../src/analog/helpers.js'
import { formatTime, getTimeParts, detectTimezone } from '../src/timezone.js'
import * as Digital from '../src/digital/index.js'
import * as Settings from '../src/settings.js'

describe('handAngles', () => {
  it('advances the hour hand smoothly through the hour', () => {
    expect(handAngles(3, 0, 0, 0).hour).toBeCloseTo(90, 5)
    expect(handAngles(3, 30, 0, 0).hour).toBeCloseTo(105, 5)
  })

  it('advances the minute hand smoothly through the minute', () => {
    expect(handAngles(0, 10, 0, 0).minute).toBeCloseTo(60, 5)
    expect(handAngles(0, 10, 30, 0).minute).toBeCloseTo(63, 5)
  })

  it('treats midnight and noon as zero', () => {
    expect(handAngles(0, 0, 0, 0).hour).toBe(0)
    expect(handAngles(12, 0, 0, 0).hour).toBe(0)
  })
})

describe('formatTime', () => {
  it('zero-pads 24-hour time', () => {
    expect(formatTime(9, 5, 3)).toBe('09:05:03')
    expect(formatTime(0, 0, 0)).toBe('00:00:00')
  })

  it('renders 12-hour time with a period', () => {
    expect(formatTime(0, 0, 0, true)).toBe('12:00:00 AM')
    expect(formatTime(12, 0, 0, true)).toBe('12:00:00 PM')
    expect(formatTime(13, 7, 9, true)).toBe('1:07:09 PM')
  })
})

describe('getTimeParts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:34:56.789Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reads a zone exactly', () => {
    expect(getTimeParts('UTC')).toEqual({ h: 12, m: 34, s: 56, ms: 789 })
  })

  it('applies the zone offset', () => {
    expect(getTimeParts('Asia/Tokyo').h).toBe(21) // +09:00, no DST
    expect(getTimeParts('America/Chicago').h).toBe(6) // -06:00 in January
  })

  it('reads the current time on every call for the same zone', () => {
    expect(getTimeParts('UTC').s).toBe(56)
    vi.setSystemTime(new Date('2026-01-15T12:34:58.000Z'))
    expect(getTimeParts('UTC')).toEqual({ h: 12, m: 34, s: 58, ms: 0 })
  })

  it('reports midnight as hour 0, not 24', () => {
    vi.setSystemTime(new Date('2026-01-15T00:30:00.000Z'))
    expect(getTimeParts('UTC').h).toBe(0)
  })

  it('detects a usable local zone', () => {
    expect(() => new Intl.DateTimeFormat('en-US', { timeZone: detectTimezone() })).not.toThrow()
  })
})

describe('digital tick', () => {
  let display

  beforeEach(() => {
    vi.useFakeTimers()
    // Load 700 ms into a second, so a plain 1s interval would lag by 700 ms.
    vi.setSystemTime(new Date('2026-01-15T12:34:05.700Z'))
    display = document.createElement('div')
    Digital.init(display, () => getTimeParts('UTC'), Settings.get())
  })
  afterEach(() => {
    Digital.stop()
    vi.useRealTimers()
  })

  it('changes the digits right after the second turns over', () => {
    expect(display.textContent).toBe('12:34:05')
    vi.advanceTimersByTime(290)
    expect(display.textContent).toBe('12:34:05')
    vi.advanceTimersByTime(30) // now 06.020
    expect(display.textContent).toBe('12:34:06')
    vi.advanceTimersByTime(1000)
    expect(display.textContent).toBe('12:34:07')
  })

  it('stops ticking after stop()', () => {
    Digital.stop()
    vi.advanceTimersByTime(5000)
    expect(display.textContent).toBe('12:34:05')
  })
})
