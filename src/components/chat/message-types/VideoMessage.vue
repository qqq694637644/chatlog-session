<script setup lang="ts">
import { ref } from 'vue'
import { getMediaPlaceholder } from '../composables/utils'

interface Props {
  videoUrl: string
  showMediaResources: boolean
  content?: string
  md5?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const showPreview = ref(false)

const handleClick = () => {
  if (props.showMediaResources && props.videoUrl) {
    showPreview.value = true
  }
  emit('click')
}
</script>

<template>
  <div class="message-video" @click="handleClick">
    <template v-if="showMediaResources">
      <div v-if="videoUrl" class="video-cover">
        <el-icon class="play-icon"><VideoPlay /></el-icon>
        <span v-if="content" class="video-duration">{{ content }}</span>
      </div>
      <div v-else class="video-placeholder">
        <el-icon><VideoCamera /></el-icon>
        <span>视频 (MD5: {{ md5?.substring(0, 8) }}...)</span>
      </div>
    </template>
    <span v-else class="media-placeholder">{{ getMediaPlaceholder(43) }}</span>
  </div>
  
  <!-- 视频预览对话框 -->
  <el-dialog
    v-model="showPreview"
    :width="'90%'"
    :style="{ maxWidth: '1200px' }"
    align-center
    destroy-on-close
  >
    <video v-if="videoUrl" :src="videoUrl" controls class="preview-video">
      您的浏览器不支持视频播放
    </video>
  </el-dialog>
</template>

<style lang="scss" scoped>
.message-video {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  .video-cover {
    width: 240px;
    height: 180px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 4px;

    .play-icon {
      font-size: 48px;
      color: #fff;
      opacity: 0.9;
      transition: opacity 0.3s ease;
    }

    .video-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background-color: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  }

  .video-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 240px;
    height: 180px;
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 12px;
    border-radius: 4px;

    .el-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
  }

  .media-placeholder {
    display: inline-block;
    padding: 8px 12px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    font-style: italic;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    border: 1px dashed var(--el-border-color);

    &:hover {
      background: var(--el-fill-color);
    }
  }

  .preview-video {
    width: 100%;
    height: auto;
    display: block;
    background-color: #000;
  }

  &:hover .play-icon {
    opacity: 1;
    transform: scale(1.1);
  }
}

.dark-mode {
  .message-video .video-placeholder {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .media-placeholder {
    background: var(--el-fill-color-dark);
    border-color: var(--el-border-color-darker);
  }
}
</style>