import { View, Text } from '@tarojs/components'
import type { Theme } from '../theme'
import { r } from '../utils/size'
import Icon from './Icon'

export default function Toast({ msg, tk, error }: { msg: string; tk: Theme; error?: boolean }) {
  if (!msg) return null
  return (
    <View
      style={{
        position: 'absolute', top: r(54), left: '50%', transform: 'translateX(-50%)', zIndex: 60,
        background: tk.ink, color: tk.card, padding: `${r(11)} ${r(18)}`, borderRadius: r(12),
        fontSize: r(13.5), fontWeight: 600, display: 'flex', alignItems: 'center', gap: r(8),
        boxShadow: '0 8px 24px rgba(0,0,0,.25)', animation: 'toastIn .25s', maxWidth: r(360)
      }}
    >
      <Icon name={error ? 'bolt' : 'check'} size={16} color={error ? tk.up : tk.brand} fill={error} />
      <Text>{msg}</Text>
    </View>
  )
}
