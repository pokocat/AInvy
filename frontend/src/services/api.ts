import Taro from '@tarojs/taro'
import type {
  AnalyzeResult, AnalyzeSamples, Brief, Fund, FundsPage, Message, Source, Tracking
} from './types'

// On WeChat MP we hit the backend through 微信云托管's `callContainer` instead of
// `Taro.request`. That tunnels over the WeChat channel, so the 云托管 domain does
// NOT need to be on the "request 合法域名" whitelist. H5 (browser) has no
// wx.cloud, so it keeps using plain HTTP. The `process.env.TARO_ENV === 'weapp'`
// check is inlined at the `if` below (not via a const) so webpack's ConstPlugin
// drops the dead branch at parse time, even in non-minified builds.
const CLOUD_ENV = 'prod-d7gxgn6330d08c0d0'   // 云托管环境 ID
const CLOUD_SERVICE = 'flask-n3c0'           // 云托管服务名 (X-WX-SERVICE)

// Minimal typing for wx.cloud.callContainer (not in Taro's typings).
interface WxCloud {
  init?: (opts?: { env?: string }) => void
  callContainer: (opts: {
    config: { env: string }
    path: string
    method?: string
    header?: Record<string, string>
    data?: unknown
  }) => Promise<{ statusCode: number; data: unknown }>
}

let cloudReady = false
function getCloud(): WxCloud {
  const cloud = (Taro as unknown as { cloud: WxCloud }).cloud
  if (!cloudReady) {
    // callContainer carries its own config.env, so init isn't strictly required;
    // call it once defensively and swallow "already inited / not required" errors.
    try { cloud.init?.({ env: CLOUD_ENV }) } catch { /* noop */ }
    cloudReady = true
  }
  return cloud
}

class ApiError extends Error {
  constructor(public status: number, public source: string, message: string) {
    super(message)
  }
}

type Resp = Promise<{ statusCode: number; data: unknown }>

// Transport selection. Kept NON-async (just returns the promise) on purpose: an
// async function gets compiled to a regenerator state machine, after which
// webpack can no longer drop the `process.env.TARO_ENV` dead branch — so the
// other platform's base URL / SDK call would leak into the bundle. As a plain
// sync `if`, ConstPlugin folds it and strips the unused branch entirely.
function transport(fullPath: string, method: 'GET' | 'POST', data?: unknown): Resp {
  if (process.env.TARO_ENV === 'weapp') {
    return getCloud().callContainer({
      config: { env: CLOUD_ENV },
      path: fullPath,
      method,
      header: { 'content-type': 'application/json', 'X-WX-SERVICE': CLOUD_SERVICE },
      data
    })
  }
  // H5 base URL. Override at build time with TARO_APP_API; `??` (not `||`) so an
  // explicit empty string keeps same-origin `/api/...` (how Vercel's bundled
  // FastAPI fn is reached).
  const base = process.env.TARO_APP_API ?? 'http://localhost:8000'
  return Taro.request({
    url: `${base}${fullPath}`,
    method,
    data: data as Taro.request.Option['data'],
    header: { 'content-type': 'application/json' }
  }) as unknown as Resp
}

async function req<T>(path: string, method: 'GET' | 'POST' = 'GET', data?: unknown): Promise<T> {
  const { statusCode, data: body } = await transport(`/api${path}`, method, data)
  if (statusCode >= 200 && statusCode < 300) {
    return body as T
  }
  // Surface real backend errors (in prod, a dead data source returns 502 with
  // {error, source, detail} — we never fake data, so propagate it).
  const err = (body || {}) as { detail?: string; source?: string }
  throw new ApiError(statusCode, err.source || 'api', err.detail || `请求失败 (${statusCode})`)
}

export const api = {
  brief: () => req<Brief>('/brief'),
  funds: () => req<FundsPage>('/funds'),
  fund: (id: string) => req<Fund>(`/funds/${id}`),
  tracking: () => req<Tracking>('/tracking'),
  toggleWatch: (fundId: string) => req<Tracking>('/tracking/watch', 'POST', { fund_id: fundId }),
  buy: (fundId: string, amount: number, mode: '定投' | '单次') =>
    req<Tracking>('/tracking/buy', 'POST', { fund_id: fundId, amount, mode }),
  messages: () => req<Message[]>('/messages'),
  sources: () => req<Source[]>('/sources'),
  analyze: (text: string) => req<AnalyzeResult>('/analyze', 'POST', { text }),
  analyzeSamples: () => req<AnalyzeSamples>('/analyze/samples')
}

export { ApiError }
