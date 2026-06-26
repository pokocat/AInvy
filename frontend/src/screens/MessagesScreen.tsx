import { View, Text, ScrollView } from '@tarojs/components'
import type { Theme } from '../theme'
import type { Message } from '../services/types'
import { r } from '../utils/size'
import Icon from '../components/Icon'

// 消息中心 (notification list) — port of screens-messages.jsx.

export default function MessagesScreen({ tk, messages, onGoHome }: {
  tk: Theme; messages: Message[]; onGoHome: () => void
}) {
  const iconColor: Record<string, string> = {
    简报: tk.brand, 提醒: tk.up, 定投: tk.down, 周报: tk.hero, 政策: tk.brandDeep
  }
  return (
    <ScrollView scrollY style={{ flex: 1, background: tk.bg }}>
      <View style={{ background: tk.card, padding: `${r(16)} ${r(18)}`, borderBottom: `1px solid ${tk.line}` }}>
        <View style={{ fontSize: r(10.5), letterSpacing: '.18em', color: tk.brand, fontWeight: 700, marginBottom: r(4) }}>NOTIFICATIONS</View>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: tk.serif, fontSize: r(25), fontWeight: 800, color: tk.ink }}>消息中心</Text>
          <Text style={{ fontSize: r(12.5), color: tk.brand, fontWeight: 600 }}>全部已读</Text>
        </View>
      </View>

      {/* subscription banner */}
      <View style={{ margin: `${r(16)} ${r(18)} 0`, background: `linear-gradient(150deg, ${tk.hero}, ${tk.hero2})`, borderRadius: r(18), padding: `${r(16)} ${r(17)}`, display: 'flex', alignItems: 'center', gap: r(13), position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: r(-20), right: r(-10), width: r(110), height: r(110), borderRadius: '50%', background: `radial-gradient(circle, ${tk.brand}30, transparent 70%)` }} />
        <View style={{ width: r(42), height: r(42), borderRadius: r(12), background: tk.heroChip, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="bell" size={22} color={tk.brand} fill />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ color: tk.onHero, fontSize: r(14), fontWeight: 700 }}>每日 08:15 推送简报</View>
          <View style={{ color: tk.onHeroSub, fontSize: r(12), marginTop: r(3) }}>微信订阅消息 · 每日动态 + 每周周报 · 已授权</View>
        </View>
        <View style={{ width: r(42), height: r(24), borderRadius: r(999), background: tk.brand, position: 'relative', flexShrink: 0 }}>
          <View style={{ position: 'absolute', top: r(2), right: r(2), width: r(20), height: r(20), borderRadius: r(999), background: '#fff' }} />
        </View>
      </View>

      <View style={{ padding: `${r(8)} ${r(18)} ${r(30)}` }}>
        {messages.map((m) => (
          <View key={m.id} onClick={m.type === '简报' ? onGoHome : undefined} style={{ display: 'flex', gap: r(13), padding: `${r(15)} ${r(2)}`, borderBottom: `1px solid ${tk.lineSoft}` }}>
            <View style={{ width: r(40), height: r(40), borderRadius: r(12), background: (iconColor[m.type] || tk.brand) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: tk.serif, fontWeight: 800, fontSize: r(16), color: iconColor[m.type] || tk.brand }}>{m.icon}</View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: r(8) }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: r(7) }}>
                  <Text style={{ fontSize: r(14), fontWeight: 700, color: tk.ink }}>{m.title}</Text>
                  {m.unread && <View style={{ width: r(7), height: r(7), borderRadius: r(999), background: tk.up, flexShrink: 0 }} />}
                </View>
                <Text style={{ fontSize: r(11), color: tk.faint, flexShrink: 0 }}>{m.time}</Text>
              </View>
              <View style={{ fontSize: r(12.5), color: tk.sub, lineHeight: 1.6, marginTop: r(5) }}>{m.desc}</View>
              {m.type === '简报' && (
                <View style={{ display: 'inline-flex', alignItems: 'center', gap: r(4), marginTop: r(8) }}>
                  <Text style={{ fontSize: r(12), fontWeight: 600, color: tk.brand }}>查看简报</Text>
                  <Icon name="chevron" size={13} color={tk.brand} />
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
