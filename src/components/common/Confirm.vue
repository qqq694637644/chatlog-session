<script setup lang="ts">
import { ElMessageBox, ElMessageBoxOptions } from 'element-plus'

interface Props {
  title?: string
  message?: string
  type?: 'success' | 'warning' | 'info' | 'error'
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  lockScroll?: boolean
  dangerouslyUseHTMLString?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  message: '确定要执行此操作吗？',
  type: 'warning',
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  showCancelButton: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  showClose: true,
  lockScroll: true,
  dangerouslyUseHTMLString: false
})

const emit = defineEmits<Emits>()

// 显示确认对话框
const show = async (): Promise<boolean> => {
  try {
    const options: ElMessageBoxOptions = {
      title: props.title,
      message: props.message,
      type: props.type,
      confirmButtonText: props.confirmButtonText,
      cancelButtonText: props.cancelButtonText,
      showCancelButton: props.showCancelButton,
      closeOnClickModal: props.closeOnClickModal,
      closeOnPressEscape: props.closeOnPressEscape,
      showClose: props.showClose,
      lockScroll: props.lockScroll,
      dangerouslyUseHTMLString: props.dangerouslyUseHTMLString,
      distinguishCancelAndClose: true
    }

    await ElMessageBox(options)
    emit('confirm')
    return true
  } catch (action: any) {
    if (action === 'cancel' || action === 'close') {
      emit('cancel')
    }
    return false
  }
}

defineExpose({
  show
})
</script>

<template>
  <div class="confirm-wrapper">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.confirm-wrapper {
  display: contents;
}
</style>
