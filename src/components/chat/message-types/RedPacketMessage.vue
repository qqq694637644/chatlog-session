<script setup lang="ts">
/**
 * 红包消息组件
 * 用于显示微信红包消息（type=49, subType=2001）
 */

interface Props {
  content?: string
  showMediaResources?: boolean
}

withDefaults(defineProps<Props>(), {
  content: '',
  showMediaResources: true
})
</script>

<template>
  <div class="red-packet-message">
    <div class="red-packet-message__icon">
      <el-icon :size="24">
        <Present />
      </el-icon>
    </div>
    <div class="red-packet-message__content">
      <span class="red-packet-message__title">微信红包</span>
      <span class="red-packet-message__desc">请在手机上查看红包</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.red-packet-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border-radius: 8px;
  color: #fff;
  min-width: 240px;
  box-shadow: 0 2px 8px rgba(238, 90, 82, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(238, 90, 82, 0.4);
  }

  &__icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
  }

  &__desc {
    font-size: 12px;
    opacity: 0.9;
  }
}

// 暗色模式适配
.dark {
  .red-packet-message {
    background: linear-gradient(135deg, #d84a3f 0%, #c43d34 100%);
  }
}
</style>