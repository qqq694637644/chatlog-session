<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVersion, getBuildDate, getVersionInfo } from '@/utils/version'
import { Guide } from '@element-plus/icons-vue'

const appStore = useAppStore()
const notificationStore = useNotificationStore()
const router = useRouter()

// 设置选项
const settings = ref({
  // API 设定
  apiTimeout: 30000,
  apiRetryCount: 3,
  apiRetryDelay: 1000,

  // 外观设置
  theme: appStore.isDark ? 'dark' : 'light',
  language: 'zh-CN',
  fontSize: 'medium',

  // 通知设置
  enableNotifications: true,
  enableMention: true,
  enableQuote: true,
  enableMessage: false,
  enableSound: true,
  enableVibrate: false,
  onlyShowLatest: true,
  autoCloseTime: 5,
  myWxid: '',
  showMessageContent: true,

  // 聊天设置
  enterToSend: true,
  showTimestamp: true,
  showAvatar: true,
  messageGrouping: true,
  showMediaResources: true,
  enableServerPinning: true,
  autoRefresh: false,
  autoRefreshInterval: 30,

  // 隐私设置
  saveHistory: true,
  autoDownloadMedia: true,
  compressImages: true,

  // 高级设置
  cacheSize: '100MB'
})

// 版本信息（从构建时注入）
const version = ref(getVersion())
const buildDate = ref(getBuildDate())

// 完整版本信息（可选，用于更详细的显示）
const versionInfo = getVersionInfo()

// 当前活动菜单
const activeMenu = ref('api')

// 菜单项
const menuItems = [
  { key: 'api', label: '服务连接', icon: 'Link' },
  { key: 'appearance', label: '外观设置', icon: 'Brush' },
  { key: 'notifications', label: '通知设置', icon: 'Bell' },
  { key: 'chat', label: '聊天设置', icon: 'ChatDotRound' },
  { key: 'privacy', label: '隐私设置', icon: 'Lock' },
  { key: 'advanced', label: '高级设置', icon: 'Setting' },
  { key: 'about', label: '关于', icon: 'InfoFilled' }
]

// 字体大小选项
const fontSizeOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' },
  { label: '特大', value: 'extra-large' }
]

// 语言选项
const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

// 主题选项
const themeOptions = [
  { label: '浅色', value: 'light', icon: 'Sunny' },
  { label: '深色', value: 'dark', icon: 'Moon' },
  { label: '跟随系统', value: 'auto', icon: 'Monitor' }
]

// API 超时选项
const apiTimeoutOptions = [
  { label: '10 秒', value: 10000 },
  { label: '30 秒', value: 30000 },
  { label: '60 秒', value: 60000 },
  { label: '120 秒', value: 120000 }
]

// 重试次数选项
// 通知权限状态
const notificationPermission = computed(() => notificationStore.permission)

// 通知统计
const notificationStats = computed(() => notificationStore.getStats())

const retryCountOptions = [
  { label: '不重试', value: 0 },
  { label: '1 次', value: 1 },
  { label: '3 次', value: 3 },
  { label: '5 次', value: 5 }
]

const testingApi = ref(false)
const testApiConnection = async () => {
  testingApi.value = true
  try {
    const response = await fetch('/api/v1/session?format=json', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    if (response.status === 401) {
      ElMessage.error('授权已失效，请重新通过桌面 BAT 打开网页')
      return
    }
    if (response.status !== 200) {
      ElMessage.error('连接失败：HTTP ' + response.status)
      return
    }

    const data = await response.json()
    if (data && (Array.isArray(data) || typeof data === 'object')) {
      ElMessage.success('安全代理连接正常')
    } else {
      ElMessage.error('服务响应格式不正确')
    }
  } catch (error: any) {
    ElMessage.error('连接失败：' + (error.message || '网络错误'))
  } finally {
    testingApi.value = false
  }
}
// 重置 API 设置
const resetApiSettings = () => {
  settings.value.apiTimeout = 30000
  settings.value.apiRetryCount = 3
  settings.value.apiRetryDelay = 1000
  appStore.config.enableDebug = false
  saveSettings()
  ElMessage.success('API 设置已重置')
}

// 从 localStorage 加载配置
const loadSettings = () => {
  try {
    localStorage.removeItem('apiBaseUrl')
    const savedSettings = localStorage.getItem('chatlog-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      if (parsed.apiTimeout !== undefined) settings.value.apiTimeout = parsed.apiTimeout
      if (parsed.apiRetryCount !== undefined) settings.value.apiRetryCount = parsed.apiRetryCount
      if (parsed.apiRetryDelay !== undefined) settings.value.apiRetryDelay = parsed.apiRetryDelay
      if (parsed.enableDebug !== undefined) appStore.config.enableDebug = parsed.enableDebug

      if (parsed.theme !== undefined) settings.value.theme = parsed.theme
      if (parsed.language !== undefined) settings.value.language = parsed.language
      if (parsed.fontSize !== undefined) settings.value.fontSize = parsed.fontSize

      if (parsed.enableNotifications !== undefined) settings.value.enableNotifications = parsed.enableNotifications
      if (parsed.enableMention !== undefined) settings.value.enableMention = parsed.enableMention
      if (parsed.enableQuote !== undefined) settings.value.enableQuote = parsed.enableQuote
      if (parsed.enableMessage !== undefined) settings.value.enableMessage = parsed.enableMessage
      if (parsed.enableSound !== undefined) settings.value.enableSound = parsed.enableSound
      if (parsed.enableVibrate !== undefined) settings.value.enableVibrate = parsed.enableVibrate
      if (parsed.onlyShowLatest !== undefined) settings.value.onlyShowLatest = parsed.onlyShowLatest
      if (parsed.autoCloseTime !== undefined) settings.value.autoCloseTime = parsed.autoCloseTime
      if (parsed.myWxid !== undefined) settings.value.myWxid = parsed.myWxid
      if (parsed.showMessageContent !== undefined) settings.value.showMessageContent = parsed.showMessageContent

      if (parsed.enterToSend !== undefined) settings.value.enterToSend = parsed.enterToSend
      if (parsed.showTimestamp !== undefined) settings.value.showTimestamp = parsed.showTimestamp
      if (parsed.showAvatar !== undefined) settings.value.showAvatar = parsed.showAvatar
      if (parsed.messageGrouping !== undefined) settings.value.messageGrouping = parsed.messageGrouping
      if (parsed.showMediaResources !== undefined) settings.value.showMediaResources = parsed.showMediaResources
      if (parsed.enableServerPinning !== undefined) settings.value.enableServerPinning = parsed.enableServerPinning
      if (parsed.autoRefresh !== undefined) settings.value.autoRefresh = parsed.autoRefresh
      if (parsed.autoRefreshInterval !== undefined) settings.value.autoRefreshInterval = parsed.autoRefreshInterval

      if (parsed.saveHistory !== undefined) settings.value.saveHistory = parsed.saveHistory
      if (parsed.autoDownloadMedia !== undefined) settings.value.autoDownloadMedia = parsed.autoDownloadMedia
      if (parsed.compressImages !== undefined) settings.value.compressImages = parsed.compressImages

      if (parsed.cacheSize !== undefined) settings.value.cacheSize = parsed.cacheSize

      console.log('[Settings] 已加载保存的配置')
    } else {
      console.log('[Settings] 未找到保存的配置，使用默认值')
    }
  } catch (error) {
    console.error('[Settings] 加载配置失败:', error)
    ElMessage.warning('加载配置失败，使用默认配置')
  }
}

// 组件挂载时加载配置
onMounted(async () => {
  loadSettings()
  // 初始化通知 Store
  await notificationStore.init()
  // 从 notificationStore 加载设置
  settings.value.myWxid = notificationStore.config.myWxid || ''
  settings.value.showMessageContent = notificationStore.config.showMessageContent
  // 同步通知设置
  syncNotificationSettings()
})

// 切换主题
const handleThemeChange = (theme: string) => {
  appStore.updateSettings({ theme: theme as 'light' | 'dark' | 'auto' })
  ElMessage.success('主题已切换')
}

// 同步通知设置到 Store
const syncNotificationSettings = () => {
  notificationStore.updateConfig({
    enabled: settings.value.enableNotifications,
    enableMention: settings.value.enableMention,
    enableQuote: settings.value.enableQuote,
    enableMessage: settings.value.enableMessage,
    enableSound: settings.value.enableSound,
    enableVibrate: settings.value.enableVibrate,
    onlyShowLatest: settings.value.onlyShowLatest,
    autoClose: settings.value.autoCloseTime,
    myWxid: settings.value.myWxid,
    showMessageContent: settings.value.showMessageContent,
  })
}

// 请求通知权限
const requestNotificationPermission = async () => {
  const result = await notificationStore.requestPermission()
  if (result === 'granted') {
    ElMessage.success('通知权限已授予')
    settings.value.enableNotifications = true
    saveSettings()
  } else if (result === 'denied') {
    ElMessage.error('通知权限被拒绝')
  }
}

// 测试通知
const testNotification = async () => {
  console.log('🔔 Starting test notification...')
  console.log('Current permission:', notificationPermission.value)
  console.log('Config enabled:', notificationStore.config.enabled)
  
  try {
    const success = await notificationStore.testNotification()
    
    if (success) {
      ElMessage.success({
        message: '测试通知已发送，请查看浏览器右上角的通知',
        duration: 3000
      })
      console.log('✅ Test notification sent successfully')
    } else {
      ElMessage.error({
        message: '无法发送通知，请检查权限设置',
        duration: 5000
      })
      console.error('❌ Test notification failed')
    }
  } catch (error) {
    console.error('❌ Test notification error:', error)
    ElMessage.error({
      message: `发送通知失败: ${error instanceof Error ? error.message : '未知错误'}`,
      duration: 5000
    })
  }
}

// 清空通知历史
const clearNotificationHistory = () => {
  ElMessageBox.confirm('确定要清空所有通知历史吗？', '确认清空', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    notificationStore.clearHistory()
    ElMessage.success('通知历史已清空')
  }).catch(() => {
    // 用户取消
  })
}

// 保存设置
const saveSettings = () => {
  // 保存其他设置到 chatlog-settings（包含 enableDebug）
  const settingsToSave = {
    ...settings.value,
    enableDebug: appStore.config.enableDebug
  }
  localStorage.setItem('chatlog-settings', JSON.stringify(settingsToSave))

  // 同步用户设置到 appStore
  appStore.updateSettings({
    showMediaResources: settings.value.showMediaResources,
    disableServerPinning: !settings.value.enableServerPinning
  })

  // 同步通知设置到 notificationStore
  syncNotificationSettings()

  // 触发自定义事件，通知其他组件设置已更新
  window.dispatchEvent(new CustomEvent('chatlog-settings-updated', {
    detail: settingsToSave
  }))

  ElMessage.success('设置已保存')
}

// 重置设置
const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有设置吗？此操作不可恢复。',
      '重置设置',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    // 重置为默认值
    settings.value = {
      apiTimeout: 30000,
      apiRetryCount: 3,
      apiRetryDelay: 1000,
      theme: 'light',
      language: 'zh-CN',
      fontSize: 'medium',
      enableNotifications: true,
      enableSound: true,
      enterToSend: true,
      showTimestamp: true,
      showAvatar: true,
      messageGrouping: true,
      showMediaResources: true,
      enableServerPinning: true,
      autoRefresh: false,
      autoRefreshInterval: 30,
      enableMention: true,
      enableQuote: true,
      enableMessage: false,
      enableVibrate: false,
      onlyShowLatest: true,
      autoCloseTime: 5,
      myWxid: '',
      showMessageContent: true,
      saveHistory: true,
      autoDownloadMedia: true,
      compressImages: true,
      cacheSize: '100MB'
    }
    appStore.config.enableDebug = false

    localStorage.removeItem('chatlog-settings')
    ElMessage.success('设置已重置')
  } catch {
    // 用户取消
  }
}

// 清除缓存
const clearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有缓存吗？这将删除本地存储的聊天记录。',
      '清除缓存',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    // 清除缓存
    localStorage.clear()
    sessionStorage.clear()

    ElMessage.success('缓存已清除')
  } catch {
    // 用户取消
  }
}

// 导出数据
const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

// 检查更新
const checkUpdate = () => {
  ElMessage.info('当前已是最新版本')
}

// 重新运行引导
const restartOnboarding = async () => {
  try {
    await ElMessageBox.confirm(
      '重新运行引导将清除当前的引导完成标记。确定要继续吗？',
      '重新运行引导',
      {
        type: 'info',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    // 清除引导完成标记
    localStorage.removeItem('onboardingCompleted')
    localStorage.removeItem('onboardingSkippedAt')

    ElMessage.success('即将打开引导页面')

    // 跳转到引导页面
    setTimeout(() => {
      router.push('/onboarding')
    }, 500)
  } catch {
    // 用户取消
  }
}


</script>

<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- 侧边栏菜单 -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
          <!-- <el-button text size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
          </el-button> -->
          <h2>设置</h2>
        </div>

        <el-menu
          :default-active="activeMenu"
          class="settings-menu"
          @select="(key: string) => activeMenu = key"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.key"
            :index="item.key"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 设置内容 -->
      <div class="settings-content">
        <el-scrollbar>
          <!-- 服务连接 -->
          <div v-show="activeMenu === 'api'" class="setting-section">
            <div class="section-header">
              <h3>安全连接</h3>
              <p>所有数据请求均通过当前网站的授权代理访问</p>
            </div>

            <el-alert
              title="同源安全代理已启用"
              type="success"
              :closable="false"
              show-icon
              style="margin-bottom: 20px"
            >
              <template #default>
                <div style="line-height: 1.8">
                  <p>• 浏览器只访问当前网页，不直接连接 Chatlog 数据服务。</p>
                  <p>• 服务端会验证每个数据请求携带的 HttpOnly API Key Cookie。</p>
                  <p>• 图片、视频、语音和文件请求也经过相同的授权检查。</p>
                </div>
              </template>
            </el-alert>

            <el-form label-position="left" label-width="120px">
              <el-form-item label="连接测试">
                <el-button
                  type="primary"
                  :loading="testingApi"
                  @click="testApiConnection"
                >
                  <el-icon><Connection /></el-icon>
                  测试安全连接
                </el-button>
                <el-text type="info" size="small" style="margin-left: 12px">
                  验证授权和本机 Chatlog 服务是否正常
                </el-text>
              </el-form-item>

              <el-divider />

              <el-form-item label="请求超时">
                <el-select v-model="settings.apiTimeout" style="width: 200px">
                  <el-option
                    v-for="option in apiTimeoutOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-text type="info" size="small" style="margin-left: 12px">
                  API 请求的超时时间
                </el-text>
              </el-form-item>

              <el-form-item label="重试次数">
                <el-select v-model="settings.apiRetryCount" style="width: 200px">
                  <el-option
                    v-for="option in retryCountOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-text type="info" size="small" style="margin-left: 12px">
                  请求失败后的重试次数
                </el-text>
              </el-form-item>

              <el-form-item label="重试延迟">
                <el-input-number
                  v-model="settings.apiRetryDelay"
                  :min="100"
                  :max="10000"
                  :step="100"
                  style="width: 200px"
                />
                <el-text type="info" size="small" style="margin-left: 12px">
                  毫秒（ms）
                </el-text>
              </el-form-item>

              <el-divider />

              <el-form-item label="调试模式">
                <el-switch v-model="appStore.config.enableDebug" />
                <el-text type="info" size="small" style="margin-left: 12px">
                  在控制台输出 API 请求详情和调试信息
                </el-text>
              </el-form-item>

              <el-form-item>
                <el-button type="warning" @click="resetApiSettings">
                  <el-icon><RefreshRight /></el-icon>
                  重置连接设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 外观设置 -->
          <div v-show="activeMenu === 'appearance'" class="setting-section">
            <div class="section-header">
              <h3>外观设置</h3>
              <p>自定义界面外观</p>
            </div>

            <el-form label-position="left" label-width="120px">
              <el-form-item label="主题模式">
                <el-radio-group
                  v-model="settings.theme"
                  @change="(val: any) => handleThemeChange(String(val))"
                >
                  <el-radio-button
                    v-for="option in themeOptions"
                    :key="option.value"
                    :label="option.value"
                  >
                    <el-icon><component :is="option.icon" /></el-icon>
                    {{ option.label }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="语言">
                <el-select v-model="settings.language" style="width: 200px">
                  <el-option
                    v-for="option in languageOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="字体大小">
                <el-radio-group v-model="settings.fontSize">
                  <el-radio-button
                    v-for="option in fontSizeOptions"
                    :key="option.value"
                    :label="option.value"
                  >
                    {{ option.label }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>

          <!-- 通知设置 -->
          <div v-show="activeMenu === 'notifications'" class="setting-section">
            <div class="section-header">
              <h3>通知设置</h3>
              <p>管理消息通知</p>
            </div>

            <el-form label-position="left" label-width="120px">
              <!-- 通知权限状态 -->
              <el-alert
                v-if="notificationPermission === 'denied'"
                type="error"
                :closable="false"
                style="margin-bottom: 16px"
              >
                <template #title>
                  <span style="font-size: 13px">通知权限已被拒绝</span>
                </template>
                <div style="font-size: 12px; margin-top: 4px">
                  请在浏览器设置中允许通知权限，然后刷新页面
                </div>
              </el-alert>

              <el-alert
                v-else-if="notificationPermission === 'default'"
                type="warning"
                :closable="false"
                style="margin-bottom: 16px"
              >
                <template #title>
                  <span style="font-size: 13px">需要通知权限</span>
                </template>
                <div style="font-size: 12px; margin-top: 4px">
                  <el-button size="small" type="primary" @click="requestNotificationPermission">
                    请求通知权限
                  </el-button>
                </div>
              </el-alert>

              <el-alert
                v-else
                type="success"
                :closable="false"
                style="margin-bottom: 16px"
              >
                <template #title>
                  <span style="font-size: 13px">通知权限已授予</span>
                </template>
              </el-alert>

              <el-divider />

              <!-- 全局开关 -->
              <el-form-item label="启用通知">
                <el-switch v-model="settings.enableNotifications" />
                <span class="form-tip">关闭后将不会收到任何通知</span>
              </el-form-item>

              <el-divider />

              <!-- 基础设置 -->
              <div style="margin-bottom: 16px">
                <el-text tag="b">基础设置</el-text>
              </div>

              <el-form-item label="我的微信 ID">
                <el-input
                  v-model="settings.myWxid"
                  placeholder="请输入你的微信ID"
                  :disabled="!settings.enableNotifications"
                  style="width: 300px"
                />
                <span class="form-tip">用于识别哪些消息与你有关（如 @我）</span>
              </el-form-item>

              <el-form-item label="显示消息内容">
                <el-switch
                  v-model="settings.showMessageContent"
                  :disabled="!settings.enableNotifications"
                />
                <span class="form-tip">关闭后通知只显示"有新消息"，不显示具体内容（隐私保护）</span>
              </el-form-item>

              <el-divider />

              <!-- 通知类型 -->
              <div style="margin-bottom: 16px">
                <el-text tag="b">通知类型</el-text>
              </div>

              <el-form-item label="@我的消息">
                <el-switch
                  v-model="settings.enableMention"
                  :disabled="!settings.enableNotifications"
                />
                <span class="form-tip">有人在群聊中 @你</span>
              </el-form-item>

              <el-form-item label="引用我的消息">
                <el-switch
                  v-model="settings.enableQuote"
                  :disabled="!settings.enableNotifications"
                />
                <span class="form-tip">有人引用了你的消息</span>
              </el-form-item>

              <el-form-item label="普通消息">
                <el-switch
                  v-model="settings.enableMessage"
                  :disabled="!settings.enableNotifications"
                />
                <span class="form-tip">所有新消息（可能会很多）</span>
              </el-form-item>

              <el-divider />

              <!-- 通知行为 -->
              <div style="margin-bottom: 16px">
                <el-text tag="b">通知行为</el-text>
              </div>

              <el-form-item label="通知声音">
                <el-switch
                  v-model="settings.enableSound"
                  :disabled="!settings.enableNotifications"
                />
              </el-form-item>

              <el-form-item label="震动提示">
                <el-switch
                  v-model="settings.enableVibrate"
                  :disabled="!settings.enableNotifications"
                />
                <span class="form-tip">仅移动设备支持</span>
              </el-form-item>



              <el-form-item label="只显示最新">
                <el-switch
                  v-model="settings.onlyShowLatest"
                  :disabled="!settings.enableNotifications"
                />
                <span class="form-tip">新通知会替换旧通知</span>
              </el-form-item>

              <el-form-item label="自动关闭">
                <el-input-number
                  v-model="settings.autoCloseTime"
                  :min="0"
                  :max="60"
                  :step="1"
                  :disabled="!settings.enableNotifications"
                  style="width: 150px"
                />
                <el-text type="info" size="small" style="margin-left: 12px">
                  秒（0 表示不自动关闭）
                </el-text>
              </el-form-item>

              <el-divider />

              <!-- 通知测试 -->
              <el-form-item label="测试通知">
                <el-button
                  :disabled="notificationPermission !== 'granted'"
                  @click="testNotification"
                >
                  <el-icon><Bell /></el-icon>
                  发送测试通知
                </el-button>
              </el-form-item>

              <!-- 通知统计 -->
              <el-form-item label="通知统计">
                <el-space direction="vertical" size="small">
                  <el-text size="small">未读通知: {{ notificationStats.unreadCount }}</el-text>
                  <el-text size="small">历史通知: {{ notificationStats.totalNotifications }}</el-text>
                  <el-text size="small">静音会话: {{ notificationStats.muteCount }}</el-text>
                </el-space>
              </el-form-item>

              <el-form-item label="清空历史">
                <el-button @click="clearNotificationHistory">
                  <el-icon><Delete /></el-icon>
                  清空通知历史
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 聊天设置 -->
          <div v-show="activeMenu === 'chat'" class="setting-section">
            <div class="section-header">
              <h3>聊天设置</h3>
              <p>自定义聊天行为</p>
            </div>

            <el-form label-position="left" label-width="120px">
              <!-- <el-form-item label="回车发送">
                <el-switch v-model="settings.enterToSend" />
                <span class="form-tip">关闭后使用 Ctrl+Enter 发送</span>
              </el-form-item> -->

              <el-form-item label="显示时间">
                <el-switch v-model="settings.showTimestamp" />
              </el-form-item>

              <el-form-item label="显示头像">
                <el-switch v-model="settings.showAvatar" />
              </el-form-item>

              <el-form-item label="消息分组">
                <el-switch v-model="settings.messageGrouping" />
                <span class="form-tip">相同发送者的连续消息合并显示</span>
              </el-form-item>

              <el-form-item label="同步服务端置顶">
                <el-switch v-model="settings.enableServerPinning" />
                <span class="form-tip">关闭后仅显示本地置顶会话</span>
              </el-form-item>

              <el-divider />

              <el-form-item label="显示媒体资源">
                <el-switch v-model="settings.showMediaResources" />
                <span class="form-tip">显示图片、视频、表情等外部资源</span>
              </el-form-item>

              <el-alert
                v-if="!settings.showMediaResources"
                type="warning"
                :closable="false"
                style="margin-top: 12px"
              >
                <template #title>
                  <span style="font-size: 13px">关闭后媒体资源将显示为文本描述（如 [图片]）</span>
                </template>
                <div style="font-size: 12px; margin-top: 4px">
                  适用于 Chatlog 服务无法获取附件密钥的情况
                </div>
              </el-alert>

              <el-divider />

              <el-form-item label="自动刷新">
                <el-switch v-model="settings.autoRefresh" />
                <span class="form-tip">自动刷新会话列表和消息</span>
              </el-form-item>

              <el-form-item v-if="settings.autoRefresh" label="刷新间隔">
                <el-input-number
                  v-model="settings.autoRefreshInterval"
                  :min="10"
                  :max="300"
                  :step="10"
                  style="width: 200px"
                />
                <el-text type="info" size="small" style="margin-left: 12px">
                  秒（s）
                </el-text>
              </el-form-item>
            </el-form>
          </div>

          <!-- 隐私设置 -->
          <div v-show="activeMenu === 'privacy'" class="setting-section">
            <div class="section-header">
              <h3>隐私设置</h3>
              <p>管理隐私和数据</p>
            </div>

            <el-form label-position="left" label-width="120px">
              <el-form-item label="保存历史">
                <el-switch v-model="settings.saveHistory" />
              </el-form-item>

              <el-form-item label="自动下载">
                <el-switch v-model="settings.autoDownloadMedia" />
                <span class="form-tip">自动下载图片和视频</span>
              </el-form-item>

              <el-form-item label="压缩图片">
                <el-switch v-model="settings.compressImages" />
              </el-form-item>

              <el-form-item label="数据管理">
                <el-space>
                  <el-button @click="exportData">
                    <el-icon><Download /></el-icon>
                    导出数据
                  </el-button>
                  <el-button type="danger" @click="clearCache">
                    <el-icon><Delete /></el-icon>
                    清除缓存
                  </el-button>
                </el-space>
              </el-form-item>
            </el-form>
          </div>

          <!-- 高级设置 -->
          <div v-show="activeMenu === 'advanced'" class="setting-section">
            <div class="section-header">
              <h3>高级设置</h3>
              <p>仅供高级用户使用</p>
            </div>

            <el-form label-position="left" label-width="120px">
              <el-form-item label="调试模式">
                <el-switch v-model="appStore.config.enableDebug" />
                <span class="form-tip">在控制台输出 API 请求详情和调试信息</span>
              </el-form-item>

              <el-form-item label="缓存大小">
                <el-input
                  v-model="settings.cacheSize"
                  readonly
                  style="width: 200px"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 关于 -->
          <div v-show="activeMenu === 'about'" class="setting-section">
            <div class="section-header">
              <h3>关于 Chatlog Session</h3>
            </div>

            <div class="about-content">
              <div class="app-logo">
                <el-icon size="80" color="#07c160">
                  <ChatLineSquare />
                </el-icon>
              </div>

              <div class="app-info">
                <h2>Chatlog Session</h2>
                <p class="version">版本 {{ version }}</p>
                <p class="build-date">构建日期: {{ buildDate }}</p>
                <p v-if="versionInfo.gitHash && versionInfo.gitHash !== 'unknown'" class="git-info">
                  提交: {{ versionInfo.gitHash }}
                </p>
              </div>

              <div class="about-actions">
                <el-button type="primary" @click="checkUpdate">
                  <el-icon><Refresh /></el-icon>
                  检查更新
                </el-button>
                <el-button @click="restartOnboarding">
                  <el-icon><Guide /></el-icon>
                  重新运行新手引导
                </el-button>
              </div>

              <el-divider />

              <div class="about-details">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="项目名称">
                    Chatlog Session
                  </el-descriptions-item>
                  <el-descriptions-item label="版本">
                    {{ version }}
                  </el-descriptions-item>
                  <el-descriptions-item label="构建日期">
                    {{ buildDate }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="versionInfo.buildTime && versionInfo.buildTime !== buildDate"
                    label="构建时间"
                  >
                    {{ versionInfo.buildTime }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="versionInfo.gitHash && versionInfo.gitHash !== 'unknown'"
                    label="Git Hash"
                  >
                    <el-tag size="small" type="info">{{ versionInfo.gitHash }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="versionInfo.gitBranch && versionInfo.gitBranch !== 'unknown'"
                    label="Git 分支"
                  >
                    <el-tag size="small" :type="versionInfo.gitBranch === 'main' ? 'success' : 'warning'">
                      {{ versionInfo.gitBranch }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="环境">
                    <el-tag size="small" :type="versionInfo.isDev ? 'warning' : 'success'">
                      {{ versionInfo.isDev ? '开发版本' : '生产版本' }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="技术栈">
                    Vue 3 + TypeScript + Vite
                  </el-descriptions-item>
                  <el-descriptions-item label="开源协议">
                    Apache-2.0 License
                  </el-descriptions-item>
                  <el-descriptions-item label="项目仓库">
                    <el-link
                      href="https://github.com/xlight/chatlog-session"
                      target="_blank"
                      type="primary"
                    >
                      GitHub
                    </el-link>
                  </el-descriptions-item>
                </el-descriptions>
              </div>

            </div>
          </div>
        </el-scrollbar>

        <!-- 底部操作栏 -->
        <div class="settings-footer">
          <el-button @click="resetSettings">重置设置</el-button>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color);
  overflow: hidden;
}

.settings-container {
  display: flex;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

// 侧边栏
.settings-sidebar {
  width: 240px;
  height: 100%;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    gap: 8px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .settings-menu {
    flex: 1;
    border-right: none;
    overflow-y: auto;
  }
}

// 内容区域
.settings-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;

  .setting-section {
    padding: 24px 32px;

    .section-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .form-tip {
      margin-left: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    // 关于页面
    .about-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 24px;

      .app-logo {
        margin: 24px 0;
      }

      .app-info {
        text-align: center;

        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }

        .version {
          margin: 4px 0;
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }

        .build-date {
          margin: 4px 0;
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }

        .git-info {
          margin: 4px 0;
          font-size: 11px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          color: var(--el-text-color-placeholder);
          background-color: var(--el-fill-color-light);
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
        }
      }

      .about-details {
        width: 100%;
        max-width: 600px;
      }

      .about-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .settings-footer {
    padding: 16px 32px;
    border-top: 1px solid var(--el-border-color-light);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
    background-color: var(--el-bg-color);
  }
}

// 响应式
@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }

  .settings-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--el-border-color-light);

    .settings-menu {
      display: flex;
      overflow-x: auto;
      overflow-y: visible;

      :deep(.el-menu-item) {
        flex-shrink: 0;
      }
    }
  }

  .settings-content {
    .setting-section {
      padding: 16px;

      .el-form {
        :deep(.el-form-item__label) {
          width: 100px !important;
        }
      }
    }

    .settings-footer {
      padding: 12px 16px;
    }
  }
}
</style>
