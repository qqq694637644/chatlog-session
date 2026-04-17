import { ref, computed } from 'vue'
import { useContactStore } from '@/stores/contact'
import { ElMessage } from 'element-plus'
import type { Session } from '@/types'

/**
 * 会话详情管理 composable
 * 负责会话详情抽屉管理、联系人ID计算
 */
export function useSessionDetail(currentSession: () => Session | null) {
  const contactStore = useContactStore()

  // 会话详情抽屉可见性
  const sessionDetailDrawerVisible = ref(false)

  // 根据会话类型获取联系人 ID
  const sessionDetailContactId = computed(() => {
    if (!currentSession()) return ''

    // 对于群聊，使用 talker（群 ID）
    // 对于私聊，使用 talker（对方的 wxid）
    // talker 字段包含了实际的联系人 wxid 或群 ID
    return currentSession()?.talker || currentSession()?.id || ''
  })

  // 会话详情抽屉标题
  const sessionDetailDrawerTitle = computed(() => {
    if (!currentSession()) return '会话详情'

    // 优先使用 displayName，然后使用 remark、name、talkerName
    const name = currentSession()?.remark ||
                 currentSession()?.name ||
                 currentSession()?.talkerName

    return name || '会话详情'
  })

  /**
   * 处理显示会话详情
   */
  const handleShowSessionDetail = () => {
    if (!currentSession()) {
      ElMessage.warning('请先选择一个会话')
      return
    }

    // 调试信息
    console.log('🔍 打开会话详情')
    console.log('currentSession:', currentSession())
    console.log('sessionDetailContactId:', sessionDetailContactId.value)
    console.log('contactStore.contacts 数量:', contactStore.contacts.length)

    // 查找匹配的联系人
    const matchedContact = contactStore.contacts.find(c => c.wxid === sessionDetailContactId.value)
    console.log('找到的联系人:', matchedContact)

    sessionDetailDrawerVisible.value = true
  }

  /**
   * 关闭会话详情抽屉
   */
  const closeSessionDetail = () => {
    sessionDetailDrawerVisible.value = false
  }

  /**
   * 获取匹配的联系人信息
   */
  const matchedContact = computed(() => {
    if (!sessionDetailContactId.value) return null
    return contactStore.contacts.find(c => c.wxid === sessionDetailContactId.value) || null
  })

  /**
   * 获取会话详情数据
   */
  const sessionDetailData = computed(() => {
    if (!currentSession()) return null

    return {
      session: currentSession(),
      contactId: sessionDetailContactId.value,
      contact: matchedContact.value,
      title: sessionDetailDrawerTitle.value,
      hasContact: !!matchedContact.value
    }
  })

  return {
    // 状态
    sessionDetailDrawerVisible,
    
    // 计算属性
    sessionDetailContactId,
    sessionDetailDrawerTitle,
    matchedContact,
    sessionDetailData,
    
    // 方法
    handleShowSessionDetail,
    closeSessionDetail,
  }
}