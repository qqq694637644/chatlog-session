<script setup lang="ts">
interface Props {
  error?: Error | string | null
  title?: string
  message?: string
  showDetails?: boolean
  showRetry?: boolean
  icon?: string
  iconSize?: number
  iconColor?: string
}

interface Emits {
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  title: '出错了',
  message: '页面加载失败，请稍后重试',
  showDetails: false,
  showRetry: true,
  icon: 'CircleClose',
  iconSize: 64,
  iconColor: '#f56c6c'
})

const emit = defineEmits<Emits>()

// 获取错误信息
const getErrorMessage = () => {
  if (!props.error) return props.message
  
  if (typeof props.error === 'string') {
    return props.error
  }
  
  if (props.error instanceof Error) {
    return props.error.message || props.message
  }
  
  return props.message
}

// 获取错误详情
const getErrorDetails = () => {
  if (!props.error) return ''
  
  if (props.error instanceof Error) {
    return props.error.stack || ''
  }
  
  return JSON.stringify(props.error, null, 2)
}

// 重试
const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div class="error-wrapper">
    <div class="error-content">
      <!-- 错误图标 -->
      <div class="error-icon">
        <el-icon :size="iconSize" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>

      <!-- 错误标题 -->
      <h3 class="error-title">{{ title }}</h3>

      <!-- 错误描述 -->
      <p class="error-message">{{ getErrorMessage() }}</p>

      <!-- 错误详情 -->
      <el-collapse v-if="showDetails && error" class="error-details">
        <el-collapse-item title="查看详细信息" name="1">
          <pre class="error-stack">{{ getErrorDetails() }}</pre>
        </el-collapse-item>
      </el-collapse>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <el-button v-if="showRetry" type="primary" @click="handleRetry">
          <el-icon><Refresh /></el-icon>
          重试
        </el-button>

        <!-- 额外操作 -->
        <slot name="actions"></slot>
      </div>

      <!-- 额外内容 -->
      <div v-if="$slots.default" class="error-extra">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 500px;
    text-align: center;

    .error-icon {
      opacity: 0.8;
    }

    .error-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .error-message {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }

    .error-details {
      width: 100%;
      margin-top: 8px;

      .error-stack {
        margin: 0;
        padding: 12px;
        background-color: var(--el-fill-color-light);
        border-radius: 4px;
        font-size: 12px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        color: var(--el-text-color-regular);
        text-align: left;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 200px;
      }
    }

    .error-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }

    .error-extra {
      margin-top: 16px;
      width: 100%;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .error-wrapper {
    min-height: 250px;
    padding: 24px 16px;

    .error-content {
      .error-title {
        font-size: 18px;
      }

      .error-message {
        font-size: 13px;
      }

      .error-details {
        .error-stack {
          font-size: 11px;
          max-height: 150px;
        }
      }
    }
  }
}
</style>