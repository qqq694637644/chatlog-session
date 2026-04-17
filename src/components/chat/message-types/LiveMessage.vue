<template>
  <div class="live-message">
    <div class="live-message__container">
      <div class="live-message__icon">
        <el-icon :size="24" color="#FF6B35">
          <VideoCamera />
        </el-icon>
      </div>
      <div class="live-message__content">
        <div class="live-message__title">{{ title }}</div>
        <div class="live-message__badge">
          <el-icon :size="12">
            <VideoCamera />
          </el-icon>
          <span>直播</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VideoCamera } from '@element-plus/icons-vue'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '直播'
})

const title = computed(() => props.title || '直播')
</script>

<style scoped lang="scss">
.live-message {
  display: inline-block;
  max-width: 300px;

  &__container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #FFF5F0 0%, #FFEDE5 100%);
    border: 1px solid #FFD4C1;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: linear-gradient(135deg, #FFEDE5 0%, #FFE5D9 100%);
      border-color: #FFC4A8;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(255, 107, 53, 0.15);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #FF8C61 0%, #FF6B35 100%);
    border-radius: 8px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%);
    border-radius: 10px;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    width: fit-content;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 1px 3px rgba(255, 107, 53, 0.3);

    .el-icon {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

// 深色模式适配
.dark {
  .live-message {
    &__container {
      background: linear-gradient(135deg, #2D1810 0%, #3D2010 100%);
      border-color: #4D3020;

      &:hover {
        background: linear-gradient(135deg, #3D2010 0%, #4D3020 100%);
        border-color: #5D4030;
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
      }
    }

    &__title {
      color: #E5E5E5;
    }
  }
}
</style>
