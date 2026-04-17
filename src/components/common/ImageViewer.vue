<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Close, ZoomIn, ZoomOut, RefreshLeft, RefreshRight, Download, WarningFilled } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  imageUrl: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '图片预览'
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const scale = ref(1)
const rotate = ref(0)
const loading = ref(true)

// Live Photo / 视频兼容状态
const resourceType = ref<'image' | 'video' | 'unknown'>('unknown')
const isImage = ref(true) // 当前是否尝试作为图片显示
const imageError = ref(false)
const videoError = ref(false)
const isVideoReady = ref(false)

const showDialog = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const transformStyle = computed(() => {
  return {
    transform: `scale(${scale.value}) rotate(${rotate.value}deg)`,
    transition: 'transform 0.3s ease'
  }
})

const handleClose = () => {
  showDialog.value = false
  emit('close')
}

const handleZoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(scale.value + 0.25, 3)
  }
}

const handleZoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(scale.value - 0.25, 0.5)
  }
}

const handleRotateLeft = () => {
  rotate.value -= 90
}

const handleRotateRight = () => {
  rotate.value += 90
}

const handleDownload = () => {
  const link = document.createElement('a')
  link.href = props.imageUrl
  link.download = `image_${Date.now()}.jpg`
  link.click()
}

const handleImageLoad = () => {
  if (resourceType.value === 'video') return
  resourceType.value = 'image'
  isImage.value = true
  loading.value = false
}

const handleImageError = () => {
  imageError.value = true
  isImage.value = false // 切换尝试视频
  
  if (isVideoReady.value) {
    resourceType.value = 'video'
    loading.value = false
  } else if (videoError.value) {
    loading.value = false // 都失败了
  }
}

const handleVideoLoad = () => {
  isVideoReady.value = true
  // 如果图片已经失败，则显示视频
  if (imageError.value) {
    resourceType.value = 'video'
    loading.value = false
  }
}

const handleVideoError = () => {
  videoError.value = true
  if (imageError.value) {
    loading.value = false // 都失败了
  }
}

const resetTransform = () => {
  scale.value = 1
  rotate.value = 0
}

const resetState = () => {
  loading.value = true
  imageError.value = false
  videoError.value = false
  isVideoReady.value = false
  isImage.value = true
  resourceType.value = 'unknown'
  resetTransform()
}

// 重置变换当对话框关闭时
watch(() => props.visible, (visible) => {
  if (visible) {
    resetState()
  }
})

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return
  
  switch (e.key) {
    case 'Escape':
      handleClose()
      break
    case '+':
    case '=':
      handleZoomIn()
      break
    case '-':
      handleZoomOut()
      break
    case 'ArrowLeft':
      handleRotateLeft()
      break
    case 'ArrowRight':
      handleRotateRight()
      break
  }
}

// 监听键盘事件
watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <el-dialog
    v-model="showDialog"
    :title="title"
    :width="'90vw'"
    :style="{ maxWidth: '1400px' }"
    align-center
    destroy-on-close
    class="image-viewer-dialog"
    @close="handleClose"
  >
    <div class="image-viewer">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-mask">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>加载中...</span>
      </div>

      <!-- 媒体容器 -->
      <div class="image-container">
        <!-- 加载失败提示 -->
        <div v-if="imageError && videoError" class="error-state">
          <el-icon class="error-icon"><WarningFilled /></el-icon>
          <span>资源加载失败</span>
        </div>

        <!-- 图片 -->
        <img
          v-show="isImage && !imageError"
          :src="imageUrl"
          :style="transformStyle"
          class="viewer-image" 
          loading="lazy" 
          crossorigin="anonymous"
          @load="handleImageLoad"
          @error="handleImageError"
        />

        <!-- 视频 (兼容 Live Photo) -->
        <video
          v-show="!isImage && isVideoReady"
          :src="imageUrl"
          :style="transformStyle"
          class="viewer-image"
          controls
          autoplay
          loop
          playsinline
          crossorigin="anonymous"
          @loadedmetadata="handleVideoLoad"
          @error="handleVideoError"
        />
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button-group>
          <el-button :icon="ZoomOut" :disabled="scale <= 0.5" @click="handleZoomOut">
            缩小
          </el-button>
          <el-button @click="resetTransform">
            {{ Math.round(scale * 100) }}%
          </el-button>
          <el-button :icon="ZoomIn" :disabled="scale >= 3" @click="handleZoomIn">
            放大
          </el-button>
        </el-button-group>

        <el-button-group class="ml-2">
          <el-button :icon="RefreshLeft" @click="handleRotateLeft">
            左转
          </el-button>
          <el-button :icon="RefreshRight" @click="handleRotateRight">
            右转
          </el-button>
        </el-button-group>

        <el-button :icon="Download" class="ml-2" @click="handleDownload">
          下载
        </el-button>

        <el-button :icon="Close" class="ml-2" type="info" @click="handleClose">
          关闭
        </el-button>
      </div>

      <!-- 快捷键提示 -->
      <div class="shortcuts-hint">
        <span>快捷键：ESC 关闭 | +/- 缩放 | ←/→ 旋转</span>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.image-viewer-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-dialog__body) {
    padding: 0;
    background-color: #f5f5f5;
    min-height: 70vh;
  }
}

.image-viewer {
  position: relative;
  width: 100%;
  min-height: 70vh;
  display: flex;
  flex-direction: column;

  .loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 1;
    gap: 12px;

    .el-icon {
      font-size: 32px;
      color: var(--el-color-primary);
    }

    span {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    overflow: hidden;
    background-color: #f5f5f5;
    min-height: 500px;

    .viewer-image {
      max-width: 100%;
      max-height: calc(70vh - 140px);
      object-fit: contain;
      cursor: move;
      user-select: none;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--el-text-color-secondary);

      .error-icon {
        font-size: 48px;
        color: var(--el-color-warning);
      }
    }
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background-color: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-lighter);
    gap: 8px;

    .ml-2 {
      margin-left: 8px;
    }
  }

  .shortcuts-hint {
    padding: 8px 16px;
    text-align: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-light);
    border-top: 1px solid var(--el-border-color-lighter);

    span {
      display: inline-block;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .image-viewer {
    .image-container {
      padding: 20px;
      min-height: 400px;

      .viewer-image {
        max-height: calc(70vh - 180px);
      }
    }

    .toolbar {
      flex-wrap: wrap;
      gap: 4px;

      .ml-2 {
        margin-left: 0;
      }

      .el-button {
        padding: 8px 12px;
        font-size: 12px;
      }
    }

    .shortcuts-hint {
      display: none;
    }
  }
}

// 暗黑模式
.dark-mode {
  .image-viewer-dialog {
    :deep(.el-dialog__body) {
      background-color: #1a1a1a;
    }
  }

  .image-viewer {
    .image-container {
      background-color: #1a1a1a;
    }
  }
}
</style>