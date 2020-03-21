module.exports = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [{
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: '~/components/loading.vue',
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/hotcss',
    '@/plugins/element-ui',
    '@/plugins/axios',
    {
      src: '@/plugins/codemirror',
      mode: 'client'
    }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    purgeCSSInDev: true
  },
  purgeCSS: {
    // mode: 'postcss',
    whitelistPatterns: [/^el-*/, /^cm-s-vscode-dark*/, /^CodeMirror*/],
    whitelistPatternsChildren: [/^el-*/, /^cm-s-vscode-dark*/, /^CodeMirror*/]
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: '/api'
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^element-ui/],
    babel: {
      babelrc: false,
      cacheDirectory: undefined,
      presets: ['@nuxt/babel-preset-app'],
      plugins: [
        ["component", {
          "libraryName": "element-ui",
          "styleLibraryName": "theme-chalk"
        }]
      ]
    },
    extractCSS: true,
    optimizeCSS: {
      assetNameRegExp: /\.optimize\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', {
          discardComments: {
            removeAll: true
          }
        }],
      },
      canPrint: true
    }
  },
  serverMiddleware: [
    // API middleware
    '~/api/index.js'
  ]
}
