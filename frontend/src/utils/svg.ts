// SVG → data-URI helper for the <Image>-based Icon and Sparkline renderers.
//
// Mini Program has no inline <svg>, so every vector is rendered as an
// <Image src="data:image/svg+xml;base64,...">. That single approach is
// portable across H5 and WeChat MP. SVG markup here is ASCII, so a small
// ASCII base64 encoder (btoa-free, MP has no btoa) is enough.

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function asciiBase64(input: string): string {
  let out = ''
  let i = 0
  while (i < input.length) {
    const c1 = input.charCodeAt(i++) & 0xff
    const c2 = input.charCodeAt(i++) & 0xff
    const c3 = input.charCodeAt(i++) & 0xff
    const e1 = c1 >> 2
    const e2 = ((c1 & 3) << 4) | (c2 >> 4)
    let e3 = ((c2 & 15) << 2) | (c3 >> 6)
    let e4 = c3 & 63
    if (isNaN(c2)) {
      e3 = 64
      e4 = 64
    } else if (isNaN(c3)) {
      e4 = 64
    }
    out += B64.charAt(e1) + B64.charAt(e2) + (e3 === 64 ? '=' : B64.charAt(e3)) + (e4 === 64 ? '=' : B64.charAt(e4))
  }
  return out
}

export function svgUri(svg: string): string {
  return `data:image/svg+xml;base64,${asciiBase64(svg)}`
}
