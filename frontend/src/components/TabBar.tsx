import { View, Text } from '@tarojs/components'
import type { Theme } from '../theme'
import { r } from '../utils/size'
import Icon, { IconName } from './Icon'

// Bottom tab bar with the center 投喂 FAB — port of components.jsx TabBar.

export type TabKey = 'home' | 'funds' | 'holdings' | 'messages'

const ITEMS: { k: TabKey; label: string; icon: IconName }[] = [
  { k: 'home', label: '简报', icon: 'brief' },
  { k: 'funds', label: '优选', icon: 'star' },
  { k: 'holdings', label: '持仓', icon: 'wallet' },
  { k: 'messages', label: '消息', icon: 'bell' }
]

export default function TabBar({ tab, setTab, tk, onFab }: {
  tab: TabKey; setTab: (k: TabKey) => void; tk: Theme; onFab: () => void
}) {
  const renderItem = (it: { k: TabKey; label: string; icon: IconName }) => {
    const on = tab === it.k
    return (
      <View
        key={it.k}
        onClick={() => setTab(it.k)}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: r(3),
          padding: `${r(4)} 0`, position: 'relative'
        }}
      >
        <Icon name={it.icon} size={23} color={on ? tk.ink : tk.faint} stroke={on ? 2 : 1.7} fill={on} />
        <Text style={{ fontSize: r(11), fontFamily: tk.sans, fontWeight: on ? 700 : 500, color: on ? tk.ink : tk.faint, letterSpacing: '.04em' }}>
          {it.label}
        </Text>
        {it.k === 'messages' && (
          <View style={{ position: 'absolute', top: r(2), right: '50%', marginRight: r(-16), width: r(7), height: r(7), borderRadius: r(999), background: tk.up }} />
        )}
      </View>
    )
  }

  return (
    <View
      style={{
        display: 'flex', alignItems: 'center', background: tk.card,
        borderTop: `1px solid ${tk.line}`, padding: `${r(8)} ${r(4)} ${r(6)}`, flexShrink: 0
      }}
    >
      {renderItem(ITEMS[0])}
      {renderItem(ITEMS[1])}
      <View style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <View
          onClick={onFab}
          style={{
            width: r(54), height: r(54), borderRadius: r(18), marginTop: r(-26),
            background: `linear-gradient(155deg, ${tk.hero}, ${tk.hero2})`,
            boxShadow: `0 8px 20px ${tk.hero}66, 0 0 0 5px ${tk.card}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: r(1)
          }}
        >
          <Icon name="sparkle" size={22} color={tk.brand} fill />
          <Text style={{ fontSize: r(9), color: tk.onHeroSub, fontWeight: 700, letterSpacing: '.06em' }}>投喂</Text>
        </View>
      </View>
      {renderItem(ITEMS[2])}
      {renderItem(ITEMS[3])}
    </View>
  )
}
