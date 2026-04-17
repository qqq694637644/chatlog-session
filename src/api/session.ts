/**
 * 会话管理 API
 * 对应后端 /api/v1/session 相关接口
 */

import { request } from '@/utils/request'
import type { Session } from '@/types/session'
import type { SessionParams } from '@/types/api'

/**
 * 后端返回的会话数据结构
 */
interface SessionApiResponse {
  userName: string      // 用户ID/会话ID
  nOrder: number        // 排序序号/时间戳
  nickName: string      // 昵称
  content: string       // 最后消息内容
  nTime: string         // 最后消息时间 (ISO 8601格式)
  avatarUrl?: string    // 头像URL
  parentRef?: string    // 父引用
  nUnReadCount?: number // 未读数
  isPinned?: boolean    // 是否置顶
  isMinimized?: boolean // 是否最小化
}

/**
 * API 响应包装器
 */
interface ApiResponse<T> {
  items: T[]
  total?: number
}

/**
 * 会话列表响应
 */
export interface SessionListResponse {
  items: Session[]
  total: number
}

/**
 * 将后端会话数据转换为前端 Session 类型
 */
function transformSession(apiData: SessionApiResponse): Session {
  // 判断是否是群聊（userName 包含 @chatroom）
  const isChatRoom = apiData.userName.includes('@chatroom')
  const isOfficialAccount = apiData.userName.startsWith('gh_')
  const isHolder = apiData.userName.includes("@placeholder_foldgroup") || apiData.userName.includes("brandsessionholder") || apiData.userName.includes("brandservicesessionholder") //"userName": "@placeholder_foldgroup",  "userName": "brandsessionholder", "userName": "brandservicesessionholder",
  const isPrivate = !isChatRoom && !isOfficialAccount && !isHolder

  let session_type: 'group' | 'private' | 'official' | 'unknown' = 'unknown'
  if (isChatRoom) {
    session_type = 'group'
  } else if (isPrivate) {
    session_type = 'private'
  } else if(isOfficialAccount) {
    session_type = 'official'
  } else {
    session_type = 'unknown'
  }

  return {
    id: apiData.userName,
    talker: apiData.userName,
    talkerName: apiData.nickName || apiData.userName,
    name: getSessionName(apiData, session_type),
    avatar: apiData.avatarUrl || '',
    remark: '',
    type: session_type,
    lastMessage: (apiData.content || apiData.nickName) ? {
      nickName: apiData.nickName,
      content: apiData.content,
      createTime: new Date(apiData.nTime).getTime(),
      type: 1, // 默认为文本消息
    } : undefined,
    lastTime: apiData.nTime,
    lastMessageType: 1,
    unreadCount: apiData.nUnReadCount || 0,
    isPinned: apiData.isPinned || false,
    isMinimized: apiData.isMinimized || false,
    isChatRoom: isChatRoom,
    messageCount: 0, // 后端未返回消息总数
  }

  function getSessionName(apiData: SessionApiResponse, session_type: Session['type']): string {
      // 处理特殊占位符会话
      if (apiData.userName.includes("@placeholder_foldgroup")) {
        return '【折叠群聊】'
      }
      if (apiData.userName === 'brandsessionholder') {
        return '【公众号】'
      }
      if (apiData.userName === 'brandservicesessionholder') {
        return '服务号'
      }

      // 根据会话类型处理名称
      switch (session_type) {
        case 'group':
          return apiData.userName || `群聊(${apiData.nickName})` || `群聊()`
        case 'official':
          return apiData.nickName || `公众号(${apiData.userName})`
        case 'private':
          return apiData.nickName || apiData.userName
        default:
          return apiData.nickName || apiData.userName
      }
    }
}

/**
 * 会话 API 类
 */
class SessionAPI {
  /**
   * 获取会话列表
   * GET /api/v1/session
   *
   * @param params 查询参数
   * @returns 会话列表和总数
   */
  async getSessions(params?: SessionParams): Promise<SessionListResponse> {
    const response = await request.get<ApiResponse<SessionApiResponse>>('/api/v1/session', params)

    let items: Session[] = []
    let total = 0

    // 转换数据格式
    if (response && response.items && Array.isArray(response.items)) {
      items = response.items.map(item => transformSession(item))
      total = response.total || items.length
    } else if (Array.isArray(response)) {
      // 兼容旧格式（如果直接返回数组）
      items = (response as any[]).map(item => transformSession(item))
      total = items.length
    }

    return { items, total }
  }

  /**
   * 获取会话详情
   * GET /api/v1/session/:talker
   *
   * @param talker 会话 ID
   * @returns 会话详情
   */
  async getSessionDetail(talker: string): Promise<Session> {
    const response = await request.get<SessionApiResponse>(`/api/v1/session/${encodeURIComponent(talker)}`)
    return transformSession(response)
  }

  /**
   * 获取所有会话（分页）
   *
   * @param limit 返回数量
   * @param offset 偏移量
   * @returns 会话列表
   */
  async getAllSessions(limit = 50, offset = 0): Promise<Session[]> {
    const { items } = await this.getSessions({ limit, offset })
    return items
  }

  /**
   * 按类型获取会话
   *
   * @param type 会话类型（private: 私聊, group: 群聊, official: 公众号, unknown: 其他）
   * @param limit 返回数量
   * @returns 会话列表
   */
  async getSessionsByType(type: 'private' | 'group' | 'official' | 'unknown', limit = 50): Promise<Session[]> {
    const { items } = await this.getSessions({ type, limit })
    return items
  }

  /**
   * 获取私聊会话列表
   *
   * @param limit 返回数量
   * @returns 私聊会话列表
   */
  getPrivateSessions(limit = 50): Promise<Session[]> {
    return this.getSessionsByType('private', limit)
  }

  /**
   * 获取群聊会话列表
   *
   * @param limit 返回数量
   * @returns 群聊会话列表
   */
  getGroupSessions(limit = 50): Promise<Session[]> {
    return this.getSessionsByType('group', limit)
  }

  /**
   * 获取置顶会话
   *
   * @returns 置顶会话列表
   */
  async getPinnedSessions(): Promise<Session[]> {
    const { items } = await this.getSessions({ limit: 100 })
    return items.filter(session => session.isPinned)
  }

  /**
   * 获取活跃会话
   * （根据最后消息时间排序）
   *
   * @param limit 返回数量
   * @returns 活跃会话列表
   */
  async getActiveSessions(limit = 20): Promise<Session[]> {
    const { items } = await this.getSessions({ limit })
    return items.sort((a, b) => {
      const timeA = a.lastMessage?.createTime || 0
      const timeB = b.lastMessage?.createTime || 0
      return timeB - timeA
    })
  }

  /**
   * 搜索会话
   *
   * @param keyword 搜索关键词（会话名称或备注）
   * @returns 搜索结果
   */
  async searchSessions(keyword: string): Promise<Session[]> {
    const { items } = await this.getSessions({ limit: 1000 })
    const lowerKeyword = keyword.toLowerCase()

    return items.filter(session => {
      const name = (session.name || '').toLowerCase()
      const remark = (session.remark || '').toLowerCase()
      return name.includes(lowerKeyword) || remark.includes(lowerKeyword)
    })
  }

  /**
   * 获取未读会话
   *
   * @returns 有未读消息的会话列表
   */
  async getUnreadSessions(): Promise<Session[]> {
    const { items } = await this.getSessions({ limit: 100 })
    return items.filter(session => (session.unreadCount || 0) > 0)
  }

  /**
   * 获取会话统计信息
   *
   * @returns 统计信息
   */
  async getSessionStats(): Promise<{
    total: number
    private: number
    group: number
    unread: number
    pinned: number
  }> {
    const { items, total } = await this.getSessions({ limit: 1000 })

    return {
      total: total,
      private: items.filter(s => s.type === 'private').length,
      group: items.filter(s => s.type === 'group').length,
      unread: items.filter(s => (s.unreadCount || 0) > 0).length,
      pinned: items.filter(s => s.isPinned).length,
    }
  }

  /**
   * 批量获取会话详情
   *
   * @param talkers 会话 ID 列表
   * @returns 会话详情列表
   */
  async getBatchSessionDetails(talkers: string[]): Promise<Session[]> {
    const promises = talkers.map(talker => this.getSessionDetail(talker))
    return request.all<Session>(promises)
  }
}

/**
 * 导出单例
 */
export const sessionAPI = new SessionAPI()

/**
 * 默认导出
 */
export default sessionAPI