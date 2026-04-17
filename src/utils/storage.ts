/**
 * 本地存储工具
 * 提供统一的 localStorage 和 sessionStorage 操作方法
 */

/**
 * 存储类型
 */
export type StorageType = 'local' | 'session'

/**
 * 存储选项
 */
export interface StorageOptions {
  type?: StorageType
  expire?: number // 过期时间（秒）
  encrypt?: boolean // 是否加密
}

/**
 * 存储数据结构
 */
interface StorageData<T = any> {
  value: T
  expire?: number
  timestamp: number
}

/**
 * 存储类
 */
class Storage {
  private prefix = 'chatlog_'

  /**
   * 获取存储实例
   */
  private getStorage(type: StorageType): globalThis.Storage {
    return type === 'local' ? localStorage : sessionStorage
  }

  /**
   * 获取完整的键名
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * 设置值
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): void {
    try {
      const { type = 'local', expire, encrypt = false } = options
      const storage = this.getStorage(type)
      const fullKey = this.getKey(key)

      const data: StorageData<T> = {
        value,
        timestamp: Date.now(),
        expire: expire ? Date.now() + expire * 1000 : undefined,
      }

      let stringValue = JSON.stringify(data)

      // 简单加密（生产环境应使用更安全的加密方法）
      if (encrypt) {
        stringValue = this.encrypt(stringValue)
      }

      storage.setItem(fullKey, stringValue)
    } catch (error) {
      console.error(`Failed to set storage ${key}:`, error)
    }
  }

  /**
   * 获取值
   */
  get<T>(key: string, options: StorageOptions = {}): T | null {
    try {
      const { type = 'local', encrypt = false } = options
      const storage = this.getStorage(type)
      const fullKey = this.getKey(key)

      let stringValue = storage.getItem(fullKey)
      if (!stringValue) return null

      // 解密
      if (encrypt) {
        stringValue = this.decrypt(stringValue)
      }

      const data: StorageData<T> = JSON.parse(stringValue)

      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        this.remove(key, options)
        return null
      }

      return data.value
    } catch (error) {
      console.error(`Failed to get storage ${key}:`, error)
      return null
    }
  }

  /**
   * 移除值
   */
  remove(key: string, options: StorageOptions = {}): void {
    try {
      const { type = 'local' } = options
      const storage = this.getStorage(type)
      const fullKey = this.getKey(key)
      storage.removeItem(fullKey)
    } catch (error) {
      console.error(`Failed to remove storage ${key}:`, error)
    }
  }

  /**
   * 清空存储
   */
  clear(type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type)
      const keys = Object.keys(storage)

      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          storage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  /**
   * 获取所有键
   */
  keys(type: StorageType = 'local'): string[] {
    try {
      const storage = this.getStorage(type)
      const keys = Object.keys(storage)

      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''))
    } catch (error) {
      console.error('Failed to get storage keys:', error)
      return []
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string, options: StorageOptions = {}): boolean {
    return this.get(key, options) !== null
  }

  /**
   * 获取存储大小（字节）
   */
  size(type: StorageType = 'local'): number {
    try {
      const storage = this.getStorage(type)
      let size = 0

      Object.keys(storage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          const value = storage.getItem(key)
          if (value) {
            size += key.length + value.length
          }
        }
      })

      return size
    } catch (error) {
      console.error('Failed to get storage size:', error)
      return 0
    }
  }

  /**
   * 简单加密（Base64）
   * 注意：这只是简单的编码，不是真正的加密
   * 生产环境应使用更安全的加密算法
   */
  private encrypt(str: string): string {
    try {
      return btoa(encodeURIComponent(str))
    } catch (error) {
      console.error('Encrypt failed:', error)
      return str
    }
  }

  /**
   * 简单解密（Base64）
   */
  private decrypt(str: string): string {
    try {
      return decodeURIComponent(atob(str))
    } catch (error) {
      console.error('Decrypt failed:', error)
      return str
    }
  }

  /**
   * 设置前缀
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix
  }
}

/**
 * 创建存储实例
 */
const storage = new Storage()

/**
 * 导出便捷方法
 */

/**
 * 设置 localStorage
 */
export function setLocal<T>(key: string, value: T, expire?: number): void {
  storage.set(key, value, { type: 'local', expire })
}

/**
 * 获取 localStorage
 */
export function getLocal<T>(key: string): T | null {
  return storage.get<T>(key, { type: 'local' })
}

/**
 * 移除 localStorage
 */
export function removeLocal(key: string): void {
  storage.remove(key, { type: 'local' })
}

/**
 * 清空 localStorage
 */
export function clearLocal(): void {
  storage.clear('local')
}

/**
 * 设置 sessionStorage
 */
export function setSession<T>(key: string, value: T, expire?: number): void {
  storage.set(key, value, { type: 'session', expire })
}

/**
 * 获取 sessionStorage
 */
export function getSession<T>(key: string): T | null {
  return storage.get<T>(key, { type: 'session' })
}

/**
 * 移除 sessionStorage
 */
export function removeSession(key: string): void {
  storage.remove(key, { type: 'session' })
}

/**
 * 清空 sessionStorage
 */
export function clearSession(): void {
  storage.clear('session')
}

/**
 * 检查是否支持 localStorage
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * 检查是否支持 sessionStorage
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * 获取存储使用情况
 */
export function getStorageUsage(): {
  local: { size: number; keys: number }
  session: { size: number; keys: number }
} {
  return {
    local: {
      size: storage.size('local'),
      keys: storage.keys('local').length,
    },
    session: {
      size: storage.size('session'),
      keys: storage.keys('session').length,
    },
  }
}

/**
 * 格式化存储大小
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

/**
 * 默认导出
 */
export default storage