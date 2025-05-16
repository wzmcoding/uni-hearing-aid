<script setup lang="ts">
const env = useEnvStore()
</script>

<template>
  <div class="relative overflow-hidden rounded-1 bg-muted" :class="env.platform !== AppPlatform.H5 ? 'h-full w-full' : ''">
    <div
      class="skeleton gradient absolute left-0 top-0 h-full w-[30rpx] rotate-20"
    />
  </div>
</template>

<style lang="scss" scoped>
.gradient {
  background: linear-gradient(to right, hsl(var(--muted)) 0%, hsl(var(--background)) 50%, hsl(var(--muted)) 100%);
}
.skeleton {
  animation: skeleton-animation 2s linear infinite;;
}
@keyframes skeleton-animation {
  0% {
    left: 0;
  }
  20% {
    left: 20%;
  }
  40% {
    left: 40%;
  }
  60% {
    left: 60%;
  }
  80% {
    left: 80%;
  }
  100% {
    left: 100%;
  }
}
</style>
