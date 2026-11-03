/**
 * HTTP 请求封装
 * 基于 axios 封装统一的请求处理
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse, ApiError } from '@/types/api'

/**
 * 扩展 axios 配置类型，支持重试
 */
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: number
      retryCount?: number
    }
  }
}

/**
 * 从 localStorage 读取设置
 */
const getSettings = () => {
  try {
    const settings = localStorage.getItem('chatlog-settings')
    return settings ? JSON.parse(settings) : {}
  } catch {
    return {}
  }
}

/**
 * API 统一通过当前网页的同源服务端代理访问。
 * 空 baseURL 表示使用当前页面 origin，不在浏览器暴露 Go 服务地址。
 */
export const getApiBaseUrl = (): string => ''

/**
 * 获取动态配置
 */
const getDynamicConfig = (): AxiosRequestConfig => {
  const settings = getSettings()
  
  return {
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    timeout: settings.apiTimeout || Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  }
}

/**
 * 请求配置
 */
const config: AxiosRequestConfig = getDynamicConfig()

/**
 * 创建 axios 实例
 */
const service: AxiosInstance = axios.create(config)

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 初始化元数据
    if (!config.metadata) {
      config.metadata = {}
    }
    config.metadata.startTime = Date.now()
    config.withCredentials = true
    
    // 初始化重试计数
    if (config.metadata.retryCount === undefined) {
      config.metadata.retryCount = 0
    }
    
    const settings = getSettings()
    if (settings.apiTimeout) {
      config.timeout = settings.apiTimeout
    }
    
    // 添加默认分页参数（如果没有提供）
    if (config.method?.toLowerCase() === 'get') {
      const userParams = config.params || {}
      
      // 设置默认值，用户参数优先
      config.params = {
        limit: 200,     // 默认值
        offset: 0,      // 默认值
        ...userParams,  // 用户参数会覆盖默认值
        format: 'json', // 始终添加 format
        _t: Date.now(), // 始终添加时间戳
      }
    } else {
      // 非 GET 请求也添加 format 参数
      config.params = {
        ...config.params,
        format: 'json',
      }
    }

    // 开发环境日志或用户开启了 API 调试
    const enableDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true' || settings.enableDebug
    if (import.meta.env.DEV && enableDebug) {
      console.log('📤 API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''))
      console.log('📤 Request Params:', config.params || config.data)
      console.log('📤 Request Config:', {
        timeout: config.timeout,
        baseURL: config.baseURL
      })
    }
    
    // 调试：打印最终参数（临时）
    if (config.method?.toLowerCase() === 'get' && config.url?.includes('/contact')) {
      console.log('🔍 Final params for', config.url, ':', config.params)
    }

    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    // 开发环境日志或用户开启了 API 调试
    const settings = getSettings()
    const enableDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true' || settings.enableDebug
    if (import.meta.env.DEV && enableDebug) {
      const duration = response.config.metadata?.startTime 
        ? Date.now() - response.config.metadata.startTime 
        : 0
      console.log('📥 API Response:', response.config.url, `(${duration}ms)`)
      console.log('📥 Response Data:', data)
    }

    // 处理 Chatlog API 的响应格式
    // 优先级从高到低处理各种响应格式
    
    // 1. 如果是数组，直接返回（某些旧接口）
    if (Array.isArray(data)) {
      return data as any
    }

    // 2. 如果不是对象，直接返回（字符串、数字等）
    if (!data || typeof data !== 'object') {
      return data as any
    }

    // 3. Chatlog API 标准格式：{ items: [...] }
    if ('items' in data) {
      return data as any
    }

    // 4. 标准 REST API 格式：{ code: 0, data: ..., message: ... }
    if ('code' in data) {
      if (data.code === 0) {
        return data.data
      }
      // 业务错误
      const errorMessage = data.message || '请求失败'
      ElMessage.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    // 5. 其他格式，直接返回原始数据
    return data as any
  },
  async (error: AxiosError<ApiError>) => {
    const settings = getSettings()
    const enableDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true' || settings.enableDebug
    const config = error.config as InternalAxiosRequestConfig
    
    // 获取重试配置
    const retryCount = settings.apiRetryCount ?? 3
    const retryDelay = settings.apiRetryDelay ?? 1000
    
    // 判断是否应该重试
    const shouldRetry = config && 
                       config.metadata &&
                       config.metadata.retryCount !== undefined &&
                       config.metadata.retryCount < retryCount &&
                       (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED')
    
    if (shouldRetry && config.metadata) {
      config.metadata.retryCount = (config.metadata.retryCount || 0) + 1
      
      if (enableDebug) {
        console.warn(`🔄 API Retry (${config.metadata.retryCount}/${retryCount}):`, config.url)
      }
      
      // 等待重试延迟
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      
      // 重新发起请求
      return service(config)
    }
    
    // 记录错误日志
    if (enableDebug) {
      console.error('❌ API Error:', error.config?.url)
      console.error('❌ Error Details:', {
        status: error.response?.status,
        message: error.message,
        retries: config?.metadata?.retryCount || 0,
        config: {
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
          url: error.config?.url
        }
      })
    } else {
      console.error('❌ Response Error:', error.message)
    }

    // 处理不同的错误状态
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          ElMessage.error(data?.message || '请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请登录')
          // 跳转到登录页面
          // router.push('/login')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 408:
          ElMessage.error('请求超时')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        default:
          ElMessage.error(data?.message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      // 请求配置出错
      ElMessage.error(error.message || '请求配置错误')
    }

    return Promise.reject(error)
  }
)

/**
 * 通用请求方法
 */
class Request {
  /**
   * GET 请求
   */
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, { params, ...config })
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, { params, ...config })
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.patch(url, data, config)
  }

  /**
   * 上传文件
   */
  upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  /**
   * 下载文件
   */
  download(url: string, filename?: string): Promise<void> {
    return service
      .get(url, {
        responseType: 'blob',
      })
      .then((response: any) => {
        const blob = new Blob([response])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = filename || 'download'
        link.click()
        window.URL.revokeObjectURL(link.href)
      })
  }

  /**
   * 批量请求
   */
  all<T = any>(requests: Promise<any>[]): Promise<T[]> {
    return Promise.all(requests)
  }
}

/**
 * 导出请求实例
 */
export const request = new Request()

/**
 * 导出 axios 实例（用于特殊情况）
 */
export default service
