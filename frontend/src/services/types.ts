// Shared API types — mirror backend/app/schemas.py.

export type Tone = '利好' | '利空' | '中性'

export interface AiPoint { t: string; tone: 'up' | 'down' | 'flat' }
export interface Sector { name: string; heat: number; chg: number; tags: string[]; note: string }
export interface FeedItem {
  id: string; cat: string; accent: 'brand' | 'up' | 'flat'
  time: string; source: string; ai: boolean
  title: string; summary: string; detail: string
}
export interface Brief {
  date: string; summary: string; points: AiPoint[]
  sectors: Sector[]; feed: FeedItem[]; cats: string[]
}

export interface Fund {
  id: string; code: string; name: string; theme: string; type: string; risk: string
  y1: number; sip: boolean; star: number; nav: number; navChg: number
  scale: string; mgr: string; reason: string; series: number[]
}
export interface PortfolioItem { name: string; w: number }
export interface Portfolio {
  id: string; name: string; risk: string; tag: string
  desc: string; target: string; items: PortfolioItem[]
}
export interface FundsPage { themes: string[]; funds: Fund[]; portfolios: Portfolio[] }

export interface WatchItem { id: string; name: string; code: string; nav: number; chg: number }
export interface Position {
  id: string; name: string; code: string; cost: number; nav: number
  shares: number; sip: boolean; sipAmt: number
}
export interface Tracking { watch: WatchItem[]; positions: Position[] }

export interface Message {
  id: string; type: string; icon: string; title: string; desc: string; time: string; unread: boolean
}

export interface ConceptHit { concept: string; score: number }
export interface MatchedFund { fund: Fund; relevance: number }
export interface AnalyzeResult {
  summary: string; tone: Tone; nature: string
  concepts: ConceptHit[]; matches: MatchedFund[]; risk: string[]
  engine: 'rule' | 'llm'
}
export interface ClueItem {
  id: string; date: string; text: string
  concepts: string[]; fundIds: string[]; tone: Tone; since: number
}
export interface AnalyzeSamples { samples: string[]; history: ClueItem[] }

export interface Source { tag: string; name: string; desc: string; free: boolean }
