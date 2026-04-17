/**
 * 消息缓存 Composable
 * 提供消息缓存和自动刷新的便捷接口
 */

import { computed, onMounted, onUnmounted } from 'vue'
import { useMessageCacheStore } from '@/stores/messageCache'
import { useAutoRefreshStore } from '@/stores/autoRefresh'
import type { Message } from '@/types/message'

/**
 * 缓存选项
 */
interface CacheOptions {
  /**
   * 是否自动刷新
   */
  autoRefresh?: boolean
  
  /**
   * 刷新优先级
   */
  priority?: number
  
  /**
   * 是否在挂载时立即加载
   */
  immediate?: boolean
  
  /**
   * 缓存过期时间（毫秒），默认使用 store 配置
   * @deprecated 当前版本未使用，保留以供未来扩展
   */
  ttl?: number
}

/**
 * 使用消息缓存
 */
export function useMessageCache(talker: string, options: CacheOptions = {}) {
  const {
    autoRefresh = true,
    priority = 0,
    immediate = true,
    ttl: _ttl,
  } = options

  const cacheStore = useMessageCacheStore()
  const refreshStore = useAutoRefreshStore()

  // 初始化缓存 store
  if (!cacheStore.metadata.length) {
    cacheStore.init()
  }

  // 初始化刷新 store
  if (autoRefresh && refreshStore.config.enabled && !refreshStore.timer) {
    refreshStore.init()
  }

  // 计算属性
  const cached = computed(() => cacheStore.get(talker))
  const isRefreshing = computed(() => {
    return refreshStore.runningTasks.some(t => t.talker === talker)
  })
  const hasCached = computed(() => cached.value !== null)

  /**
   * 从缓存加载消息
   */
  const loadFromCache = (): Message[] | null => {
    return cacheStore.get(talker)
  }

  /**
   * 保存消息到缓存
   */
  const saveToCache = (messages: Message[]): boolean => {
    return cacheStore.set(talker, messages)
  }

  /**
   * 刷新消息
   */
  const refresh = async (forcePriority?: number): Promise<Message[] | null> => {
    const p = forcePriority !== undefined ? forcePriority : priority
    return await refreshStore.refreshOne(talker, p)
  }

  /**
   * 移除缓存
   */
  const clearCache = () => {
    cacheStore.remove(talker)
  }

  /**
   * 获取或加载消息
   * 优先从缓存读取，如果没有则触发刷新
   */
  const getOrLoad = async (loader?: () => Promise<Message[]>): Promise<Message[]> => {
    // 先从缓存读取
    const cachedMessages = loadFromCache()
    if (cachedMessages) {
      // 如果启用自动刷新，后台触发更新
      if (autoRefresh && refreshStore.config.enabled) {
        refresh().catch(err => {
          console.error('Background refresh failed:', err)
        })
      }
      return cachedMessages
    }

    // 缓存未命中，需要加载
    if (loader) {
      const messages = await loader()
      saveToCache(messages)
      return messages
    }

    // 使用刷新 store 加载
    const messages = await refresh()
    return messages || []
  }

  /**
   * 标记需要刷新
   */
  const markNeedsRefresh = () => {
    if (autoRefresh && refreshStore.config.enabled) {
      refreshStore.markNeedsRefresh([talker])
    }
  }

  /**
   * 取消刷新标记
   */
  const unmarkNeedsRefresh = () => {
    refreshStore.unmarkNeedsRefresh(talker)
  }

  // 生命周期
  onMounted(() => {
    if (immediate && autoRefresh && refreshStore.config.enabled) {
      markNeedsRefresh()
    }
  })

  onUnmounted(() => {
    // 清理
  })

  return {
    // 状态
    cached,
    hasCached,
    isRefreshing,
    
    // 方法
    loadFromCache,
    saveToCache,
    refresh,
    clearCache,
    getOrLoad,
    markNeedsRefresh,
    unmarkNeedsRefresh,
  }
}

/**
 * 使用批量缓存
 */
export function useBatchCache(talkers: string[], options: CacheOptions = {}) {
  const {
    autoRefresh = true,
    priority = 0,
  } = options

  const cacheStore = useMessageCacheStore()
  const refreshStore = useAutoRefreshStore()

  // 初始化
  if (!cacheStore.metadata.length) {
    cacheStore.init()
  }

  if (autoRefresh && refreshStore.config.enabled && !refreshStore.timer) {
    refreshStore.init()
  }

  /**
   * 加载所有缓存
   */
  const loadAll = (): Map<string, Message[]> => {
    const result = new Map<string, Message[]>()
    talkers.forEach(talker => {
      const messages = cacheStore.get(talker)
      if (messages) {
        result.set(talker, messages)
      }
    })
    return result
  }

  /**
   * 刷新所有
   */
  const refreshAll = async (): Promise<void> => {
    await refreshStore.refreshBatch(talkers, priority)
  }

  /**
   * 预热缓存
   */
  const warmup = async (loader: (talker: string) => Promise<Message[]>): Promise<void> => {
    await cacheStore.warmup(talkers, loader)
  }

  /**
   * 标记所有需要刷新
   */
  const markAllNeedsRefresh = () => {
    if (autoRefresh && refreshStore.config.enabled) {
      refreshStore.markNeedsRefresh(talkers)
    }
  }

  // 生命周期
  onMounted(() => {
    if (autoRefresh && refreshStore.config.enabled) {
      markAllNeedsRefresh()
    }
  })

  return {
    loadAll,
    refreshAll,
    warmup,
    markAllNeedsRefresh,
  }
}

/**
 * 使用缓存统计
 */
export function useCacheStats() {
  const cacheStore = useMessageCacheStore()
  const refreshStore = useAutoRefreshStore()

  const cacheStats = computed(() => cacheStore.getStats())
  const refreshReport = computed(() => refreshStore.getReport())
  
  const usage = computed(() => ({
    count: cacheStore.cacheCount,
    size: cacheStore.totalSize,
    maxSize: cacheStore.config.maxSize,
    percentage: cacheStore.usagePercentage,
    isNearLimit: cacheStore.isNearLimit,
  }))

  const refreshStatus = computed(() => ({
    enabled: refreshStore.config.enabled,
    isRefreshing: refreshStore.isRefreshing,
    progress: refreshStore.progress,
    activeCount: refreshStore.activeCount,
    pendingCount: refreshStore.pendingTasks.length,
  }))

  return {
    cacheStats,
    refreshReport,
    usage,
    refreshStatus,
  }
}

/**
 * 使用缓存配置
 */
export function useCacheConfig() {
  const cacheStore = useMessageCacheStore()
  const refreshStore = useAutoRefreshStore()

  const cacheConfig = computed({
    get: () => cacheStore.config,
    set: (config) => cacheStore.updateConfig(config),
  })

  const refreshConfig = computed({
    get: () => refreshStore.config,
    set: (config) => refreshStore.updateConfig(config),
  })

  /**
   * 启用自动刷新
   */
  const enableAutoRefresh = () => {
    refreshStore.updateConfig({ enabled: true })
  }

  /**
   * 禁用自动刷新
   */
  const disableAutoRefresh = () => {
    refreshStore.updateConfig({ enabled: false })
  }

  /**
   * 清空所有缓存
   */
  const clearAllCache = () => {
    cacheStore.clear()
  }

  /**
   * 清理过期缓存
   */
  const cleanExpired = () => {
    cacheStore.cleanExpired()
  }

  return {
    cacheConfig,
    refreshConfig,
    enableAutoRefresh,
    disableAutoRefresh,
    clearAllCache,
    cleanExpired,
  }
}