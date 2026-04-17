import { onMounted } from 'vue'
import { useContactStore } from '@/stores/contact'

/**
 * 联系人自动加载 composable
 * 负责联系人数据自动检查、后台加载逻辑
 */
export function useContactAutoLoad() {
  const contactStore = useContactStore()

  /**
   * 检查联系人数据并自动加载
   */
  const checkAndLoadContacts = async () => {
    try {
      const { db } = await import('@/utils/db')
      const contactCount = await db.getContactCount()

      if (contactCount === 0 && !contactStore.isBackgroundLoading) {
        console.log('📦 数据库为空，自动启动后台加载联系人...')

        // 启动后台加载
        contactStore.loadContactsInBackground({
          batchSize: 500,
          batchDelay: 100,
          useCache: true
        }).catch(err => {
          console.error('自动后台加载联系人失败:', err)
        })
      } else if (contactCount > 0) {
        console.log(`📦 数据库已有 ${contactCount} 个联系人，无需自动加载`)
      }
    } catch (err) {
      console.error('检查联系人数据失败:', err)
    }
  }

  /**
   * 手动启动联系人加载
   */
  const startContactLoading = async (options?: {
    batchSize?: number
    batchDelay?: number
    useCache?: boolean
  }) => {
    try {
      const { db } = await import('@/utils/db')
      const contactCount = await db.getContactCount()

      if (contactCount === 0 && !contactStore.isBackgroundLoading) {
        console.log('📦 手动启动联系人加载...')

        await contactStore.loadContactsInBackground({
          batchSize: options?.batchSize || 500,
          batchDelay: options?.batchDelay || 100,
          useCache: options?.useCache ?? true
        })

        return true
      } else if (contactCount > 0) {
        console.log(`📦 数据库已有 ${contactCount} 个联系人，无需加载`)
        return false
      }
    } catch (err) {
      console.error('手动启动联系人加载失败:', err)
      throw err
    }
  }

  /**
   * 检查联系人加载状态
   */
  const checkContactLoadingStatus = async () => {
    try {
      const { db } = await import('@/utils/db')
      const contactCount = await db.getContactCount()
      const loadingStatus = contactStore.isBackgroundLoading

      return {
        contactCount,
        isBackgroundLoading: loadingStatus,
        hasContacts: contactCount > 0,
        needsLoading: contactCount === 0 && !loadingStatus
      }
    } catch (err) {
      console.error('检查联系人加载状态失败:', err)
      throw err
    }
  }

  /**
   * 停止联系人加载
   */
  const stopContactLoading = () => {
    if (contactStore.isBackgroundLoading) {
      console.log('⏸️ 停止联系人加载')
      contactStore.cancelBackgroundLoading()
    }
  }

  /**
   * 初始化自动加载检查
   */
  const initAutoLoad = () => {
    // 在组件挂载时自动检查并加载
    onMounted(async () => {
      await checkAndLoadContacts()
    })
  }

  return {
    // 方法
    checkAndLoadContacts,
    startContactLoading,
    checkContactLoadingStatus,
    stopContactLoading,
    initAutoLoad,
  }
}