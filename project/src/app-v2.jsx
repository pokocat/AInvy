// app-v2.jsx — 投小AI v2：加入「投喂分析」FAB + 数据·方案 + 真实数据语义
const { useState: useS2 } = React;

const TWEAK_DEFAULTS_V2 = /*EDITMODE-BEGIN*/{
  "theme": "ink_green",
  "feedStyle": "detailed",
  "serifTitles": true
}/*EDITMODE-END*/;

const FUNDS_BY_ID_V2 = Object.fromEntries(FUNDS.map(f => [f.id, f]));

function ToastV2({ msg, tk }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', top: 54, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      background: tk.ink, color: tk.card, padding: '11px 18px', borderRadius: 12, fontSize: 13.5, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,.25)', animation: 'toastIn .25s', maxWidth: 340, whiteSpace: 'nowrap' }}>
      <Icon name="check" size={16} color={tk.brand}/>{msg}
    </div>
  );
}

function AppV2() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS_V2);
  const tk = getTheme(t.theme);
  if (!t.serifTitles) tk.serif = tk.sans;

  const [tab, setTab] = useS2('home');
  const [detail, setDetail] = useS2(null);
  const [buyFund, setBuyFund] = useS2(null);
  const [watch, setWatch] = useS2(WATCHLIST.map(w => w.id));
  const [positions, setPositions] = useS2(POSITIONS);
  const [toast, setToast] = useS2('');
  const [showAnalyze, setShowAnalyze] = useS2(false);
  const [showSources, setShowSources] = useS2(false);

  const flash = (m) => { setToast(m); clearTimeout(window.__tt2); window.__tt2 = setTimeout(() => setToast(''), 1900); };

  const toggleWatch = (id) => {
    setWatch(w => {
      if (w.includes(id)) { flash('已移出自选'); return w.filter(x => x !== id); }
      flash('已加入自选'); return [...w, id];
    });
  };

  const confirmBuy = (f, amt, mode) => {
    setPositions(ps => {
      const ex = ps.find(p => p.id === f.id);
      if (ex) return ps.map(p => p.id === f.id ? { ...p, shares: p.shares + Math.round(amt / f.nav), sip: mode === '定投' ? true : p.sip, sipAmt: mode === '定投' ? amt : p.sipAmt } : p);
      return [...ps, { id: f.id, name: f.name, code: f.code, cost: f.nav, nav: f.nav, shares: Math.round(amt / f.nav), sip: mode === '定投', sipAmt: mode === '定投' ? amt : 0 }];
    });
    setBuyFund(null);
    flash(mode === '定投' ? `已开启定投 ¥${amt}/月（模拟）` : `已模拟买入 ¥${amt}`);
  };

  const openFund = (f) => { setShowAnalyze(false); setDetail(f); };

  const statusDark = !!detail || showAnalyze || tab === 'home';
  const statusBg = (detail || showAnalyze) ? tk.hero : (tab === 'home' ? tk.hero : tk.card);

  let screen;
  if (tab === 'home') screen = <HomeScreen tk={tk} t={t} onInfo={() => setShowSources(true)}/>;
  else if (tab === 'funds') screen = <FundsScreen tk={tk} t={t} onOpen={openFund} watch={watch} toggleWatch={toggleWatch}/>;
  else if (tab === 'holdings') screen = <HoldingsScreen tk={tk} positions={positions} watch={watch} fundsById={FUNDS_BY_ID_V2} onOpen={openFund} removeWatch={(id) => toggleWatch(id)}/>;
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
              <TabBar tab={tab} setTab={setTab} tk={tk} onFab={() => setShowAnalyze(true)}/>
            </>
          )}

          {showAnalyze && (
            <AnalyzeFlow tk={tk} onClose={() => setShowAnalyze(false)} fundsById={FUNDS_BY_ID_V2}
              watch={watch} onWatch={toggleWatch} onBuy={(f) => setBuyFund(f)} onOpen={openFund}
              onSave={() => flash('已存入线索库')}/>
          )}
          {showSources && <SourcesSheet tk={tk} onClose={() => setShowSources(false)}/>}
          {buyFund && <BuySheet f={buyFund} tk={tk} onClose={() => setBuyFund(null)} onConfirm={confirmBuy}/>}
          <ToastV2 msg={toast} tk={tk}/>
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

ReactDOM.createRoot(document.getElementById('root')).render(<AppV2/>);
