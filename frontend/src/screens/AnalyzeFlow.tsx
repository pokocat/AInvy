import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import { useEffect, useState } from 'react'
import type { Theme } from '../theme'
import type { AnalyzeResult, AnalyzeSamples, Fund, MatchedFund, Source } from '../services/types'
import { api, ApiError } from '../services/api'
import { r } from '../utils/size'
import Icon from '../components/Icon'
import { Chip, Tag, RiskDot } from '../components/atoms'

// 投喂：主动上报内容 → AI 分析 → 推荐标的 — port of screens-analyze.jsx.
// Analysis now runs server-side (POST /api/analyze): rule engine in dev, LLM in prod.

const LOAD_STEPS = ['识别内容与来源', '抽取关键词与概念', '匹配可投标的', '研判情绪与风险', '生成投资线索']

// ---------- 数据来源 / 方案 sheet ----------
export function SourcesSheet({ tk, sources, onClose }: { tk: Theme; sources: Source[]; onClose: () => void }) {
  return (
    <View onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,20,17,.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
      <View onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxHeight: '82%', background: tk.card, borderRadius: `${r(24)} ${r(24)} 0 0`, padding: `${r(8)} ${r(20)} ${r(26)}`, animation: 'sheetUp .3s cubic-bezier(.4,0,.2,1)' }}>
        <View style={{ width: r(40), height: r(4), borderRadius: r(999), background: tk.line, margin: `0 auto ${r(16)}` }} />
        <ScrollView scrollY style={{ maxHeight: '70vh' }}>
          <View style={{ fontFamily: tk.serif, fontSize: r(20), fontWeight: 800, color: tk.ink }}>数据与实现方案</View>
          <View style={{ fontSize: r(12.5), color: tk.sub, marginTop: r(6), lineHeight: 1.6 }}>
            本应用展示的能力，均可用下列<Text style={{ color: tk.brand, fontWeight: 700 }}>免费/低成本</Text>数据源真实落地。架构：小程序 → 自建后端(云函数)定时拉取 → 云数据库 → 订阅消息推送。
          </View>
          <View style={{ display: 'flex', flexDirection: 'column', gap: r(10), marginTop: r(16) }}>
            {sources.map((s, i) => (
              <View key={i} style={{ background: tk.cardAlt, borderRadius: r(14), padding: `${r(13)} ${r(14)}`, border: `1px solid ${tk.lineSoft}` }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: r(5) }}>
                  <Tag tk={tk} color={s.free ? tk.down : tk.brand}>{s.tag}</Tag>
                  <Text style={{ fontSize: r(11), fontWeight: 600, color: s.free ? tk.down : tk.brandDeep }}>{s.free ? '免费' : '按量付费'}</Text>
                </View>
                <View style={{ fontSize: r(14), fontWeight: 700, color: tk.ink }}>{s.name}</View>
                <View style={{ fontSize: r(12.5), color: tk.sub, lineHeight: 1.6, marginTop: r(4) }}>{s.desc}</View>
              </View>
            ))}
          </View>
          <View style={{ fontSize: r(11.5), color: tk.faint, lineHeight: 1.7, marginTop: r(14), padding: `${r(12)} ${r(14)}`, background: tk.brandSoft, borderRadius: r(12) }}>
            注：免费源多为非官方接口，需后端做缓存与容错；小程序需在「request 合法域名」中配置自建后端域名，不直接调第三方。
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

// ---------- matched fund row ----------
function MatchFund({ m, tk, watched, onOpen, onWatch, onBuy }: {
  m: MatchedFund; tk: Theme; watched: boolean; onOpen: () => void; onWatch: () => void; onBuy: () => void
}) {
  const f = m.fund
  return (
    <View style={{ background: tk.card, borderRadius: r(14), border: `1px solid ${tk.line}`, padding: `${r(13)} ${r(14)}` }}>
      <View onClick={onOpen}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: r(8) }}>
          <Text style={{ fontSize: r(14), fontWeight: 700, color: tk.ink }}>{f.name}</Text>
          {f.sip ? <Tag tk={tk} color={tk.down}>适合定投</Tag> : <Tag tk={tk} color={tk.faint}>波动大</Tag>}
        </View>
        <View style={{ display: 'flex', alignItems: 'center', gap: r(8), marginTop: r(6) }}>
          <Text style={{ fontSize: r(11.5), color: tk.faint }}>{f.code} · {f.type}</Text>
          <RiskDot risk={f.risk} tk={tk} />
        </View>
        <View style={{ display: 'flex', alignItems: 'center', gap: r(8), marginTop: r(9) }}>
          <Text style={{ fontSize: r(11), color: tk.faint }}>关联度</Text>
          <View style={{ flex: 1, height: r(5), borderRadius: r(999), background: tk.line, overflow: 'hidden' }}>
            <View style={{ width: m.relevance + '%', height: '100%', background: `linear-gradient(90deg,${tk.brand},${tk.brandDeep})` }} />
          </View>
          <Text style={{ fontSize: r(12), fontWeight: 700, color: tk.brand }}>{m.relevance}%</Text>
        </View>
      </View>
      <View style={{ display: 'flex', gap: r(8), marginTop: r(12) }}>
        <View onClick={onWatch} style={{ flex: 1, border: `1.4px solid ${watched ? tk.brand : tk.line}`, background: watched ? tk.brandSoft : 'transparent', color: watched ? tk.brandDeep : tk.sub, borderRadius: r(10), padding: `${r(9)} 0`, fontSize: r(12.5), fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: r(4) }}>
          <Icon name="bookmark" size={14} color={watched ? tk.brandDeep : tk.sub} fill={watched} /><Text>{watched ? '已自选' : '加自选'}</Text>
        </View>
        <View onClick={onBuy} style={{ flex: 1, background: tk.ink, color: tk.card, borderRadius: r(10), padding: `${r(9)} 0`, fontSize: r(12.5), fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: r(4) }}>
          <Icon name="plus" size={14} color={tk.card} /><Text>模拟买入</Text>
        </View>
      </View>
    </View>
  )
}

export default function AnalyzeFlow({ tk, samples, watch, onClose, onWatch, onBuy, onOpen, onSave, onError }: {
  tk: Theme
  samples: AnalyzeSamples | null
  watch: string[]
  onClose: () => void
  onWatch: (id: string) => void
  onBuy: (f: Fund) => void
  onOpen: (f: Fund) => void
  onSave: () => void
  onError: (msg: string) => void
}) {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input')
  const [mode, setMode] = useState('文字')
  const [text, setText] = useState('')
  const [loadI, setLoadI] = useState(0)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [pending, setPending] = useState<AnalyzeResult | null>(null)
  const [saved, setSaved] = useState(false)

  const run = async (t?: string) => {
    const val = (t ?? text).trim()
    if (!val) return
    setText(val)
    setSaved(false)
    setResult(null)
    setPending(null)
    setStep('loading')
    setLoadI(0)
    try {
      const res = await api.analyze(val)
      setPending(res)
    } catch (err) {
      const msg = err instanceof ApiError ? `分析失败：${err.message}` : '分析失败，请稍后重试'
      onError(msg)
      setStep('input')
    }
  }

  // Drive the step animation; reveal result only once the API has returned too.
  useEffect(() => {
    if (step !== 'loading') return
    if (loadI >= LOAD_STEPS.length) {
      if (pending) {
        const id = setTimeout(() => { setResult(pending); setStep('result') }, 250)
        return () => clearTimeout(id)
      }
      return // wait for the API
    }
    const id = setTimeout(() => setLoadI((i) => i + 1), 360)
    return () => clearTimeout(id)
  }, [step, loadI, pending])

  const toneColor = (t: string) => (t === '利好' ? tk.up : t === '利空' ? tk.down : tk.sub)

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 45, background: tk.bg, display: 'flex', flexDirection: 'column', animation: 'sheetUp .28s cubic-bezier(.4,0,.2,1)' }}>
      {/* header */}
      <View style={{ background: `linear-gradient(160deg, ${tk.hero}, ${tk.hero2})`, padding: `${r(8)} ${r(18)} ${r(18)}`, flexShrink: 0 }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View onClick={onClose} style={{ background: tk.heroChip, borderRadius: r(999), width: r(34), height: r(34), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="back" size={20} color={tk.onHero} />
          </View>
          <Text style={{ color: tk.onHeroSub, fontSize: r(12.5), fontWeight: 600 }}>投喂 · 让 AI 拆解</Text>
          <View style={{ width: r(34) }} />
        </View>
        <View style={{ marginTop: r(12), display: 'flex', alignItems: 'center', gap: r(9) }}>
          <Icon name="sparkle" size={22} color={tk.brand} fill />
          <Text style={{ fontFamily: tk.serif, fontSize: r(24), fontWeight: 800, color: tk.onHero }}>投喂分析</Text>
        </View>
        <View style={{ color: tk.onHeroSub, fontSize: r(12.5), marginTop: r(6), lineHeight: 1.6 }}>把你看到的新闻、公众号片段、朋友消息或传闻丢进来，AI 帮你提取可投标的与风险</View>
      </View>

      <ScrollView scrollY style={{ flex: 1 }}>
        {step === 'input' && (
          <View style={{ padding: `${r(18)} ${r(18)} ${r(30)}` }}>
            <View style={{ display: 'flex', gap: r(7), marginBottom: r(14) }}>
              {['文字', '链接', '截图'].map((m) => (
                <Chip key={m} tk={tk} active={mode === m} soft onClick={() => setMode(m)}>{m === '文字' ? '✎ 文字' : m === '链接' ? '🔗 链接' : '🖼 截图'}</Chip>
              ))}
            </View>
            {mode === '截图' ? (
              <View style={{ border: `1.5px dashed ${tk.line}`, borderRadius: r(16), padding: `${r(34)} ${r(16)}`, textAlign: 'center', background: tk.card }}>
                <View style={{ display: 'flex', justifyContent: 'center' }}><Icon name="search" size={28} color={tk.faint} /></View>
                <View style={{ fontSize: r(13.5), color: tk.sub, marginTop: r(10), fontWeight: 600 }}>上传聊天/新闻截图</View>
                <View style={{ fontSize: r(11.5), color: tk.faint, marginTop: r(4) }}>后端 OCR 提取文字后分析（演示用文字输入）</View>
              </View>
            ) : (
              <Textarea
                value={text}
                onInput={(e) => setText(e.detail.value)}
                placeholder={mode === '链接' ? '粘贴公众号 / 新闻文章链接，AI 抓取正文后分析…' : '粘贴或输入你看到、听到的消息，例如：最近 HBM 很火，存储要涨价…'}
                style={{ width: '100%', minHeight: r(130), border: `1px solid ${tk.line}`, borderRadius: r(16), padding: r(15), fontSize: r(14), lineHeight: 1.7, color: tk.ink, background: tk.card, boxSizing: 'border-box' }}
              />
            )}

            <View style={{ fontSize: r(12), color: tk.faint, marginTop: r(16), marginBottom: r(8), fontWeight: 600 }}>试试这些 ↓</View>
            <View style={{ display: 'flex', flexDirection: 'column', gap: r(8) }}>
              {(samples?.samples || []).map((s, i) => (
                <View key={i} onClick={() => { setMode('文字'); setText(s) }} style={{ border: `1px solid ${tk.line}`, background: tk.card, borderRadius: r(12), padding: `${r(11)} ${r(13)}`, fontSize: r(13), color: tk.sub, lineHeight: 1.5 }}>{s}</View>
              ))}
            </View>

            {samples && samples.history.length > 0 && (
              <View>
                <View style={{ display: 'flex', alignItems: 'center', gap: r(7), marginTop: r(24), marginBottom: r(10) }}>
                  <Icon name="bookmark" size={16} color={tk.ink} fill />
                  <Text style={{ fontFamily: tk.serif, fontSize: r(17), fontWeight: 800, color: tk.ink }}>我的线索库</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'column', gap: r(10) }}>
                  {samples.history.map((h) => (
                    <View key={h.id} style={{ background: tk.card, borderRadius: r(14), border: `1px solid ${tk.line}`, padding: `${r(13)} ${r(14)}` }}>
                      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: r(11.5), color: tk.faint }}>{h.date} · {h.tone}</Text>
                        <Text style={{ fontSize: r(12), fontWeight: 700, color: h.since >= 0 ? tk.up : tk.down }}>投喂后关联标的 {h.since > 0 ? '+' : ''}{h.since}%</Text>
                      </View>
                      <View style={{ fontSize: r(13), color: tk.ink, lineHeight: 1.6, marginTop: r(6) }}>{h.text}</View>
                      <View style={{ display: 'flex', gap: r(6), marginTop: r(9) }}>
                        {h.concepts.map((c) => <Tag key={c} tk={tk}>{c}</Tag>)}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {step === 'loading' && (
          <View style={{ padding: `${r(40)} ${r(28)}` }}>
            <View style={{ display: 'flex', flexDirection: 'column', gap: r(2) }}>
              {LOAD_STEPS.map((s, i) => {
                const done = i < loadI
                const active = i === loadI
                return (
                  <View key={i} style={{ display: 'flex', alignItems: 'center', gap: r(14), padding: `${r(13)} 0`, opacity: i <= loadI ? 1 : 0.35, transition: 'opacity .3s' }}>
                    <View style={{ width: r(26), height: r(26), borderRadius: r(999), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? tk.brand : active ? tk.brandSoft : tk.line, border: active ? `2px solid ${tk.brand}` : 'none' }}>
                      {done ? <Icon name="check" size={15} color="#fff" /> : <View style={{ width: r(7), height: r(7), borderRadius: r(999), background: active ? tk.brand : tk.faint, animation: active ? 'pulse 1s infinite' : 'none' }} />}
                    </View>
                    <Text style={{ fontSize: r(14.5), fontWeight: done || active ? 700 : 500, color: done || active ? tk.ink : tk.faint }}>{s}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {step === 'result' && result && (
          <View style={{ padding: `${r(16)} ${r(18)} ${r(30)}` }}>
            <View style={{ background: tk.cardAlt, borderRadius: r(14), padding: `${r(12)} ${r(14)}`, borderLeft: `3px solid ${tk.brand}` }}>
              <View style={{ fontSize: r(11), color: tk.faint, marginBottom: r(5), fontWeight: 600 }}>你投喂的内容</View>
              <View style={{ fontSize: r(13.5), color: tk.ink, lineHeight: 1.65 }}>{text}</View>
            </View>

            <View style={{ display: 'flex', gap: r(8), marginTop: r(14) }}>
              <View style={{ flex: 1, background: tk.card, borderRadius: r(12), border: `1px solid ${tk.line}`, padding: `${r(11)} ${r(12)}` }}>
                <View style={{ fontSize: r(11), color: tk.faint }}>市场情绪</View>
                <View style={{ fontFamily: tk.serif, fontSize: r(17), fontWeight: 800, color: toneColor(result.tone), marginTop: r(3) }}>{result.tone}</View>
              </View>
              <View style={{ flex: 1, background: tk.card, borderRadius: r(12), border: `1px solid ${tk.line}`, padding: `${r(11)} ${r(12)}` }}>
                <View style={{ fontSize: r(11), color: tk.faint }}>信息性质</View>
                <View style={{ fontFamily: tk.serif, fontSize: r(17), fontWeight: 800, color: tk.ink, marginTop: r(3) }}>{result.nature}</View>
              </View>
            </View>

            <View style={{ background: tk.brandSoft, borderRadius: r(14), padding: `${r(14)} ${r(15)}`, marginTop: r(12), border: `1px solid ${tk.brand}33` }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: r(6), marginBottom: r(7) }}>
                <Icon name="sparkle" size={15} color={tk.brandDeep} fill />
                <Text style={{ fontSize: r(12), fontWeight: 700, color: tk.brandDeep, letterSpacing: '.05em' }}>AI 摘要</Text>
                <Tag tk={tk} color={result.engine === 'llm' ? tk.brand : tk.faint}>{result.engine === 'llm' ? '大模型' : '规则引擎'}</Tag>
              </View>
              <View style={{ fontSize: r(13.5), color: tk.ink, lineHeight: 1.75 }}>{result.summary}</View>
            </View>

            <View style={{ marginTop: r(16) }}>
              <View style={{ fontSize: r(12), color: tk.faint, fontWeight: 600, marginBottom: r(9) }}>提取的关键概念</View>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: r(8) }}>
                {result.concepts.map((c, i) => (
                  <Text key={i} style={{ fontSize: r(13), fontWeight: 700, color: tk.hero, background: tk.card, border: `1px solid ${tk.line}`, padding: `${r(7)} ${r(13)}`, borderRadius: r(999) }}>#{c.concept}</Text>
                ))}
              </View>
            </View>

            <View style={{ display: 'flex', alignItems: 'center', gap: r(7), marginTop: r(20), marginBottom: r(11) }}>
              <Icon name="star" size={17} color={tk.ink} fill />
              <Text style={{ fontFamily: tk.serif, fontSize: r(18), fontWeight: 800, color: tk.ink }}>可投标的</Text>
              <Text style={{ fontSize: r(11.5), color: tk.faint }}>· 据概念匹配</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'column', gap: r(10) }}>
              {result.matches.map((m) => (
                <MatchFund key={m.fund.id} m={m} tk={tk} watched={watch.includes(m.fund.id)} onOpen={() => onOpen(m.fund)} onWatch={() => onWatch(m.fund.id)} onBuy={() => onBuy(m.fund)} />
              ))}
            </View>

            <View style={{ background: tk.card, borderRadius: r(14), border: `1px solid ${tk.up}33`, padding: `${r(14)} ${r(15)}`, marginTop: r(16) }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: r(6), marginBottom: r(9) }}>
                <Text style={{ width: r(18), height: r(18), borderRadius: r(999), background: tk.up, color: '#fff', fontSize: r(12), fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</Text>
                <Text style={{ fontSize: r(12.5), fontWeight: 700, color: tk.up }}>风险提示</Text>
              </View>
              <View style={{ display: 'flex', flexDirection: 'column', gap: r(8) }}>
                {result.risk.map((rk, i) => (
                  <View key={i} style={{ display: 'flex', gap: r(8), fontSize: r(12.5), color: tk.sub, lineHeight: 1.6 }}>
                    <Text style={{ color: tk.up, flexShrink: 0 }}>·</Text>
                    <Text style={{ flex: 1 }}>{rk}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ display: 'flex', gap: r(10), marginTop: r(18) }}>
              <View onClick={() => setStep('input')} style={{ flex: 1, border: `1.5px solid ${tk.ink}`, color: tk.ink, borderRadius: r(13), padding: `${r(13)} 0`, fontSize: r(14), fontWeight: 700, textAlign: 'center' }}>再投喂一条</View>
              <View onClick={() => { setSaved(true); onSave() }} style={{ flex: 1.3, background: saved ? tk.down : tk.ink, color: tk.card, borderRadius: r(13), padding: `${r(13)} 0`, fontSize: r(14), fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: r(6) }}>
                <Icon name={saved ? 'check' : 'bookmark'} size={15} color={tk.card} fill={!saved} /><Text>{saved ? '已存入线索库' : '存入线索库'}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {step === 'input' && (
        <View style={{ flexShrink: 0, background: tk.card, borderTop: `1px solid ${tk.line}`, padding: `${r(12)} ${r(18)}` }}>
          <View onClick={() => run()} style={{ width: '100%', background: text.trim() ? tk.ink : tk.line, color: text.trim() ? tk.card : tk.faint, borderRadius: r(14), padding: `${r(15)} 0`, fontSize: r(15), fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: r(7), transition: 'all .2s' }}>
            <Icon name="sparkle" size={17} color={text.trim() ? tk.card : tk.faint} fill /><Text>开始分析</Text>
          </View>
        </View>
      )}
    </View>
  )
}
