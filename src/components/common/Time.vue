<script setup lang="ts">
import { computed } from 'vue'
import { 
  formatRelativeTime, 
  formatMessageTime, 
  formatSessionTime,
  formatFullDate,
  formatDate,
  formatDateTime,
  formatTime
} from '@/utils/date'

interface Props {
  time: string | number | Date
  format?: 'relative' | 'message' | 'session' | 'full' | 'date' | 'datetime' | 'time' | 'auto'
  tooltip?: boolean
  tooltipFormat?: string
  prefix?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'auto',
  tooltip: true,
  tooltipFormat: 'full'
})

// 格式化时间
const formattedTime = computed(() => {
  if (!props.time) return ''
  
  try {
    // 统一转换为 Date 对象
    const date = typeof props.time === 'number' 
      ? new Date(props.time < 10000000000 ? props.time * 1000 : props.time)
      : typeof props.time === 'string'
      ? new Date(props.time)
      : props.time

    switch (props.format) {
      case 'relative':
        return formatRelativeTime(date)
      case 'message':
        return formatMessageTime(date.getTime())
      case 'session':
        return formatSessionTime(date.getTime())
      case 'full':
        return formatFullDate(date)
      case 'date':
        return formatDate(date)
      case 'datetime':
        return formatDateTime(date)
      case 'time':
        return formatTime(date)
      case 'auto':
        // 自动选择格式：优先使用相对时间
        return formatRelativeTime(date)
      default:
        return formatRelativeTime(date)
    }
  } catch (error) {
    console.error('时间格式化错误:', error)
    return String(props.time)
  }
})

// Tooltip 内容
const tooltipContent = computed(() => {
  if (!props.tooltip || !props.time) return ''
  
  try {
    // 统一转换为 Date 对象
    const date = typeof props.time === 'number' 
      ? new Date(props.time < 10000000000 ? props.time * 1000 : props.time)
      : typeof props.time === 'string'
      ? new Date(props.time)
      : props.time

    switch (props.tooltipFormat) {
      case 'full':
        return formatFullDate(date)
      case 'datetime':
        return formatDateTime(date)
      case 'date':
        return formatDate(date)
      default:
        return formatFullDate(date)
    }
  } catch (error) {
    return ''
  }
})

// 显示文本
const displayText = computed(() => {
  const text = formattedTime.value
  if (!text) return ''
  
  let result = text
  if (props.prefix) result = props.prefix + result
  if (props.suffix) result = result + props.suffix
  
  return result
})
</script>

<template>
  <span class="time-display">
    <el-tooltip
      v-if="tooltip && tooltipContent"
      :content="tooltipContent"
      placement="top"
    >
      <span class="time-text">
        <slot :time="formattedTime">{{ displayText }}</slot>
      </span>
    </el-tooltip>
    <span v-else class="time-text">
      <slot :time="formattedTime">{{ displayText }}</slot>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.time-display {
  display: inline-block;
  
  .time-text {
    font-size: inherit;
    color: inherit;
    white-space: nowrap;
  }
}
</style>