// components.jsx — shared UI for 投小AI
const { useState, useRef, useEffect } = React;

// ---------- utils ----------
const pct = (n, plus = true) => `${n > 0 && plus ? '+' : ''}${n.toFixed(2)}%`;
const yuan = (n) => '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
const yuan2 = (n) => '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- minimal line icons ----------
function Icon({ name, size = 24, color = 'currentColor', stroke = 1.8, fill = false }) {
  const p = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    brief: <><path d="M5 4h11l3 3v13H5z" {...p}/><path d="M9 9h7M9 13h7M9 17h4" {...p}/></>,
    star:  <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z" {...p} fill={fill ? color : 'none'}/>,
    wallet:<><rect x="3.5" y="6" width="17" height="13" rx="2.5" {...p}/><path d="M3.5 10h17M16 14h1.5" {...p}/></>,
    bell:  <><path d="M6.5 9a5.5 5.5 0 0111 0c0 5 2 6 2 6H4.5s2-1 2-6z" {...p} fill={fill ? color : 'none'}/><path d="M10 19a2 2 0 004 0" {...p}/></>,
    flame: <path d="M12 3c1 3-2 4-2 7a3 3 0 006 .2c0-1.6-1-2.6-1-4 2 1.3 3 3.3 3 5.3a6 6 0 11-12 0c0-3.8 3.5-5.2 6-8.5z" {...p} fill={fill ? color : 'none'}/>,
    chevron:<path d="M9 6l6 6-6 6" {...p}/>,
    chevronDown:<path d="M6 9l6 6 6-6" {...p}/>,
    back:  <path d="M15 6l-6 6 6 6" {...p}/>,
    plus:  <path d="M12 6v12M6 12h12" {...p}/>,
    check: <path d="M5 12.5l4 4 10-10" {...p}/>,
    bookmark:<path d="M7 4h10v16l-5-3.5L7 20z" {...p} fill={fill ? color : 'none'}/>,
    search:<><circle cx="11" cy="11" r="6" {...p}/><path d="M16 16l4 4" {...p}/></>,
    calc:  <><rect x="5" y="3" width="14" height="18" rx="2" {...p}/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4" {...p}/></>,
    arrow: <path d="M5 12h13M13 7l5 5-5 5" {...p}/>,
    sparkle:<path d="M12 4l1.6 5L19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-2z" {...p} fill={fill ? color : 'none'}/>,
    bolt:  <path d="M13 3L5 14h6l-1 7 8-11h-6z" {...p} fill={fill ? color : 'none'}/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>{paths[name]}</svg>;
}

// ---------- sparkline ----------
function Sparkline({ data, color, w = 120, h = 40, fillTop, strokeW = 2 }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, h - ((v - min) / span) * (h - 4) - 2 ]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${d} L${w} ${h} L0 ${h} Z`;
  const gid = 'g' + Math.round(min * 1e6) + '_' + Math.round(max * 1e6) + w;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {fillTop && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.22"/>
              <stop offset="1" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`}/>
        </>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeW} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// ---------- small atoms ----------
function Chip({ children, tk, active, onClick, soft }) {
  return (
    <button onClick={onClick} style={{
      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
      padding: '7px 14px', borderRadius: 999, fontSize: 13, fontFamily: tk.sans,
      fontWeight: active ? 600 : 500, letterSpacing: '.02em',
      background: active ? tk.ink : (soft ? tk.cardAlt : 'transparent'),
      color: active ? tk.card : tk.sub,
      transition: 'all .18s',
    }}>{children}</button>
  );
}

function Tag({ children, tk, color }) {
  const c = color || tk.brand;
  return (
    <span style={{
      fontSize: 11, fontFamily: tk.sans, fontWeight: 600, letterSpacing: '.03em',
      color: c, background: c + '1a', padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Change({ v, tk, size = 14, weight = 700, suffix = true }) {
  const c = v > 0 ? tk.up : v < 0 ? tk.down : tk.sub;
  return <span style={{ color: c, fontSize: size, fontWeight: weight, fontVariantNumeric: 'tabular-nums', fontFamily: tk.sans }}>{pct(v, suffix)}</span>;
}

function RiskDot({ risk, tk }) {
  const map = { '低': tk.down, '中': tk.brand, '中高': '#e08a2b', '高': tk.up };
  const c = map[risk] || tk.sub;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: c, fontFamily: tk.sans }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c }}/>{risk}风险
    </span>
  );
}

// ---------- bottom tab bar ----------
function TabBar({ tab, setTab, tk, onFab }) {
  const items = [
    { k: 'home', label: '简报', icon: 'brief' },
    { k: 'funds', label: '优选', icon: 'star' },
    { k: 'holdings', label: '持仓', icon: 'wallet' },
    { k: 'messages', label: '消息', icon: 'bell' },
  ];
  const renderItem = (it) => {
    const on = tab === it.k;
    return (
      <button key={it.k} onClick={() => setTab(it.k)} style={{
        flex: 1, border: 'none', background: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        padding: '4px 0', position: 'relative',
      }}>
        <Icon name={it.icon} size={23} color={on ? tk.ink : tk.faint} stroke={on ? 2 : 1.7} fill={on}/>
        <span style={{ fontSize: 11, fontFamily: tk.sans, fontWeight: on ? 700 : 500, color: on ? tk.ink : tk.faint, letterSpacing: '.04em' }}>{it.label}</span>
        {it.k === 'messages' && <span style={{ position: 'absolute', top: 2, right: '50%', marginRight: -16, width: 7, height: 7, borderRadius: 999, background: tk.up }}/>}
      </button>
    );
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', background: tk.card, borderTop: `1px solid ${tk.line}`,
      padding: '8px 4px 6px', flexShrink: 0,
    }}>
      {onFab ? (
        <>
          {renderItem(items[0])}
          {renderItem(items[1])}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <button onClick={onFab} style={{
              border: 'none', cursor: 'pointer', width: 54, height: 54, borderRadius: 18, marginTop: -26,
              background: `linear-gradient(155deg, ${tk.hero}, ${tk.hero2})`,
              boxShadow: `0 8px 20px ${tk.hero}66, 0 0 0 5px ${tk.card}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
            }}>
              <Icon name="sparkle" size={22} color={tk.brand} fill/>
              <span style={{ fontSize: 9, color: tk.onHeroSub, fontWeight: 700, letterSpacing: '.06em' }}>投喂</span>
            </button>
          </div>
          {renderItem(items[2])}
          {renderItem(items[3])}
        </>
      ) : items.map(renderItem)}
    </div>
  );
}

// ---------- phone frame (custom, status bar over dark hero) ----------
function Phone({ children, tk, statusDark = false, statusBg }) {
  return (
    <div style={{
      width: 412, height: 880, borderRadius: 44, overflow: 'hidden',
      background: tk.bg, border: '9px solid #2a2622',
      boxShadow: '0 40px 90px rgba(20,30,25,.35), 0 0 0 2px rgba(0,0,0,.4) inset',
      display: 'flex', flexDirection: 'column', position: 'relative',
      fontFamily: tk.sans,
    }}>
      <div style={{ background: statusBg || tk.bg, flexShrink: 0 }}>
        <AndroidStatusBar dark={statusDark}/>
      </div>
      {children}
      <div style={{ background: tk.card, flexShrink: 0 }}>
        <AndroidNavBar dark={false}/>
      </div>
    </div>
  );
}

// expandable
function Expand({ open, children }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);
  useEffect(() => { if (ref.current) setH(open ? ref.current.scrollHeight : 0); }, [open, children]);
  return (
    <div style={{ height: h, overflow: 'hidden', transition: 'height .28s cubic-bezier(.4,0,.2,1)' }}>
      <div ref={ref}>{children}</div>
    </div>
  );
}

Object.assign(window, {
  pct, yuan, yuan2, Icon, Sparkline, Chip, Tag, Change, RiskDot, TabBar, Phone, Expand,
});
