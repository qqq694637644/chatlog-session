/**
 * useDisplayName Composable
 * 用于获取和管理联系人/会话的显示名称
 */

import { ref, watch, type Ref, computed } from 'vue'
import { useContactStore } from '@/stores/contact'

export interface UseDisplayNameOptions {
  /**
   * 联系人/会话 ID
   */
  id: Ref<string | undefined>
  
  /**
   * 默认名称（fallback）
   */
  defaultName?: Ref<string | undefined>
  
  /**
   * 是否立即执行
   * @default true
   */
  immediate?: boolean
  
  /**
   * 是否在获取失败时使用默认名称
   * @default true
   */
  useFallback?: boolean
}

/**
 * 获取和管理显示名称
 * 
 * @example
 * ```ts
 * const { displayName } = useDisplayName({
 *   id: computed(() => props.session?.id),
 *   defaultName: computed(() => props.session?.name)
 * })
 * ```
 */
export function useDisplayName(options: UseDisplayNameOptions) {
  const {
    id,
    defaultName,
    immediate = true,
    useFallback = true
  } = options

  const contactStore = useContactStore()
  
  // 显示名称
  const displayName = ref<string>('')
  
  // 加载状态
  const loading = ref(false)
  
  // 错误状态
  const error = ref<Error | null>(null)

  /**
   * 加载显示名称
   */
  const loadDisplayName = async (contactId: string) => {
    if (!contactId) {
      displayName.value = defaultName?.value || ''
      return
    }

    loading.value = true
    error.value = null

    try {
      const name = await contactStore.getContactDisplayName(contactId)
      
      // 如果获取到的名称有效且不等于 ID，则使用它
      if (name && name !== contactId) {
        displayName.value = name
      } else if (useFallback && defaultName?.value) {
        // 否则使用默认名称
        displayName.value = defaultName.value
      } else {
        // 如果没有默认名称，使用 ID
        displayName.value = contactId
      }
    } catch (err) {
      console.warn('获取联系人显示名称失败:', contactId, err)
      error.value = err as Error
      
      // 发生错误时使用默认名称
      if (useFallback && defaultName?.value) {
        displayName.value = defaultName.value
      } else {
        displayName.value = contactId
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 重新加载显示名称
   */
  const refresh = () => {
    if (id.value) {
      loadDisplayName(id.value)
    }
  }

  // 监听 ID 变化
  watch(id, (newId) => {
    if (newId) {
      loadDisplayName(newId)
    } else {
      displayName.value = defaultName?.value || ''
    }
  }, { immediate })

  // 监听默认名称变化（作为 fallback）
  if (defaultName) {
    watch(defaultName, (newName) => {
      // 只有在当前没有显示名称或加载失败时才更新
      if (newName && (!displayName.value || error.value)) {
        displayName.value = newName
      }
    }, { immediate: immediate && !id.value })
  }

  // 计算是否有有效的显示名称
  const hasDisplayName = computed(() => {
    return !!displayName.value && displayName.value !== id.value
  })

  return {
    /**
     * 显示名称
     */
    displayName,
    
    /**
     * 是否正在加载
     */
    loading,
    
    /**
     * 错误信息
     */
    error,
    
    /**
     * 是否有有效的显示名称
     */
    hasDisplayName,
    
    /**
     * 重新加载
     */
    refresh
  }
}