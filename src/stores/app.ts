/**
 * 应用全局状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserSettings, AppConfig } from '@/types'

// 系统主题监听器引用
let systemThemeMediaQuery: MediaQueryList | null = null
let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null

/**
 * 导航栈项
 */
export interface NavigationStackItem {
  view: 'sessionList' | 'messageList' | 'contactList' | 'contactDetail' | 'search' | 'settings'
  params?: {
    sessionId?: string
    contactId?: string
    [key: string]: any
  }
}

export const useAppStore = defineStore('app', () => {
  // ==================== State ====================

  /**
   * 应用配置
   */
  const config = ref<AppConfig>({
    title: import.meta.env.VITE_APP_TITLE || 'Chatlog Session',
    version: import.meta.env.VITE_APP_VERSION || 'dev',
    apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    pageSize: Number(import.meta.env.VITE_PAGE_SIZE) || 500,
    maxPageSize: Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 5000,
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  })

  /**
   * 用户设置
   */
  const settings = ref<UserSettings>({
    theme: 'light',
    language: 'zh-CN',
    fontSize: 'medium',
    messageDensity: 'comfortable',
    enterToSend: true,
    autoPlayVoice: false,
    showMessagePreview: true,
    timeFormat: '24h',
    showMediaResources: true,
    disableServerPinning: false,
  })

  /**
   * 加载状态
   */
  const loading = ref({
    app: false,
    sessions: false,
    messages: false,
    contacts: false,
    search: false,
    history: false,
  })

  /**
   * 侧边栏展开状态
   */
  const sidebarCollapsed = ref(false)

  /**
   * 移动端状态
   */
  const isMobile = ref(false)

  /**
   * 当前激活的导航项
   */
  const activeNav = ref('chat')

  /**
   * 页面导航栈（移动端使用）
   */
  const navigationStack = ref<NavigationStackItem[]>([
    { view: 'sessionList' }
  ])

  /**
   * 是否显示消息列表（移动端控制）
   */
  const showMessageList = ref(false)

  /**
   * 是否显示联系人详情（移动端控制）
   */
  const showContactDetail = ref(false)

  /**
   * 当前会话ID（移动端导航用）
   */
  const currentMobileSessionId = ref<string | undefined>(undefined)

  /**
   * 当前联系人ID（移动端导航用）
   */
  const currentMobileContactId = ref<string | undefined>(undefined)

  /**
   * 全局错误信息
   */
  const error = ref<Error | null>(null)

  // ==================== Getters ====================

  /**
   * 是否为暗色主题
   */
  const isDark = computed(() => {
    if (settings.value.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return settings.value.theme === 'dark'
  })

  /**
   * 是否启用调试模式
   */
  const isDebug = computed(() => config.value.enableDebug)

  /**
   * 是否有错误
   */
  const hasError = computed(() => error.value !== null)

  /**
   * 是否正在加载
   */
  const isLoading = computed(() => {
    return Object.values(loading.value).some(v => v)
  })

  // ==================== Actions ====================

  /**
   * 初始化应用
   */
  function init() {
    // 从 localStorage 加载设置
    loadSettings()

    // 检测移动端
    checkMobile()

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile)

    // 设置主题监听器并应用主题
    setupThemeListener()
    applyTheme()

    if (isDebug.value) {
      console.log('📱 App initialized', {
        config: config.value,
        settings: settings.value,
        isMobile: isMobile.value,
      })
    }
  }

  /**
   * 加载设置
   */
  function loadSettings() {
    try {
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        settings.value = { ...settings.value, ...parsed }
      }

      // 从 chatlog-settings 加载 enableDebug（与 Settings 页面统一）
      const chatlogSettings = localStorage.getItem('chatlog-settings')
      if (chatlogSettings) {
        const parsed = JSON.parse(chatlogSettings)
        if (parsed.enableDebug !== undefined) {
          config.value.enableDebug = parsed.enableDebug
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  /**
   * 保存设置
   */
  function saveSettings() {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings.value))
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  /**
   * 更新设置
   */
  function updateSettings(newSettings: Partial<UserSettings>) {
    const oldTheme = settings.value.theme
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()

    // 如果更新了主题，重新设置监听器并应用主题
    if (newSettings.theme && newSettings.theme !== oldTheme) {
      setupThemeListener()
      applyTheme()
    }
  }

  /**
   * 设置系统主题监听器
   */
  function setupThemeListener() {
    // 移除旧的监听器
    if (systemThemeMediaQuery && systemThemeListener) {
      systemThemeMediaQuery.removeEventListener('change', systemThemeListener)
      systemThemeMediaQuery = null
      systemThemeListener = null
    }

    // 如果是 auto 模式，添加新的监听器
    if (settings.value.theme === 'auto') {
      systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemThemeListener = () => {
        applyTheme()
      }
      systemThemeMediaQuery.addEventListener('change', systemThemeListener)
    }
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(settings.value.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    updateSettings({ theme: themes[nextIndex] })
  }

  /**
   * 应用主题
   */
  function applyTheme() {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  /**
   * 检测移动端
   */
  function checkMobile() {
    const wasMobile = isMobile.value
    isMobile.value = window.innerWidth <= 768
    
    // 从移动端切换到PC端时，重置移动端状态
    if (wasMobile && !isMobile.value) {
      resetMobileNavigation()
    }
  }

  /**
   * 切换侧边栏
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /**
   * 导航到详情页（移动端）
   */
  function navigateToDetail(view: NavigationStackItem['view'], params?: NavigationStackItem['params']) {
    if (!isMobile.value) return

    navigationStack.value.push({ view, params })

    if (view === 'messageList') {
      showMessageList.value = true
      currentMobileSessionId.value = params?.sessionId
    } else if (view === 'contactDetail') {
      showContactDetail.value = true
      currentMobileContactId.value = params?.contactId
    }

    if (isDebug.value) {
      console.log('📱 Navigate to detail:', view, params, 'Stack:', navigationStack.value)
    }
  }

  /**
   * 返回上一页（移动端）
   */
  function navigateBack() {
    if (!isMobile.value || navigationStack.value.length <= 1) return

    const current = navigationStack.value.pop()

    if (current?.view === 'messageList') {
      showMessageList.value = false
      currentMobileSessionId.value = undefined
    } else if (current?.view === 'contactDetail') {
      showContactDetail.value = false
      currentMobileContactId.value = undefined
    }

    if (isDebug.value) {
      console.log('📱 Navigate back, Stack:', navigationStack.value)
    }
  }

  /**
   * 切换主视图（移动端底部标签栏）
   */
  function switchMobileView(view: string) {
    if (!isMobile.value) return

    setActiveNav(view)
    
    // 只在有二级页面时才重置导航栈
    // 避免不必要的状态清空，提升切换性能
    if (navigationStack.value.length > 1) {
      resetMobileNavigation()
    }

    if (isDebug.value) {
      console.log('📱 Switch mobile view:', view, 'Stack depth:', navigationStack.value.length)
    }
  }

  /**
   * 重置移动端导航状态
   */
  function resetMobileNavigation() {
    navigationStack.value = [{ view: 'sessionList' }]
    showMessageList.value = false
    showContactDetail.value = false
    currentMobileSessionId.value = undefined
    currentMobileContactId.value = undefined
  }

  /**
   * 检查是否可以返回
   */
  function canNavigateBack() {
    return isMobile.value && navigationStack.value.length > 1
  }

  /**
   * 设置激活的导航项
   */
  function setActiveNav(nav: string) {
    activeNav.value = nav
  }

  /**
   * 设置加载状态
   */
  function setLoading(key: keyof typeof loading.value, value: boolean) {
    loading.value[key] = value
  }

  /**
   * 设置错误
   */
  function setError(err: Error | null) {
    error.value = err
  }

  /**
   * 清除错误
   */
  function clearError() {
    error.value = null
  }

  /**
   * 重置状态
   */
  function $reset() {
    settings.value = {
      theme: 'light',
      language: 'zh-CN',
      fontSize: 'medium',
      messageDensity: 'comfortable',
      enterToSend: true,
      autoPlayVoice: false,
      showMessagePreview: true,
      timeFormat: '24h',
      showMediaResources: true,
      disableServerPinning: false,
    }
    sidebarCollapsed.value = false
    activeNav.value = 'chat'
    error.value = null
    Object.keys(loading.value).forEach(key => {
      loading.value[key as keyof typeof loading.value] = false
    })
    resetMobileNavigation()
  }

  // ==================== Return ====================

  return {
    // State
    config,
    settings,
    loading,
    sidebarCollapsed,
    isMobile,
    activeNav,
    error,
    navigationStack,
    showMessageList,
    showContactDetail,
    currentMobileSessionId,
    currentMobileContactId,

    // Getters
    isDark,
    isDebug,
    hasError,
    isLoading,

    // Actions
    init,
    loadSettings,
    saveSettings,
    updateSettings,
    toggleTheme,
    applyTheme,
    checkMobile,
    toggleSidebar,
    setActiveNav,
    setLoading,
    setError,
    clearError,
    $reset,
    navigateToDetail,
    navigateBack,
    switchMobileView,
    resetMobileNavigation,
    canNavigateBack,
  }
})