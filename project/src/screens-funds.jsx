// screens-funds.jsx — 优选 (funds + portfolios), fund detail, 定投计算器
const { useState: useStateF } = React;

function StarRow({ v, tk, size = 12 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[0,1,2,3,4].map(i => (
        <Icon key={i} name="star" size={size} color={tk.brand} fill={i < Math.round(v)}/>
      ))}
    </span>
  );
}

// ---------- portfolio card ----------
function PortfolioCard({ p, tk }) {
  const rc = p.risk === '低' ? tk.down : p.risk === '中' ? tk.brand : tk.up;
  return (
    <div style={{ minWidth: 250, width: 250, background: tk.card, borderRadius: 18, border: `1px solid ${tk.line}`, padding: 16, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: tk.serif, fontSize: 17, fontWeight: 800, color: tk.ink }}>{p.name}</span>
          <Tag tk={tk} color={rc}>{p.risk}风险</Tag>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: tk.sub, lineHeight: 1.6, marginTop: 8, minHeight: 40 }}>{p.desc}</div>
      <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 12, gap: 2 }}>
        {p.items.map((it, i) => {
          const cols = [tk.brand, tk.hero, tk.down, tk.up, tk.sub];
          return <div key={i} style={{ width: it.w + '%', background: cols[i % cols.length] }}/>;
        })}
      </div>
      <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {p.items.map((it, i) => {
          const cols = [tk.brand, tk.hero, tk.down, tk.up, tk.sub];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: cols[i % cols.length] }}/>
              <span style={{ flex: 1, color: tk.sub }}>{it.name}</span>
              <span style={{ fontWeight: 700, color: tk.ink, fontVariantNumeric: 'tabular-nums' }}>{it.w}%</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${tk.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: tk.faint }}>{p.target}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: tk.brand, display: 'inline-flex', alignItems: 'center', gap: 3 }}>定投此组合 <Icon name="arrow" size={13} color={tk.brand}/></span>
      </div>
    </div>
  );
}

// ---------- fund list row ----------
function FundRow({ f, tk, onOpen, watched, onWatch }) {
  return (
    <div onClick={onOpen} style={{ background: tk.card, borderRadius: 16, border: `1px solid ${tk.line}`, padding: '14px 15px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: tk.ink }}>{f.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 11.5, color: tk.faint, fontFamily: tk.sans, fontVariantNumeric: 'tabular-nums' }}>{f.code}</span>
            <span style={{ fontSize: 11.5, color: tk.faint }}>{f.type}</span>
            <RiskDot risk={f.risk} tk={tk}/>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onWatch(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, marginTop: -2 }}>
          <Icon name="bookmark" size={20} color={watched ? tk.brand : tk.faint} fill={watched}/>
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, color: tk.faint, letterSpacing: '.04em' }}>近1年</div>
          <div style={{ fontFamily: tk.serif, fontSize: 24, fontWeight: 800, color: f.y1 >= 0 ? tk.up : tk.down, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            {f.y1 > 0 ? '+' : ''}{f.y1.toFixed(1)}<span style={{ fontSize: 14 }}>%</span>
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: 130, margin: '0 14px' }}>
          <Sparkline data={f.series} color={f.y1 >= 0 ? tk.up : tk.down} w={130} h={42} fillTop strokeW={2}/>
        </div>
        <div style={{ textAlign: 'right' }}>
          {f.sip
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: tk.down, background: tk.down + '18', padding: '4px 9px', borderRadius: 7 }}><Icon name="check" size={12} color={tk.down}/>适合定投</span>
            : <span style={{ fontSize: 11.5, fontWeight: 600, color: tk.faint, background: tk.cardAlt, padding: '4px 9px', borderRadius: 7 }}>波动较大</span>}
          <div style={{ marginTop: 7, display: 'flex', justifyContent: 'flex-end' }}><StarRow v={f.star} tk={tk}/></div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: tk.sub, lineHeight: 1.6, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${tk.lineSoft}` }}>
        <span style={{ color: tk.brand, fontWeight: 700 }}>荐 </span>{f.reason}
      </div>
    </div>
  );
}

function FundsScreen({ tk, t, onOpen, watch, toggleWatch }) {
  const [theme, setTheme] = useStateF('全部');
  const list = theme === '全部' ? FUNDS : FUNDS.filter(f => f.theme === theme);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: tk.bg }}>
      <div style={{ background: tk.card, padding: '16px 18px 18px', borderBottom: `1px solid ${tk.line}` }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: tk.brand, fontWeight: 700, marginBottom: 4 }}>SELECTED FUNDS</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: tk.serif, fontSize: 25, fontWeight: 800, color: tk.ink }}>优选标的</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: tk.sub, fontSize: 12.5 }}>
            <Icon name="search" size={17} color={tk.sub}/>搜索
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: tk.sub, marginTop: 6 }}>懒人定投 · AI 按主题与风险为你筛选，附推荐理由</div>
      </div>

      {/* portfolios */}
      <div style={{ marginTop: 20, paddingLeft: 18 }}>
        <div style={{ paddingRight: 18 }}>
          <SectionTitle tk={tk} kicker="PORTFOLIOS" title="组合推荐" icon="sparkle"
            right={<span style={{ fontSize: 11.5, color: tk.faint, fontFamily: tk.sans, paddingBottom: 3 }}>高 · 中 · 低风险</span>}/>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', marginTop: 13, paddingRight: 18, paddingBottom: 4 }}>
          {PORTFOLIOS.map(p => <PortfolioCard key={p.id} p={p} tk={tk}/>)}
        </div>
      </div>

      {/* themes + list */}
      <div style={{ padding: '0 18px', marginTop: 26 }}>
        <SectionTitle tk={tk} kicker="BY THEME" title="按主题精选" icon="star"/>
        <div style={{ display: 'flex', gap: 7, marginTop: 13, overflowX: 'auto', paddingBottom: 2 }}>
          {FUND_THEMES.map(c => <Chip key={c} tk={tk} active={theme === c} soft onClick={() => setTheme(c)}>{c}</Chip>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14, paddingBottom: 30 }}>
          {list.map(f => <FundRow key={f.id} f={f} tk={tk} onOpen={() => onOpen(f)} watched={watch.includes(f.id)} onWatch={() => toggleWatch(f.id)}/>)}
        </div>
      </div>
    </div>
  );
}

// ---------- 定投计算器 ----------
function SipCalc({ f, tk }) {
  const [amt, setAmt] = useStateF(1000);
  const [years, setYears] = useStateF(5);
  const r = Math.min(Math.max(f.y1 / 100 * 0.55, 0.05), 0.12); // 保守化年化假设
  const n = years * 12, i = r / 12;
  const fv = amt * ((Math.pow(1 + i, n) - 1) / i);
  const invested = amt * n;
  const gain = fv - invested;
  return (
    <div style={{ background: tk.card, borderRadius: 18, border: `1px solid ${tk.line}`, padding: 17, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
        <Icon name="calc" size={18} color={tk.ink} stroke={2}/>
        <span style={{ fontFamily: tk.serif, fontSize: 17, fontWeight: 800, color: tk.ink }}>定投计算器</span>
      </div>
      <div style={{ fontSize: 11.5, color: tk.faint, marginBottom: 14 }}>按年化 {(r*100).toFixed(1)}% 保守估算（非收益承诺）</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, color: tk.sub }}>每月定投</span>
        <span style={{ fontFamily: tk.serif, fontSize: 18, fontWeight: 800, color: tk.ink }}>{yuan(amt)}</span>
      </div>
      <input type="range" min={100} max={5000} step={100} value={amt} onChange={e => setAmt(+e.target.value)}
        style={{ width: '100%', accentColor: tk.brand, marginTop: 6 }}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
        <span style={{ fontSize: 13, color: tk.sub }}>定投年限</span>
        <span style={{ fontFamily: tk.serif, fontSize: 18, fontWeight: 800, color: tk.ink }}>{years} 年</span>
      </div>
      <input type="range" min={1} max={20} step={1} value={years} onChange={e => setYears(+e.target.value)}
        style={{ width: '100%', accentColor: tk.brand, marginTop: 6 }}/>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <div style={{ flex: 1, background: tk.cardAlt, borderRadius: 12, padding: '12px 13px' }}>
          <div style={{ fontSize: 11, color: tk.faint }}>累计投入</div>
          <div style={{ fontFamily: tk.serif, fontSize: 18, fontWeight: 800, color: tk.ink, marginTop: 3 }}>{yuan(invested)}</div>
        </div>
        <div style={{ flex: 1.2, background: `linear-gradient(150deg, ${tk.hero}, ${tk.hero2})`, borderRadius: 12, padding: '12px 13px' }}>
          <div style={{ fontSize: 11, color: tk.onHeroSub }}>预估总值</div>
          <div style={{ fontFamily: tk.serif, fontSize: 19, fontWeight: 800, color: tk.onHero, marginTop: 3 }}>{yuan(fv)}</div>
          <div style={{ fontSize: 11.5, color: tk.brand, fontWeight: 700, marginTop: 2 }}>预估收益 {yuan(gain)}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- fund detail ----------
function FundDetail({ f, tk, onBack, watched, onWatch, onBuy }) {
  const stats = [
    { k: '近1年', v: (f.y1 > 0 ? '+' : '') + f.y1.toFixed(1) + '%', c: f.y1 >= 0 ? tk.up : tk.down },
    { k: '风险等级', v: f.risk, c: tk.ink },
    { k: '基金规模', v: f.scale, c: tk.ink },
    { k: '基金经理', v: f.mgr, c: tk.ink },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: tk.bg }}>
      {/* dark header */}
      <div style={{ background: `linear-gradient(165deg, ${tk.hero}, ${tk.hero2})`, padding: '8px 18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ border: 'none', background: tk.heroChip, borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="back" size={20} color={tk.onHero}/>
          </button>
          <button onClick={onWatch} style={{ border: 'none', background: tk.heroChip, borderRadius: 999, padding: '7px 13px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <Icon name="bookmark" size={15} color={watched ? tk.brand : tk.onHero} fill={watched}/>
            <span style={{ color: watched ? tk.brand : tk.onHero, fontSize: 12.5, fontWeight: 600 }}>{watched ? '已自选' : '加自选'}</span>
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {f.sip && <Tag tk={tk} color={tk.brand}>适合定投</Tag>}
            <span style={{ fontSize: 11.5, color: tk.onHeroSub, fontVariantNumeric: 'tabular-nums' }}>{f.code} · {f.type}</span>
          </div>
          <div style={{ fontFamily: tk.serif, fontSize: 22, fontWeight: 800, color: tk.onHero, marginTop: 8, lineHeight: 1.3 }}>{f.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: tk.hero, background: tk.brand, padding: '2px 6px', borderRadius: 5 }}>估</span>
            <span style={{ fontSize: 11.5, color: tk.onHeroSub }}>盘中估算净值</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 5 }}>
            <span style={{ fontFamily: tk.serif, fontSize: 34, fontWeight: 800, color: tk.onHero, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{f.nav.toFixed(3)}</span>
            <span style={{ color: f.navChg >= 0 ? '#ff8b80' : '#7fe3bf', fontSize: 15, fontWeight: 700, paddingBottom: 3 }}>{f.navChg > 0 ? '+' : ''}{f.navChg.toFixed(2)}%</span>
          </div>
          <div style={{ fontSize: 11.5, color: tk.onHeroSub, marginTop: 6 }}>单位净值 {(f.nav / (1 + f.navChg / 100)).toFixed(4)}（{BRIEF_DATE.split(' ')[0]} 确认） · 来源 天天基金</div>
        </div>
      </div>

      <div style={{ padding: '18px 18px 0' }}>
        {/* nav chart */}
        <div style={{ background: tk.card, borderRadius: 18, border: `1px solid ${tk.line}`, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: tk.ink }}>净值走势</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['近1月','近6月','近1年'].map((r, i) => (
                <span key={r} style={{ fontSize: 11.5, fontWeight: i === 2 ? 700 : 500, color: i === 2 ? tk.card : tk.sub, background: i === 2 ? tk.ink : tk.cardAlt, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>{r}</span>
              ))}
            </div>
          </div>
          <Sparkline data={f.series} color={f.y1 >= 0 ? tk.up : tk.down} w={344} h={108} fillTop strokeW={2.2}/>
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, background: tk.line, borderRadius: 14, overflow: 'hidden', marginTop: 14 }}>
          {stats.map(s => (
            <div key={s.k} style={{ background: tk.card, padding: '12px 6px', textAlign: 'center' }}>
              <div style={{ fontFamily: tk.serif, fontSize: 15.5, fontWeight: 800, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
              <div style={{ fontSize: 10.5, color: tk.faint, marginTop: 3 }}>{s.k}</div>
            </div>
          ))}
        </div>

        {/* AI reason */}
        <div style={{ background: tk.brandSoft, borderRadius: 16, padding: 15, marginTop: 14, border: `1px solid ${tk.brand}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon name="sparkle" size={15} color={tk.brandDeep} fill/>
            <span style={{ fontSize: 12, fontWeight: 700, color: tk.brandDeep, letterSpacing: '.05em', whiteSpace: 'nowrap' }}>AI 推荐理由</span>
          </div>
          <div style={{ fontSize: 13.5, color: tk.ink, lineHeight: 1.75 }}>{f.reason}</div>
        </div>

        {/* calculator */}
        <SipCalc f={f} tk={tk}/>
        <div style={{ height: 90 }}/>
      </div>

      {/* sticky actions */}
      <div style={{ position: 'sticky', bottom: 0, background: tk.card, borderTop: `1px solid ${tk.line}`, padding: '12px 18px', display: 'flex', gap: 10 }}>
        <button onClick={onWatch} style={{ flex: 1, border: `1.5px solid ${tk.ink}`, background: 'transparent', color: tk.ink, borderRadius: 13, padding: '13px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: tk.sans }}>
          {watched ? '已加自选' : '加入自选'}
        </button>
        <button onClick={onBuy} style={{ flex: 1.4, border: 'none', background: tk.ink, color: tk.card, borderRadius: 13, padding: '13px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: tk.sans, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="plus" size={16} color={tk.card}/>模拟买入
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { FundsScreen, FundDetail, SipCalc, PortfolioCard });
