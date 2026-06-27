import { PropsWithChildren } from 'react'
import './app.scss'

// Platform-specific global resets. Several rules (remote @import, the `*`
// universal selector, `::-webkit-*`, attribute selectors) are H5-only and break
// WXSS, so they're split per platform. TARO_ENV is replaced with a literal at
// build time, so webpack keeps only the reachable branch's require.
if (process.env.TARO_ENV === 'h5') {
  require('./app-h5.scss')
} else {
  require('./app-weapp.scss')
}

function App({ children }: PropsWithChildren) {
  return children
}

export default App
