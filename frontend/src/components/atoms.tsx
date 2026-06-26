import { View, Text } from '@tarojs/components'
import { ReactNode } from 'react'
import type { Theme } from '../theme'
import { pct } from '../utils/format'
import { r } from '../utils/size'
import Icon, { IconName } from './Icon'

// ---------- Chip ----------
export function Chip({ children, tk, active, onClick, soft }: {
  children: ReactNode; tk: Theme; active?: boolean; onClick?: () => void; soft?: boolean
}) {
  return (
    <View
      onClick={onClick}
      style={{
        whiteSpace: 'nowrap', padding: `${r(7)} ${r(14)}`, borderRadius: r(999),
        fontSize: r(13), fontFamily: tk.sans, fontWeight: active ? 600 : 500, letterSpacing: '.02em',
        background: active ? tk.ink : soft ? tk.cardAlt : 'transparent',
        color: active ? tk.card : tk.sub, transition: 'all .18s', display: 'inline-block'
      }}
    >
      {children}
    </View>
  )
}

// ---------- Tag ----------
export function Tag({ children, tk, color }: { children: ReactNode; tk: Theme; color?: string }) {
  const c = color || tk.brand
  return (
    <Text
      style={{
        fontSize: r(11), fontFamily: tk.sans, fontWeight: 600, letterSpacing: '.03em',
        color: c, background: c + '1a', padding: `${r(2)} ${r(7)}`, borderRadius: r(5), whiteSpace: 'nowrap'
      }}
    >
      {children}
    </Text>
  )
}

// ---------- Change (signed pct, A股 colors) ----------
export function Change({ v, tk, size = 14, weight = 700, suffix = true }: {
  v: number; tk: Theme; size?: number; weight?: number; suffix?: boolean
}) {
  const c = v > 0 ? tk.up : v < 0 ? tk.down : tk.sub
  return (
    <Text style={{ color: c, fontSize: r(size), fontWeight: weight, fontFamily: tk.sans }}>
      {pct(v, suffix)}
    </Text>
  )
}

// ---------- RiskDot ----------
export function RiskDot({ risk, tk }: { risk: string; tk: Theme }) {
  const map: Record<string, string> = { 低: tk.down, 中: tk.brand, 中高: '#e08a2b', 高: tk.up }
  const c = map[risk] || tk.sub
  return (
    <View style={{ display: 'inline-flex', alignItems: 'center', gap: r(4) }}>
      <View style={{ width: r(6), height: r(6), borderRadius: r(999), background: c }} />
      <Text style={{ fontSize: r(11.5), fontWeight: 600, color: c, fontFamily: tk.sans }}>{risk}风险</Text>
    </View>
  )
}

// ---------- StarRow ----------
export function StarRow({ v, tk, size = 12 }: { v: number; tk: Theme; size?: number }) {
  return (
    <View style={{ display: 'inline-flex', gap: r(1) }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={size} color={tk.brand} fill={i < Math.round(v)} />
      ))}
    </View>
  )
}

// ---------- SectionTitle ----------
export function SectionTitle({ tk, kicker, title, icon, right }: {
  tk: Theme; kicker?: string; title: string; icon?: IconName; right?: ReactNode
}) {
  return (
    <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View>
        {kicker && (
          <View style={{ fontSize: r(10.5), letterSpacing: '.18em', color: tk.brand, fontWeight: 700, fontFamily: tk.sans, marginBottom: r(3) }}>
            {kicker}
          </View>
        )}
        <View style={{ display: 'flex', alignItems: 'center', gap: r(7) }}>
          {icon && <Icon name={icon} size={19} color={tk.ink} stroke={2} />}
          <Text style={{ fontFamily: tk.serif, fontSize: r(21), fontWeight: 700, color: tk.ink, letterSpacing: '.01em' }}>
            {title}
          </Text>
        </View>
      </View>
      {right}
    </View>
  )
}

// ---------- HeatBar ----------
export function HeatBar({ v, tk }: { v: number; tk: Theme }) {
  return (
    <View style={{ height: r(5), borderRadius: r(999), background: tk.line, overflow: 'hidden', flex: 1 }}>
      <View style={{ width: v + '%', height: '100%', borderRadius: r(999), background: `linear-gradient(90deg, ${tk.brand}, ${tk.brandDeep})` }} />
    </View>
  )
}

// ---------- Expand (height transition, cross-platform via max-height) ----------
export function Expand({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <View
      style={{
        maxHeight: open ? r(600) : 0,
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height .3s cubic-bezier(.4,0,.2,1), opacity .25s'
      }}
    >
      {children}
    </View>
  )
}
