export default function ({
  $axios
}) {
  const noopLoading = {
    finish: () => {},
    start: () => {},
    fail: () => {},
    set: () => {}
  }
  const $loading = () => (window.$nuxt && window.$nuxt.$loading && window.$nuxt.$loading.set) ? window.$nuxt.$loading : noopLoading
  $axios.setHeader('Cache-Control', 'no-cache')
  $axios.onRequest((config) => {
    $loading().start()
  })
  // 响应返回处理
  $axios.onResponse((response) => {
    return response.data
  })
  // 响应错误处理
  $axios.onResponseError((error) => {
    const response = error.response || {
      data: {
        message: error
      }
    }
    return Promise.reject(new Error(response.data.message))
  })
}
