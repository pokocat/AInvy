import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import type { Theme } from '../theme'
import type { Fund, Position, WatchItem } from '../services/types'
import { r } from '../utils/size'
import { yuan, yuan2 } from '../utils/format'
import Icon from '../components/Icon'
import Sparkline from '../components/Sparkline'
import { Tag } from '../components/atoms'

// 持仓 (自选 + 模拟持仓) + 模拟买入 sheet — port of screens-holdings.jsx.

function SubTabs({ tabs, val, set, tk }: { tabs: string[]; val: string; set: (v: string) => void; tk: Theme }) {
  return (
    <View style={{ display: 'flex', gap: r(4), background: tk.cardAlt, borderRadius: r(12), padding: r(4) }}>
      {tabs.map((t) => (
        <View
          key={t}
          onClick={() => set(t)}
          style={{
            flex: 1, textAlign: 'center', borderRadius: r(9), padding: `${r(9)} 0`,
            fontFamily: tk.sans, fontSize: r(13.5), fontWeight: val === t ? 700 : 500,
            background: val === t ? tk.card : 'transparent', color: val === t ? tk.ink : tk.sub,
            boxShadow: val === t ? '0 1px 4px rgba(0,0,0,.06)' : 'none', transition: 'all .18s'
          }}
        >
          {t}
        </View>
      ))}
    </View>
  )
}

function WatchRow({ w, tk, fund, onOpen }: { w: WatchItem; tk: Theme; fund?: Fund; onOpen: () => void }) {
  return (
    <View onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: r(12), padding: `${r(14)} ${r(4)}`, borderBottom: `1px solid ${tk.lineSoft}` }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: r(14.5), fontWeight: 700, color: tk.ink }}>{w.name}</Text>
        <View style={{ fontSize: r(11.5), color: tk.faint, marginTop: r(4) }}>{w.code}</View>
      </View>
      {fund && <View style={{ width: r(80), opacity: 0.9 }}><Sparkline data={fund.series} color={w.chg >= 0 ? tk.up : tk.down} w={80} h={30} strokeW={1.8} /></View>}
      <View style={{ textAlign: 'right', minWidth: r(88) }}>
        <View style={{ fontFamily: tk.serif, fontSize: r(16), fontWeight: 800, color: tk.ink }}>{w.nav.toFixed(3)}</View>
        <View style={{ marginTop: r(3) }}>
          <Text style={{ display: 'inline-block', minWidth: r(58), textAlign: 'center', fontSize: r(12.5), fontWeight: 700, color: '#fff', borderRadius: r(6), padding: `${r(2)} 0`, background: w.chg >= 0 ? tk.up : tk.down }}>
            {w.chg > 0 ? '+' : ''}{w.chg.toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  )
}

function PositionRow({ p, tk, onOpen }: { p: Position; tk: Theme; onOpen: () => void }) {
  const mv = p.nav * p.shares
  const costTotal = p.cost * p.shares
  const profit = mv - costTotal
  const profitPct = (profit / costTotal) * 100
  const c = profit >= 0 ? tk.up : tk.down
  return (
    <View onClick={onOpen} style={{ background: tk.card, borderRadius: r(16), border: `1px solid ${tk.line}`, padding: `${r(14)} ${r(15)}` }}>
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: r(8) }}>
          <Text style={{ fontSize: r(14.5), fontWeight: 700, color: tk.ink }}>{p.name}</Text>
          {p.sip && <Tag tk={tk} color={tk.down}>定投中 ¥{p.sipAmt}/月</Tag>}
        </View>
        <Icon name="chevron" size={16} color={tk.faint} />
      </View>
      <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: r(14) }}>
        <View>
          <View style={{ fontSize: r(10.5), color: tk.faint }}>持仓市值</View>
          <View style={{ fontFamily: tk.serif, fontSize: r(21), fontWeight: 800, color: tk.ink, marginTop: r(2) }}>{yuan2(mv)}</View>
        </View>
        <View style={{ textAlign: 'right' }}>
          <View style={{ fontSize: r(10.5), color: tk.faint }}>累计盈亏</View>
          <View style={{ fontFamily: tk.serif, fontSize: r(19), fontWeight: 800, color: c, marginTop: r(2) }}>{profit >= 0 ? '+' : ''}{yuan2(profit).slice(1)}</View>
          <View style={{ fontSize: r(12), fontWeight: 700, color: c }}>{profitPct > 0 ? '+' : ''}{profitPct.toFixed(2)}%</View>
        </View>
      </View>
      <View style={{ display: 'flex', gap: r(18), marginTop: r(12), paddingTop: r(11), borderTop: `1px solid ${tk.lineSoft}` }}>
        {[['成本价', p.cost.toFixed(3)], ['现价', p.nav.toFixed(3)], ['持有份额', p.shares.toLocaleString('zh-CN')]].map(([k, v]) => (
          <View key={k}>
            <Text style={{ fontSize: r(11), color: tk.faint }}>{k} </Text>
            <Text style={{ fontSize: r(12.5), fontWeight: 700, color: tk.sub }}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function HoldingsScreen({ tk, positions, watch, fundsById, onOpen }: {
  tk: Theme; positions: Position[]; watch: WatchItem[]; fundsById: Record<string, Fund>; onOpen: (f: Fund) => void
}) {
  const [sub, setSub] = useState('模拟持仓')
  const totalMv = positions.reduce((a, p) => a + p.nav * p.shares, 0)
  const totalCost = positions.reduce((a, p) => a + p.cost * p.shares, 0)
  const totalProfit = totalMv - totalCost
  const totalPct = totalCost ? (totalProfit / totalCost) * 100 : 0
  const dayProfit = positions.reduce((a, p) => {
    const fnd = fundsById[p.id]
    return a + (fnd ? (fnd.navChg / 100) * p.nav * p.shares : 0)
  }, 0)
  const up = '#ff8b80'
  const down = '#7fe3bf'

  return (
    <ScrollView scrollY style={{ flex: 1, background: tk.bg }}>
      <View style={{ background: tk.card, padding: `${r(16)} ${r(18)}`, borderBottom: `1px solid ${tk.line}` }}>
        <View style={{ fontSize: r(10.5), letterSpacing: '.18em', color: tk.brand, fontWeight: 700, marginBottom: r(4) }}>MY TRACKING</View>
        <Text style={{ fontFamily: tk.serif, fontSize: r(25), fontWeight: 800, color: tk.ink }}>我的持仓</Text>
        <View style={{ marginTop: r(14) }}>
          <SubTabs tabs={['模拟持仓', '自选']} val={sub} set={setSub} tk={tk} />
        </View>
      </View>

      {sub === '模拟持仓' ? (
        <View style={{ padding: `${r(16)} ${r(18)} ${r(30)}` }}>
          <View style={{ background: `linear-gradient(160deg, ${tk.hero}, ${tk.hero2})`, borderRadius: r(20), padding: `${r(20)} ${r(20)} ${r(18)}`, position: 'relative', overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: r(-30), right: r(-20), width: r(140), height: r(140), borderRadius: '50%', background: `radial-gradient(circle, ${tk.brand}30, transparent 70%)` }} />
            <View style={{ fontSize: r(12), color: tk.onHeroSub, letterSpacing: '.04em' }}>模拟总市值</View>
            <View style={{ fontFamily: tk.serif, fontSize: r(34), fontWeight: 800, color: tk.onHero, marginTop: r(4) }}>{yuan2(totalMv)}</View>
            <View style={{ display: 'flex', gap: r(26), marginTop: r(16) }}>
              <View>
                <View style={{ fontSize: r(11), color: tk.onHeroSub }}>累计盈亏</View>
                <View style={{ fontSize: r(17), fontWeight: 800, color: totalProfit >= 0 ? up : down, marginTop: r(3) }}>{totalProfit >= 0 ? '+' : ''}{yuan2(totalProfit).slice(1)}</View>
                <View style={{ fontSize: r(12), fontWeight: 700, color: totalProfit >= 0 ? up : down }}>{totalPct > 0 ? '+' : ''}{totalPct.toFixed(2)}%</View>
              </View>
              <View>
                <View style={{ fontSize: r(11), color: tk.onHeroSub }}>今日盈亏</View>
                <View style={{ fontSize: r(17), fontWeight: 800, color: dayProfit >= 0 ? up : down, marginTop: r(3) }}>{dayProfit >= 0 ? '+' : ''}{yuan2(dayProfit).slice(1)}</View>
              </View>
            </View>
          </View>
          <View style={{ fontSize: r(12), color: tk.faint, textAlign: 'center', marginTop: r(12) }}>模拟盘 · 仅供跟踪练习，非真实交易</View>
          <View style={{ display: 'flex', flexDirection: 'column', gap: r(12), marginTop: r(14) }}>
            {positions.map((p) => <PositionRow key={p.id} p={p} tk={tk} onOpen={() => { const f = fundsById[p.id]; if (f) onOpen(f) }} />)}
          </View>
        </View>
      ) : (
        <View style={{ padding: `${r(4)} ${r(18)} ${r(30)}` }}>
          {watch.length === 0 ? (
            <View style={{ textAlign: 'center', color: tk.faint, padding: `${r(60)} 0`, fontSize: r(13.5) }}>暂无自选 · 去「优选」收藏标的</View>
          ) : (
            watch.map((w) => <WatchRow key={w.id} w={w} tk={tk} fund={fundsById[w.id]} onOpen={() => { const f = fundsById[w.id]; if (f) onOpen(f) }} />)
          )}
        </View>
      )}
    </ScrollView>
  )
}

// ---------- 模拟买入 sheet ----------
export function BuySheet({ f, tk, onClose, onConfirm }: {
  f: Fund; tk: Theme; onClose: () => void; onConfirm: (f: Fund, amt: number, mode: '定投' | '单次') => void
}) {
  const [amt, setAmt] = useState(1000)
  const [mode, setMode] = useState<'定投' | '单次'>('定投')
  return (
    <View onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,20,17,.5)', zIndex: 55, display: 'flex', alignItems: 'flex-end' }}>
      <View onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: tk.card, borderRadius: `${r(24)} ${r(24)} 0 0`, padding: `${r(8)} ${r(20)} ${r(24)}`, animation: 'sheetUp .3s cubic-bezier(.4,0,.2,1)' }}>
        <View style={{ width: r(40), height: r(4), borderRadius: r(999), background: tk.line, margin: `0 auto ${r(16)}` }} />
        <View style={{ display: 'flex', alignItems: 'center', gap: r(8) }}>
          <Text style={{ fontFamily: tk.serif, fontSize: r(18), fontWeight: 800, color: tk.ink }}>模拟买入</Text>
          <Tag tk={tk}>模拟盘</Tag>
        </View>
        <View style={{ fontSize: r(13), color: tk.sub, marginTop: r(6) }}>{f.name} · {f.code}</View>

        <View style={{ display: 'flex', gap: r(4), background: tk.cardAlt, borderRadius: r(12), padding: r(4), marginTop: r(16) }}>
          {(['定投', '单次'] as const).map((m) => (
            <View key={m} onClick={() => setMode(m)} style={{ flex: 1, textAlign: 'center', borderRadius: r(9), padding: `${r(10)} 0`, fontSize: r(13.5), fontWeight: mode === m ? 700 : 500, background: mode === m ? tk.card : 'transparent', color: mode === m ? tk.ink : tk.sub, boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.06)' : 'none' }}>
              {m === '定投' ? '每月定投' : '单次买入'}
            </View>
          ))}
        </View>

        <View style={{ marginTop: r(18), textAlign: 'center' }}>
          <View style={{ fontSize: r(12), color: tk.faint }}>{mode === '定投' ? '每月扣款金额' : '买入金额'}</View>
          <View style={{ fontFamily: tk.serif, fontSize: r(38), fontWeight: 800, color: tk.ink, marginTop: r(4) }}>{yuan(amt)}</View>
        </View>
        <View style={{ display: 'flex', gap: r(8), marginTop: r(14) }}>
          {[500, 1000, 2000, 5000].map((v) => (
            <View key={v} onClick={() => setAmt(v)} style={{ flex: 1, textAlign: 'center', border: `1px solid ${amt === v ? tk.ink : tk.line}`, background: amt === v ? tk.ink : 'transparent', color: amt === v ? tk.card : tk.sub, borderRadius: r(10), padding: `${r(9)} 0`, fontSize: r(13), fontWeight: 600 }}>{v}</View>
          ))}
        </View>

        <View onClick={() => onConfirm(f, amt, mode)} style={{ width: '100%', background: tk.ink, color: tk.card, borderRadius: r(14), padding: `${r(15)} 0`, fontSize: r(15), fontWeight: 700, marginTop: r(20), textAlign: 'center' }}>
          确认{mode === '定投' ? '开启定投' : '买入'}（模拟）
        </View>
      </View>
    </View>
  )
}
