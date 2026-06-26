// Visual verification: render the original SVG line-icons beside the generated
// font glyphs (outline + solid) and screenshot. Lets us eyeball fidelity
// without WeChat DevTools.
import { chromium } from 'playwright-core'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// pull the woff2 base64 out of the generated scss
const scss = readFileSync(resolve(root, 'src/assets/iconfont.gen.scss'), 'utf8')
const b64 = scss.match(/base64,([^']+)'/)[1]

// pull the glyph map out of the generated ts
const ts = readFileSync(resolve(root, 'src/components/iconfont.gen.ts'), 'utf8')
const GLYPHS = {}
for (const m of ts.matchAll(/(\w+): \{ o: '([^']+)', s: '([^']+)' \}/g)) {
  GLYPHS[m[1]] = { o: JSON.parse(`"${m[2]}"`), s: JSON.parse(`"${m[3]}"`) }
}

// original SVG art (mirror of Icon.tsx PATHS, stroke style)
const PATHS = {
  brief: '<path d="M5 4h11l3 3v13H5z"/><path d="M9 9h7M9 13h7M9 17h4"/>',
  star: '<path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z"/>',
  wallet: '<rect x="3.5" y="6" width="17" height="13" rx="2.5"/><path d="M3.5 10h17M16 14h1.5"/>',
  bell: '<path d="M6.5 9a5.5 5.5 0 0111 0c0 5 2 6 2 6H4.5s2-1 2-6z"/><path d="M10 19a2 2 0 004 0"/>',
  flame: '<path d="M12 3c1 3-2 4-2 7a3 3 0 006 .2c0-1.6-1-2.6-1-4 2 1.3 3 3.3 3 5.3a6 6 0 11-12 0c0-3.8 3.5-5.2 6-8.5z"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  plus: '<path d="M12 6v12M6 12h12"/>',
  check: '<path d="M5 12.5l4 4 10-10"/>',
  bookmark: '<path d="M7 4h10v16l-5-3.5L7 20z"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4"/>',
  arrow: '<path d="M5 12h13M13 7l5 5-5 5"/>',
  sparkle: '<path d="M12 4l1.6 5L19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-2z"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
}
const SOLID = new Set(['star', 'bell', 'flame', 'bookmark', 'sparkle', 'bolt'])

const rows = Object.keys(PATHS).map((name) => {
  const svg = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#15362c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`
  const fontO = `<span class="ic">${GLYPHS[name].o}</span>`
  const fontS = SOLID.has(name) ? `<span class="ic solid">${GLYPHS[name].s}</span>` : '<span class="muted">—</span>'
  return `<tr><td class="n">${name}</td><td>${svg}</td><td>${fontO}</td><td>${fontS}</td></tr>`
}).join('')

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:appicon;src:url('data:font/woff2;base64,${b64}') format('woff2');}
body{font-family:sans-serif;background:#f4efe2;margin:0;padding:24px;}
table{border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;}
td,th{padding:8px 16px;border-bottom:1px solid #eee;text-align:center;vertical-align:middle;}
th{background:#15362c;color:#fff;font-size:13px;}
.n{font-family:monospace;font-size:13px;text-align:left;color:#333;}
.ic{font-family:appicon;font-size:40px;color:#15362c;line-height:1;}
.ic.solid{color:#1a7a5a;}
.muted{color:#ccc;}
</style></head><body>
<table><thead><tr><th>name</th><th>original SVG</th><th>font outline</th><th>font solid</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const page = await browser.newPage({ deviceScaleFactor: 2 })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const table = await page.$('table')
await table.screenshot({ path: resolve(root, 'tools/iconfont_verify.png') })
await browser.close()
console.log('wrote tools/iconfont_verify.png')
