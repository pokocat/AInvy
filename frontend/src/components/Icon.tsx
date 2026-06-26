import { Text } from '@tarojs/components'
import { GLYPHS } from './iconfont.gen'
import { r } from '../utils/size'

// Icons render from a self-contained base64 icon font (see app.scss import of
// assets/iconfont.gen.scss, built by tools/build_iconfont.py). A font glyph is
// recoloured via CSS `color` and renders reliably on both H5 and WeChat MP —
// unlike base64 <Image> SVG, which isn't guaranteed on older MP base libs.
//
// `fill` picks the solid glyph for icons that have one (star, bell, flame,
// bookmark, sparkle, bolt); other names fall back to their single outline
// glyph. `stroke` is accepted for call-site compatibility but the weight is
// baked into the font, so it has no per-instance effect.

export type IconName =
  | 'brief' | 'star' | 'wallet' | 'bell' | 'flame' | 'chevron' | 'chevronDown'
  | 'back' | 'plus' | 'check' | 'bookmark' | 'search' | 'calc' | 'arrow'
  | 'sparkle' | 'bolt'

interface Props {
  name: IconName
  size?: number
  color?: string
  stroke?: number
  fill?: boolean
}

export default function Icon({ name, size = 24, color = '#000', fill = false }: Props) {
  const glyph = GLYPHS[name]
  const ch = fill ? glyph.s : glyph.o
  return (
    <Text
      className="appicon"
      style={{
        fontSize: r(size),
        lineHeight: r(size),
        width: r(size),
        height: r(size),
        color,
        textAlign: 'center',
        flexShrink: 0,
        display: 'inline-block'
      }}
    >
      {ch}
    </Text>
  )
}
