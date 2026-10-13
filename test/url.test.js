import { describe, it, expect } from 'vitest'
import { parseUrlSettings } from '../src/url.js'

const known = {
  styleNames: ['Classic', 'Minimal', 'Neon'],
  fontNames: ['Orbitron', 'Share Tech Mono', 'VT323'],
  sizes: ['small', 'medium', 'large', 'xl', 'fill'],
}
const parse = search => parseUrlSettings(search, known)

describe('parseUrlSettings', () => {
  it('returns nothing for an empty query', () => {
    expect(parse('')).toEqual({})
  })

  it('reads mode, size and timezone', () => {
    expect(parse('?mode=digital&size=xl&tz=Europe/London')).toEqual({
      mode: 'digital',
      size: 'xl',
      timezone: 'Europe/London',
    })
  })

  it('pins styles and fonts by name, loosely matched', () => {
    expect(parse('?style=neon').analog).toEqual({ pinnedStyle: 2 })
    expect(parse('?font=share-tech-mono').digital).toEqual({ pinnedFont: 1 })
    expect(parse('?font=Share%20Tech%20Mono').digital).toEqual({ pinnedFont: 1 })
    expect(parse('?font=VT323').digital).toEqual({ pinnedFont: 2 })
  })

  it('unpins with "cycle"', () => {
    expect(parse('?style=cycle&font=cycle')).toEqual({
      analog: { pinnedStyle: -1 },
      digital: { pinnedFont: -1 },
    })
  })

  it('reads hour12 as a boolean', () => {
    expect(parse('?hour12=1').digital).toEqual({ hour12: true })
    expect(parse('?hour12=false').digital).toEqual({ hour12: false })
  })

  it('ignores values it does not recognise', () => {
    expect(parse('?mode=sundial&size=huge&tz=Not/AZone&style=nope&font=comic&hour12=maybe')).toEqual({})
  })
})
