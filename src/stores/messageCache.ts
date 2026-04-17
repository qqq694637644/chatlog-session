/**
 * 消息缓存 Store
 * 管理每个联系人的消息缓存（SessionStorage）
 * 
 * 功能：
 * - 每个联系人独立缓存
 * - LRU 淘汰策略
 * - TTL 过期机制
 * - 容量限制
 */

import { defineStore } from 'pinia'
import { useAppStore } from './app'
import type { Message } from '@/types/message'

/**
 * 缓存项接口
 */
interface CacheItem {
  talker: string
  messages: Message[]
  timestamp: number
  lastAccess: number
  version: number
}

/**
 * 缓存元数据
 */
interface CacheMetadata {
  talker: string
  timestamp: number
  lastAccess: number
  size: number
  messageCount: number
}

/**
 * 缓存配置
 */
interface CacheConfig {
  maxSize: number        // 最大缓存大小（字节）
  maxItems: number       // 最大缓存项数
  ttl: number           // 缓存过期时间（毫秒）
  version: number       // 缓存版本
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 10 * 1024 * 1024,  // 10MB
  maxItems: 50,                // 最多缓存50个会话
  ttl: 30 * 60 * 1000,        // 30分钟过期
  version: 1,
}

/**
 * 缓存键前缀
 */
const CACHE_PREFIX = 'chatlog_cache_'
const METADATA_KEY = 'chatlog_cache_metadata'

export const useMessageCacheStore = defineStore('messageCache', {
  state: () => ({
    config: { ...DEFAULT_CONFIG },
    metadata: [] as CacheMetadata[],
    totalSize: 0,
    loading: false,
  }),

  getters: {
    /**
     * 获取缓存使用率
     */
    usagePercentage: (state): number => {
      return (state.totalSize / state.config.maxSize) * 100
    },

    /**
     * 获取缓存项数量
     */
    cacheCount: (state): number => {
      return state.metadata.length
    },

    /**
     * 是否接近容量限制
     */
    isNearLimit: (state): boolean => {
      return state.totalSize > state.config.maxSize * 0.8
    },
  },

  actions: {
    /**
     * 初始化缓存
     */
    init() {
      this.loadMetadata()
      this.cleanExpired()
    },

    /**
     * 加载元数据
     */
    loadMetadata() {
      try {
        const data = sessionStorage.getItem(METADATA_KEY)
        if (data) {
          this.metadata = JSON.parse(data)
          this.calculateTotalSize()
        }
      } catch (error) {
        console.error('Failed to load cache metadata:', error)
        this.metadata = []
      }
    },

    /**
     * 保存元数据
     */
    saveMetadata() {
      try {
        sessionStorage.setItem(METADATA_KEY, JSON.stringify(this.metadata))
      } catch (error) {
        console.error('Failed to save cache metadata:', error)
      }
    },

    /**
     * 计算总大小
     */
    calculateTotalSize() {
      this.totalSize = this.metadata.reduce((sum, item) => sum + item.size, 0)
    },

    /**
     * 获取缓存键
     */
    getCacheKey(talker: string): string {
      return `${CACHE_PREFIX}${talker}`
    },

    /**
     * 获取缓存
     */
    get(talker: string): Message[] | null {
      try {
        const key = this.getCacheKey(talker)
        const data = sessionStorage.getItem(key)
        
        if (!data) {
          return null
        }

        const item: CacheItem = JSON.parse(data)

        // 检查版本
        if (item.version !== this.config.version) {
          this.remove(talker)
          return null
        }

        // 检查过期
        const now = Date.now()
        if (now - item.timestamp > this.config.ttl) {
          this.remove(talker)
          return null
        }

        // 更新访问时间
        item.lastAccess = now
        sessionStorage.setItem(key, JSON.stringify(item))
        this.updateMetadata(talker, item)

        return item.messages
      } catch (error) {
        console.error(`Failed to get cache for ${talker}:`, error)
        return null
      }
    },

    /**
     * 设置缓存
     */
    set(talker: string, messages: Message[]): boolean {
      try {
        const now = Date.now()
        const item: CacheItem = {
          talker,
          messages,
          timestamp: now,
          lastAccess: now,
          version: this.config.version,
        }

        const data = JSON.stringify(item)
        const size = new Blob([data]).size

        // 检查单项大小
        if (size > this.config.maxSize * 0.5) {
          console.warn(`Cache item too large for ${talker}: ${size} bytes`)
          return false
        }

        // 确保有足够空间
        this.ensureSpace(size)

        // 保存
        const key = this.getCacheKey(talker)
        sessionStorage.setItem(key, data)

        // 更新元数据
        this.updateMetadata(talker, item, size)

        return true
      } catch (error) {
        console.error(`Failed to set cache for ${talker}:`, error)
        
        // 如果是 QuotaExceededError，尝试清理后重试
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          const appStore = useAppStore()
          if (appStore.isDebug) {
            console.log(`⚠️ QuotaExceededError: Evicting LRU and retrying for ${talker}`)
          }
          this.evictLRU(1)
          return this.set(talker, messages)
        }
        
        return false
      }
    },

    /**
     * 更新元数据
     */
    updateMetadata(talker: string, item: CacheItem, size?: number) {
      const index = this.metadata.findIndex(m => m.talker === talker)
      
      const metadata: CacheMetadata = {
        talker,
        timestamp: item.timestamp,
        lastAccess: item.lastAccess,
        size: size || this.metadata[index]?.size || 0,
        messageCount: item.messages.length,
      }

      if (index >= 0) {
        this.metadata[index] = metadata
      } else {
        this.metadata.push(metadata)
      }

      this.calculateTotalSize()
      this.saveMetadata()
    },

    /**
     * 移除缓存
     */
    remove(talker: string) {
      try {
        const key = this.getCacheKey(talker)
        sessionStorage.removeItem(key)

        const index = this.metadata.findIndex(m => m.talker === talker)
        if (index >= 0) {
          this.metadata.splice(index, 1)
          this.calculateTotalSize()
          this.saveMetadata()
        }
      } catch (error) {
        console.error(`Failed to remove cache for ${talker}:`, error)
      }
    },

    /**
     * 清空所有缓存
     */
    clear() {
      try {
        // 删除所有缓存项
        this.metadata.forEach(item => {
          const key = this.getCacheKey(item.talker)
          sessionStorage.removeItem(key)
        })

        // 清空元数据
        this.metadata = []
        this.totalSize = 0
        sessionStorage.removeItem(METADATA_KEY)
      } catch (error) {
        console.error('Failed to clear cache:', error)
      }
    },

    /**
     * 确保有足够空间
     */
    ensureSpace(requiredSize: number) {
      // 检查是否超过项数限制
      if (this.metadata.length >= this.config.maxItems) {
        this.evictLRU(1)
      }

      // 检查是否超过大小限制
      while (this.totalSize + requiredSize > this.config.maxSize && this.metadata.length > 0) {
        this.evictLRU(1)
      }
    },

    /**
     * LRU 淘汰
     */
    evictLRU(count: number) {
      // 按最后访问时间排序
      const sorted = [...this.metadata].sort((a, b) => a.lastAccess - b.lastAccess)
      
      // 删除最久未访问的项
      for (let i = 0; i < Math.min(count, sorted.length); i++) {
        this.remove(sorted[i].talker)
      }

      const appStore = useAppStore()
      if (appStore.isDebug) {
        console.log(`🗑️ Evicted ${Math.min(count, sorted.length)} cache items (LRU)`)
      }
    },

    /**
     * 清理过期缓存
     */
    cleanExpired() {
      const now = Date.now()
      const expired: string[] = []

      this.metadata.forEach(item => {
        if (now - item.timestamp > this.config.ttl) {
          expired.push(item.talker)
        }
      })

      expired.forEach(talker => this.remove(talker))

      if (expired.length > 0) {
        const appStore = useAppStore()
        if (appStore.isDebug) {
          console.log(`🧹 Cleaned ${expired.length} expired cache items`)
        }
      }
    },

    /**
     * 获取缓存统计
     */
    getStats() {
      return {
        count: this.metadata.length,
        totalSize: this.totalSize,
        maxSize: this.config.maxSize,
        usagePercentage: this.usagePercentage,
        items: this.metadata.map(item => ({
          talker: item.talker,
          messageCount: item.messageCount,
          size: item.size,
          age: Date.now() - item.timestamp,
          lastAccess: Date.now() - item.lastAccess,
        })),
      }
    },

    /**
     * 预热缓存（批量加载）
     */
    async warmup(talkers: string[], loader: (talker: string) => Promise<Message[]>) {
      this.loading = true
      
      try {
        for (const talker of talkers) {
          // 检查是否已缓存
          if (this.get(talker)) {
            continue
          }

          // 加载并缓存
          try {
            const messages = await loader(talker)
            this.set(talker, messages)
          } catch (error) {
            console.error(`Failed to warmup cache for ${talker}:`, error)
          }
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新配置
     */
    updateConfig(config: Partial<CacheConfig>) {
      this.config = { ...this.config, ...config }
      
      // 如果新配置更小，可能需要淘汰
      if (this.totalSize > this.config.maxSize) {
        this.ensureSpace(0)
      }
    },
  },
})