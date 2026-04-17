/**
 * 自动刷新 Store
 * 管理消息的后台自动刷新
 *
 * 功能：
 * - 检测有新消息的联系人
 * - 后台刷新队列管理
 * - 并发控制
 * - 刷新进度和状态提示
 * - 智能刷新策略
 */

import { defineStore } from 'pinia'
import { chatlogAPI } from '@/api/chatlog'
import { useMessageCacheStore } from './messageCache'
import { useAppStore } from './app'
import { useNotificationStore } from './notification'
import { useContactStore } from './contact'
import type { Message } from '@/types/message'
import { toCST, formatCSTRange } from '@/utils/timezone'

/**
 * 刷新任务状态
 */
export enum RefreshStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

/**
 * 刷新任务
 */
interface RefreshTask {
  talker: string
  priority: number
  status: RefreshStatus
  startTime?: number
  endTime?: number
  error?: string
  retryCount: number
  startFromTime?: string  // 刷新起始时间（缓存最后一条消息的时间，东八区 ISO 格式）
}

/**
 * 刷新配置
 */
interface RefreshConfig {
  enabled: boolean
  interval: number          // 自动刷新间隔（毫秒）
  maxConcurrency: number    // 最大并发数
  maxRetries: number        // 最大重试次数
  timeout: number           // 请求超时时间（毫秒）
  batchSize: number         // 批量刷新大小
  pageSize: number          // 每次获取的消息数量
}

/**
 * 刷新统计
 */
interface RefreshStats {
  totalTasks: number
  successCount: number
  failedCount: number
  averageTime: number
  lastRefreshTime: number
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: RefreshConfig = {
  enabled: true,
  interval: 5 * 60 * 1000,  // 5分钟
  maxConcurrency: 3,
  maxRetries: 2,
  timeout: 10000,           // 10秒
  batchSize: 10,
  pageSize: 200,            // 每次获取200条消息
}

export const useAutoRefreshStore = defineStore('autoRefresh', {
  state: () => ({
    config: { ...DEFAULT_CONFIG },
    tasks: [] as RefreshTask[],
    activeCount: 0,
    stats: {
      totalTasks: 0,
      successCount: 0,
      failedCount: 0,
      averageTime: 0,
      lastRefreshTime: 0,
    } as RefreshStats,
    timer: null as number | null,
    needsRefreshTalkers: [] as string[],
  }),

  getters: {
    /**
     * 等待中的任务
     */
    pendingTasks: (state): RefreshTask[] => {
      return state.tasks.filter(t => t.status === RefreshStatus.PENDING)
    },

    /**
     * 运行中的任务
     */
    runningTasks: (state): RefreshTask[] => {
      return state.tasks.filter(t => t.status === RefreshStatus.RUNNING)
    },

    /**
     * 是否正在刷新
     */
    isRefreshing: (state): boolean => {
      return state.activeCount > 0
    },

    /**
     * 刷新进度
     */
    progress: (state): number => {
      if (state.tasks.length === 0) return 0
      const completed = state.tasks.filter(
        t => t.status === RefreshStatus.SUCCESS || t.status === RefreshStatus.FAILED
      ).length
      return Math.round((completed / state.tasks.length) * 100)
    },

    /**
     * 是否启用
     */
    isEnabled: (state): boolean => {
      return state.config.enabled
    },
  },

  actions: {
    /**
     * 初始化
     */
    init() {
      const appStore = useAppStore()
      this.loadConfig()
      if (this.config.enabled) {
        this.startAutoRefresh()
      }
      if (appStore.isDebug) {
        console.log('🔄 AutoRefresh store initialized')
      }
    },

    /**
     * 加载配置
     */
    loadConfig() {
      try {
        const data = localStorage.getItem('auto_refresh_config')
        if (data) {
          this.config = { ...this.config, ...JSON.parse(data) }
        }
      } catch (error) {
        console.error('Failed to load auto-refresh config:', error)
      }
    },

    /**
     * 保存配置
     */
    saveConfig() {
      try {
        localStorage.setItem('auto_refresh_config', JSON.stringify(this.config))
      } catch (error) {
        console.error('Failed to save auto-refresh config:', error)
      }
    },

    /**
     * 更新配置
     */
    updateConfig(config: Partial<RefreshConfig>) {
      const wasEnabled = this.config.enabled
      this.config = { ...this.config, ...config }
      this.saveConfig()

      // 处理启用/禁用状态变化
      if (!wasEnabled && this.config.enabled) {
        this.startAutoRefresh()
      } else if (wasEnabled && !this.config.enabled) {
        this.stopAutoRefresh()
      }
    },

    /**
     * 启动自动刷新
     */
    startAutoRefresh() {
      if (this.timer) return

      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log('🔄 Starting auto-refresh...')
      }

      // 立即执行一次
      this.refreshAll()

      // 设置定时器
      this.timer = window.setInterval(() => {
        this.refreshAll()
      }, this.config.interval)
    },

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
      if (this.timer) {
        const appStore = useAppStore()
        if (appStore.isDebug) {
          console.log('⏹️ Stopping auto-refresh...')
        }
        clearInterval(this.timer)
        this.timer = null
      }
    },

    /**
     * 添加刷新任务
     */
    addTask(talker: string, priority = 0, startFromTime?: string): RefreshTask {
      const appStore = useAppStore()
      // 检查是否已存在
      const existingIndex = this.tasks.findIndex(t => t.talker === talker)
      
      if (existingIndex >= 0) {
        const existingTask = this.tasks[existingIndex]
        
        // 如果旧任务不是 running 状态，用新任务覆盖
        if (existingTask.status !== RefreshStatus.RUNNING) {
          if (appStore.isDebug) {
            console.log(`🔄 Replacing existing task (status: ${existingTask.status}) with new task for ${talker}`)
          }
          const newTask: RefreshTask = {
            talker,
            priority,
            status: RefreshStatus.PENDING,
            retryCount: 0,
            startFromTime,
          }
          this.tasks[existingIndex] = newTask
          return newTask
        }
        
        // 如果是 running 状态，只更新优先级和起始时间
        if (appStore.isDebug) {
          console.log(`⏳ Task is running, updating priority and startFromTime for ${talker}`)
        }
        if (priority > existingTask.priority) {
          existingTask.priority = priority
        }
        if (startFromTime) {
          existingTask.startFromTime = startFromTime
        }
        return existingTask
      }

      // 创建新任务
      const task: RefreshTask = {
        talker,
        priority,
        status: RefreshStatus.PENDING,
        retryCount: 0,
        startFromTime,
      }

      this.tasks.push(task)
      if (appStore.isDebug) {
        console.log(`➕ Added new task for ${talker}`)
      }
      return task
    },

    /**
     * 刷新单个会话
     * @param talker 会话 ID
     * @param priority 优先级
     * @param startFromTime 刷新起始时间（缓存最后一条消息的时间，东八区 ISO 格式）
     */
    async refreshOne(talker: string, priority = 0, startFromTime?: string): Promise<Message[] | null> {
      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log(`🔄 refreshOne called for talker: ${talker}, priority: ${priority}, startFromTime: ${startFromTime || 'none'}`)
        console.log(`📊 Current state: enabled=${this.config.enabled}, activeCount=${this.activeCount}, pendingCount=${this.pendingTasks.length}`)
      }
      
      const task = this.addTask(talker, priority, startFromTime)
      if (appStore.isDebug) {
        console.log(`✅ Task added: ${talker}, status=${task.status}, startFromTime: ${task.startFromTime || 'none'}`)
      }

      // 如果正在运行，等待完成
      if (task.status === RefreshStatus.RUNNING) {
        if (appStore.isDebug) {
          console.log(`⏳ Task already running, waiting...`)
        }
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (task.status !== RefreshStatus.RUNNING) {
              clearInterval(checkInterval)
              const cacheStore = useMessageCacheStore()
              resolve(cacheStore.get(talker))
            }
          }, 100)
        })
      }

      // 等待执行
      if (appStore.isDebug) {
        console.log(`🚀 Starting executeNext...`)
      }
      await this.executeNext()
      
      const cacheStore = useMessageCacheStore()
      const result = cacheStore.get(talker)
      if (appStore.isDebug) {
        console.log(`✅ refreshOne completed, result: ${result ? result.length + ' messages' : 'null'}`)
      }
      return result
    },

    /**
     * 刷新多个会话
     */
    async refreshBatch(talkers: string[], priority = 0, startFromTimeMap?: Map<string, string>): Promise<void> {
      talkers.forEach(talker => {
        const startFromTime = startFromTimeMap?.get(talker)
        this.addTask(talker, priority, startFromTime)
      })
      await this.executeNext()
    },

    /**
     * 刷新所有需要刷新的会话
     */
    async refreshAll(): Promise<void> {
      const appStore = useAppStore()
      if (this.needsRefreshTalkers.length === 0) {
        if (appStore.isDebug) {
          console.log('📭 No talkers need refresh')
        }
        return
      }

      if (appStore.isDebug) {
        console.log(`🔄 Refreshing ${this.needsRefreshTalkers.length} talkers...`)
      }
      await this.refreshBatch([...this.needsRefreshTalkers])
    },

    /**
     * 执行下一批任务
     */
    async executeNext(): Promise<void> {
      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log(`📋 executeNext: ${this.pendingTasks.length} pending tasks`)
      }

      while (this.pendingTasks.length > 0) {
        // 等待有空闲槽位
        while (this.activeCount >= this.config.maxConcurrency) {
          if (appStore.isDebug) {
            console.log(`⏸️ Waiting for free slot (${this.activeCount}/${this.config.maxConcurrency})`)
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // 获取下一个任务（优先级最高的）
        const task = this.getNextTask()
        if (!task) {
          if (appStore.isDebug) {
            console.log(`⚠️ No task found`)
          }
          break
        }

        if (appStore.isDebug) {
          console.log(`🎯 Executing task: ${task.talker}`)
        }
        // 执行任务（不等待，允许并发）
        this.executeTask(task)
      }

      // 等待所有任务完成
      if (appStore.isDebug) {
        console.log(`⏳ Waiting for ${this.activeCount} active tasks to complete`)
      }
      while (this.activeCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      if (appStore.isDebug) {
        console.log(`✅ All tasks completed`)
      }
    },

    /**
     * 获取下一个任务
     */
    getNextTask(): RefreshTask | null {
      const pending = this.pendingTasks
      if (pending.length === 0) return null

      // 按优先级排序
      pending.sort((a, b) => b.priority - a.priority)
      return pending[0]
    },

    /**
     * 执行任务
     */
    async executeTask(task: RefreshTask): Promise<void> {
      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log(`🔨 executeTask started: ${task.talker}`)
      }
      task.status = RefreshStatus.RUNNING
      task.startTime = Date.now()
      this.activeCount++

      try {
        if (appStore.isDebug) {
          console.log(`📡 Fetching messages for ${task.talker}...`)
          console.log(`📅 Start from time: ${task.startFromTime || 'none (will auto-detect from cache)'}`)
        }
        
        // 设置超时
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
        })

        // 执行请求（传入当前缓存和起始时间）
        const cacheStore = useMessageCacheStore()
        const cached = cacheStore.get(task.talker)
        const messagesPromise = this.fetchMessages(task.talker, cached, task.startFromTime)
        const messages = await Promise.race([messagesPromise, timeoutPromise])

        if (appStore.isDebug) {
          console.log(`✅ Fetched ${messages.length} messages for ${task.talker}`)
        }

        // 检测新消息并发送通知
        this.checkAndNotify(messages, cached, task.talker)

        // 保存到缓存
        const success = cacheStore.set(task.talker, messages)

        if (success) {
          task.status = RefreshStatus.SUCCESS
          this.stats.successCount++
          if (appStore.isDebug) {
            console.log(`💾 Cache saved successfully for ${task.talker}`)
          }

          // 触发缓存更新事件，通知其他组件（如 chat store）
          window.dispatchEvent(new CustomEvent('chatlog-cache-updated', {
            detail: { talker: task.talker, messages }
          }))
        } else {
          throw new Error('Failed to save cache')
        }
      } catch (error) {
        console.error(`❌ Failed to refresh ${task.talker}:`, error)
        task.error = error instanceof Error ? error.message : 'Unknown error'

        // 重试
        if (task.retryCount < this.config.maxRetries) {
          task.retryCount++
          task.status = RefreshStatus.PENDING
          if (appStore.isDebug) {
            console.log(`🔄 Retrying ${task.talker} (${task.retryCount}/${this.config.maxRetries})`)
          }
        } else {
          task.status = RefreshStatus.FAILED
          this.stats.failedCount++
          if (appStore.isDebug) {
            console.log(`💀 Task failed after ${this.config.maxRetries} retries: ${task.talker}`)
          }
        }
      } finally {
        task.endTime = Date.now()
        this.activeCount--
        this.updateStats(task)
        if (appStore.isDebug) {
          console.log(`🏁 executeTask finished: ${task.talker}, status=${task.status}`)
        }
      }
    },

    /**
     * 获取消息并智能填补缓存缺口
     * @param talker 会话ID
     * @param cachedMessages 当前缓存的消息（用于确定需要填补的时间范围）
     * @param startFromTime 刷新起始时间（东八区 ISO 格式），如果提供则使用此时间，否则从缓存中自动检测
     */
    async fetchMessages(talker: string, cachedMessages: Message[] | null, startFromTime?: string): Promise<Message[]> {
      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log(`📥 fetchMessages: Requesting messages for ${talker}`)
      }
      
      if (!cachedMessages || cachedMessages.length === 0) {
        // 没有缓存，获取最新的消息
        if (appStore.isDebug) {
          console.log(`📭 No cache found, fetching latest messages`)
        }
        const messages = await chatlogAPI.getSessionMessages(talker, undefined, this.config.pageSize)
        if (appStore.isDebug) {
          console.log(`📦 fetchMessages: Received ${messages.length} messages (no cache)`)
        }
        return messages
      }

      // 确定刷新的起始时间
      let latestCachedTimeMs: number
      let latestCachedTimeCST: string
      
      if (startFromTime) {
        // 使用传入的起始时间
        latestCachedTimeMs = new Date(startFromTime).getTime()
        latestCachedTimeCST = startFromTime
        if (appStore.isDebug) {
          console.log(`📅 Using provided start time: ${startFromTime}`)
        }
      } else {
        // 从缓存中找到最新的消息时间
        const latestCached = cachedMessages.reduce((latest, msg) => {
          const msgTime = msg.time ? new Date(msg.time).getTime() : msg.createTime * 1000
          const latestTime = latest.time ? new Date(latest.time).getTime() : latest.createTime * 1000
          return msgTime > latestTime ? msg : latest
        }, cachedMessages[0])

        latestCachedTimeMs = latestCached.time 
          ? new Date(latestCached.time).getTime() 
          : latestCached.createTime * 1000
        
        // 转换为东八区 ISO 格式
        latestCachedTimeCST = toCST(new Date(latestCachedTimeMs))
        if (appStore.isDebug) {
          console.log(`📅 Latest cached message time (auto-detected): ${latestCachedTimeCST}`)
        }
      }

      // 获取从起始时间到现在的新消息
      const now = Date.now()
      const nowCST = toCST(new Date(now))
      const timeDiff = now - latestCachedTimeMs
      const daysDiff = Math.ceil(timeDiff / (24 * 60 * 60 * 1000))
      
      if (appStore.isDebug) {
        console.log(`⏰ Time difference: ${daysDiff} days, fetching updates...`)
        console.log(`📆 Time range: ${latestCachedTimeCST} ~ ${nowCST}`)
      }

      // 使用时间范围获取消息
      let newMessages: Message[]
      
      if (daysDiff <= 1) {
        // 时间差小于1天，使用时间范围查询
        const timeRange = formatCSTRange(new Date(latestCachedTimeMs), new Date(now))
        if (appStore.isDebug) {
          console.log(`📅 Fetching with time range: ${timeRange}`)
        }
        newMessages = await chatlogAPI.getChatlog({
          talker,
          time: timeRange,
          limit: this.config.pageSize * 2,
        })
        if (appStore.isDebug) {
          console.log(`📦 Fetched ${newMessages.length} messages in time range`)
        }
      } else if (daysDiff <= 7) {
        // 获取时间范围内的消息
        const timeRange = formatCSTRange(new Date(latestCachedTimeMs), new Date(now))
        if (appStore.isDebug) {
          console.log(`📅 Fetching with time range: ${timeRange}`)
        }
        newMessages = await chatlogAPI.getChatlog({
          talker,
          time: timeRange,
          limit: this.config.pageSize * 2,
        })
        if (appStore.isDebug) {
          console.log(`📦 Fetched ${newMessages.length} messages in ${daysDiff} days range`)
        }
      } else {
        // 时间跨度太大，只获取最近7天
        console.warn(`⚠️ Time gap too large (${daysDiff} days), fetching last 7 days only`)
        newMessages = await chatlogAPI.getRecentMessages(7, talker, this.config.pageSize * 2)
        if (appStore.isDebug) {
          console.log(`📦 Fetched recent 7 days messages: ${newMessages.length}`)
        }
      }

      // 过滤出比缓存更新的消息
      const newerMessages = newMessages.filter(msg => {
        const msgTime = msg.time ? new Date(msg.time).getTime() : msg.createTime * 1000
        return msgTime > latestCachedTimeMs
      })

      if (appStore.isDebug) {
        console.log(`🆕 Found ${newerMessages.length} newer messages`)
      }

      // 合并消息：缓存 + 新消息
      const mergedMessages = [...cachedMessages, ...newerMessages]

      // 去重（基于 id 或 seq）
      const uniqueMessages = mergedMessages.reduce((acc, msg) => {
        const key = `${msg.id}_${msg.seq}`
        if (!acc.has(key)) {
          acc.set(key, msg)
        }
        return acc
      }, new Map<string, Message>())

      // 转换为数组并按时间排序（旧到新）
      const result = Array.from(uniqueMessages.values()).sort((a, b) => {
        const timeA = a.time ? new Date(a.time).getTime() : a.createTime * 1000
        const timeB = b.time ? new Date(b.time).getTime() : b.createTime * 1000
        return timeA - timeB
      })

      if (appStore.isDebug) {
        console.log(`📦 fetchMessages: Merged ${result.length} messages (${cachedMessages.length} cached + ${newerMessages.length} new)`)
      }

      // 如果合并后消息太多，只保留最新的 pageSize * 3 条
      const maxMessages = this.config.pageSize * 3
      if (result.length > maxMessages) {
        if (appStore.isDebug) {
          console.log(`✂️ Trimming messages from ${result.length} to ${maxMessages}`)
        }
        return result.slice(-maxMessages)
      }

      return result
    },

    /**
     * 更新统计
     */
    updateStats(task: RefreshTask) {
      this.stats.totalTasks++
      this.stats.lastRefreshTime = Date.now()

      if (task.startTime && task.endTime) {
        const duration = task.endTime - task.startTime
        this.stats.averageTime =
          (this.stats.averageTime * (this.stats.totalTasks - 1) + duration) / this.stats.totalTasks
      }
    },

    /**
     * 检测需要刷新的会话
     * 通过比较会话列表的最后消息时间和缓存中的最后消息时间
     */
    async detectNeedsRefresh(): Promise<void> {
      const appStore = useAppStore()
      const cacheStore = useMessageCacheStore()
      
      // 清空之前的标记
      this.needsRefreshTalkers = []
      
      // 导入 sessionStore（动态导入避免循环依赖）
      const { useSessionStore } = await import('./session')
      const sessionStore = useSessionStore()
      
      if (appStore.isDebug) {
        console.log('🔍 Detecting sessions that need refresh...')
        console.log(`📊 Total sessions: ${sessionStore.sessions.length}`)
        console.log(`📦 Cached sessions: ${cacheStore.metadata.length}`)
      }

      // 获取所有会话
      const sessions = sessionStore.sessions
      const needsRefresh: string[] = []
      let checkedCount = 0

      for (const session of sessions) {
        const talker = session.id
        
        // 检查缓存
        const cached = cacheStore.get(talker)
        
        if (!cached || cached.length === 0) {
          // 没有缓存，跳过（用户打开时会自动加载）
          if (appStore.isDebug && checkedCount < 3) {
            console.log(`⏭️ Skipping ${talker}: no cache`)
          }
          continue
        }

        checkedCount++

        // 获取缓存中最后一条消息的时间
        const cachedLastTime = cached[cached.length - 1]?.time
        
        // 获取会话列表中最后一条消息的时间
        const sessionLastTime = session.lastTime
        
        if (!cachedLastTime || !sessionLastTime) {
          if (appStore.isDebug && checkedCount <= 3) {
            console.log(`⏭️ Skipping ${talker}: missing time`, {
              cachedLastTime,
              sessionLastTime
            })
          }
          continue
        }

        // 比较时间，如果会话的最后消息时间比缓存新，说明有新消息
        // 注意：允许 1 秒的误差，避免时间精度问题
        const cachedTime = new Date(cachedLastTime).getTime()
        const sessionTime = new Date(sessionLastTime).getTime()
        const timeDiff = sessionTime - cachedTime
        
        if (appStore.isDebug && checkedCount <= 3) {
          console.log(`🔍 Checking ${talker}:`, {
            sessionLastTime,
            cachedLastTime,
            sessionTime,
            cachedTime,
            diff: timeDiff,
            needsRefresh: timeDiff > 1000
          })
        }
        
        if (timeDiff > 1000) { // 大于 1 秒才认为有新消息
          needsRefresh.push(talker)
          
          if (appStore.isDebug) {
            console.log(`📌 Session needs refresh: ${talker}`, {
              sessionLastTime,
              cachedLastTime,
              diff: timeDiff,
              diffSeconds: (timeDiff / 1000).toFixed(1)
            })
          }
        }
      }

      if (appStore.isDebug) {
        console.log(`✅ Detection completed:`, {
          totalSessions: sessions.length,
          checkedSessions: checkedCount,
          needsRefresh: needsRefresh.length,
          talkers: needsRefresh
        })
      }

      // 标记需要刷新的会话
      if (needsRefresh.length > 0) {
        this.markNeedsRefresh(needsRefresh)
        
        // 自动批量刷新（如果启用）
        if (this.config.enabled) {
          if (appStore.isDebug) {
            console.log(`🔄 Starting batch refresh for ${needsRefresh.length} sessions...`)
          }
          await this.refreshBatch(needsRefresh)
        }
      } else {
        if (appStore.isDebug) {
          console.log('✅ All cached sessions are up to date')
        }
      }
    },

    /**
     * 标记需要刷新的会话
     */
    markNeedsRefresh(talkers: string[]) {
      const appStore = useAppStore()
      const newTalkers = talkers.filter(t => !this.needsRefreshTalkers.includes(t))
      this.needsRefreshTalkers.push(...newTalkers)
      
      if (appStore.isDebug) {
        console.log(`📌 Marked ${newTalkers.length} talkers for refresh`)
      }
    },

    /**
     * 取消标记
     */
    unmarkNeedsRefresh(talker: string) {
      const index = this.needsRefreshTalkers.indexOf(talker)
      if (index >= 0) {
        this.needsRefreshTalkers.splice(index, 1)
      }
    },

    /**
     * 清空任务
     */
    clearTasks() {
      this.tasks = []
      this.activeCount = 0
    },

    /**
     * 重置统计
     */
    resetStats() {
      this.stats = {
        totalTasks: 0,
        successCount: 0,
        failedCount: 0,
        averageTime: 0,
        lastRefreshTime: 0,
      }
    },

    /**
     * 获取刷新报告
     */
    getReport() {
      return {
        config: { ...this.config },
        stats: { ...this.stats },
        tasks: this.tasks.map(t => ({
          talker: t.talker,
          status: t.status,
          priority: t.priority,
          retryCount: t.retryCount,
          startTime: t.startTime,
          endTime: t.endTime,
          duration: t.startTime && t.endTime ? t.endTime - t.startTime : 0,
          error: t.error,
          startFromTime: t.startFromTime,
        })),
        activeCount: this.activeCount,
        pendingCount: this.pendingTasks.length,
        needsRefreshCount: this.needsRefreshTalkers.length,
      }
    },

    /**
     * 检测新消息并发送通知
     */
    async checkAndNotify(newMessages: Message[], cachedMessages: Message[] | null, talker: string) {
      const notificationStore = useNotificationStore()
      const contactStore = useContactStore()
      
      // 如果通知未启用，直接返回
      if (!notificationStore.isEnabled) {
        return
      }

      // 如果没有缓存，说明是首次加载，不发送通知
      if (!cachedMessages || cachedMessages.length === 0) {
        return
      }

      // 找出新消息（不在缓存中的消息）
      const cachedIds = new Set(cachedMessages.map(m => `${m.id}_${m.seq}`))
      const actualNewMessages = newMessages.filter(m => !cachedIds.has(`${m.id}_${m.seq}`))

      // 如果没有新消息，返回
      if (actualNewMessages.length === 0) {
        return
      }

      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log(`🔔 Found ${actualNewMessages.length} new messages for ${talker}`)
      }

      // 获取联系人信息
      const contact = contactStore.contacts.find(c => c.wxid === talker)
      const talkerName = contact?.remark || contact?.nickname || talker

      // 获取当前用户的 wxid（用于检测 @我）
      const myWxid = notificationStore.config.myWxid

      // 检测并发送通知
      try {
        await notificationStore.checkMessages(actualNewMessages, talker, talkerName, myWxid)
      } catch (error) {
        console.error('Failed to check and send notifications:', error)
      }
    },

    /**
     * 销毁
     */
    destroy() {
      this.stopAutoRefresh()
      this.clearTasks()
    },
  },
})
