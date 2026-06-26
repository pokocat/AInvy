import { Image } from '@tarojs/components'
import { svgUri } from '../utils/svg'
import { r } from '../utils/size'

// Net-value sparkline — port of components.jsx Sparkline, rendered as an
// <Image> SVG data-URI for cross-platform support.

interface Props {
  data: number[]
  color: string
  w?: number
  h?: number
  fillTop?: boolean
  strokeW?: number
}

export default function Sparkline({ data, color, w = 120, h = 40, fillTop = false, strokeW = 2 }: Props) {
  if (!data || !data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / span) * (h - 4) - 2
  ])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${d} L${w} ${h} L0 ${h} Z`
  const gid = 'g' + Math.round(min * 1e6) + '_' + Math.round(max * 1e6) + w

  const defs = fillTop
    ? `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${color}" stop-opacity="0.22"/>` +
      `<stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>` +
      `<path d="${area}" fill="url(#${gid})"/>`
    : ''

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    defs +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${strokeW}" ` +
    `stroke-linejoin="round" stroke-linecap="round"/>` +
    '</svg>'

  return <Image src={svgUri(svg)} style={{ width: r(w), height: r(h), display: 'block' }} />
}
