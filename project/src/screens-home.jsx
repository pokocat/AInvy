// screens-home.jsx — 简报 (daily briefing)
const { useState: useStateH } = React;

function HeatBar({ v, tk, neg }) {
  return (
    <div style={{ height: 5, borderRadius: 999, background: tk.line, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: v + '%', height: '100%', borderRadius: 999,
        background: `linear-gradient(90deg, ${tk.brand}, ${tk.brandDeep})` }}/>
    </div>
  );
}

function SectorBoard({ tk }) {
  return (
    <div style={{ padding: '0 18px', marginTop: 26 }}>
      <SectionTitle tk={tk} kicker="HOT SECTORS" title="板块热度榜" icon="flame"
        right={<span style={{ fontSize: 11.5, color: tk.faint, fontFamily: tk.sans }}>实时 · 09:30</span>}/>
      <div style={{ background: tk.card, borderRadius: 18, border: `1px solid ${tk.line}`, padding: '6px 4px', marginTop: 12 }}>
        {SECTORS.map((s, i) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
            borderBottom: i < SECTORS.length - 1 ? `1px solid ${tk.lineSoft}` : 'none' }}>
            <span style={{ width: 20, textAlign: 'center', fontFamily: tk.serif, fontSize: 16, fontWeight: 700,
              color: i < 3 ? tk.brand : tk.faint }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: tk.ink }}>{s.name}</span>
                {s.tags.slice(0, 1).map(t => <Tag key={t} tk={tk}>{t}</Tag>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <HeatBar v={s.heat} tk={tk}/>
              </div>
            </div>
            <div style={{ width: 62, textAlign: 'right' }}>
              <Change v={s.chg} tk={tk} size={14}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ tk, kicker, title, icon, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        {kicker && <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: tk.brand, fontWeight: 700, fontFamily: tk.sans, marginBottom: 3 }}>{kicker}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {icon && <Icon name={icon} size={19} color={tk.ink} stroke={2}/>}
          <span style={{ fontFamily: tk.serif, fontSize: 21, fontWeight: 700, color: tk.ink, letterSpacing: '.01em' }}>{title}</span>
        </div>
      </div>
      {right}
    </div>
  );
}

function FeedCard({ item, tk, compact, accentColor }) {
  const [open, setOpen] = useStateH(false);
  const ac = accentColor;
  const hasAI = !!item.ai;
  return (
    <div style={{ background: tk.card, borderRadius: 16, border: `1px solid ${tk.line}`, overflow: 'hidden' }}>
      <div onClick={() => hasAI && setOpen(o => !o)} style={{ padding: compact ? '13px 15px' : '15px 16px', cursor: hasAI ? 'pointer' : 'default', display: 'flex', gap: 12 }}>
        <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 999, background: ac, flexShrink: 0 }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <Tag tk={tk} color={ac}>{item.cat}</Tag>
            <span style={{ fontSize: 11.5, color: tk.faint, fontFamily: tk.sans }}>{item.source} · {item.time}</span>
          </div>
          <div style={{ fontFamily: tk.serif, fontSize: compact ? 16 : 17, fontWeight: 700, color: tk.ink, lineHeight: 1.4, letterSpacing: '.01em' }}>{item.title}</div>
          {!compact && <div style={{ fontSize: 13.5, color: tk.sub, lineHeight: 1.65, marginTop: 7 }}>{item.summary}</div>}
          {hasAI && <Expand open={open}>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${tk.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <Icon name="sparkle" size={14} color={tk.brand} fill/>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: tk.brand, letterSpacing: '.06em' }}>AI 解读 · 对你的影响</span>
              </div>
              <div style={{ fontSize: 13.5, color: tk.sub, lineHeight: 1.7 }}>{item.detail}</div>
            </div>
          </Expand>}
          {hasAI && <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 11 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: tk.brand }}>{open ? '收起' : 'AI解读'}</span>
            <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-flex' }}>
              <Icon name="chevron" size={14} color={tk.brand}/>
            </span>
          </div>}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ tk, t, onInfo }) {
  const [cat, setCat] = useStateH('全部');
  const accent = (a) => a === 'up' ? tk.up : a === 'brand' ? tk.brand : tk.sub;
  const feed = cat === '全部' ? FEED : FEED.filter(f => f.cat === cat);
  const compact = t.feedStyle === 'compact';

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: tk.bg }}>
      {/* HERO */}
      <div style={{ background: `linear-gradient(165deg, ${tk.hero} 0%, ${tk.hero2} 100%)`, padding: '6px 18px 26px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, ${tk.brand}33, transparent 70%)` }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: tk.brand, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: tk.serif, fontWeight: 800, fontSize: 16, color: tk.hero }}>投</div>
            <span style={{ color: tk.onHero, fontFamily: tk.serif, fontWeight: 700, fontSize: 16, letterSpacing: '.04em' }}>投小AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onInfo && (
              <button onClick={onInfo} style={{ display: 'flex', alignItems: 'center', gap: 5, background: tk.heroChip, padding: '5px 11px', borderRadius: 999, border: 'none', cursor: 'pointer' }}>
                <Icon name="bolt" size={13} color={tk.brand} fill/>
                <span style={{ color: tk.onHeroSub, fontSize: 11.5, fontWeight: 600 }}>数据·方案</span>
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: tk.heroChip, padding: '5px 11px', borderRadius: 999 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: tk.down }}/>
              <span style={{ color: tk.onHeroSub, fontSize: 11.5, fontWeight: 600 }}>已同步</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22, position: 'relative' }}>
          <div style={{ color: tk.onHeroSub, fontSize: 12.5, letterSpacing: '.04em' }}>{BRIEF_DATE} · 早安</div>
          <div style={{ fontFamily: tk.serif, fontSize: 30, fontWeight: 800, color: tk.onHero, marginTop: 6, letterSpacing: '.02em', lineHeight: 1.2 }}>
            今日市场简报
          </div>
          <div style={{ width: 38, height: 3, background: tk.brand, borderRadius: 999, marginTop: 12 }}/>
        </div>

        {/* AI summary */}
        <div style={{ marginTop: 20, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 18, padding: '16px 16px 14px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <Icon name="sparkle" size={16} color={tk.brand} fill/>
            <span style={{ color: tk.brand, fontSize: 12, fontWeight: 700, letterSpacing: '.08em', whiteSpace: 'nowrap' }}>AI 一段话总结</span>
          </div>
          <div style={{ color: tk.onHero, fontSize: 14, lineHeight: 1.85, opacity: .95 }}>{AI_SUMMARY}</div>
        </div>

        {/* points */}
        <div style={{ marginTop: 13, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {AI_POINTS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 2px' }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: p.tone === 'up' ? tk.up : tk.brand, flexShrink: 0 }}/>
              <span style={{ color: tk.onHero, fontSize: 13.5, opacity: .92, flex: 1 }}>{p.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTORS */}
      <SectorBoard tk={tk}/>

      {/* FEED */}
      <div style={{ padding: '0 18px', marginTop: 28 }}>
        <SectionTitle tk={tk} kicker="MARKET FEED" title="动态汇总" icon="bolt"/>
        <div style={{ display: 'flex', gap: 7, marginTop: 13, overflowX: 'auto', paddingBottom: 2 }}>
          {CATS.map(c => <Chip key={c} tk={tk} active={cat === c} soft onClick={() => setCat(c)}>{c}</Chip>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 14, paddingBottom: 28 }}>
          {feed.map(it => <FeedCard key={it.id} item={it} tk={tk} compact={compact} accentColor={accent(it.accent)}/>)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, SectionTitle });
