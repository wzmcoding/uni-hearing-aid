<script setup lang="ts">
const ui = useUi()

function retry() {
  router.replace('/pages/index')
}

onReady(() => {
  ui.showError('系统遇到问题，请稍后再试', () => {
    retry()
  })
})
</script>

<template>
  <MlPage>
    <div class="h-100vh flex flex-col items-center justify-center gap-4 px-8">
      <button class="w-full btn-accent px-6 py-3" @click="router.replace('/pages/index')">
        回到首页
      </button>
    </div>
  </MlPage>
</template>
