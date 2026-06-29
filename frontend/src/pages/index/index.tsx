import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { getTheme, ThemeKey, Theme } from '../../theme'
import { api, ApiError } from '../../services/api'
import type {
  AnalyzeSamples, Brief, Fund, FundsPage, Message, Source, Tracking
} from '../../services/types'
import { r } from '../../utils/size'
import Frame from '../../components/Frame'
import TabBar, { TabKey } from '../../components/TabBar'
import Toast from '../../components/Toast'
import HomeScreen from '../../screens/HomeScreen'
import FundsScreen, { FundDetail } from '../../screens/FundsScreen'
import HoldingsScreen, { BuySheet } from '../../screens/HoldingsScreen'
import MessagesScreen from '../../screens/MessagesScreen'
import AnalyzeFlow, { SourcesSheet } from '../../screens/AnalyzeFlow'

// 投小AI v2 — single stateful page mirroring app-v2.jsx, wired to the FastAPI backend.
// Theme defaults match the prototype's 墨绿金 / 详尽 / 衬线 look.
const THEME_KEY: ThemeKey = 'ink_green'
const FEED_STYLE: 'detailed' | 'compact' = 'detailed'
const SERIF_TITLES = true

type LoadKey = 'brief' | 'funds' | 'tracking' | 'messages' | 'sources' | 'samples'

// In-shell placeholder: keeps the frame + nav visible while a section's data is
// loading or after it failed, instead of blocking the whole app behind one gate.
function ScreenState({ tk, error, onRetry }: { tk: Theme; error?: string; onRetry: () => void }) {
  return (
    <View style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: r(32), background: tk.bg }}>
      {error ? (
        <>
          <Text style={{ fontFamily: tk.serif, fontSize: r(16), fontWeight: 800, color: tk.ink }}>加载失败</Text>
          <Text style={{ fontSize: r(13), color: tk.sub, marginTop: r(8), textAlign: 'center', lineHeight: 1.6 }}>{error}</Text>
          <View onClick={onRetry} style={{ marginTop: r(18), padding: `${r(9)} ${r(22)}`, borderRadius: r(999), background: tk.brand }}>
            <Text style={{ fontSize: r(13), fontWeight: 700, color: tk.hero }}>重试</Text>
          </View>
        </>
      ) : (
        <Text style={{ color: tk.sub, fontSize: r(13) }}>加载中…</Text>
      )}
    </View>
  )
}

export default function Index() {
  const tk = getTheme(THEME_KEY, SERIF_TITLES)

  // --- server data ---
  const [brief, setBrief] = useState<Brief | null>(null)
  const [fundsPage, setFundsPage] = useState<FundsPage | null>(null)
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [samples, setSamples] = useState<AnalyzeSamples | null>(null)
  // Per-section load errors (keyed). Sections load independently, so one failure
  // marks only its own error and never blocks the shell or the other sections.
  const [errs, setErrs] = useState<Record<string, string>>({})

  // --- ui state ---
  const [tab, setTab] = useState<TabKey>('home')
  const [detail, setDetail] = useState<Fund | null>(null)
  const [buyFund, setBuyFund] = useState<Fund | null>(null)
  const [showAnalyze, setShowAnalyze] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [toast, setToast] = useState('')
  const [toastErr, setToastErr] = useState(false)

  let toastTimer: ReturnType<typeof setTimeout>
  const flash = (m: string, err = false) => {
    setToast(m)
    setToastErr(err)
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => setToast(''), 2000)
  }

  // Load each section independently. A failure marks only that section's error
  // (shown inline with a retry) — it never blocks the shell or other sections.
  const load = (key: LoadKey) => {
    setErrs((e) => { const n = { ...e }; delete n[key]; return n })
    const fail = (err: unknown) =>
      setErrs((e) => ({ ...e, [key]: err instanceof ApiError ? `${err.source}：${err.message}` : '后端连接失败' }))
    if (key === 'brief') api.brief().then(setBrief).catch(fail)
    else if (key === 'funds') api.funds().then(setFundsPage).catch(fail)
    else if (key === 'tracking') api.tracking().then(setTracking).catch(fail)
    else if (key === 'messages') api.messages().then(setMessages).catch(fail)
    else if (key === 'sources') api.sources().then(setSources).catch(fail)
    else api.analyzeSamples().then(setSamples).catch(fail)
  }

  useEffect(() => {
    const keys: LoadKey[] = ['brief', 'funds', 'tracking', 'messages', 'sources', 'samples']
    keys.forEach(load)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const watchIds = tracking ? tracking.watch.map((w) => w.id) : []
  const fundsById: Record<string, Fund> = {}
  if (fundsPage) for (const f of fundsPage.funds) fundsById[f.id] = f

  const toggleWatch = async (id: string) => {
    try {
      const res = await api.toggleWatch(id)
      setTracking(res)
      flash(res.watch.some((w) => w.id === id) ? '已加入自选' : '已移出自选')
    } catch (err) {
      flash(err instanceof ApiError ? err.message : '操作失败', true)
    }
  }

  const confirmBuy = async (f: Fund, amt: number, mode: '定投' | '单次') => {
    try {
      const res = await api.buy(f.id, amt, mode)
      setTracking(res)
      setBuyFund(null)
      flash(mode === '定投' ? `已开启定投 ¥${amt}/月（模拟）` : `已模拟买入 ¥${amt}`)
    } catch (err) {
      flash(err instanceof ApiError ? err.message : '买入失败', true)
    }
  }

  const openFund = (f: Fund) => { setShowAnalyze(false); setDetail(f) }

  const statusDark = !!detail || showAnalyze || tab === 'home'
  const statusBg = detail || showAnalyze ? tk.hero : tab === 'home' ? tk.hero : tk.card

  // No full-screen gate: the shell (status bar + screen area + TabBar) always
  // renders. Each tab shows its data once ready, else an in-shell loading/error
  // placeholder with a retry — a broken section never hides the nav.
  let screen
  if (tab === 'home') {
    screen = brief
      ? <HomeScreen tk={tk} brief={brief} feedStyle={FEED_STYLE} onInfo={() => setShowSources(true)} />
      : <ScreenState tk={tk} error={errs.brief} onRetry={() => load('brief')} />
  } else if (tab === 'funds') {
    screen = fundsPage
      ? <FundsScreen tk={tk} page={fundsPage} watch={watchIds} onOpen={openFund} toggleWatch={toggleWatch} />
      : <ScreenState tk={tk} error={errs.funds} onRetry={() => load('funds')} />
  } else if (tab === 'holdings') {
    screen = tracking
      ? <HoldingsScreen tk={tk} positions={tracking.positions} watch={tracking.watch} fundsById={fundsById} onOpen={openFund} />
      : <ScreenState tk={tk} error={errs.tracking} onRetry={() => load('tracking')} />
  } else {
    screen = <MessagesScreen tk={tk} messages={messages} onGoHome={() => setTab('home')} />
  }

  return (
    <Frame tk={tk} statusDark={statusDark} statusBg={statusBg}>
      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {detail ? (
          <FundDetail
            f={detail} tk={tk} onBack={() => setDetail(null)}
            watched={watchIds.includes(detail.id)} onWatch={() => toggleWatch(detail.id)}
            onBuy={() => setBuyFund(detail)}
          />
        ) : (
          <>
            {screen}
            <TabBar tab={tab} setTab={setTab} tk={tk} onFab={() => setShowAnalyze(true)} />
          </>
        )}

        {showAnalyze && (
          <AnalyzeFlow
            tk={tk} samples={samples} watch={watchIds}
            onClose={() => setShowAnalyze(false)}
            onWatch={toggleWatch} onBuy={(f) => setBuyFund(f)} onOpen={openFund}
            onSave={() => flash('已存入线索库')}
            onError={(m) => flash(m, true)}
          />
        )}
        {showSources && <SourcesSheet tk={tk} sources={sources} onClose={() => setShowSources(false)} />}
        {buyFund && <BuySheet f={buyFund} tk={tk} onClose={() => setBuyFund(null)} onConfirm={confirmBuy} />}
        <Toast msg={toast} tk={tk} error={toastErr} />
      </View>
    </Frame>
  )
}
