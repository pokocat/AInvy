import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import type { Theme } from '../theme'
import type { Brief, FeedItem } from '../services/types'
import { r } from '../utils/size'
import Icon from '../components/Icon'
import { Chip, Tag, Change, SectionTitle, HeatBar, Expand } from '../components/atoms'

// 简报 (daily briefing) — port of screens-home.jsx.

function FeedCard({ item, tk, compact, accentColor }: {
  item: FeedItem; tk: Theme; compact: boolean; accentColor: string
}) {
  const [open, setOpen] = useState(false)
  const hasAI = !!item.ai
  return (
    <View style={{ background: tk.card, borderRadius: r(16), border: `1px solid ${tk.line}`, overflow: 'hidden' }}>
      <View
        onClick={() => hasAI && setOpen((o) => !o)}
        style={{ padding: compact ? `${r(13)} ${r(15)}` : `${r(15)} ${r(16)}`, display: 'flex', gap: r(12) }}
      >
        <View style={{ width: r(3), alignSelf: 'stretch', borderRadius: r(999), background: accentColor, flexShrink: 0 }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: r(8), marginBottom: r(7) }}>
            <Tag tk={tk} color={accentColor}>{item.cat}</Tag>
            <Text style={{ fontSize: r(11.5), color: tk.faint, fontFamily: tk.sans }}>{item.source} · {item.time}</Text>
          </View>
          <View style={{ fontFamily: tk.serif, fontSize: r(compact ? 16 : 17), fontWeight: 700, color: tk.ink, lineHeight: 1.4, letterSpacing: '.01em' }}>
            {item.title}
          </View>
          {!compact && (
            <View style={{ fontSize: r(13.5), color: tk.sub, lineHeight: 1.65, marginTop: r(7) }}>{item.summary}</View>
          )}
          {hasAI && (
            <Expand open={open}>
              <View style={{ marginTop: r(12), paddingTop: r(12), borderTop: `1px dashed ${tk.line}` }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: r(6), marginBottom: r(7) }}>
                  <Icon name="sparkle" size={14} color={tk.brand} fill />
                  <Text style={{ fontSize: r(11.5), fontWeight: 700, color: tk.brand, letterSpacing: '.06em' }}>AI 解读 · 对你的影响</Text>
                </View>
                <View style={{ fontSize: r(13.5), color: tk.sub, lineHeight: 1.7 }}>{item.detail}</View>
              </View>
            </Expand>
          )}
          {hasAI && (
            <View style={{ display: 'flex', alignItems: 'center', gap: r(5), marginTop: r(11) }}>
              <Text style={{ fontSize: r(12), fontWeight: 600, color: tk.brand }}>{open ? '收起' : 'AI解读'}</Text>
              <View style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-flex' }}>
                <Icon name="chevron" size={14} color={tk.brand} />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default function HomeScreen({ tk, brief, feedStyle, onInfo }: {
  tk: Theme; brief: Brief; feedStyle: 'detailed' | 'compact'; onInfo: () => void
}) {
  const [cat, setCat] = useState('全部')
  const accent = (a: string) => (a === 'up' ? tk.up : a === 'brand' ? tk.brand : tk.sub)
  const feed = cat === '全部' ? brief.feed : brief.feed.filter((f) => f.cat === cat)
  const compact = feedStyle === 'compact'

  return (
    <ScrollView scrollY style={{ flex: 1, background: tk.bg }}>
      {/* HERO */}
      <View style={{ background: `linear-gradient(165deg, ${tk.hero} 0%, ${tk.hero2} 100%)`, padding: `${r(6)} ${r(18)} ${r(26)}`, position: 'relative' }}>
        <View style={{ position: 'absolute', top: r(-40), right: r(-30), width: r(180), height: r(180), borderRadius: '50%', background: `radial-gradient(circle, ${tk.brand}33, transparent 70%)` }} />
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: r(9) }}>
            <View style={{ width: r(30), height: r(30), borderRadius: r(9), background: tk.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tk.serif, fontWeight: 800, fontSize: r(16), color: tk.hero }}>投</View>
            <View style={{ display: 'flex', flexDirection: 'column' }}>
              <Text style={{ color: tk.onHero, fontFamily: tk.serif, fontWeight: 700, fontSize: r(16), letterSpacing: '.04em', lineHeight: r(18) }}>投小AI</Text>
              <Text style={{ color: tk.brand, fontSize: r(9), fontWeight: 700, letterSpacing: '.22em' }}>AINVY</Text>
            </View>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: r(8) }}>
            <View onClick={onInfo} style={{ display: 'flex', alignItems: 'center', gap: r(5), background: tk.heroChip, padding: `${r(5)} ${r(11)}`, borderRadius: r(999) }}>
              <Icon name="bolt" size={13} color={tk.brand} fill />
              <Text style={{ color: tk.onHeroSub, fontSize: r(11.5), fontWeight: 600 }}>数据·方案</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: r(6), background: tk.heroChip, padding: `${r(5)} ${r(11)}`, borderRadius: r(999) }}>
              <View style={{ width: r(6), height: r(6), borderRadius: r(999), background: tk.down }} />
              <Text style={{ color: tk.onHeroSub, fontSize: r(11.5), fontWeight: 600 }}>已同步</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: r(22), position: 'relative' }}>
          <Text style={{ color: tk.onHeroSub, fontSize: r(12.5), letterSpacing: '.04em' }}>{brief.date} · 早安</Text>
          <View style={{ fontFamily: tk.serif, fontSize: r(30), fontWeight: 800, color: tk.onHero, marginTop: r(6), letterSpacing: '.02em', lineHeight: 1.2 }}>今日市场简报</View>
          <View style={{ width: r(38), height: r(3), background: tk.brand, borderRadius: r(999), marginTop: r(12) }} />
        </View>

        {/* AI summary */}
        <View style={{ marginTop: r(20), background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.10)', borderRadius: r(18), padding: `${r(16)} ${r(16)} ${r(14)}`, position: 'relative' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: r(7), marginBottom: r(10) }}>
            <Icon name="sparkle" size={16} color={tk.brand} fill />
            <Text style={{ color: tk.brand, fontSize: r(12), fontWeight: 700, letterSpacing: '.08em', whiteSpace: 'nowrap' }}>AI 一段话总结</Text>
          </View>
          <View style={{ color: tk.onHero, fontSize: r(14), lineHeight: 1.85, opacity: 0.95 }}>{brief.summary}</View>
        </View>

        {/* points */}
        <View style={{ marginTop: r(13), display: 'flex', flexDirection: 'column', gap: r(1) }}>
          {brief.points.map((p, i) => (
            <View key={i} style={{ display: 'flex', alignItems: 'center', gap: r(10), padding: `${r(9)} ${r(2)}` }}>
              <View style={{ width: r(5), height: r(5), borderRadius: r(999), background: p.tone === 'up' ? tk.up : p.tone === 'down' ? tk.down : tk.brand, flexShrink: 0 }} />
              <Text style={{ color: tk.onHero, fontSize: r(13.5), opacity: 0.92, flex: 1 }}>{p.t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* SECTORS */}
      <View style={{ padding: `0 ${r(18)}`, marginTop: r(26) }}>
        <SectionTitle tk={tk} kicker="HOT SECTORS" title="板块热度榜" icon="flame"
          right={<Text style={{ fontSize: r(11.5), color: tk.faint, fontFamily: tk.sans }}>实时 · 09:30</Text>} />
        <View style={{ background: tk.card, borderRadius: r(18), border: `1px solid ${tk.line}`, padding: `${r(6)} ${r(4)}`, marginTop: r(12) }}>
          {brief.sectors.map((s, i) => (
            <View key={s.name} style={{ display: 'flex', alignItems: 'center', gap: r(12), padding: `${r(11)} ${r(14)}`, borderBottom: i < brief.sectors.length - 1 ? `1px solid ${tk.lineSoft}` : 'none' }}>
              <Text style={{ width: r(20), textAlign: 'center', fontFamily: tk.serif, fontSize: r(16), fontWeight: 700, color: i < 3 ? tk.brand : tk.faint }}>{i + 1}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: r(7) }}>
                  <Text style={{ fontSize: r(14.5), fontWeight: 700, color: tk.ink }}>{s.name}</Text>
                  {s.tags.slice(0, 1).map((t) => <Tag key={t} tk={tk}>{t}</Tag>)}
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: r(8), marginTop: r(6) }}>
                  <HeatBar v={s.heat} tk={tk} />
                </View>
              </View>
              <View style={{ width: r(62), textAlign: 'right' }}>
                <Change v={s.chg} tk={tk} size={14} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* FEED */}
      <View style={{ padding: `0 ${r(18)}`, marginTop: r(28) }}>
        <SectionTitle tk={tk} kicker="MARKET FEED" title="动态汇总" icon="bolt" />
        <ScrollView scrollX style={{ marginTop: r(13), whiteSpace: 'nowrap' }}>
          <View style={{ display: 'flex', gap: r(7), paddingBottom: r(2) }}>
            {brief.cats.map((c) => <Chip key={c} tk={tk} active={cat === c} soft onClick={() => setCat(c)}>{c}</Chip>)}
          </View>
        </ScrollView>
        <View style={{ display: 'flex', flexDirection: 'column', gap: r(11), marginTop: r(14), paddingBottom: r(28) }}>
          {feed.map((it) => <FeedCard key={it.id} item={it} tk={tk} compact={compact} accentColor={accent(it.accent)} />)}
        </View>
      </View>
    </ScrollView>
  )
}
