import { View, Text } from '@tarojs/components'
import { ReactNode } from 'react'
import type { Theme } from '../theme'
import { r } from '../utils/size'

const isH5 = process.env.TARO_ENV === 'h5'

// Faux Android status bar (time + wifi/cell/battery), matching the prototype's
// android-frame.jsx. On H5 it renders inside the phone bezel; on MP it sits
// under the real system bar as a colored hero strip.
function StatusBar({ dark, bg }: { dark: boolean; bg: string }) {
  const c = dark ? '#fff' : '#171d1b'
  return (
    <View style={{ background: bg, flexShrink: 0 }}>
      <View
        style={{
          height: r(40), display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `0 ${r(16)}`, position: 'relative', fontFamily: 'Roboto, system-ui, sans-serif'
        }}
      >
        <Text style={{ fontSize: r(14), fontWeight: 400, letterSpacing: '0.25px', color: c }}>9:30</Text>
        <View style={{ position: 'absolute', left: '50%', top: r(8), transform: 'translateX(-50%)', width: r(24), height: r(24), borderRadius: r(100), background: '#2e2e2e' }} />
        <View style={{ display: 'flex', alignItems: 'center', gap: r(5) }}>
          <Text style={{ fontSize: r(12), color: c, fontWeight: 700 }}>▾</Text>
          <Text style={{ fontSize: r(12), color: c, fontWeight: 700 }}>◢</Text>
          <View style={{ width: r(18), height: r(11), borderRadius: r(2), border: `1.5px solid ${c}`, position: 'relative' }}>
            <View style={{ position: 'absolute', top: r(2), left: r(1.5), bottom: r(2), width: r(11), background: c, borderRadius: r(1) }} />
          </View>
        </View>
      </View>
    </View>
  )
}

function NavPill({ tk }: { tk: Theme }) {
  return (
    <View style={{ background: tk.card, flexShrink: 0, height: r(24), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: r(108), height: r(4), borderRadius: r(2), background: '#171d1b', opacity: 0.4 }} />
    </View>
  )
}

// Phone shell. On H5 a bezeled, centered ~412px column (pixel-identical to the
// prototype). On MP it fills the device.
export default function Frame({ children, tk, statusDark, statusBg }: {
  children: ReactNode; tk: Theme; statusDark: boolean; statusBg: string
}) {
  const inner = (
    <View
      style={{
        width: isH5 ? r(412) : '100%',
        height: isH5 ? r(880) : '100vh',
        borderRadius: isH5 ? r(44) : 0,
        overflow: 'hidden',
        background: tk.bg,
        border: isH5 ? '9px solid #2a2622' : 'none',
        boxShadow: isH5 ? '0 40px 90px rgba(20,30,25,.35)' : 'none',
        display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: tk.sans
      }}
    >
      <StatusBar dark={statusDark} bg={statusBg} />
      {children}
      <NavPill tk={tk} />
    </View>
  )

  if (!isH5) return inner

  return (
    <View
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: r(24), background: 'radial-gradient(circle at 50% 0%, #2c3a33, #181d1a 70%)', boxSizing: 'border-box'
      }}
    >
      {inner}
    </View>
  )
}
