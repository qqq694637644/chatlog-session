import { ref, computed, watchEffect } from 'vue'
import { useAppStore } from '@/stores/app'
import { useChatroomStore } from '@/stores/chatroom'
import { useChatStore } from '@/stores/chat'
import type { Session } from '@/types'

/**
 * 移动端会话信息 composable
 * 负责移动端副标题计算、会话信息格式化
 */
export function useMobileSessionInfo(currentSession: () => Session | null) {
  const appStore = useAppStore()
  const chatroomStore = useChatroomStore()
  const chatStore = useChatStore()

  // 移动端副标题（显示会话类型和消息数）
  const mobileSubtitle = ref('')

  // 监听会话变化，更新副标题
  watchEffect(async () => {
    if (!currentSession() || !appStore.isMobile) {
      mobileSubtitle.value = ''
      return
    }

    const parts: string[] = []

    // 会话类型
    switch (currentSession()?.type) {
      case 'private':
        parts.push('私聊')
        break
      case 'group':
        parts.push('群聊')
        break
      case 'official':
        parts.push('公众号')
        break
    }

    // 根据会话类型显示不同信息
    if (currentSession()?.type === 'group') {
      // 群聊显示群人数（需要从 store 获取）
      const memberCount = await chatroomStore.getChatroomMemberCount(currentSession()?.id || '')
      if (memberCount > 0) {
        parts.push(`${memberCount}人`)
      }
    } else {
      // 非群聊显示消息总数
      const messageCount = chatStore.messages.length
      if (messageCount > 0) {
        parts.push(`${messageCount}条消息`)
      }
    }

    mobileSubtitle.value = parts.join(' · ')
  })

  // 获取会话类型文本
  const sessionTypeText = computed(() => {
    switch (currentSession()?.type) {
      case 'private':
        return '私聊'
      case 'group':
        return '群聊'
      case 'official':
        return '公众号'
      default:
        return ''
    }
  })

  // 获取会话统计信息
  const sessionStats = computed(() => {
    if (!currentSession()) return null

    return {
      type: currentSession()?.type,
      memberCount: 0, // 需要异步获取
      messageCount: chatStore.messages.length,
      lastTime: currentSession()?.lastTime
    }
  })

  // 格式化会话信息用于显示
  const formattedSessionInfo = computed(() => {
    if (!currentSession()) return ''

    const info = []
    
    // 会话类型
    info.push(sessionTypeText.value)

    // 如果是群聊，添加成员数（需要异步获取）
    if (currentSession()?.type === 'group') {
      info.push('群聊')
    }

    // 消息数量
    if (chatStore.messages.length > 0) {
      info.push(`${chatStore.messages.length}条消息`)
    }

    return info.join(' · ')
  })

  return {
    // 状态
    mobileSubtitle,
    
    // 计算属性
    sessionTypeText,
    sessionStats,
    formattedSessionInfo,
  }
}