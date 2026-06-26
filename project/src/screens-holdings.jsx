// screens-holdings.jsx — 持仓 (自选 + 模拟持仓) + 模拟买入 sheet
const { useState: useStateW } = React;

function SubTabs({ tabs, val, set, tk }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: tk.cardAlt, borderRadius: 12, padding: 4 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => set(t)} style={{
          flex: 1, border: 'none', cursor: 'pointer', borderRadius: 9, padding: '9px 0',
          fontFamily: tk.sans, fontSize: 13.5, fontWeight: val === t ? 700 : 500,
          background: val === t ? tk.card : 'transparent', color: val === t ? tk.ink : tk.sub,
          boxShadow: val === t ? '0 1px 4px rgba(0,0,0,.06)' : 'none', transition: 'all .18s',
        }}>{t}</button>
      ))}
    </div>
  );
}

function WatchRow({ w, tk, fund, onOpen, onRemove }) {
  return (
    <div onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 4px', borderBottom: `1px solid ${tk.lineSoft}`, cursor: 'pointer' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: tk.ink }}>{w.name}</div>
        <div style={{ fontSize: 11.5, color: tk.faint, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{w.code}</div>
      </div>
      {fund && <div style={{ width: 80, opacity: .9 }}><Sparkline data={fund.series} color={w.chg >= 0 ? tk.up : tk.down} w={80} h={30} strokeW={1.8}/></div>}
      <div style={{ textAlign: 'right', minWidth: 88 }}>
        <div style={{ fontFamily: tk.serif, fontSize: 16, fontWeight: 800, color: tk.ink, fontVariantNumeric: 'tabular-nums' }}>{w.nav.toFixed(3)}</div>
        <div style={{ marginTop: 3 }}>
          <span style={{ display: 'inline-block', minWidth: 58, textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: '#fff', borderRadius: 6, padding: '2px 0', background: w.chg >= 0 ? tk.up : tk.down, fontVariantNumeric: 'tabular-nums' }}>{w.chg > 0 ? '+' : ''}{w.chg.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

function PositionRow({ p, tk, onOpen }) {
  const mv = p.nav * p.shares;
  const costTotal = p.cost * p.shares;
  const profit = mv - costTotal;
  const profitPct = profit / costTotal * 100;
  const c = profit >= 0 ? tk.up : tk.down;
  return (
    <div onClick={onOpen} style={{ background: tk.card, borderRadius: 16, border: `1px solid ${tk.line}`, padding: '14px 15px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: tk.ink }}>{p.name}</span>
          {p.sip && <Tag tk={tk} color={tk.down}>定投中 ¥{p.sipAmt}/月</Tag>}
        </div>
        <Icon name="chevron" size={16} color={tk.faint}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 }}>
        <div>
          <div style={{ fontSize: 10.5, color: tk.faint }}>持仓市值</div>
          <div style={{ fontFamily: tk.serif, fontSize: 21, fontWeight: 800, color: tk.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{yuan2(mv)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10.5, color: tk.faint }}>累计盈亏</div>
          <div style={{ fontFamily: tk.serif, fontSize: 19, fontWeight: 800, color: c, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{profit >= 0 ? '+' : ''}{yuan2(profit).slice(1)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{profitPct > 0 ? '+' : ''}{profitPct.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${tk.lineSoft}` }}>
        {[['成本价', p.cost.toFixed(3)], ['现价', p.nav.toFixed(3)], ['持有份额', p.shares.toLocaleString('zh-CN')]].map(([k, v]) => (
          <div key={k}>
            <span style={{ fontSize: 11, color: tk.faint }}>{k} </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: tk.sub, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoldingsScreen({ tk, positions, watch, fundsById, onOpen, removeWatch }) {
  const [sub, setSub] = useStateW('模拟持仓');
  const totalMv = positions.reduce((a, p) => a + p.nav * p.shares, 0);
  const totalCost = positions.reduce((a, p) => a + p.cost * p.shares, 0);
  const totalProfit = totalMv - totalCost;
  const totalPct = totalCost ? totalProfit / totalCost * 100 : 0;
  const dayProfit = positions.reduce((a, p) => { const fnd = fundsById[p.id]; return a + (fnd ? fnd.navChg / 100 * p.nav * p.shares : 0); }, 0);
  const watchItems = watch.map(id => WATCHLIST.find(w => w.id === id) || (fundsById[id] && { id, name: fundsById[id].name, code: fundsById[id].code, nav: fundsById[id].nav, chg: fundsById[id].navChg })).filter(Boolean);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: tk.bg }}>
      <div style={{ background: tk.card, padding: '16px 18px 16px', borderBottom: `1px solid ${tk.line}` }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: tk.brand, fontWeight: 700, marginBottom: 4 }}>MY TRACKING</div>
        <span style={{ fontFamily: tk.serif, fontSize: 25, fontWeight: 800, color: tk.ink }}>我的持仓</span>
        <div style={{ marginTop: 14 }}>
          <SubTabs tabs={['模拟持仓', '自选']} val={sub} set={setSub} tk={tk}/>
        </div>
      </div>

      {sub === '模拟持仓' ? (
        <div style={{ padding: '16px 18px 30px' }}>
          {/* summary */}
          <div style={{ background: `linear-gradient(160deg, ${tk.hero}, ${tk.hero2})`, borderRadius: 20, padding: '20px 20px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -20, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${tk.brand}30, transparent 70%)` }}/>
            <div style={{ fontSize: 12, color: tk.onHeroSub, letterSpacing: '.04em' }}>模拟总市值</div>
            <div style={{ fontFamily: tk.serif, fontSize: 34, fontWeight: 800, color: tk.onHero, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{yuan2(totalMv)}</div>
            <div style={{ display: 'flex', gap: 26, marginTop: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: tk.onHeroSub }}>累计盈亏</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: totalProfit >= 0 ? '#ff8b80' : '#7fe3bf', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{totalProfit >= 0 ? '+' : ''}{yuan2(totalProfit).slice(1)}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: totalProfit >= 0 ? '#ff8b80' : '#7fe3bf' }}>{totalPct > 0 ? '+' : ''}{totalPct.toFixed(2)}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: tk.onHeroSub }}>今日盈亏</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: dayProfit >= 0 ? '#ff8b80' : '#7fe3bf', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{dayProfit >= 0 ? '+' : ''}{yuan2(dayProfit).slice(1)}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: tk.faint, textAlign: 'center', marginTop: 12 }}>模拟盘 · 仅供跟踪练习，非真实交易</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            {positions.map(p => <PositionRow key={p.id} p={p} tk={tk} onOpen={() => { const f = fundsById[p.id]; if (f) onOpen(f); }}/>)}
          </div>
        </div>
      ) : (
        <div style={{ padding: '4px 18px 30px' }}>
          {watchItems.length === 0
            ? <div style={{ textAlign: 'center', color: tk.faint, padding: '60px 0', fontSize: 13.5 }}>暂无自选 · 去「优选」收藏标的</div>
            : watchItems.map(w => <WatchRow key={w.id} w={w} tk={tk} fund={fundsById[w.id]} onOpen={() => { const f = fundsById[w.id]; if (f) onOpen(f); }} onRemove={() => removeWatch(w.id)}/>)}
        </div>
      )}
    </div>
  );
}

// ---------- 模拟买入 sheet ----------
function BuySheet({ f, tk, onClose, onConfirm }) {
  const [amt, setAmt] = useStateW(1000);
  const [mode, setMode] = useStateW('定投');
  if (!f) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,20,17,.5)', zIndex: 55, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: tk.card, borderRadius: '24px 24px 0 0', padding: '8px 20px 24px', animation: 'sheetUp .3s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: tk.line, margin: '0 auto 16px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: tk.serif, fontSize: 18, fontWeight: 800, color: tk.ink }}>模拟买入</span>
          <Tag tk={tk}>模拟盘</Tag>
        </div>
        <div style={{ fontSize: 13, color: tk.sub, marginTop: 6 }}>{f.name} · {f.code}</div>

        <div style={{ display: 'flex', gap: 4, background: tk.cardAlt, borderRadius: 12, padding: 4, marginTop: 16 }}>
          {['定投', '单次'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 9, padding: '10px 0', fontSize: 13.5, fontWeight: mode === m ? 700 : 500, background: mode === m ? tk.card : 'transparent', color: mode === m ? tk.ink : tk.sub, boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.06)' : 'none' }}>{m === '定投' ? '每月定投' : '单次买入'}</button>
          ))}
        </div>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: tk.faint }}>{mode === '定投' ? '每月扣款金额' : '买入金额'}</div>
          <div style={{ fontFamily: tk.serif, fontSize: 38, fontWeight: 800, color: tk.ink, marginTop: 4 }}>{yuan(amt)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {[500, 1000, 2000, 5000].map(v => (
            <button key={v} onClick={() => setAmt(v)} style={{ flex: 1, border: `1px solid ${amt === v ? tk.ink : tk.line}`, background: amt === v ? tk.ink : 'transparent', color: amt === v ? tk.card : tk.sub, borderRadius: 10, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>

        <button onClick={() => onConfirm(f, amt, mode)} style={{ width: '100%', border: 'none', background: tk.ink, color: tk.card, borderRadius: 14, padding: '15px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 20, fontFamily: tk.sans }}>
          确认{mode === '定投' ? '开启定投' : '买入'}（模拟）
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { HoldingsScreen, BuySheet, SubTabs });
