import { ref, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'

/**
 * 移动端手势 composable
 * 负责移动端手势返回功能
 */
export function useMobileGesture() {
  const appStore = useAppStore()

  // 手势相关状态
  const touchStartX = ref(0)
  const touchCurrentX = ref(0)
  const isDragging = ref(false)
  const chatPageRef = ref<HTMLElement | null>(null)

  /**
   * 处理触摸开始事件
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (!appStore.isMobile || !appStore.showMessageList) return

    const touch = e.touches[0]
    touchStartX.value = touch.clientX
    touchCurrentX.value = touch.clientX

    // 只在左边缘20px内触发
    if (touch.clientX < 20) {
      isDragging.value = true
    }
  }

  /**
   * 处理触摸移动事件
   */
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.value) return

    const touch = e.touches[0]
    touchCurrentX.value = touch.clientX
    const deltaX = touchCurrentX.value - touchStartX.value

    // 只允许向右滑动
    if (deltaX > 0) {
      e.preventDefault()

      if (chatPageRef.value) {
        const panel = chatPageRef.value.querySelector('.message-panel') as HTMLElement
        if (panel) {
          const offset = Math.min(deltaX, window.innerWidth)
          panel.style.transform = `translateX(${offset}px)`
          panel.style.transition = 'none'
        }
      }
    }
  }

  /**
   * 处理触摸结束事件
   */
  const handleTouchEnd = () => {
    if (!isDragging.value) return

    const deltaX = touchCurrentX.value - touchStartX.value
    const threshold = window.innerWidth * 0.3

    if (chatPageRef.value) {
      const panel = chatPageRef.value.querySelector('.message-panel') as HTMLElement
      if (panel) {
        panel.style.transition = 'transform 0.3s ease-out'

        if (deltaX > threshold) {
          // 完成返回
          panel.style.transform = `translateX(100%)`
          setTimeout(() => {
            appStore.navigateBack()
            panel.style.transform = ''
          }, 300)
        } else {
          // 回弹
          panel.style.transform = ''
        }
      }
    }

    isDragging.value = false
    touchStartX.value = 0
    touchCurrentX.value = 0
  }

  /**
   * 绑定手势事件到元素
   */
  const bindGestureEvents = (element: HTMLElement) => {
    chatPageRef.value = element
    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchEnd)
  }

  /**
   * 解绑手势事件
   */
  const unbindGestureEvents = () => {
    if (chatPageRef.value) {
      chatPageRef.value.removeEventListener('touchstart', handleTouchStart)
      chatPageRef.value.removeEventListener('touchmove', handleTouchMove)
      chatPageRef.value.removeEventListener('touchend', handleTouchEnd)
      chatPageRef.value = null
    }
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    unbindGestureEvents()
  })

  return {
    // 状态
    touchStartX,
    touchCurrentX,
    isDragging,
    chatPageRef,
    
    // 方法
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    bindGestureEvents,
    unbindGestureEvents,
  }
}