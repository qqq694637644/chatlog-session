<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  size?: 'small' | 'default' | 'large'
  clearable?: boolean
  autofocus?: boolean
  disabled?: boolean
  maxlength?: number
  showWordLimit?: boolean
  prefixIcon?: string
  suffixIcon?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索...',
  size: 'default',
  clearable: true,
  autofocus: false,
  disabled: false,
  prefixIcon: 'Search'
})

const emit = defineEmits<Emits>()

const inputValue = ref(props.modelValue)
const inputRef = ref()

// 同步 modelValue
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

// 输入变化
const handleInput = (value: string) => {
  inputValue.value = value
  emit('update:modelValue', value)
}

// 搜索
const handleSearch = () => {
  emit('search', inputValue.value)
}

// 按下回车
const handleKeydown = (event: Event | KeyboardEvent) => {
  if (event instanceof KeyboardEvent && event.key === 'Enter') {
    handleSearch()
  }
}

// 清空
const handleClear = () => {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
  emit('search', '')
}

// 聚焦
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

// 失焦
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// 暴露方法
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

defineExpose({
  focus,
  blur
})
</script>

<template>
  <div class="search-bar" :class="[`search-bar--${size}`, { 'is-disabled': disabled }]">
    <el-input
      ref="inputRef"
      :model-value="inputValue"
      :placeholder="placeholder"
      :size="size"
      :clearable="clearable"
      :disabled="disabled"
      :maxlength="maxlength"
      :show-word-limit="showWordLimit"
      :autofocus="autofocus"
      class="search-input"
      @update:model-value="handleInput"
      @keydown="handleKeydown"
      @clear="handleClear"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template #prefix>
        <el-icon>
          <component :is="prefixIcon" />
        </el-icon>
      </template>

      <template v-if="suffixIcon" #suffix>
        <el-icon>
          <component :is="suffixIcon" />
        </el-icon>
      </template>

      <template v-if="$slots.append" #append>
        <slot name="append"></slot>
      </template>
    </el-input>

    <!-- 搜索按钮（可选） -->
    <slot name="button">
      <el-button
        v-if="$slots.button"
        type="primary"
        :size="size"
        :disabled="disabled"
        class="search-button"
        @click="handleSearch"
      >
        <el-icon><Search /></el-icon>
      </el-button>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  &--small {
    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 16px;
      }
    }
  }

  &--default {
    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 18px;
      }
    }
  }

  &--large {
    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 20px;
      }
    }
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .search-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      transition: all 0.3s;
      box-shadow: 0 0 0 1px var(--el-border-color) inset;

      &:hover {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }
    }

    :deep(.el-input__prefix) {
      color: var(--el-text-color-placeholder);
    }

    :deep(.el-input__suffix) {
      color: var(--el-text-color-placeholder);
    }
  }

  .search-button {
    flex-shrink: 0;
    border-radius: 50%;
    padding: 8px;
    min-width: unset;
    width: 36px;
    height: 36px;
  }
}
</style>