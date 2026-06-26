import Taro from '@tarojs/taro'
import type {
  AnalyzeResult, AnalyzeSamples, Brief, Fund, FundsPage, Message, Source, Tracking
} from './types'

// Backend base URL. Override at build time with TARO_APP_API, else default to
// the local FastAPI dev server. Mini Program requires this host in the
// "request 合法域名" whitelist (see chat's real-architecture note).
const BASE = process.env.TARO_APP_API || 'http://localhost:8000'

class ApiError extends Error {
  constructor(public status: number, public source: string, message: string) {
    super(message)
  }
}

async function req<T>(path: string, method: 'GET' | 'POST' = 'GET', data?: unknown): Promise<T> {
  const res = await Taro.request({
    url: `${BASE}/api${path}`,
    method,
    data: data as Taro.request.Option['data'],
    header: { 'content-type': 'application/json' }
  })
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res.data as T
  }
  // Surface real backend errors (in prod, a dead data source returns 502 with
  // {error, source, detail} — we never fake data, so propagate it).
  const body = (res.data || {}) as { detail?: string; source?: string }
  throw new ApiError(res.statusCode, body.source || 'api', body.detail || `请求失败 (${res.statusCode})`)
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
