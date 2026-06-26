// Cross-platform sizing.
//
// The prototype was laid out in CSS px on a 412px-wide phone frame. To stay
// faithful while being responsive on real devices:
//   * WeChat MP  → convert to rpx (750-base), so the layout scales to any
//                  screen width exactly like the original proportions.
//   * H5         → keep literal px, rendered inside a centered ~420px phone
//                  column, so the web demo is pixel-identical to the prototype.
//
// Usage: r(16) → '29.13rpx' (weapp) | '16px' (h5). Use for every padding,
// margin, font-size, width, height, gap and border-radius in inline styles.

const BASE = 412 // prototype frame width
const DESIGN = 750 // weapp rpx design width

const isH5 = process.env.TARO_ENV === 'h5'

export function r(n: number): string {
  if (isH5) return `${n}px`
  return `${+((n * DESIGN) / BASE).toFixed(2)}rpx`
}

/** The phone column width on H5; full width on MP. */
export const FRAME_W = isH5 ? `${BASE}px` : '100vw'
