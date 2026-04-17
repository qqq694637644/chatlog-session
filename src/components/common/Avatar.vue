<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  src?: string
  name?: string
  size?: number | string
  shape?: 'circle' | 'square'
  alt?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  shape: 'circle',
  alt: '',
  name: '',
  src: '',
  icon: ''
})

// 计算头像大小
const avatarSize = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})

// 计算字体大小
const fontSize = computed(() => {
  const size = typeof props.size === 'number' ? props.size : parseInt(props.size)
  return `${Math.floor(size * 0.4)}px`
})

// 从名字中提取首字母
const nameInitial = computed(() => {
  if (!props.name) return '?'
  
  // 如果是中文名，取第一个字
  if (/[\u4e00-\u9fa5]/.test(props.name)) {
    return props.name.charAt(0)
  }
  
  // 如果是英文名，取首字母
  const words = props.name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return props.name.charAt(0).toUpperCase()
})

// 根据名字生成背景色
const backgroundColor = computed(() => {
  if (!props.name) return '#ccc'
  
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa541c', '#a0d911', '#2f54eb'
  ]
  
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
})

// 图片加载失败处理
const hasLoadError = ref(false)

watch(() => props.src, () => {
  hasLoadError.value = false
})

const imgError = computed(() => !props.src || hasLoadError.value)

const handleError = () => {
  hasLoadError.value = true
}
</script>

<template>
  <div
    class="avatar"
    :class="[`avatar--${shape}`, { 'avatar--error': imgError }]"
    :style="{
      width: avatarSize,
      height: avatarSize,
      backgroundColor: imgError ? backgroundColor : 'transparent'
    }"
  >
    <!-- 图片头像 -->
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt || name"
      class="avatar__img" loading="lazy" crossorigin="anonymous"
      @error="handleError"
    />
    
    <!-- 图标头像 -->
    <el-icon v-else-if="icon" :size="parseInt(avatarSize) * 0.6" class="avatar__icon">
      <component :is="icon" />
    </el-icon>
    
    <!-- 文字头像 -->
    <span v-else class="avatar__text" :style="{ fontSize }">
      {{ nameInitial }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  user-select: none;
  position: relative;
  
  &--circle {
    border-radius: 50%;
  }
  
  &--square {
    border-radius: 4px;
  }
  
  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &__text {
    color: #fff;
    font-weight: 500;
    line-height: 1;
  }
  
  &__icon {
    color: #fff;
  }
  
  &--error {
    border: 1px solid var(--el-border-color-lighter);
  }
}
</style>