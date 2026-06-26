import { defineConfig } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig(async (merge) => {
  const baseConfig = {
    projectName: 'touxiao-ai',
    date: '2026-6-26',
    designWidth: 750,
    deviceRatio: { 640: 2.34 / 2, 750: 1, 828: 1.81 / 2, 375: 2 },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    // Inject the backend base URL at build time so `process.env.TARO_APP_API`
    // is replaced with a literal (otherwise it throws `process is not defined`
    // in the browser). Override via `TARO_APP_API=https://... npm run build:h5`.
    defineConstants: {
      'process.env.TARO_APP_API': JSON.stringify(process.env.TARO_APP_API || 'http://localhost:8000')
    },
    copy: { patterns: [], options: {} },
    framework: 'react',
    compiler: { type: 'webpack5', prebundle: { enable: false } },
    cache: { enable: false },
    mini: {
      postcss: {
        pxtransform: { enable: true, config: {} },
        cssModules: { enable: false }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: { enable: true, config: {} },
        cssModules: { enable: false }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
