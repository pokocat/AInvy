import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { getTheme, ThemeKey } from '../../theme'
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

export default function Index() {
  const tk = getTheme(THEME_KEY, SERIF_TITLES)

  // --- server data ---
  const [brief, setBrief] = useState<Brief | null>(null)
  const [fundsPage, setFundsPage] = useState<FundsPage | null>(null)
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [samples, setSamples] = useState<AnalyzeSamples | null>(null)
  const [bootError, setBootError] = useState('')

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

  // Load everything on mount. A failure surfaces (no fake data).
  useEffect(() => {
    Promise.all([
      api.brief(), api.funds(), api.tracking(), api.messages(), api.sources(), api.analyzeSamples()
    ])
      .then(([b, f, tr, msg, src, smp]) => {
        setBrief(b); setFundsPage(f); setTracking(tr)
        setMessages(msg); setSources(src); setSamples(smp)
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? `${err.source}：${err.message}` : '后端连接失败，请确认 API 已启动'
        setBootError(msg)
      })
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

  // --- boot / error / loading gates ---
  if (bootError) {
    return (
      <Frame tk={tk} statusDark={false} statusBg={tk.card}>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: r(32), background: tk.bg }}>
          <Text style={{ fontFamily: tk.serif, fontSize: r(18), fontWeight: 800, color: tk.ink }}>加载失败</Text>
          <Text style={{ fontSize: r(13), color: tk.sub, marginTop: r(10), textAlign: 'center', lineHeight: 1.7 }}>{bootError}</Text>
          <Text style={{ fontSize: r(12), color: tk.faint, marginTop: r(16), textAlign: 'center', lineHeight: 1.6 }}>请确认后端已启动：{'\n'}cd backend && uvicorn app.main:app --port 8000</Text>
        </View>
      </Frame>
    )
  }

  if (!brief || !fundsPage || !tracking) {
    return (
      <Frame tk={tk} statusDark statusBg={tk.hero}>
        <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tk.hero }}>
          <Text style={{ color: tk.onHeroSub, fontSize: r(13) }}>投小AI 加载中…</Text>
        </View>
      </Frame>
    )
  }

  let screen
  if (tab === 'home') screen = <HomeScreen tk={tk} brief={brief} feedStyle={FEED_STYLE} onInfo={() => setShowSources(true)} />
  else if (tab === 'funds') screen = <FundsScreen tk={tk} page={fundsPage} watch={watchIds} onOpen={openFund} toggleWatch={toggleWatch} />
  else if (tab === 'holdings') screen = <HoldingsScreen tk={tk} positions={tracking.positions} watch={tracking.watch} fundsById={fundsById} onOpen={openFund} />
  else screen = <MessagesScreen tk={tk} messages={messages} onGoHome={() => setTab('home')} />

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
