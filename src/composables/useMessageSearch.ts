import { ref, computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import { ElMessage } from 'element-plus'
import type { Session, Message } from '@/types'

/**
 * 消息搜索管理 composable
 * 负责搜索对话框管理、消息定位逻辑
 */
export function useMessageSearch(
  currentSession: () => Session | null,
  onSessionSelect?: (session: Session) => void,
  onMessageScroll?: (messageId: string) => void
) {
  const sessionStore = useSessionStore()

  // 搜索对话框可见性
  const searchDialogVisible = ref(false)

  /**
   * 处理搜索消息（打开搜索对话框）
   */
  const handleSearchMessages = () => {
    if (!currentSession()) {
      ElMessage.warning('请先选择一个会话')
      return
    }

    // 打开搜索对话框
    searchDialogVisible.value = true
  }

  /**
   * 处理搜索结果中的消息点击
   */
  const handleSearchMessageClick = (message: Message) => {
    // 如果点击的消息来自不同的会话，先切换会话
    if (message.talker && message.talker !== currentSession()?.talker) {
      const targetSession = sessionStore.sessions.find((s: Session) => s.talker === message.talker)
      if (targetSession) {
        // 调用外部提供的会话选择回调
        onSessionSelect?.(targetSession)
      }
    }

    // 定位到消息
    if (message.id) {
      // 延迟执行，确保会话切换完成
      setTimeout(() => {
        // 调用外部提供的消息滚动回调
        onMessageScroll?.(message.id.toString())
      }, 300)
    }
  }

  /**
   * 打开搜索对话框
   */
  const openSearchDialog = () => {
    searchDialogVisible.value = true
  }

  /**
   * 关闭搜索对话框
   */
  const closeSearchDialog = () => {
    searchDialogVisible.value = false
  }

  /**
   * 切换搜索对话框可见性
   */
  const toggleSearchDialog = () => {
    searchDialogVisible.value = !searchDialogVisible.value
  }

  /**
   * 检查是否可以搜索消息
   */
  const canSearchMessages = computed(() => {
    return !!currentSession()
  })

  return {
    // 状态
    searchDialogVisible,

    // 计算属性
    canSearchMessages,

    // 方法
    handleSearchMessages,
    handleSearchMessageClick,
    openSearchDialog,
    closeSearchDialog,
    toggleSearchDialog,
  }
}
