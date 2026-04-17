/**
 * 联系人管理 API
 * 对应后端 /api/v1/contact 相关接口
 */

import { request } from '@/utils/request'
import type { Contact } from '@/types/contact'
import { ContactType } from '@/types/contact'
import type { ContactParams } from '@/types/api'

/**
 * 后端返回的联系人数据结构
 */
interface BackendContact {
  userName: string
  alias: string
  remark: string
  nickName: string
  isFriend: boolean
}

/**
 * 后端返回的联系人列表响应
 */
interface BackendContactResponse {
  items: BackendContact[]
}

/**
 * 转换后端联系人数据到前端格式
 */
function transformContact(backendContact: BackendContact): Contact {
  // 判断联系人类型
  let type: ContactType
  if (backendContact.userName.endsWith('@chatroom')) {
    type = ContactType.Chatroom
  } else if (backendContact.userName.startsWith('gh_')) {
    type = ContactType.Official
  } else if (backendContact.userName.endsWith('@openim')) {
    type = ContactType.Friend
  } else {
    type = ContactType.Friend
  }

  return {
    wxid: backendContact.userName,
    nickname: backendContact.nickName || backendContact.userName,
    remark: backendContact.remark || '',
    alias: backendContact.alias || '',
    avatar: '', // 后端未返回，使用空字符串
    type,
    isStarred: false, // 后端未返回，默认false
  }
}

/**
 * 联系人 API 类
 */
class ContactAPI {
  /**
   * 获取联系人列表
   * GET /api/v1/contact
   *
   * @param params 查询参数
   * @returns 联系人列表
   */
  async getContacts(params?: ContactParams): Promise<Contact[]> {
    const response = await request.get<BackendContactResponse>('/api/v1/contact', params)

    // 如果后端返回的是 { items: [...] } 格式
    if (response && typeof response === 'object' && 'items' in response) {
      return response.items.map(transformContact)
    }

    // 如果后端直接返回数组（兼容处理）
    if (Array.isArray(response)) {
      return (response as any[]).map(transformContact)
    }

    return []
  }

  /**
   * 获取联系人详情
   * GET /api/v1/contact/:wxid
   *
   * @param wxid 联系人微信 ID
   * @returns 联系人详情
   */
  async getContactDetail(wxid: string): Promise<Contact> {
    const response = await request.get<BackendContact>(`/api/v1/contact/${encodeURIComponent(wxid)}`)
    return transformContact(response)
  }

  /**
   * 获取群聊列表（前端过滤）
   * 
   * @returns 群聊列表
   */
  async getChatrooms(): Promise<Contact[]> {
    const all = await this.getContacts()
    return all.filter(c => c.type === ContactType.Chatroom)
  }

  /**
   * 获取好友列表（前端过滤）
   * 
   * @returns 好友列表
   */
  async getFriends(): Promise<Contact[]> {
    const all = await this.getContacts()
    return all.filter(c => c.type === ContactType.Friend)
  }

  /**
   * 获取公众号列表（前端过滤）
   * 
   * @returns 公众号列表
   */
  async getOfficialAccounts(): Promise<Contact[]> {
    const all = await this.getContacts()
    return all.filter(c => c.type === ContactType.Official)
  }

  /**
   * 搜索联系人
   * GET /api/v1/contact?keyword=xxx
   *
   * @param keyword 搜索关键词
   * @returns 搜索结果
   */
  searchContacts(keyword: string): Promise<Contact[]> {
    return this.getContacts({ keyword })
  }

  /**
   * 获取所有联系人（不分类型）
   *
   * @returns 所有联系人
   */
  getAllContacts(): Promise<Contact[]> {
    return this.getContacts()
  }

  /**
   * 按首字母分组获取联系人
   *
   * @returns 按首字母分组的联系人
   */
  async getContactsByLetter(): Promise<Record<string, Contact[]>> {
    const contacts = await this.getFriends()
    const grouped: Record<string, Contact[]> = {}

    contacts.forEach(contact => {
      // 获取首字母（简单处理，实际可能需要更复杂的拼音转换）
      const letter = this.getFirstLetter(contact.nickname || contact.alias || contact.wxid)
      if (!grouped[letter]) {
        grouped[letter] = []
      }
      grouped[letter].push(contact)
    })

    // 排序每组内的联系人
    Object.keys(grouped).forEach(letter => {
      grouped[letter].sort((a, b) => {
        const nameA = a.remark || a.nickname || a.alias || a.wxid
        const nameB = b.remark || b.nickname || b.alias || b.wxid
        return nameA.localeCompare(nameB, 'zh-CN')
      })
    })

    return grouped
  }

  /**
   * 获取星标联系人
   *
   * @returns 星标联系人列表
   */
  async getStarredContacts(): Promise<Contact[]> {
    const contacts = await this.getContacts()
    return contacts.filter(contact => contact.isStarred)
  }

  /**
   * 获取最近联系人
   * （根据最后交互时间排序）
   *
   * @param limit 返回数量
   * @returns 最近联系人列表
   */
  async getRecentContacts(limit = 20): Promise<Contact[]> {
    const contacts = await this.getContacts()
    return contacts
      .sort((a, b) => {
        const timeA = a.lastContactTime || 0
        const timeB = b.lastContactTime || 0
        return timeB - timeA
      })
      .slice(0, limit)
  }

  /**
   * 获取群聊成员
   *
   * @param chatroomId 群聊 ID
   * @returns 群成员列表
   */
  async getChatroomMembers(chatroomId: string): Promise<Contact[]> {
    const chatroom = await this.getContactDetail(chatroomId)
    if (!chatroom.memberList) {
      return []
    }

    // 批量获取成员详情
    const memberPromises = chatroom.memberList.map(wxid =>
      this.getContactDetail(wxid).catch(() => null)
    )
    const members = await request.all<Contact>(memberPromises)

    return members.filter((m): m is Contact => m !== null)
  }

  /**
   * 获取联系人统计信息
   *
   * @returns 统计信息
   */
  async getContactStats(): Promise<{
    total: number
    friends: number
    chatrooms: number
    official: number
    starred: number
  }> {
    const [all, friends, chatrooms, official, starred] = await Promise.all([
      this.getAllContacts(),
      this.getFriends(),
      this.getChatrooms(),
      this.getOfficialAccounts(),
      this.getStarredContacts(),
    ])

    return {
      total: all.length,
      friends: friends.length,
      chatrooms: chatrooms.length,
      official: official.length,
      starred: starred.length,
    }
  }

  /**
   * 批量获取联系人详情
   *
   * @param wxids 联系人微信 ID 列表
   * @returns 联系人详情列表
   */
  async getBatchContactDetails(wxids: string[]): Promise<Contact[]> {
    const promises = wxids.map(wxid =>
      this.getContactDetail(wxid).catch(() => null)
    )
    const contacts = await request.all<Contact>(promises)
    return contacts.filter((c): c is Contact => c !== null)
  }

  /**
   * 获取联系人显示名称
   * （优先级：备注 > 昵称 > 别名 > 微信号）
   *
   * @param contact 联系人对象
   * @returns 显示名称
   */
  getDisplayName(contact: Contact): string {
    return contact.remark || contact.nickname || contact.alias || contact.wxid
  }

  /**
   * 获取首字母（简单实现）
   *
   * @param name 名称
   * @returns 首字母
   */
  private getFirstLetter(name: string): string {
    if (!name) return '#'

    const firstChar = name.charAt(0).toUpperCase()

    // 如果是英文字母
    if (/[A-Z]/.test(firstChar)) {
      return firstChar
    }

    // 其他字符归类到 #
    return '#'
  }
}

/**
 * 导出单例
 */
export const contactAPI = new ContactAPI()

/**
 * 默认导出
 */
export default contactAPI
