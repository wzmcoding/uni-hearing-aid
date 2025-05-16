<template>
  <div
    class="app" :class="{
      dark: isDark,
    }"
  >
    <main>
      <slot />
      <MlTabBar />
    </main>
  </div>
</template>
