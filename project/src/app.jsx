// app.jsx — 投小AI main app
const { useState: useS } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "ink_green",
  "feedStyle": "detailed",
  "serifTitles": true
}/*EDITMODE-END*/;

const FUNDS_BY_ID = Object.fromEntries(FUNDS.map(f => [f.id, f]));

function Toast({ msg, tk }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', top: 54, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      background: tk.ink, color: tk.card, padding: '11px 18px', borderRadius: 12, fontSize: 13.5, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,.25)', animation: 'toastIn .25s', maxWidth: 320, whiteSpace: 'nowrap' }}>
      <Icon name="check" size={16} color={tk.brand}/>{msg}
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const tk = getTheme(t.theme);
  if (!t.serifTitles) tk.serif = tk.sans;

  const [tab, setTab] = useS('home');
  const [detail, setDetail] = useS(null);
  const [buyFund, setBuyFund] = useS(null);
  const [watch, setWatch] = useS(WATCHLIST.map(w => w.id));
  const [positions, setPositions] = useS(POSITIONS);
  const [toast, setToast] = useS('');

  const flash = (m) => { setToast(m); clearTimeout(window.__tt); window.__tt = setTimeout(() => setToast(''), 1900); };

  const toggleWatch = (id) => {
    setWatch(w => {
      if (w.includes(id)) { flash('已移出自选'); return w.filter(x => x !== id); }
      flash('已加入自选'); return [...w, id];
    });
  };

  const confirmBuy = (f, amt, mode) => {
    setPositions(ps => {
      const ex = ps.find(p => p.id === f.id);
      if (ex) {
        return ps.map(p => p.id === f.id ? { ...p, shares: p.shares + Math.round(amt / f.nav), sip: mode === '定投' ? true : p.sip, sipAmt: mode === '定投' ? amt : p.sipAmt } : p);
      }
      return [...ps, { id: f.id, name: f.name, code: f.code, cost: f.nav, nav: f.nav, shares: Math.round(amt / f.nav), sip: mode === '定投', sipAmt: mode === '定投' ? amt : 0 }];
    });
    setBuyFund(null);
    flash(mode === '定投' ? `已开启定投 ¥${amt}/月（模拟）` : `已模拟买入 ¥${amt}`);
  };

  const openFund = (f) => { setDetail(f); };

  // status bar styling per view
  const isDark = !detail && tab === 'home' || !!detail;
  const statusBg = detail ? tk.hero : (tab === 'home' ? tk.hero : tk.card);
  const statusDark = !!detail || tab === 'home';

  let screen;
  if (tab === 'home') screen = <HomeScreen tk={tk} t={t}/>;
  else if (tab === 'funds') screen = <FundsScreen tk={tk} t={t} onOpen={openFund} watch={watch} toggleWatch={toggleWatch}/>;
  else if (tab === 'holdings') screen = <HoldingsScreen tk={tk} positions={positions} watch={watch} fundsById={FUNDS_BY_ID} onOpen={openFund} removeWatch={(id) => toggleWatch(id)}/>;
  else screen = <MessagesScreen tk={tk} onGoHome={() => setTab('home')}/>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(circle at 50% 0%, #2c3a33, #181d1a 70%)', boxSizing: 'border-box' }}>
      <Phone tk={tk} statusDark={statusDark} statusBg={statusBg}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          {detail ? (
            <FundDetail f={detail} tk={tk} onBack={() => setDetail(null)}
              watched={watch.includes(detail.id)} onWatch={() => toggleWatch(detail.id)}
              onBuy={() => setBuyFund(detail)}/>
          ) : (
            <>
              {screen}
              <TabBar tab={tab} setTab={setTab} tk={tk}/>
            </>
          )}
          {buyFund && <BuySheet f={buyFund} tk={tk} onClose={() => setBuyFund(null)} onConfirm={confirmBuy}/>}
          <Toast msg={toast} tk={tk}/>
        </div>
      </Phone>

      <TweaksPanel>
        <TweakSection label="配色主题"/>
        <TweakRadio label="主题" value={t.theme}
          options={[{label:'墨绿金', value:'ink_green'},{label:'深蓝', value:'navy'},{label:'中性墨', value:'mono'}]}
          onChange={v => setTweak('theme', v)}/>
        <TweakSection label="版式 / 信息流"/>
        <TweakRadio label="信息流密度" value={t.feedStyle}
          options={[{label:'详尽', value:'detailed'},{label:'紧凑', value:'compact'}]}
          onChange={v => setTweak('feedStyle', v)}/>
        <TweakToggle label="标题用衬线体" value={t.serifTitles} onChange={v => setTweak('serifTitles', v)}/>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
