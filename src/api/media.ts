/**
 * 多媒体资源 API
 * 对应后端多媒体路由相关接口
 */

import { request, getApiBaseUrl } from '@/utils/request'

/**
 * 多媒体 API 类
 */
class MediaAPI {
  private get baseURL(): string {
    return getApiBaseUrl()
  }

  /**
   * 获取图片 URL
   * GET /image/:id
   *
   * @param id 图片 ID
   * @returns 图片 URL
   */
  getImageUrl(id: string , path?: string): string {
    if(id){
      return `${this.baseURL}/image/${encodeURIComponent(id)}`
    }
    if(path){
      return this.getDataUrl(path)
    }
    return `${this.baseURL}/image/${encodeURIComponent(id)}`
  }

  /**
   * 获取缩略图 URL
   * GET /image/:id?thumbnail=true
   *
   * @param id 图片 ID
   * @returns 缩略图 URL
   */
  getThumbnailUrl(id: string, path?: string): string {
    if(path){
      return this.getDataUrl(path) + '_t.dat'
    }
    return `${this.baseURL}/image/${encodeURIComponent(id)}?thumbnail=true`
  }

  /**
   * 获取视频 URL
   * GET /video/:id
   *
   * @param id 视频 ID
   * @returns 视频 URL
   */
  getVideoUrl(id: string): string {
    return `${this.baseURL}/video/${encodeURIComponent(id)}`
  }

  /**
   * 获取语音 URL
   * GET /voice/:id
   *
   * @param id 语音 ID
   * @returns 语音 URL
   */
  getVoiceUrl(id: string): string {
    return `${this.baseURL}/voice/${encodeURIComponent(id)}`
  }

  /**
   * 获取文件 URL
   * GET /file/:id
   *
   * @param id 文件 ID
   * @returns 文件 URL
   */
  getFileUrl(id: string): string {
    return `${this.baseURL}/file/${encodeURIComponent(id)}`
  }

  /**
   * 获取数据文件 URL
   * GET /data/:path
   *
   * @param path 文件路径
   * @returns 数据文件 URL
   */
  getDataUrl(path: string): string {
    //replace \\ to /
    path = path.replace(/\\/g, '/')
    return `${this.baseURL}/data/${path}`
  }

  /**
   * 获取头像 URL
   *
   * @param avatarPath 头像路径或 ID
   * @returns 头像 URL
   */
  getAvatarUrl(avatarPath: string): string {
    if (!avatarPath) {
      return ''
    }

    // 如果是完整 URL，直接返回
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath
    }

    // 如果是相对路径，拼接为完整 URL
    return `${this.baseURL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`
  }

  /**
   * 下载图片
   *
   * @param id 图片 ID
   * @param filename 保存的文件名
   */
  downloadImage(id: string, filename?: string): Promise<void> {
    return request.download(this.getImageUrl(id), filename || `image-${id}.jpg`)
  }

  /**
   * 下载视频
   *
   * @param id 视频 ID
   * @param filename 保存的文件名
   */
  downloadVideo(id: string, filename?: string): Promise<void> {
    return request.download(this.getVideoUrl(id), filename || `video-${id}.mp4`)
  }

  /**
   * 下载语音
   *
   * @param id 语音 ID
   * @param filename 保存的文件名
   */
  downloadVoice(id: string, filename?: string): Promise<void> {
    return request.download(this.getVoiceUrl(id), filename || `voice-${id}.mp3`)
  }

  /**
   * 下载文件
   *
   * @param id 文件 ID
   * @param filename 保存的文件名
   */
  downloadFile(id: string, filename?: string): Promise<void> {
    return request.download(this.getFileUrl(id), filename || `file-${id}`)
  }

  /**
   * 预加载图片
   *
   * @param url 图片 URL
   * @returns Promise，图片加载完成后 resolve
   */
  preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 批量预加载图片
   *
   * @param urls 图片 URL 列表
   * @returns Promise，所有图片加载完成后 resolve
   */
  async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const promises = urls.map(url => this.preloadImage(url))
    return request.all<HTMLImageElement>(promises)
  }

  /**
   * 获取图片尺寸
   *
   * @param url 图片 URL
   * @returns 图片宽高
   */
  async getImageSize(url: string): Promise<{ width: number; height: number }> {
    const img = await this.preloadImage(url)
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
    }
  }

  /**
   * 检查资源是否可访问
   *
   * @param url 资源 URL
   * @returns 是否可访问
   */
  async checkResourceAvailable(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 根据消息类型获取资源 URL
   *
   * @param type 消息类型
   * @param resourceId 资源 ID
   * @returns 资源 URL
   */
  getResourceUrlByType(type: number, resourceId: string): string {
    switch (type) {
      case 3: // 图片
        return this.getImageUrl(resourceId)
      case 34: // 语音
        return this.getVoiceUrl(resourceId)
      case 43: // 视频
        return this.getVideoUrl(resourceId)
      case 49: // 文件
        return this.getFileUrl(resourceId)
      default:
        return ''
    }
  }

  /**
   * 根据消息类型下载资源
   *
   * @param type 消息类型
   * @param resourceId 资源 ID
   * @param filename 保存的文件名
   */
  downloadResourceByType(type: number, resourceId: string, filename?: string): Promise<void> {
    switch (type) {
      case 3: // 图片
        return this.downloadImage(resourceId, filename)
      case 34: // 语音
        return this.downloadVoice(resourceId, filename)
      case 43: // 视频
        return this.downloadVideo(resourceId, filename)
      case 49: // 文件
        return this.downloadFile(resourceId, filename)
      default:
        return Promise.reject(new Error('不支持的消息类型'))
    }
  }

  /**
   * 获取媒体类型描述
   *
   * @param type 消息类型
   * @returns 媒体类型描述
   */
  getMediaTypeLabel(type: number): string {
    const labels: Record<number, string> = {
      3: '图片',
      34: '语音',
      43: '视频',
      47: '表情',
      49: '文件',
    }
    return labels[type] || '未知'
  }

  /**
   * 判断是否为媒体消息
   *
   * @param type 消息类型
   * @returns 是否为媒体消息
   */
  isMediaMessage(type: number): boolean {
    return [3, 34, 43, 47, 49].includes(type)
  }
}

/**
 * 导出单例
 */
export const mediaAPI = new MediaAPI()

/**
 * 默认导出
 */
export default mediaAPI
