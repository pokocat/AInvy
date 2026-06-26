import { View, Text, ScrollView, Slider as TaroSlider } from '@tarojs/components'
import { useState } from 'react'
import type { Theme } from '../theme'
import type { Fund, FundsPage, Portfolio } from '../services/types'
import { r } from '../utils/size'
import { yuan } from '../utils/format'
import Icon from '../components/Icon'
import Sparkline from '../components/Sparkline'
import { Chip, Tag, RiskDot, StarRow, SectionTitle } from '../components/atoms'

// 优选 (funds + portfolios), fund detail, 定投计算器 — port of screens-funds.jsx.

function PortfolioCard({ p, tk }: { p: Portfolio; tk: Theme }) {
  const rc = p.risk === '低' ? tk.down : p.risk === '中' ? tk.brand : tk.up
  const cols = [tk.brand, tk.hero, tk.down, tk.up, tk.sub]
  return (
    <View style={{ width: r(250), background: tk.card, borderRadius: r(18), border: `1px solid ${tk.line}`, padding: r(16), flexShrink: 0 }}>
      <View style={{ display: 'flex', alignItems: 'center', gap: r(8) }}>
        <Text style={{ fontFamily: tk.serif, fontSize: r(17), fontWeight: 800, color: tk.ink }}>{p.name}</Text>
        <Tag tk={tk} color={rc}>{p.risk}风险</Tag>
      </View>
      <View style={{ fontSize: r(12.5), color: tk.sub, lineHeight: 1.6, marginTop: r(8), minHeight: r(40) }}>{p.desc}</View>
      <View style={{ display: 'flex', height: r(8), borderRadius: r(999), overflow: 'hidden', marginTop: r(12), gap: r(2) }}>
        {p.items.map((it, i) => <View key={i} style={{ width: it.w + '%', background: cols[i % cols.length] }} />)}
      </View>
      <View style={{ marginTop: r(11), display: 'flex', flexDirection: 'column', gap: r(6) }}>
        {p.items.map((it, i) => (
          <View key={i} style={{ display: 'flex', alignItems: 'center', gap: r(7), fontSize: r(12) }}>
            <View style={{ width: r(7), height: r(7), borderRadius: r(2), background: cols[i % cols.length] }} />
            <Text style={{ flex: 1, color: tk.sub }}>{it.name}</Text>
            <Text style={{ fontWeight: 700, color: tk.ink }}>{it.w}%</Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: r(12), paddingTop: r(11), borderTop: `1px solid ${tk.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: r(12), color: tk.faint }}>{p.target}</Text>
        <View style={{ display: 'inline-flex', alignItems: 'center', gap: r(3) }}>
          <Text style={{ fontSize: r(12), fontWeight: 700, color: tk.brand }}>定投此组合</Text>
          <Icon name="arrow" size={13} color={tk.brand} />
        </View>
      </View>
    </View>
  )
}

function FundRow({ f, tk, onOpen, watched, onWatch }: {
  f: Fund; tk: Theme; onOpen: () => void; watched: boolean; onWatch: () => void
}) {
  return (
    <View onClick={onOpen} style={{ background: tk.card, borderRadius: r(16), border: `1px solid ${tk.line}`, padding: `${r(14)} ${r(15)}` }}>
      <View style={{ display: 'flex', alignItems: 'flex-start', gap: r(12) }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: r(15), fontWeight: 700, color: tk.ink }}>{f.name}</Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: r(8), marginTop: r(6) }}>
            <Text style={{ fontSize: r(11.5), color: tk.faint, fontFamily: tk.sans }}>{f.code}</Text>
            <Text style={{ fontSize: r(11.5), color: tk.faint }}>{f.type}</Text>
            <RiskDot risk={f.risk} tk={tk} />
          </View>
        </View>
        <View onClick={(e) => { e.stopPropagation(); onWatch() }} style={{ padding: r(2) }}>
          <Icon name="bookmark" size={20} color={watched ? tk.brand : tk.faint} fill={watched} />
        </View>
      </View>
      <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: r(12) }}>
        <View>
          <View style={{ fontSize: r(10.5), color: tk.faint, letterSpacing: '.04em' }}>近1年</View>
          <View style={{ fontFamily: tk.serif, fontSize: r(24), fontWeight: 800, color: f.y1 >= 0 ? tk.up : tk.down, lineHeight: 1.1 }}>
            {f.y1 > 0 ? '+' : ''}{f.y1.toFixed(1)}<Text style={{ fontSize: r(14) }}>%</Text>
          </View>
        </View>
        <View style={{ flex: 1, maxWidth: r(130), margin: `0 ${r(14)}` }}>
          <Sparkline data={f.series} color={f.y1 >= 0 ? tk.up : tk.down} w={130} h={42} fillTop strokeW={2} />
        </View>
        <View style={{ textAlign: 'right' }}>
          {f.sip ? (
            <View style={{ display: 'inline-flex', alignItems: 'center', gap: r(4), fontSize: r(11.5), fontWeight: 700, color: tk.down, background: tk.down + '18', padding: `${r(4)} ${r(9)}`, borderRadius: r(7) }}>
              <Icon name="check" size={12} color={tk.down} /><Text>适合定投</Text>
            </View>
          ) : (
            <Text style={{ fontSize: r(11.5), fontWeight: 600, color: tk.faint, background: tk.cardAlt, padding: `${r(4)} ${r(9)}`, borderRadius: r(7) }}>波动较大</Text>
          )}
          <View style={{ marginTop: r(7), display: 'flex', justifyContent: 'flex-end' }}><StarRow v={f.star} tk={tk} /></View>
        </View>
      </View>
      <View style={{ fontSize: r(12.5), color: tk.sub, lineHeight: 1.6, marginTop: r(12), paddingTop: r(11), borderTop: `1px solid ${tk.lineSoft}` }}>
        <Text style={{ color: tk.brand, fontWeight: 700 }}>荐 </Text>{f.reason}
      </View>
    </View>
  )
}

export default function FundsScreen({ tk, page, watch, onOpen, toggleWatch }: {
  tk: Theme; page: FundsPage; watch: string[]; onOpen: (f: Fund) => void; toggleWatch: (id: string) => void
}) {
  const [theme, setTheme] = useState('全部')
  const list = theme === '全部' ? page.funds : page.funds.filter((f) => f.theme === theme)
  return (
    <ScrollView scrollY style={{ flex: 1, background: tk.bg }}>
      <View style={{ background: tk.card, padding: `${r(16)} ${r(18)} ${r(18)}`, borderBottom: `1px solid ${tk.line}` }}>
        <View style={{ fontSize: r(10.5), letterSpacing: '.18em', color: tk.brand, fontWeight: 700, marginBottom: r(4) }}>SELECTED FUNDS</View>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: tk.serif, fontSize: r(25), fontWeight: 800, color: tk.ink }}>优选标的</Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: r(6) }}>
            <Icon name="search" size={17} color={tk.sub} />
            <Text style={{ color: tk.sub, fontSize: r(12.5) }}>搜索</Text>
          </View>
        </View>
        <View style={{ fontSize: r(12.5), color: tk.sub, marginTop: r(6) }}>懒人定投 · AI 按主题与风险为你筛选，附推荐理由</View>
      </View>

      {/* portfolios */}
      <View style={{ marginTop: r(20), paddingLeft: r(18) }}>
        <View style={{ paddingRight: r(18) }}>
          <SectionTitle tk={tk} kicker="PORTFOLIOS" title="组合推荐" icon="sparkle"
            right={<Text style={{ fontSize: r(11.5), color: tk.faint, fontFamily: tk.sans, paddingBottom: r(3) }}>高 · 中 · 低风险</Text>} />
        </View>
        <ScrollView scrollX style={{ marginTop: r(13), whiteSpace: 'nowrap' }}>
          <View style={{ display: 'flex', gap: r(12), paddingRight: r(18), paddingBottom: r(4) }}>
            {page.portfolios.map((p) => <PortfolioCard key={p.id} p={p} tk={tk} />)}
          </View>
        </ScrollView>
      </View>

      {/* themes + list */}
      <View style={{ padding: `0 ${r(18)}`, marginTop: r(26) }}>
        <SectionTitle tk={tk} kicker="BY THEME" title="按主题精选" icon="star" />
        <ScrollView scrollX style={{ marginTop: r(13), whiteSpace: 'nowrap' }}>
          <View style={{ display: 'flex', gap: r(7), paddingBottom: r(2) }}>
            {page.themes.map((c) => <Chip key={c} tk={tk} active={theme === c} soft onClick={() => setTheme(c)}>{c}</Chip>)}
          </View>
        </ScrollView>
        <View style={{ display: 'flex', flexDirection: 'column', gap: r(12), marginTop: r(14), paddingBottom: r(30) }}>
          {list.map((f) => <FundRow key={f.id} f={f} tk={tk} onOpen={() => onOpen(f)} watched={watch.includes(f.id)} onWatch={() => toggleWatch(f.id)} />)}
        </View>
      </View>
    </ScrollView>
  )
}

// ---------- 定投计算器 ----------
export function SipCalc({ f, tk }: { f: Fund; tk: Theme }) {
  const [amt, setAmt] = useState(1000)
  const [years, setYears] = useState(5)
  const rate = Math.min(Math.max((f.y1 / 100) * 0.55, 0.05), 0.12)
  const n = years * 12
  const i = rate / 12
  const fv = amt * ((Math.pow(1 + i, n) - 1) / i)
  const invested = amt * n
  const gain = fv - invested
  return (
    <View style={{ background: tk.card, borderRadius: r(18), border: `1px solid ${tk.line}`, padding: r(17), marginTop: r(16) }}>
      <View style={{ display: 'flex', alignItems: 'center', gap: r(7), marginBottom: r(4) }}>
        <Icon name="calc" size={18} color={tk.ink} stroke={2} />
        <Text style={{ fontFamily: tk.serif, fontSize: r(17), fontWeight: 800, color: tk.ink }}>定投计算器</Text>
      </View>
      <View style={{ fontSize: r(11.5), color: tk.faint, marginBottom: r(14) }}>按年化 {(rate * 100).toFixed(1)}% 保守估算（非收益承诺）</View>

      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={{ fontSize: r(13), color: tk.sub }}>每月定投</Text>
        <Text style={{ fontFamily: tk.serif, fontSize: r(18), fontWeight: 800, color: tk.ink }}>{yuan(amt)}</Text>
      </View>
      <Slider tk={tk} min={100} max={5000} step={100} value={amt} onChange={setAmt} />

      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: r(12) }}>
        <Text style={{ fontSize: r(13), color: tk.sub }}>定投年限</Text>
        <Text style={{ fontFamily: tk.serif, fontSize: r(18), fontWeight: 800, color: tk.ink }}>{years} 年</Text>
      </View>
      <Slider tk={tk} min={1} max={20} step={1} value={years} onChange={setYears} />

      <View style={{ display: 'flex', gap: r(10), marginTop: r(16) }}>
        <View style={{ flex: 1, background: tk.cardAlt, borderRadius: r(12), padding: `${r(12)} ${r(13)}` }}>
          <View style={{ fontSize: r(11), color: tk.faint }}>累计投入</View>
          <View style={{ fontFamily: tk.serif, fontSize: r(18), fontWeight: 800, color: tk.ink, marginTop: r(3) }}>{yuan(invested)}</View>
        </View>
        <View style={{ flex: 1.2, background: `linear-gradient(150deg, ${tk.hero}, ${tk.hero2})`, borderRadius: r(12), padding: `${r(12)} ${r(13)}` }}>
          <View style={{ fontSize: r(11), color: tk.onHeroSub }}>预估总值</View>
          <View style={{ fontFamily: tk.serif, fontSize: r(19), fontWeight: 800, color: tk.onHero, marginTop: r(3) }}>{yuan(fv)}</View>
          <View style={{ fontSize: r(11.5), color: tk.brand, fontWeight: 700, marginTop: r(2) }}>预估收益 {yuan(gain)}</View>
        </View>
      </View>
    </View>
  )
}

// Cross-platform slider via the native @tarojs Slider component.
function Slider({ tk, min, max, step, value, onChange }: {
  tk: Theme; min: number; max: number; step: number; value: number; onChange: (v: number) => void
}) {
  return (
    <View style={{ marginTop: r(6) }}>
      <TaroSlider
        min={min}
        max={max}
        step={step}
        value={value}
        activeColor={tk.brand}
        backgroundColor={tk.line}
        blockColor="#fff"
        blockSize={20}
        onChanging={(e) => onChange(Number(e.detail.value))}
        onChange={(e) => onChange(Number(e.detail.value))}
      />
    </View>
  )
}

// ---------- fund detail ----------
export function FundDetail({ f, tk, onBack, watched, onWatch, onBuy }: {
  f: Fund; tk: Theme; onBack: () => void; watched: boolean; onWatch: () => void; onBuy: () => void
}) {
  const stats = [
    { k: '近1年', v: (f.y1 > 0 ? '+' : '') + f.y1.toFixed(1) + '%', c: f.y1 >= 0 ? tk.up : tk.down },
    { k: '风险等级', v: f.risk, c: tk.ink },
    { k: '基金规模', v: f.scale, c: tk.ink },
    { k: '基金经理', v: f.mgr, c: tk.ink }
  ]
  const unitNav = (f.nav / (1 + f.navChg / 100)).toFixed(4)
  return (
    <View style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: tk.bg }}>
      <ScrollView scrollY style={{ flex: 1 }}>
        {/* dark header */}
        <View style={{ background: `linear-gradient(165deg, ${tk.hero}, ${tk.hero2})`, padding: `${r(8)} ${r(18)} ${r(22)}` }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <View onClick={onBack} style={{ background: tk.heroChip, borderRadius: r(999), width: r(34), height: r(34), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="back" size={20} color={tk.onHero} />
            </View>
            <View onClick={onWatch} style={{ background: tk.heroChip, borderRadius: r(999), padding: `${r(7)} ${r(13)}`, display: 'flex', alignItems: 'center', gap: r(5) }}>
              <Icon name="bookmark" size={15} color={watched ? tk.brand : tk.onHero} fill={watched} />
              <Text style={{ color: watched ? tk.brand : tk.onHero, fontSize: r(12.5), fontWeight: 600 }}>{watched ? '已自选' : '加自选'}</Text>
            </View>
          </View>
          <View style={{ marginTop: r(16) }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: r(8) }}>
              {f.sip && <Tag tk={tk} color={tk.brand}>适合定投</Tag>}
              <Text style={{ fontSize: r(11.5), color: tk.onHeroSub }}>{f.code} · {f.type}</Text>
            </View>
            <View style={{ fontFamily: tk.serif, fontSize: r(22), fontWeight: 800, color: tk.onHero, marginTop: r(8), lineHeight: 1.3 }}>{f.name}</View>
            <View style={{ display: 'flex', alignItems: 'center', gap: r(7), marginTop: r(14) }}>
              <Text style={{ fontSize: r(11), fontWeight: 700, color: tk.hero, background: tk.brand, padding: `${r(2)} ${r(6)}`, borderRadius: r(5) }}>估</Text>
              <Text style={{ fontSize: r(11.5), color: tk.onHeroSub }}>盘中估算净值</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'flex-end', gap: r(10), marginTop: r(5) }}>
              <Text style={{ fontFamily: tk.serif, fontSize: r(34), fontWeight: 800, color: tk.onHero, lineHeight: 1 }}>{f.nav.toFixed(3)}</Text>
              <Text style={{ color: f.navChg >= 0 ? '#ff8b80' : '#7fe3bf', fontSize: r(15), fontWeight: 700, paddingBottom: r(3) }}>{f.navChg > 0 ? '+' : ''}{f.navChg.toFixed(2)}%</Text>
            </View>
            <View style={{ fontSize: r(11.5), color: tk.onHeroSub, marginTop: r(6) }}>单位净值 {unitNav}（确认） · 来源 天天基金</View>
          </View>
        </View>

        <View style={{ padding: `${r(18)} ${r(18)} 0` }}>
          {/* nav chart */}
          <View style={{ background: tk.card, borderRadius: r(18), border: `1px solid ${tk.line}`, padding: r(16) }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: r(12) }}>
              <Text style={{ fontSize: r(13), fontWeight: 700, color: tk.ink }}>净值走势</Text>
              <View style={{ display: 'flex', gap: r(6) }}>
                {['近1月', '近6月', '近1年'].map((rg, i) => (
                  <Text key={rg} style={{ fontSize: r(11.5), fontWeight: i === 2 ? 700 : 500, color: i === 2 ? tk.card : tk.sub, background: i === 2 ? tk.ink : tk.cardAlt, padding: `${r(3)} ${r(9)}`, borderRadius: r(6) }}>{rg}</Text>
                ))}
              </View>
            </View>
            <Sparkline data={f.series} color={f.y1 >= 0 ? tk.up : tk.down} w={344} h={108} fillTop strokeW={2.2} />
          </View>

          {/* stats */}
          <View style={{ display: 'flex', gap: 1, background: tk.line, borderRadius: r(14), overflow: 'hidden', marginTop: r(14) }}>
            {stats.map((s) => (
              <View key={s.k} style={{ flex: 1, background: tk.card, padding: `${r(12)} ${r(6)}`, textAlign: 'center' }}>
                <View style={{ fontFamily: tk.serif, fontSize: r(15.5), fontWeight: 800, color: s.c }}>{s.v}</View>
                <View style={{ fontSize: r(10.5), color: tk.faint, marginTop: r(3) }}>{s.k}</View>
              </View>
            ))}
          </View>

          {/* AI reason */}
          <View style={{ background: tk.brandSoft, borderRadius: r(16), padding: r(15), marginTop: r(14), border: `1px solid ${tk.brand}33` }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: r(6), marginBottom: r(8) }}>
              <Icon name="sparkle" size={15} color={tk.brandDeep} fill />
              <Text style={{ fontSize: r(12), fontWeight: 700, color: tk.brandDeep, letterSpacing: '.05em', whiteSpace: 'nowrap' }}>AI 推荐理由</Text>
            </View>
            <View style={{ fontSize: r(13.5), color: tk.ink, lineHeight: 1.75 }}>{f.reason}</View>
          </View>

          <SipCalc f={f} tk={tk} />
          <View style={{ height: r(20) }} />
        </View>
      </ScrollView>

      {/* sticky actions */}
      <View style={{ background: tk.card, borderTop: `1px solid ${tk.line}`, padding: `${r(12)} ${r(18)}`, display: 'flex', gap: r(10), flexShrink: 0 }}>
        <View onClick={onWatch} style={{ flex: 1, border: `1.5px solid ${tk.ink}`, color: tk.ink, borderRadius: r(13), padding: `${r(13)} 0`, fontSize: r(14.5), fontWeight: 700, textAlign: 'center' }}>
          {watched ? '已加自选' : '加入自选'}
        </View>
        <View onClick={onBuy} style={{ flex: 1.4, background: tk.ink, color: tk.card, borderRadius: r(13), padding: `${r(13)} 0`, fontSize: r(14.5), fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: r(6) }}>
          <Icon name="plus" size={16} color={tk.card} /><Text>模拟买入</Text>
        </View>
      </View>
    </View>
  )
}
