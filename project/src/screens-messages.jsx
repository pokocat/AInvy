// screens-messages.jsx — 消息中心 (notification list)
function MessagesScreen({ tk, onGoHome }) {
  const iconColor = { '简报': tk.brand, '提醒': tk.up, '定投': tk.down, '周报': tk.hero, '政策': tk.brandDeep };
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: tk.bg }}>
      <div style={{ background: tk.card, padding: '16px 18px 16px', borderBottom: `1px solid ${tk.line}` }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: tk.brand, fontWeight: 700, marginBottom: 4 }}>NOTIFICATIONS</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: tk.serif, fontSize: 25, fontWeight: 800, color: tk.ink }}>消息中心</span>
          <span style={{ fontSize: 12.5, color: tk.brand, fontWeight: 600 }}>全部已读</span>
        </div>
      </div>

      {/* subscription banner */}
      <div style={{ margin: '16px 18px 0', background: `linear-gradient(150deg, ${tk.hero}, ${tk.hero2})`, borderRadius: 18, padding: '16px 17px', display: 'flex', alignItems: 'center', gap: 13, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -10, width: 110, height: 110, borderRadius: '50%', background: `radial-gradient(circle, ${tk.brand}30, transparent 70%)` }}/>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: tk.heroChip, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="bell" size={22} color={tk.brand} fill/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: tk.onHero, fontSize: 14, fontWeight: 700 }}>每日 08:15 推送简报</div>
          <div style={{ color: tk.onHeroSub, fontSize: 12, marginTop: 3 }}>微信订阅消息 · 每日动态 + 每周周报 · 已授权</div>
        </div>
        <div style={{ width: 42, height: 24, borderRadius: 999, background: tk.brand, position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: 999, background: '#fff' }}/>
        </div>
      </div>

      <div style={{ padding: '8px 18px 30px' }}>
        {MESSAGES.map(m => (
          <div key={m.id} onClick={m.type === '简报' ? onGoHome : undefined} style={{ display: 'flex', gap: 13, padding: '15px 2px', borderBottom: `1px solid ${tk.lineSoft}`, cursor: m.type === '简报' ? 'pointer' : 'default' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: (iconColor[m.type] || tk.brand) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: tk.serif, fontWeight: 800, fontSize: 16, color: iconColor[m.type] || tk.brand }}>{m.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: tk.ink, display: 'flex', alignItems: 'center', gap: 7 }}>
                  {m.title}
                  {m.unread && <span style={{ width: 7, height: 7, borderRadius: 999, background: tk.up, flexShrink: 0 }}/>}
                </span>
                <span style={{ fontSize: 11, color: tk.faint, flexShrink: 0 }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 12.5, color: tk.sub, lineHeight: 1.6, marginTop: 5 }}>{m.desc}</div>
              {m.type === '简报' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: tk.brand, marginTop: 8 }}>查看简报 <Icon name="chevron" size={13} color={tk.brand}/></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MessagesScreen });
