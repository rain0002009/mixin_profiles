<template>
  <div class="default-layout">
    <client-only>
      <background />
    </client-only>
    <el-main class="m-auto">
      <nuxt />
    </el-main>
  </div>
</template>

<style lang="scss">
.default-layout {
  & > .el-main {
    transform: scale(1);
    background-color: rgba(#fff, 0.8);
    z-index: 10;
    height: 100vh;
  }
}
</style>
