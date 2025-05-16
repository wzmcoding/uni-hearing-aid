<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'

const visible = defineModel<boolean>({
  type: Boolean,
})

const emit = defineEmits(['close'])

function close() {
    emit('close')
}
</script>

<template>
    <!-- #ifdef MP-ALIPAY -->
    <wd-popup v-model="visible" position="bottom" @close="close">
        <slot />
    </wd-popup>
    <!-- #endif -->
    <!-- #ifndef MP-ALIPAY -->
    <TnPopup v-model="visible" open-direction="bottom" @close="close">
        <slot />
    </TnPopup>
    <!-- #endif -->
</template>

<style lang="scss" scoped>

</style>
