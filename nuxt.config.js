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
  css: ['element-ui/lib/theme-chalk/index.css'],
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
  buildModules: ['@nuxtjs/tailwindcss', 'nuxt-purgecss'],
  purgeCSS: {
    mode: 'postcss',
    whitelistPatterns: [/el-*/, /cm-s-vscode-dark*/, /^CodeMirror*/],
    whitelistPatternsChildren: [/el-*/, /cm-s-vscode-dark*/, /^CodeMirror*/]
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
    transpile: [/^element-ui/]
  },
  serverMiddleware: [
    // API middleware
    '~/api/index.js'
  ]
}
