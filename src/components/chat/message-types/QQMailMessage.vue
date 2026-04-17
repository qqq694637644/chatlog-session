<template>
  <div class="qqmail-message" @click="handleClick">
    <div class="qqmail-message__icon">
      <el-icon :size="20"><Message /></el-icon>
    </div>
    <div class="qqmail-message__content">
      <div class="qqmail-message__title">QQ邮箱提醒</div>
      <div class="qqmail-message__desc">您有新的QQ邮箱消息</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@element-plus/icons-vue'

interface Props {
  showMediaResources?: boolean
}

withDefaults(defineProps<Props>(), {
  showMediaResources: true
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  // 打开QQ邮箱网页版
  window.open('https://mail.qq.com', '_blank')
  emit('click')
}
</script>

<style scoped>
.qqmail-message {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 300px;
}

.qqmail-message:hover {
  background-color: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-6);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qqmail-message__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: var(--el-color-primary);
  border-radius: 50%;
  color: white;
  margin-right: 12px;
  flex-shrink: 0;
}

.qqmail-message__content {
  flex: 1;
  min-width: 0;
}

.qqmail-message__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qqmail-message__desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
  opacity: 0.8;
}
</style>