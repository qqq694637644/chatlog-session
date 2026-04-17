import type { ChatroomMember } from './contact'

/**
 * 会话接口
 */
export interface Session {
  id: string
  talker: string
  talkerName: string
  name?: string
  avatar: string
  remark?: string
  type?: 'private' | 'group' | 'official' | 'unknown'
  lastMessage?: {
    nickName: string
    content: string
    createTime: number
    type: number
  }
  lastTime: string
  lastMessageType: number
  unreadCount: number
  isPinned: boolean
  isLocalPinned?: boolean
  isMinimized: boolean
  isChatRoom: boolean
  messageCount: number
}

/**
 * 会话详情接口
 */
export interface SessionDetail extends Session {
  alias?: string
  firstMessageTime?: string
  members?: ChatroomMember[]
  memberCount?: number
  owner?: string
}

/**
 * 会话类型枚举
 */
export enum SessionType {
  Friend = 'friend',
  Chatroom = 'chatroom',
  Official = 'official',
}

/**
 * 会话排序方式
 */
export enum SessionSortType {
  Time = 'time',
  Name = 'name',
  Unread = 'unread',
}
