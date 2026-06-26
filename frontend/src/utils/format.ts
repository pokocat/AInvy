// Number formatters — ports of pct/yuan/yuan2 from components.jsx.

export const pct = (n: number, plus = true): string =>
  `${n > 0 && plus ? '+' : ''}${n.toFixed(2)}%`

export const yuan = (n: number): string =>
  '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })

export const yuan2 = (n: number): string =>
  '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
