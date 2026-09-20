// End-to-end smoke test: boots the real index.html body with the real main.js
// in jsdom, then checks that both modes render and that the clock animates.
// This is the check that stands in for opening a browser.
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// vitest runs with the project root as cwd.
const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

/** Resolves after the browser has painted at least `n` animation frames. */
function frames(n = 2) {
  return new Promise(resolve => {
    let left = n
    const step = () => (--left <= 0 ? resolve() : requestAnimationFrame(step))
    requestAnimationFrame(step)
  })
}

beforeAll(async () => {
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(indexHtml)
  if (!body) throw new Error('could not find <body> in index.html')
  // innerHTML does not execute the module script tag, so main.js is imported
  // explicitly below — after the DOM it queries exists.
  document.body.innerHTML = body[1]

  localStorage.clear()
  await import('../src/main.js')
})

describe('app boot', () => {
  it('renders an analog face into the svg', () => {
    const svg = document.getElementById('analog-svg')
    expect(svg.childNodes.length).toBeGreaterThan(0)
  })

  it('starts in analog mode', () => {
    expect(document.body.classList.contains('mode-analog')).toBe(true)
    expect(document.getElementById('analog-clock').classList.contains('hidden')).toBe(false)
  })

  it('populates the style, font and timezone pickers', () => {
    expect(document.querySelectorAll('#analog-style-select option').length).toBeGreaterThan(1)
    expect(document.querySelectorAll('#digital-font-select option').length).toBeGreaterThan(1)
    expect(document.querySelectorAll('#tz-list option').length).toBeGreaterThan(0)
  })

  it('advances the hands on every animation frame', async () => {
    const hands = [...document.querySelectorAll('#analog-svg g[transform^="rotate"]')]
    expect(hands.length).toBeGreaterThanOrEqual(3)

    const before = hands.map(h => h.getAttribute('transform'))
    await frames(3)
    const after = hands.map(h => h.getAttribute('transform'))

    // The second hand interpolates sub-second, so at least one hand must move.
    expect(after).not.toEqual(before)
  })

  it('renders digits when switched to digital mode', () => {
    document.querySelector('#mode-btns [data-mode="digital"]').click()

    expect(document.body.classList.contains('mode-digital')).toBe(true)
    expect(document.getElementById('digital-clock').classList.contains('hidden')).toBe(false)

    const digits = document.querySelectorAll('#digital-display .clock-digit')
    expect(digits.length).toBe(6) // HH MM SS
    for (const d of digits) expect(d.textContent).toMatch(/^\d$/)
  })

  it('persists a settings change to localStorage', () => {
    document.querySelector('#size-btns [data-size="small"]').click()

    const saved = JSON.parse(localStorage.getItem('clock-settings'))
    expect(saved.size).toBe('small')
    expect(saved.mode).toBe('digital') // from the previous click
  })
})
