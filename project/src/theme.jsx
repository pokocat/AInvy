// theme.jsx — color themes + design tokens for 投小AI
// Three palettes the user can switch via Tweaks: 墨绿金 / 深蓝 / 中性墨

const SERIF = "'Noto Serif SC', 'Songti SC', serif";
const SANS  = "'Noto Sans SC', system-ui, -apple-system, sans-serif";

// Shared market semantics: A股习惯 涨红 / 跌绿
const UP   = '#d8463b';   // 涨
const DOWN = '#119c6b';   // 跌

const THEMES = {
  // 墨绿 + 古铜金 —— 编辑感 / 高级简报
  ink_green: {
    name: '墨绿金',
    bg:       '#f1ede2',
    bgTint:   '#e9e4d4',
    card:     '#fffdf7',
    cardAlt:  '#f7f3e8',
    hero:     '#15362c',
    hero2:    '#1d4a3c',
    ink:      '#1c241f',
    sub:      '#5d6660',
    faint:    '#9aa19a',
    line:     '#e4ddcb',
    lineSoft: '#efe9da',
    brand:    '#b88a3e',     // 古铜金
    brandDeep:'#9a7330',
    brandSoft:'#f3e8cf',
    onHero:   '#f6f1e2',
    onHeroSub:'#a9c2b4',
    heroChip: 'rgba(255,255,255,0.10)',
    up: UP, down: DOWN,
  },
  // 深蓝券商 —— 专业稳重
  navy: {
    name: '深蓝',
    bg:       '#eef1f6',
    bgTint:   '#e3e8f0',
    card:     '#ffffff',
    cardAlt:  '#f4f7fb',
    hero:     '#102a4c',
    hero2:    '#1a3e6b',
    ink:      '#16202e',
    sub:      '#5a6675',
    faint:    '#97a1b0',
    line:     '#e2e7ef',
    lineSoft: '#eef1f6',
    brand:    '#c79a4b',
    brandDeep:'#a87f37',
    brandSoft:'#eef3fb',
    onHero:   '#f3f6fb',
    onHeroSub:'#9fb6d2',
    heroChip: 'rgba(255,255,255,0.10)',
    up: UP, down: DOWN,
  },
  // 中性墨 —— 极简黑白灰
  mono: {
    name: '中性墨',
    bg:       '#f4f3f0',
    bgTint:   '#ebe9e4',
    card:     '#ffffff',
    cardAlt:  '#f6f5f2',
    hero:     '#211f1c',
    hero2:    '#34302a',
    ink:      '#1c1a17',
    sub:      '#5f5b54',
    faint:    '#9a958c',
    line:     '#e6e3dc',
    lineSoft: '#efece5',
    brand:    '#9c7b3f',
    brandDeep:'#7f6331',
    brandSoft:'#efe9dd',
    onHero:   '#f4f1ea',
    onHeroSub:'#b3ac9f',
    heroChip: 'rgba(255,255,255,0.10)',
    up: UP, down: DOWN,
  },
};

function getTheme(key) {
  const t = THEMES[key] || THEMES.ink_green;
  return { ...t, serif: SERIF, sans: SANS };
}

Object.assign(window, { THEMES, getTheme, SERIF, SANS });
