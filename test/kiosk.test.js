// Boots the real app with URL parameters, then checks the kiosk behaviour.
// setTimeout is faked so the idle timeout can be stepped through.
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(indexHtml)[1]
  localStorage.clear()
  history.replaceState(null, '', '/?mode=digital&font=vt323&tz=Asia/Tokyo')
  await import('../src/main.js')
})
afterAll(() => {
  vi.useRealTimers()
})

describe('URL settings', () => {
  it('applies the URL settings on load', () => {
    expect(document.body.classList.contains('mode-digital')).toBe(true)
    const fontSel = document.getElementById('digital-font-select')
    expect(fontSel.selectedOptions[0].textContent).toBe('VT323')
    expect(document.getElementById('tz-input').value).toBe('Asia/Tokyo')
  })

  it('does not save them', () => {
    expect(localStorage.getItem('clock-settings')).toBeNull()
  })
})

describe('kiosk', () => {
  const panel = () => document.getElementById('settings-panel')
  const idle = () => document.body.classList.contains('idle')
  const key = k => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))

  it('hides the gear and cursor after 3 seconds without input', () => {
    expect(idle()).toBe(false)
    vi.advanceTimersByTime(3000)
    expect(idle()).toBe(true)
  })

  it('shows them again when the pointer moves', () => {
    document.dispatchEvent(new Event('pointermove'))
    expect(idle()).toBe(false)
  })

  it('stays awake while the settings panel is open', () => {
    document.getElementById('settings-toggle').click()
    expect(panel().classList.contains('open')).toBe(true)
    vi.advanceTimersByTime(5000)
    expect(idle()).toBe(false)
  })

  it('closes the settings panel on Escape', () => {
    key('Escape')
    expect(panel().classList.contains('open')).toBe(false)
  })
})
