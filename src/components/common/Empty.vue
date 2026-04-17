<script setup lang="ts">
interface Props {
  description?: string
  image?: string
  imageSize?: number
  icon?: string
  iconSize?: number
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  imageSize: 160,
  iconSize: 64,
  iconColor: '#909399'
})
</script>

<template>
  <div class="empty-wrapper">
    <div class="empty-content">
      <!-- 自定义图片 -->
      <div v-if="image" class="empty-image">
        <img :src="image" :style="{ width: `${imageSize}px`, height: `${imageSize}px` }" alt="empty" crossorigin="anonymous" />
      </div>

      <!-- 图标 -->
      <div v-else-if="icon" class="empty-icon">
        <el-icon :size="iconSize" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>

      <!-- 默认图标 -->
      <div v-else class="empty-icon">
        <el-icon :size="iconSize" :color="iconColor">
          <FolderOpened />
        </el-icon>
      </div>

      <!-- 描述文字 -->
      <p class="empty-description">{{ description }}</p>

      <!-- 额外操作 -->
      <div v-if="$slots.default" class="empty-action">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.empty-wrapper {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 400px;
    text-align: center;

    .empty-image {
      img {
        display: block;
        opacity: 0.5;
      }
    }

    .empty-icon {
      opacity: 0.3;
    }

    .empty-description {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      line-height: 1.6;
    }

    .empty-action {
      margin-top: 8px;
    }
  }
}
</style>