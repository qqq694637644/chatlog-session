/**
 * 消息通知 Store
 * 管理消息通知功能
 * 
 * 功能：
 * - 检测 @我 的消息
 * - 检测引用我的消息
 * - 浏览器原生通知
 * - 通知去重机制
 * - 通知历史记录
 * - 通知权限管理
 * - 通知设置
 */

import { defineStore } from 'pinia'
import { useAppStore } from './app'
import { useContactStore } from './contact'
import type { Message } from '@/types/message'

/**
 * 通知类型
 */
export enum NotificationType {
  MENTION = 'mention',      // @我
  QUOTE = 'quote',          // 引用我
  MESSAGE = 'message',      // 普通消息
}

/**
 * 通知项
 */
interface NotificationItem {
  id: string
  type: NotificationType
  talker: string
  talkerName: string
  message: Message
  timestamp: number
  read: boolean
  clicked: boolean
}

/**
 * 通知配置
 */
interface NotificationConfig {
  enabled: boolean              // 全局开关
  enableMention: boolean        // @我通知
  enableQuote: boolean          // 引用通知
  enableMessage: boolean        // 普通消息通知
  enableSound: boolean          // 声音提示
  enableVibrate: boolean        // 震动提示
  muteList: string[]            // 静音列表
  onlyShowLatest: boolean       // 只显示最新一条
  maxNotifications: number      // 最大通知数
  autoClose: number             // 自动关闭时间（秒，0 表示不自动关闭）
  myWxid?: string               // 我的微信 ID，用于识别 @我
  showMessageContent: boolean   // 是否在通知中显示消息具体内容（隐私设置）
}

/**
 * 通知权限状态
 */
type PermissionStatus = 'default' | 'granted' | 'denied'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  enableMention: true,
  enableQuote: true,
  enableMessage: false,         // 默认不通知普通消息
  enableSound: true,
  enableVibrate: false,
  muteList: [],
  onlyShowLatest: true,
  maxNotifications: 5,
  autoClose: 5,                 // 5秒后自动关闭
  myWxid: undefined,            // 需要用户手动配置
  showMessageContent: true,     // 默认显示消息内容
}

/**
 * 存储键
 */
const CONFIG_KEY = 'chatlog_notification_config'
const HISTORY_KEY = 'chatlog_notification_history'
const NOTIFIED_KEY = 'chatlog_notified_messages'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    config: { ...DEFAULT_CONFIG },
    permission: 'default' as PermissionStatus,
    history: [] as NotificationItem[],
    notifiedIds: new Set<string>(),  // 已通知的消息 ID
    activeNotifications: new Map<string, Notification>(),  // 活跃的通知对象
    initialized: false,
  }),

  getters: {
    /**
     * 是否启用通知
     */
    isEnabled: (state): boolean => {
      return state.config.enabled && state.permission === 'granted'
    },

    /**
     * 是否需要请求权限
     */
    needsPermission: (state): boolean => {
      return state.permission === 'default'
    },

    /**
     * 未读通知数
     */
    unreadCount: (state): number => {
      return state.history.filter(item => !item.read).length
    },

    /**
     * 最近的通知
     */
    recentNotifications: (state) => (limit = 10): NotificationItem[] => {
      return [...state.history]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
    },

    /**
     * 是否静音
     */
    isMuted: (state) => (talker: string): boolean => {
      return state.config.muteList.includes(talker)
    },
  },

  actions: {
    /**
     * 初始化
     */
    async init() {
      if (this.initialized) return

      this.loadConfig()
      this.loadHistory()
      this.loadNotifiedIds()
      await this.checkPermission()
      
      this.initialized = true

      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log('🔔 Notification store initialized', {
          permission: this.permission,
          enabled: this.isEnabled,
        })
      }
    },

    /**
     * 检查通知权限
     */
    async checkPermission(): Promise<PermissionStatus> {
      if (!('Notification' in window)) {
        this.permission = 'denied'
        return 'denied'
      }

      this.permission = Notification.permission as PermissionStatus
      return this.permission
    },

    /**
     * 请求通知权限
     */
    async requestPermission(): Promise<PermissionStatus> {
      if (!('Notification' in window)) {
        this.permission = 'denied'
        return 'denied'
      }

      if (this.permission === 'granted') {
        return 'granted'
      }

      try {
        const result = await Notification.requestPermission()
        this.permission = result as PermissionStatus

        const appStore = useAppStore()
        if (appStore.isDebug) {
          console.log('🔔 Notification permission:', result)
        }

        return this.permission
      } catch (error) {
        console.error('Failed to request notification permission:', error)
        this.permission = 'denied'
        return 'denied'
      }
    },

    /**
     * 加载配置
     */
    loadConfig() {
      try {
        const data = sessionStorage.getItem(CONFIG_KEY)
        if (data) {
          this.config = { ...this.config, ...JSON.parse(data) }
        }
      } catch (error) {
        console.error('Failed to load notification config:', error)
      }
    },

    /**
     * 保存配置
     */
    saveConfig() {
      try {
        sessionStorage.setItem(CONFIG_KEY, JSON.stringify(this.config))
      } catch (error) {
        console.error('Failed to save notification config:', error)
      }
    },

    /**
     * 更新配置
     */
    updateConfig(config: Partial<NotificationConfig>) {
      this.config = { ...this.config, ...config }
      this.saveConfig()

      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log('🔔 Notification config updated:', this.config)
      }
    },

    /**
     * 加载通知历史
     */
    loadHistory() {
      try {
        const data = sessionStorage.getItem(HISTORY_KEY)
        if (data) {
          this.history = JSON.parse(data)
        }
      } catch (error) {
        console.error('Failed to load notification history:', error)
      }
    },

    /**
     * 保存通知历史
     */
    saveHistory() {
      try {
        // 只保留最近的通知
        const recent = this.history
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 100)
        
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(recent))
      } catch (error) {
        console.error('Failed to save notification history:', error)
      }
    },

    /**
     * 加载已通知的消息 ID
     */
    loadNotifiedIds() {
      try {
        const data = sessionStorage.getItem(NOTIFIED_KEY)
        if (data) {
          this.notifiedIds = new Set(JSON.parse(data))
        }
      } catch (error) {
        console.error('Failed to load notified IDs:', error)
      }
    },

    /**
     * 保存已通知的消息 ID
     */
    saveNotifiedIds() {
      try {
        const ids = Array.from(this.notifiedIds).slice(-1000)  // 只保留最近 1000 个
        sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids))
      } catch (error) {
        console.error('Failed to save notified IDs:', error)
      }
    },

    /**
     * 检测消息是否需要通知
     */
    shouldNotify(message: Message, talker: string, myWxid?: string): NotificationType | null {
      // 如果未启用通知
      if (!this.isEnabled) return null

      // 如果是我自己发的消息
      if (message.isSend) return null

      // 如果已经通知过
      const messageId = `${message.id}_${message.seq}`
      if (this.notifiedIds.has(messageId)) return null

      // 如果在静音列表中
      if (this.isMuted(talker)) return null

      // 检测 @我
      if (this.config.enableMention && this.isMentioned(message, myWxid)) {
        return NotificationType.MENTION
      }

      // 检测引用我
      if (this.config.enableQuote && this.isQuoted(message, myWxid)) {
        return NotificationType.QUOTE
      }

      // 普通消息
      if (this.config.enableMessage) {
        return NotificationType.MESSAGE
      }

      return null
    },

    /**
     * 检测是否 @我
     */
    isMentioned(message: Message, myWxid?: string): boolean {
      if (!myWxid) return false

      // 文本消息中检测 @
      if (message.type === 1 && message.content) {
        // 检测 @all
        if (message.content.includes('@所有人') || message.content.includes('@All')) {
          return true
        }

        // 优先使用配置中的 myWxid
        const wxid = myWxid || this.config.myWxid
        if (!wxid) return false

        // 检测 @我的微信号
        if (message.content.includes(`@${wxid}`)) {
          return true
        }

        // 检测 @我的昵称（需要从联系人信息中获取）
        const contactStore = useContactStore()
        const myContact = contactStore.contacts.find(c => c.wxid === wxid)
        const displayName = myContact?.remark || myContact?.nickname
        if (myContact && displayName && message.content.includes(`@${displayName}`)) {
          return true
        }
      }

      return false
    },

    /**
     * 检测是否引用我
     */
    isQuoted(message: Message, myWxid?: string): boolean {
      if (!myWxid) return false

      // TODO: 根据实际的引用消息结构来实现
      // 这里需要检查消息的引用字段
      // 示例：如果消息有 quotedMessage 字段
      if (message.type === 49) {
        // XML 消息可能包含引用信息
        if (message.content && message.content.includes(myWxid)) {
          return true
        }
      }

      return false
    },

    /**
     * 发送通知
     */
    async notify(
      type: NotificationType,
      talker: string,
      talkerName: string,
      message: Message
    ): Promise<void> {
      // 检查权限
      if (!this.isEnabled) {
        const appStore = useAppStore()
        if (appStore.isDebug) {
          console.log('🔔 Notification disabled, skipping')
        }
        return
      }

      // 去重检查
      const messageId = `${message.id}_${message.seq}`
      if (this.notifiedIds.has(messageId)) {
        return
      }

      // 构建通知内容
      const { title, body, icon } = this.buildNotification(type, talkerName, message)

      try {
        // 如果只显示最新一条，关闭之前的通知
        if (this.config.onlyShowLatest) {
          this.closeAllNotifications()
        }

        // 检查通知数量限制
        if (this.activeNotifications.size >= this.config.maxNotifications) {
          this.closeOldestNotification()
        }

        // 创建通知
        const notification = new Notification(title, {
          body,
          icon,
          tag: talker,  // 使用 talker 作为 tag，相同联系人的通知会替换
          requireInteraction: this.config.autoClose === 0,
          silent: !this.config.enableSound,
        })

        // 通知点击事件
        notification.onclick = () => {
          this.handleNotificationClick(messageId, talker, message)
        }

        // 通知关闭事件
        notification.onclose = () => {
          this.activeNotifications.delete(messageId)
        }

        // 自动关闭
        if (this.config.autoClose > 0) {
          setTimeout(() => {
            notification.close()
          }, this.config.autoClose * 1000)
        }

        // 保存通知对象
        this.activeNotifications.set(messageId, notification)

        // 震动
        if (this.config.enableVibrate && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200])
        }

        // 记录通知
        this.addToHistory(type, talker, talkerName, message)
        this.notifiedIds.add(messageId)
        this.saveNotifiedIds()

        const appStore = useAppStore()
        if (appStore.isDebug) {
          console.log('🔔 Notification sent:', { type, talker, title, body })
        }
      } catch (error) {
        console.error('Failed to send notification:', error)
      }
    },

    /**
     * 构建通知内容
     */
    buildNotification(
      type: NotificationType,
      talkerName: string,
      message: Message
    ): { title: string; body: string; icon: string } {
      const icon = '/logo.png'  // 使用应用图标
      
      // 获取发送者显示名称
      const contactStore = useContactStore()
      const sender = contactStore.contacts.find(c => c.wxid === message.talker)
      const senderName = sender?.remark || sender?.nickname || message.talker
      
      let title = ''
      let body = ''

      // 根据隐私设置决定是否显示具体内容
      if (this.config.showMessageContent) {
        // 显示具体内容
        const preview = this.getMessagePreview(message)
        
        // 根据类型构建标题和内容
        switch (type) {
          case NotificationType.MENTION:
            title = `${talkerName} - ${senderName} 提到了你`
            body = preview
            break
          case NotificationType.QUOTE:
            title = `${talkerName} - ${senderName} 引用了你`
            body = preview
            break
          case NotificationType.MESSAGE:
            title = `${talkerName} - ${senderName}`
            body = preview
            break
          default:
            title = talkerName
            body = preview
        }
      } else {
        // 隐私模式：不显示具体内容
        switch (type) {
          case NotificationType.MENTION:
            title = `${talkerName}`
            body = `${senderName} 提到了你`
            break
          case NotificationType.QUOTE:
            title = `${talkerName}`
            body = `${senderName} 引用了你`
            break
          case NotificationType.MESSAGE:
            title = `${talkerName}`
            body = `${senderName} 发来了新消息`
            break
          default:
            title = talkerName
            body = '您有新消息'
        }
      }

      return { title, body, icon }
    },

    /**
     * 获取消息预览文本
     */
    getMessagePreview(message: Message): string {
      switch (message.type) {
        case 1: {  // 文本
          // 限制长度，避免通知过长
          const content = message.content || '新消息'
          return content.length > 50 ? content.substring(0, 50) + '...' : content
        }
        case 3:  // 图片
          return '[图片]'
        case 34: // 语音
          return '[语音]'
        case 43: // 视频
          return '[视频]'
        case 47: // 表情
          return '[表情]'
        case 49: // 文件/链接
          return '[文件]'
        default:
          return '新消息'
      }
    },

    /**
     * 处理通知点击
     */
    handleNotificationClick(messageId: string, talker: string, message: Message) {
      // 标记为已点击
      const item = this.history.find(h => h.id === messageId)
      if (item) {
        item.clicked = true
        item.read = true
        this.saveHistory()
      }

      // 关闭通知
      const notification = this.activeNotifications.get(messageId)
      if (notification) {
        notification.close()
      }

      // 跳转到对应会话和消息
      // 触发自定义事件，由应用层处理跳转
      window.dispatchEvent(new CustomEvent('chatlog-notification-click', {
        detail: { talker, message }
      }))

      // 聚焦窗口
      if (window.focus) {
        window.focus()
      }

      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log('🔔 Notification clicked:', { talker, messageId })
      }
    },

    /**
     * 添加到历史记录
     */
    addToHistory(
      type: NotificationType,
      talker: string,
      talkerName: string,
      message: Message
    ) {
      const id = `${message.id}_${message.seq}`
      
      const item: NotificationItem = {
        id,
        type,
        talker,
        talkerName,
        message,
        timestamp: Date.now(),
        read: false,
        clicked: false,
      }

      this.history.unshift(item)

      // 限制历史记录数量
      if (this.history.length > 100) {
        this.history = this.history.slice(0, 100)
      }

      this.saveHistory()
    },

    /**
     * 标记通知为已读
     */
    markAsRead(id: string) {
      const item = this.history.find(h => h.id === id)
      if (item) {
        item.read = true
        this.saveHistory()
      }
    },

    /**
     * 标记所有通知为已读
     */
    markAllAsRead() {
      this.history.forEach(item => {
        item.read = true
      })
      this.saveHistory()
    },

    /**
     * 清空通知历史
     */
    clearHistory() {
      this.history = []
      this.saveHistory()
    },

    /**
     * 关闭所有通知
     */
    closeAllNotifications() {
      this.activeNotifications.forEach(notification => {
        notification.close()
      })
      this.activeNotifications.clear()
    },

    /**
     * 关闭最旧的通知
     */
    closeOldestNotification() {
      const entries = Array.from(this.activeNotifications.entries())
      if (entries.length > 0) {
        const [id, notification] = entries[0]
        notification.close()
        this.activeNotifications.delete(id)
      }
    },

    /**
     * 添加到静音列表
     */
    mute(talker: string) {
      if (!this.config.muteList.includes(talker)) {
        this.config.muteList.push(talker)
        this.saveConfig()
      }
    },

    /**
     * 从静音列表移除
     */
    unmute(talker: string) {
      const index = this.config.muteList.indexOf(talker)
      if (index > -1) {
        this.config.muteList.splice(index, 1)
        this.saveConfig()
      }
    },

    /**
     * 切换静音状态
     */
    toggleMute(talker: string): boolean {
      if (this.isMuted(talker)) {
        this.unmute(talker)
        return false
      } else {
        this.mute(talker)
        return true
      }
    },

    /**
     * 批量检测和发送通知
     */
    async checkMessages(messages: Message[], talker: string, talkerName: string, myWxid?: string) {
      if (!this.isEnabled) return

      for (const message of messages) {
        const type = this.shouldNotify(message, talker, myWxid)
        if (type) {
          await this.notify(type, talker, talkerName, message)
        }
      }
    },

    /**
     * 测试通知
     */
    async testNotification() {
      const appStore = useAppStore()
      
      if (appStore.isDebug) {
        console.log('🔔 Testing notification...', {
          permission: this.permission,
          enabled: this.config.enabled,
          isEnabled: this.isEnabled
        })
      }

      // 检查权限
      if (this.permission !== 'granted') {
        console.warn('⚠️ Notification permission not granted, requesting...')
        const result = await this.requestPermission()
        if (result !== 'granted') {
          console.error('❌ Notification permission denied')
          return false
        }
      }

      if (this.permission === 'granted') {
        try {
          // 强制创建通知，不检查 config.enabled
          const notification = new Notification('Chatlog Session 通知测试', {
            body: '通知功能正常工作！✨',
            icon: '/logo.png',
            tag: 'test-notification',
            requireInteraction: false,
          })

          if (appStore.isDebug) {
            console.log('✅ Test notification created successfully')
          }

          // 通知点击事件
          notification.onclick = () => {
            console.log('🔔 Test notification clicked')
            notification.close()
            if (window.focus) {
              window.focus()
            }
          }

          // 通知关闭事件
          notification.onclose = () => {
            if (appStore.isDebug) {
              console.log('🔔 Test notification closed')
            }
          }

          // 通知错误事件
          notification.onerror = (error) => {
            console.error('❌ Test notification error:', error)
          }

          // 3秒后自动关闭
          setTimeout(() => {
            notification.close()
          }, 3000)

          return true
        } catch (error) {
          console.error('❌ Failed to create test notification:', error)
          return false
        }
      }

      console.error('❌ Notification permission not granted')
      return false
    },

    /**
     * 获取统计信息
     */
    getStats() {
      return {
        enabled: this.isEnabled,
        permission: this.permission,
        totalNotifications: this.history.length,
        unreadCount: this.unreadCount,
        activeCount: this.activeNotifications.size,
        muteCount: this.config.muteList.length,
        notifiedCount: this.notifiedIds.size,
        config: this.config,
      }
    },
  },
})