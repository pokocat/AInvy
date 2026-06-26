// screens-analyze.jsx — 投喂：主动上报内容 → AI 分析 → 推荐标的
const { useState: useStateA, useEffect: useEffectA } = React;

// ---------- 数据来源 / 方案 sheet ----------
function SourcesSheet({ tk, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,20,17,.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '82%', overflowY: 'auto', background: tk.card, borderRadius: '24px 24px 0 0', padding: '8px 20px 26px', animation: 'sheetUp .3s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: tk.line, margin: '0 auto 16px' }}/>
        <div style={{ fontFamily: tk.serif, fontSize: 20, fontWeight: 800, color: tk.ink }}>数据与实现方案</div>
        <div style={{ fontSize: 12.5, color: tk.sub, marginTop: 6, lineHeight: 1.6 }}>本原型展示的能力，均可用下列<b style={{ color: tk.brand }}>免费/低成本</b>数据源真实落地。架构：小程序 → 自建后端(云函数)定时拉取 → 云数据库 → 订阅消息推送。</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {SOURCES.map((s, i) => (
            <div key={i} style={{ background: tk.cardAlt, borderRadius: 14, padding: '13px 14px', border: `1px solid ${tk.lineSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <Tag tk={tk} color={s.free ? tk.down : tk.brand}>{s.tag}</Tag>
                <span style={{ fontSize: 11, fontWeight: 600, color: s.free ? tk.down : tk.brandDeep }}>{s.free ? '免费' : '按量付费'}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: tk.ink }}>{s.name}</div>
              <div style={{ fontSize: 12.5, color: tk.sub, lineHeight: 1.6, marginTop: 4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: tk.faint, lineHeight: 1.7, marginTop: 14, padding: '12px 14px', background: tk.brandSoft, borderRadius: 12 }}>
          注：免费源多为非官方接口，需后端做缓存与容错；小程序需在「request 合法域名」中配置自建后端域名，不直接调第三方。
        </div>
      </div>
    </div>
  );
}

// ---------- mini fund row used in result ----------
function MatchFund({ f, tk, rel, watched, onOpen, onWatch, onBuy }) {
  return (
    <div style={{ background: tk.card, borderRadius: 14, border: `1px solid ${tk.line}`, padding: '13px 14px' }}>
      <div onClick={onOpen} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: tk.ink }}>{f.name}</span>
          {f.sip
            ? <Tag tk={tk} color={tk.down}>适合定投</Tag>
            : <Tag tk={tk} color={tk.faint}>波动大</Tag>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 11.5, color: tk.faint, fontVariantNumeric: 'tabular-nums' }}>{f.code} · {f.type}</span>
          <RiskDot risk={f.risk} tk={tk}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9 }}>
          <span style={{ fontSize: 11, color: tk.faint }}>关联度</span>
          <div style={{ flex: 1, height: 5, borderRadius: 999, background: tk.line, overflow: 'hidden' }}>
            <div style={{ width: rel + '%', height: '100%', background: `linear-gradient(90deg,${tk.brand},${tk.brandDeep})` }}/>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: tk.brand, fontVariantNumeric: 'tabular-nums' }}>{rel}%</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={onWatch} style={{ flex: 1, border: `1.4px solid ${watched ? tk.brand : tk.line}`, background: watched ? tk.brandSoft : 'transparent', color: watched ? tk.brandDeep : tk.sub, borderRadius: 10, padding: '9px 0', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Icon name="bookmark" size={14} color={watched ? tk.brandDeep : tk.sub} fill={watched}/>{watched ? '已自选' : '加自选'}
        </button>
        <button onClick={onBuy} style={{ flex: 1, border: 'none', background: tk.ink, color: tk.card, borderRadius: 10, padding: '9px 0', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Icon name="plus" size={14} color={tk.card}/>模拟买入
        </button>
      </div>
    </div>
  );
}

const LOAD_STEPS = ['识别内容与来源', '抽取关键词与概念', '匹配可投标的', '研判情绪与风险', '生成投资线索'];

function AnalyzeFlow({ tk, onClose, fundsById, watch, onWatch, onBuy, onSave }) {
  const [step, setStep] = useStateA('input');   // input | loading | result
  const [mode, setMode] = useStateA('文字');
  const [text, setText] = useStateA('');
  const [loadI, setLoadI] = useStateA(0);
  const [result, setResult] = useStateA(null);
  const [saved, setSaved] = useStateA(false);

  const run = (t) => {
    const val = (t ?? text).trim();
    if (!val) return;
    setText(val); setResult(analyzeText(val)); setSaved(false);
    setStep('loading'); setLoadI(0);
  };

  useEffectA(() => {
    if (step !== 'loading') return;
    if (loadI >= LOAD_STEPS.length) { const id = setTimeout(() => setStep('result'), 350); return () => clearTimeout(id); }
    const id = setTimeout(() => setLoadI(i => i + 1), 360);
    return () => clearTimeout(id);
  }, [step, loadI]);

  const toneColor = (t) => t === '利好' ? tk.up : t === '利空' ? tk.down : tk.sub;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: tk.bg, display: 'flex', flexDirection: 'column', animation: 'sheetUp .28s cubic-bezier(.4,0,.2,1)' }}>
      {/* header */}
      <div style={{ background: `linear-gradient(160deg, ${tk.hero}, ${tk.hero2})`, padding: '8px 18px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ border: 'none', background: tk.heroChip, borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="back" size={20} color={tk.onHero}/>
          </button>
          <span style={{ color: tk.onHeroSub, fontSize: 12.5, fontWeight: 600 }}>投喂 · 让 AI 拆解</span>
          <div style={{ width: 34 }}/>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon name="sparkle" size={22} color={tk.brand} fill/>
          <span style={{ fontFamily: tk.serif, fontSize: 24, fontWeight: 800, color: tk.onHero }}>投喂分析</span>
        </div>
        <div style={{ color: tk.onHeroSub, fontSize: 12.5, marginTop: 6, lineHeight: 1.6 }}>把你看到的新闻、公众号片段、朋友消息或传闻丢进来，AI 帮你提取可投标的与风险</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {step === 'input' && (
          <div style={{ padding: '18px 18px 30px' }}>
            <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
              {['文字','链接','截图'].map(m => (
                <Chip key={m} tk={tk} active={mode === m} soft onClick={() => setMode(m)}>{m === '文字' ? '✎ 文字' : m === '链接' ? '🔗 链接' : '🖼 截图'}</Chip>
              ))}
            </div>
            {mode === '截图' ? (
              <div style={{ border: `1.5px dashed ${tk.line}`, borderRadius: 16, padding: '34px 16px', textAlign: 'center', background: tk.card }}>
                <Icon name="search" size={28} color={tk.faint}/>
                <div style={{ fontSize: 13.5, color: tk.sub, marginTop: 10, fontWeight: 600 }}>上传聊天/新闻截图</div>
                <div style={{ fontSize: 11.5, color: tk.faint, marginTop: 4 }}>后端 OCR 提取文字后分析（演示用文字输入）</div>
              </div>
            ) : (
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={mode === '链接' ? '粘贴公众号 / 新闻文章链接，AI 抓取正文后分析…' : '粘贴或输入你看到、听到的消息，例如：最近 HBM 很火，存储要涨价…'}
                style={{ width: '100%', minHeight: 130, border: `1px solid ${tk.line}`, borderRadius: 16, padding: 15, fontSize: 14, lineHeight: 1.7, color: tk.ink, background: tk.card, resize: 'none', outline: 'none', fontFamily: tk.sans, boxSizing: 'border-box' }}/>
            )}

            <div style={{ fontSize: 12, color: tk.faint, marginTop: 16, marginBottom: 8, fontWeight: 600 }}>试试这些 ↓</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ANALYZE_SAMPLES.map((s, i) => (
                <button key={i} onClick={() => { setMode('文字'); setText(s); }} style={{ textAlign: 'left', border: `1px solid ${tk.line}`, background: tk.card, borderRadius: 12, padding: '11px 13px', fontSize: 13, color: tk.sub, cursor: 'pointer', lineHeight: 1.5 }}>{s}</button>
              ))}
            </div>

            {ANALYZE_HISTORY.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 24, marginBottom: 10 }}>
                  <Icon name="bookmark" size={16} color={tk.ink} fill/>
                  <span style={{ fontFamily: tk.serif, fontSize: 17, fontWeight: 800, color: tk.ink }}>我的线索库</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ANALYZE_HISTORY.map(h => (
                    <div key={h.id} style={{ background: tk.card, borderRadius: 14, border: `1px solid ${tk.line}`, padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11.5, color: tk.faint }}>{h.date} · {h.tone}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: h.since >= 0 ? tk.up : tk.down }}>投喂后关联标的 {h.since > 0 ? '+' : ''}{h.since}%</span>
                      </div>
                      <div style={{ fontSize: 13, color: tk.ink, lineHeight: 1.6, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{h.text}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
                        {h.concepts.map(c => <Tag key={c} tk={tk}>{c}</Tag>)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {step === 'loading' && (
          <div style={{ padding: '40px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {LOAD_STEPS.map((s, i) => {
                const done = i < loadI, active = i === loadI;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', opacity: i <= loadI ? 1 : .35, transition: 'opacity .3s' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? tk.brand : active ? tk.brandSoft : tk.line, border: active ? `2px solid ${tk.brand}` : 'none' }}>
                      {done ? <Icon name="check" size={15} color="#fff"/> : <span style={{ width: 7, height: 7, borderRadius: 999, background: active ? tk.brand : tk.faint, animation: active ? 'pulse 1s infinite' : 'none' }}/>}
                    </div>
                    <span style={{ fontSize: 14.5, fontWeight: done || active ? 700 : 500, color: done || active ? tk.ink : tk.faint }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div style={{ padding: '16px 18px 30px' }}>
            {/* original */}
            <div style={{ background: tk.cardAlt, borderRadius: 14, padding: '12px 14px', borderLeft: `3px solid ${tk.brand}` }}>
              <div style={{ fontSize: 11, color: tk.faint, marginBottom: 5, fontWeight: 600 }}>你投喂的内容</div>
              <div style={{ fontSize: 13.5, color: tk.ink, lineHeight: 1.65 }}>{text}</div>
            </div>

            {/* badges */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <div style={{ flex: 1, background: tk.card, borderRadius: 12, border: `1px solid ${tk.line}`, padding: '11px 12px' }}>
                <div style={{ fontSize: 11, color: tk.faint }}>市场情绪</div>
                <div style={{ fontFamily: tk.serif, fontSize: 17, fontWeight: 800, color: toneColor(result.tone), marginTop: 3 }}>{result.tone}</div>
              </div>
              <div style={{ flex: 1, background: tk.card, borderRadius: 12, border: `1px solid ${tk.line}`, padding: '11px 12px' }}>
                <div style={{ fontSize: 11, color: tk.faint }}>信息性质</div>
                <div style={{ fontFamily: tk.serif, fontSize: 17, fontWeight: 800, color: tk.ink, marginTop: 3 }}>{result.nature}</div>
              </div>
            </div>

            {/* summary */}
            <div style={{ background: tk.brandSoft, borderRadius: 14, padding: '14px 15px', marginTop: 12, border: `1px solid ${tk.brand}33` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <Icon name="sparkle" size={15} color={tk.brandDeep} fill/>
                <span style={{ fontSize: 12, fontWeight: 700, color: tk.brandDeep, letterSpacing: '.05em', whiteSpace: 'nowrap' }}>AI 摘要</span>
              </div>
              <div style={{ fontSize: 13.5, color: tk.ink, lineHeight: 1.75 }}>{result.summary}</div>
            </div>

            {/* concepts */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: tk.faint, fontWeight: 600, marginBottom: 9 }}>提取的关键概念</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.concepts.map((c, i) => (
                  <span key={i} style={{ fontSize: 13, fontWeight: 700, color: tk.hero, background: tk.card, border: `1px solid ${tk.line}`, padding: '7px 13px', borderRadius: 999 }}>#{c.concept}</span>
                ))}
              </div>
            </div>

            {/* matched funds */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 20, marginBottom: 11 }}>
              <Icon name="star" size={17} color={tk.ink} fill/>
              <span style={{ fontFamily: tk.serif, fontSize: 18, fontWeight: 800, color: tk.ink }}>可投标的</span>
              <span style={{ fontSize: 11.5, color: tk.faint }}>· 据概念匹配</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.fundIds.map((id, i) => {
                const f = fundsById[id]; if (!f) return null;
                return <MatchFund key={id} f={f} tk={tk} rel={92 - i * 17} watched={watch.includes(id)} onOpen={() => onOpen && onOpen(f)} onWatch={() => onWatch(id)} onBuy={() => onBuy(f)}/>;
              })}
            </div>

            {/* risk */}
            <div style={{ background: tk.card, borderRadius: 14, border: `1px solid ${tk.up}33`, padding: '14px 15px', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, background: tk.up, color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: tk.up }}>风险提示</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.risk.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: tk.sub, lineHeight: 1.6 }}>
                    <span style={{ color: tk.up, flexShrink: 0 }}>·</span>{r}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setStep('input')} style={{ flex: 1, border: `1.5px solid ${tk.ink}`, background: 'transparent', color: tk.ink, borderRadius: 13, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>再投喂一条</button>
              <button onClick={() => { setSaved(true); onSave && onSave(); }} style={{ flex: 1.3, border: 'none', background: saved ? tk.down : tk.ink, color: tk.card, borderRadius: 13, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name={saved ? 'check' : 'bookmark'} size={15} color={tk.card} fill={!saved}/>{saved ? '已存入线索库' : '存入线索库'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* sticky input action */}
      {step === 'input' && (
        <div style={{ flexShrink: 0, background: tk.card, borderTop: `1px solid ${tk.line}`, padding: '12px 18px' }}>
          <button onClick={() => run()} disabled={!text.trim()} style={{ width: '100%', border: 'none', background: text.trim() ? tk.ink : tk.line, color: text.trim() ? tk.card : tk.faint, borderRadius: 14, padding: '15px 0', fontSize: 15, fontWeight: 700, cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .2s' }}>
            <Icon name="sparkle" size={17} color={text.trim() ? tk.card : tk.faint} fill/>开始分析
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AnalyzeFlow, SourcesSheet });
