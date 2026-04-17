<script setup lang="ts">
import { usePWAStore } from '@/stores/pwa'
import { Refresh, Close } from '@element-plus/icons-vue'

const pwaStore = usePWAStore()

const reload = async () => {
  await pwaStore.applyUpdate()
}

const dismiss = () => {
  // Just hide the notification, don't update yet
  pwaStore.updateAvailable = false
}
</script>

<template>
  <transition name="slide-up">
    <div v-if="pwaStore.updateAvailable" class="pwa-update-notification">
      <div class="content">
        <div class="icon">
          <el-icon class="update-icon"><Refresh /></el-icon>
        </div>
        <div class="info">
          <h3>发现新版本</h3>
          <p>更新以获得最新功能和体验优化</p>
        </div>
      </div>
      <div class="actions">
        <el-button circle text :icon="Close" @click="dismiss" />
        <el-button type="primary" round size="small" @click="reload">
          更新
        </el-button>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.pwa-update-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-color-primary-light-5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2001;
  backdrop-filter: blur(10px);

  .content {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--el-color-primary-light-9);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .update-icon {
        font-size: 20px;
        color: var(--el-color-primary);
        animation: spin 2s linear infinite;
      }
    }

    .info {
      h3 {
        font-size: 15px;
        font-weight: 600;
        margin: 0;
        color: var(--el-text-color-primary);
      }
      p {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin: 2px 0 0;
      }
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}
</style>