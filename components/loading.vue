<template></template>
<script>
import { Loading } from 'element-ui'
export default {
  data() {
    return {
      loading: {
        close() {}
      }
    }
  },
  methods: {
    start() {
      this.loading = Loading.service({
        body: true,
        fullscreen: true,
        lock: true
      })
    },
    finish() {
      this.loading.close()
    },
    fail() {
      this.loading.close()
    },
    set() {}
  }
}
</script>

<style>
.el-loading-spinner .circular {
  display: inline-block;
}
</style>