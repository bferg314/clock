import { describe, it, expect, beforeEach } from 'vitest'
import * as Settings from '../src/settings.js'

const stored = () => JSON.parse(localStorage.getItem('clock-settings'))

describe('settings overrides', () => {
  beforeEach(() => {
    localStorage.clear()
    Settings.applyOverrides({})
    Settings.load()
  })

  it('applies an override without saving it', () => {
    Settings.applyOverrides({ mode: 'digital', digital: { pinnedFont: 2 } })
    expect(Settings.get().mode).toBe('digital')
    expect(Settings.get().digital.pinnedFont).toBe(2)
    expect(Settings.get().digital.hour12).toBe(false) // untouched keys keep their value
    expect(localStorage.getItem('clock-settings')).toBeNull()
  })

  it('keeps overrides out of storage when another setting is saved', () => {
    Settings.applyOverrides({ mode: 'digital', digital: { pinnedFont: 2 } })
    Settings.save({ size: 'small', digital: { hour12: true } })

    expect(stored().mode).toBe('analog')
    expect(stored().digital.pinnedFont).toBe(-1)
    expect(Settings.get().mode).toBe('digital')
    expect(Settings.get().digital.pinnedFont).toBe(2)
  })

  it('lets a saved value replace the override for that key', () => {
    Settings.applyOverrides({ mode: 'digital', digital: { pinnedFont: 2, hour12: true } })
    Settings.save({ mode: 'analog', digital: { pinnedFont: 0 } })

    expect(Settings.get().mode).toBe('analog')
    expect(Settings.get().digital.pinnedFont).toBe(0)
    expect(Settings.get().digital.hour12).toBe(true) // still overridden
    expect(stored().digital.hour12).toBe(false)
  })
})
