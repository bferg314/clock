// Contract tests for the analog face registry.
// Every face must satisfy the same init/update shape, because the orchestrator
// swaps between them blindly.
import { describe, it, expect, beforeEach } from 'vitest'
import { STYLE_NAMES } from '../src/analog/index.js'
import { FONTS, FONT_NAMES } from '../src/digital/fonts.js'

const SVG_NS = 'http://www.w3.org/2000/svg'

// Discovered from disk rather than imported from the registry, so that a face
// file which was never registered in src/analog/index.js still fails the count
// assertion below instead of being silently skipped.
const FACES = Object.entries(import.meta.glob('../src/analog/*.js', { eager: true }))
  .filter(([path]) => !/\/(index|helpers)\.js$/.test(path))
  .map(([path, mod]) => [path.split('/').pop().replace('.js', ''), mod])
  .sort(([a], [b]) => a.localeCompare(b))

function freshSvg() {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 200 200')
  document.body.appendChild(svg)
  return svg
}

/** Pulls the angle and rotation centre out of a `rotate(a,cx,cy)` transform. */
function parseRotate(el) {
  const m = /rotate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(
    el.getAttribute('transform') ?? '',
  )
  if (!m) throw new Error(`not a rotate transform: ${el.getAttribute('transform')}`)
  return { angle: Number(m[1]), cx: Number(m[2]), cy: Number(m[3]) }
}

describe('analog style registry', () => {
  it('registers every face module on disk', () => {
    expect(STYLE_NAMES).toHaveLength(FACES.length)
  })

  it('has unique, non-empty style names', () => {
    expect(new Set(STYLE_NAMES).size).toBe(STYLE_NAMES.length)
    for (const name of STYLE_NAMES) expect(name.trim()).not.toBe('')
  })

  // Registry positions are persisted to localStorage as pinnedStyle/currentStyle,
  // so inserting or reordering an entry silently repoints a user's pinned face.
  // Appending is safe and leaves this prefix untouched.
  it('preserves the established style order', () => {
    const locked = [
      'Classic', 'Minimal', 'Retro', 'Skeleton', 'Neon',
      'Nautical', 'Deco', 'Chalkboard', 'Blueprint', 'Mondrian',
    ]
    expect(STYLE_NAMES.slice(0, locked.length)).toEqual(locked)
  })
})

describe('digital font registry', () => {
  it('derives FONT_NAMES from FONTS', () => {
    expect(FONT_NAMES).toEqual(FONTS.map(f => f.name))
  })

  it('gives every font a family and weight', () => {
    for (const font of FONTS) {
      expect(font.family.trim()).not.toBe('')
      expect(typeof font.weight).toBe('number')
    }
  })

  // Same index-addressing hazard as the style registry, via pinnedFont/currentFont.
  it('preserves the established font order', () => {
    const locked = [
      'Orbitron', 'Share Tech Mono', 'VT323', 'Press Start 2P', 'Audiowide',
      'Oxanium', 'Chakra Petch', 'Syncopate', 'Major Mono Display', 'Space Mono',
      'Roboto Mono', 'Rajdhani', 'Nova Mono', 'Exo 2',
    ]
    expect(FONT_NAMES.slice(0, locked.length)).toEqual(locked)
  })
})

describe.each(FACES)('face: %s', (name, face) => {
  let svg
  let refs

  beforeEach(() => {
    svg = freshSvg()
    refs = face.init(svg)
  })

  it('draws into the svg and returns the three hands', () => {
    expect(svg.childNodes.length).toBeGreaterThan(0)
    for (const hand of ['hourHand', 'minuteHand', 'secondHand']) {
      expect(refs[hand], `${name} must return ${hand}`).toBeTruthy()
      expect(svg.contains(refs[hand]), `${name}.${hand} must be attached`).toBe(true)
    }
  })

  it('rotates each hand around the dial centre for a known time', () => {
    // 03:15:30 -> hour 97.5deg, minute 93deg, second 180deg
    face.update(refs, 3, 15, 30, 0)

    const hour = parseRotate(refs.hourHand)
    const minute = parseRotate(refs.minuteHand)
    const second = parseRotate(refs.secondHand)

    expect(hour.angle).toBeCloseTo(97.5, 5)
    expect(minute.angle).toBeCloseTo(93, 5)
    expect(second.angle).toBeCloseTo(180, 5)

    for (const t of [hour, minute, second]) {
      expect(t.cx).toBe(100)
      expect(t.cy).toBe(100)
    }
  })

  it('interpolates the second hand between whole seconds', () => {
    face.update(refs, 0, 0, 10, 0)
    const whole = parseRotate(refs.secondHand).angle
    face.update(refs, 0, 0, 10, 500)
    const half = parseRotate(refs.secondHand).angle

    expect(half - whole).toBeCloseTo(3, 5) // half a second = 3 degrees
  })

  it('wraps the hour hand at noon', () => {
    face.update(refs, 12, 0, 0, 0)
    expect(parseRotate(refs.hourHand).angle).toBeCloseTo(0, 5)
  })
})
