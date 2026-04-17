<template>
  <div class="welcome-step">
    <!-- 可滚动内容区域 -->
    <div class="welcome-step__scroll-content">
      <div class="welcome-step__content">
        <!-- Logo 区域 -->
        <div class="welcome-step__logo">
          <div class="welcome-step__logo-icon">💬</div>
          <h1 class="welcome-step__title">欢迎使用 ChatLog Session</h1>
        </div>

        <!-- 描述 -->
        <p class="welcome-step__description">查看和浏览您的聊天记录归档</p>

        <!-- 隐私声明 - 重点强调 -->
        <div class="welcome-step__privacy-banner">
          <div class="welcome-step__privacy-icon">🔒</div>
          <div class="welcome-step__privacy-content">
            <div class="welcome-step__privacy-title">100% 本地隐私保护</div>
            <div class="welcome-step__privacy-desc">
              这是一个<strong>纯前端应用</strong>，所有数据都在您的浏览器本地处理和存储，
              <strong>不会上传到任何服务器</strong>，您的隐私完全由您掌控
            </div>
          </div>
        </div>

        <!-- 功能列表 -->
        <div class="welcome-step__features">
          <div class="welcome-step__feature">
            <div class="welcome-step__feature-icon">🔐</div>
            <div class="welcome-step__feature-text">
              <div class="welcome-step__feature-title">本地数据存储</div>
              <div class="welcome-step__feature-desc">数据仅存储在浏览器本地</div>
            </div>
          </div>

          <div class="welcome-step__feature">
            <div class="welcome-step__feature-icon">📱</div>
            <div class="welcome-step__feature-text">
              <div class="welcome-step__feature-title">浏览所有会话记录</div>
              <div class="welcome-step__feature-desc">快速查看所有聊天会话</div>
            </div>
          </div>

          <div class="welcome-step__feature">
            <div class="welcome-step__feature-icon">💬</div>
            <div class="welcome-step__feature-text">
              <div class="welcome-step__feature-title">查看完整聊天历史</div>
              <div class="welcome-step__feature-desc">自动加载所有历史消息</div>
            </div>
          </div>

          <div class="welcome-step__feature">
            <div class="welcome-step__feature-icon">🔍</div>
            <div class="welcome-step__feature-text">
              <div class="welcome-step__feature-title">搜索联系人和消息</div>
              <div class="welcome-step__feature-desc">快速找到需要的内容</div>
            </div>
          </div>

          <div class="welcome-step__feature">
            <div class="welcome-step__feature-icon">📊</div>
            <div class="welcome-step__feature-text">
              <div class="welcome-step__feature-title">支持多种消息类型</div>
              <div class="welcome-step__feature-desc">文字、图片、视频等</div>
            </div>
          </div>

          <div class="welcome-step__feature">
            <div class="welcome-step__feature-icon">🚫</div>
            <div class="welcome-step__feature-text">
              <div class="welcome-step__feature-title">零服务器追踪</div>
              <div class="welcome-step__feature-desc">不记录任何用户行为数据</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 固定在底部的按钮区域 -->
    <div class="welcome-step__actions">
      <el-button type="primary" size="large" @click="handleStart">
        开始配置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  next: []
}>()

const handleStart = () => {
  emit('next')
}
</script>

<style scoped lang="scss">
.welcome-step {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  &__scroll-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 40px 20px 20px;
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
  }

  &__content {
    max-width: 700px;
    width: 100%;
    margin: 0 auto;
    text-align: center;
  }

  &__logo {
    margin-bottom: 32px;
  }

  &__logo-icon {
    font-size: 80px;
    margin-bottom: 16px;
    animation: bounce 2s ease-in-out infinite;
  }

  &__title {
    font-size: 32px;
    font-weight: 600;
    color: #303133;
    margin: 0;
    line-height: 1.4;
  }

  &__description {
    font-size: 18px;
    color: #606266;
    margin: 0 0 32px 0;
    line-height: 1.6;
  }

  &__privacy-banner {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    margin: 0 auto 40px;
    max-width: 580px;
    background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%);
    border: 2px solid #4caf50;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.2);
    animation: pulseGlow 3s ease-in-out infinite;
  }

  &__privacy-icon {
    font-size: 40px;
    flex-shrink: 0;
    animation: shake 2s ease-in-out infinite;
  }

  &__privacy-content {
    flex: 1;
    text-align: left;
  }

  &__privacy-title {
    font-size: 18px;
    font-weight: 700;
    color: #2e7d32;
    margin-bottom: 8px;
    letter-spacing: 0.3px;
  }

  &__privacy-desc {
    font-size: 14px;
    color: #455a64;
    line-height: 1.7;

    strong {
      color: #1b5e20;
      font-weight: 600;
    }
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 48px;
    text-align: left;
  }

  &__feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    background: #f5f7fa;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
      background: #ecf5ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    }
  }

  &__feature-icon {
    font-size: 36px;
    flex-shrink: 0;
  }

  &__feature-text {
    flex: 1;
  }

  &__feature-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
  }

  &__feature-desc {
    font-size: 13px;
    color: #909399;
    line-height: 1.5;
  }

  &__actions {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: white;
    border-top: 1px solid #ebeef5;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

    .el-button {
      min-width: 160px;
      padding: 12px 32px;
      font-size: 16px;
    }
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.2);
  }
  50% {
    box-shadow: 0 6px 24px rgba(76, 175, 80, 0.4);
  }
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

@media (max-width: 768px) {
  .welcome-step {
    &__scroll-content {
      padding: 20px 16px 16px;
    }

    &__logo-icon {
      font-size: 60px;
      margin-bottom: 16px;
    }

    &__title {
      font-size: 24px;
    }

    &__description {
      font-size: 16px;
      margin-bottom: 32px;
    }

    &__privacy-banner {
      flex-direction: column;
      padding: 16px 20px;
      margin-bottom: 32px;
      gap: 12px;
    }

    &__privacy-icon {
      font-size: 36px;
    }

    &__privacy-content {
      text-align: center;
    }

    &__privacy-title {
      font-size: 16px;
    }

    &__privacy-desc {
      font-size: 13px;
    }

    &__features {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    &__feature {
      padding: 16px 12px;
    }

    &__feature-icon {
      font-size: 32px;
    }

    &__feature-title {
      font-size: 14px;
    }

    &__feature-desc {
      font-size: 12px;
    }

    &__actions {
      padding: 16px;

      .el-button {
        min-width: 140px;
        font-size: 14px;
        padding: 10px 24px;
      }
    }
  }
}
</style>