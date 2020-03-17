export default function ({
  $axios,
  redirect
}) {
  $axios.setHeader('Cache-Control', 'no-cache')
  // 响应返回处理
  $axios.onResponse((response) => {
    return response.data
  })
  // 响应错误处理
  $axios.onResponseError(({
    response
  }) => {
    return Promise.reject(new Error(response.data))
  })
}
