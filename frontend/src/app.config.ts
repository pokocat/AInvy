export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#15362c',
    navigationBarTitleText: '投小AI · AInvy',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom'
  }
  // The bottom bar + center FAB is a custom in-app component (see TabBar),
  // not the native tabBar — the native one can't render the editorial FAB.
})
