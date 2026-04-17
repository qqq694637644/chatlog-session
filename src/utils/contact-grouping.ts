/**
 * 联系人分组和排序工具函数
 */

import type { Contact } from '@/types/contact'
import { getContactIndexKey, getContactSortKey, compareContactNames } from './pinyin'

/**
 * 联系人分组类型
 */
export type ContactGroupType = 'starred' | 'letter' | 'special'

/**
 * 联系人分组接口
 */
export interface ContactGroup {
  type: ContactGroupType
  key: string
  label: string
  count: number
  contacts: Contact[]
  sortOrder: number
}

/**
 * 索引项接口
 */
export interface IndexItem {
  key: string
  label: string
  enabled: boolean
  type: ContactGroupType
}

/**
 * 为联系人计算索引信息（如果尚未计算）
 * @param contact 联系人对象
 */
export function ensureContactIndex(contact: Contact): void {
  const name = contact.remark || contact.nickname || ''

  if (!contact.pinyinInitial) {
    contact.pinyinInitial = getContactIndexKey(name, contact.isStarred)
  }

  if (!contact.sortKey) {
    contact.sortKey = getContactSortKey(name)
  }
}

/**
 * 批量计算联系人索引信息
 * @param contacts 联系人列表
 */
export function batchEnsureContactIndexes(contacts: Contact[]): void {
  contacts.forEach(contact => ensureContactIndex(contact))
}

/**
 * 异步批量计算联系人索引信息（用于大数据量）
 * @param contacts 联系人列表
 * @param batchSize 每批处理数量
 * @param onProgress 进度回调
 */
export async function batchEnsureContactIndexesAsync(
  contacts: Contact[],
  batchSize: number = 500,
  onProgress?: (processed: number, total: number) => void
): Promise<void> {
  const total = contacts.length

  for (let i = 0; i < total; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize)

    // 同步处理当前批次
    batch.forEach(contact => ensureContactIndex(contact))

    // 报告进度
    if (onProgress) {
      onProgress(Math.min(i + batchSize, total), total)
    }

    // 让出控制权给浏览器，避免阻塞 UI
    if (i + batchSize < total) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
}

/**
 * 联系人分组和排序
 * @param contacts 联系人列表
 * @param skipIndexCalculation 是否跳过索引计算（如果已经计算过）
 * @returns 分组后的联系人列表
 */
export function groupAndSortContacts(contacts: Contact[], skipIndexCalculation: boolean = false): ContactGroup[] {
  // 1. 确保所有联系人都有索引信息（仅在需要时计算）
  if (!skipIndexCalculation) {
    batchEnsureContactIndexes(contacts)
  }

  // 2. 按索引字母分组
  const groupMap: Record<string, Contact[]> = {}

  contacts.forEach(contact => {
    const key = contact.pinyinInitial!
    if (!groupMap[key]) {
      groupMap[key] = []
    }
    groupMap[key].push(contact)
  })

  // 3. 组内排序
  Object.values(groupMap).forEach(group => {
    group.sort((a, b) => {
      // 星标分组按星标时间倒序
      if (a.pinyinInitial === '⭐') {
        const timeA = a.starredAt || 0
        const timeB = b.starredAt || 0
        if (timeA !== timeB) {
          return timeB - timeA // 最新星标在前
        }
      }

      // 其他分组按排序键（拼音或字母）
      const nameA = a.remark || a.nickname || ''
      const nameB = b.remark || b.nickname || ''
      return compareContactNames(nameA, nameB)
    })
  })

  // 4. 构建分组对象数组
  const result: ContactGroup[] = []

  // 星标分组（如果存在）
  if (groupMap['⭐']) {
    result.push({
      type: 'starred',
      key: '⭐',
      label: '星标朋友',
      count: groupMap['⭐'].length,
      contacts: groupMap['⭐'],
      sortOrder: 0
    })
  }

  // 字母分组 A-Z
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  letters.forEach((letter, index) => {
    if (groupMap[letter]) {
      result.push({
        type: 'letter',
        key: letter,
        label: letter,
        count: groupMap[letter].length,
        contacts: groupMap[letter],
        sortOrder: index + 1
      })
    }
  })

  // # 分组（如果存在）
  if (groupMap['#']) {
    result.push({
      type: 'special',
      key: '#',
      label: '#',
      count: groupMap['#'].length,
      contacts: groupMap['#'],
      sortOrder: 27
    })
  }

  return result
}

/**
 * 异步联系人分组和排序（用于大数据量）
 * @param contacts 联系人列表
 * @param onProgress 进度回调
 * @returns 分组后的联系人列表
 */
export async function groupAndSortContactsAsync(
  contacts: Contact[],
  onProgress?: (processed: number, total: number) => void
): Promise<ContactGroup[]> {
  // 1. 异步批量计算索引信息
  await batchEnsureContactIndexesAsync(contacts, 500, onProgress)

  // 2. 按索引字母分组
  const groupMap: Record<string, Contact[]> = {}

  contacts.forEach(contact => {
    const key = contact.pinyinInitial!
    if (!groupMap[key]) {
      groupMap[key] = []
    }
    groupMap[key].push(contact)
  })

  // 3. 组内排序
  Object.values(groupMap).forEach(group => {
    group.sort((a, b) => {
      // 星标分组按星标时间倒序
      if (a.pinyinInitial === '⭐') {
        const timeA = a.starredAt || 0
        const timeB = b.starredAt || 0
        if (timeA !== timeB) {
          return timeB - timeA // 最新星标在前
        }
      }

      // 其他分组按排序键（拼音或字母）
      const nameA = a.remark || a.nickname || ''
      const nameB = b.remark || b.nickname || ''
      return compareContactNames(nameA, nameB)
    })
  })

  // 4. 构建分组对象数组
  const result: ContactGroup[] = []

  // 星标分组（如果存在）
  if (groupMap['⭐']) {
    result.push({
      type: 'starred',
      key: '⭐',
      label: '星标朋友',
      count: groupMap['⭐'].length,
      contacts: groupMap['⭐'],
      sortOrder: 0
    })
  }

  // 字母分组 A-Z
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  letters.forEach((letter, index) => {
    if (groupMap[letter]) {
      result.push({
        type: 'letter',
        key: letter,
        label: letter,
        count: groupMap[letter].length,
        contacts: groupMap[letter],
        sortOrder: index + 1
      })
    }
  })

  // # 分组（如果存在）
  if (groupMap['#']) {
    result.push({
      type: 'special',
      key: '#',
      label: '#',
      count: groupMap['#'].length,
      contacts: groupMap['#'],
      sortOrder: 27
    })
  }

  return result
}

/**
 * 生成索引列表
 * @param groups 联系人分组
 * @returns 索引项列表
 */
export function generateIndexList(groups: ContactGroup[]): IndexItem[] {
  const existingKeys = new Set(groups.map(g => g.key))
  const indexList: IndexItem[] = []

  // 星标
  indexList.push({
    key: '⭐',
    label: '⭐',
    enabled: existingKeys.has('⭐'),
    type: 'starred'
  })

  // A-Z
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  letters.forEach(letter => {
    indexList.push({
      key: letter,
      label: letter,
      enabled: existingKeys.has(letter),
      type: 'letter'
    })
  })

  // #
  indexList.push({
    key: '#',
    label: '#',
    enabled: existingKeys.has('#'),
    type: 'special'
  })

  return indexList
}

/**
 * 将分组列表扁平化为虚拟滚动所需的格式
 * @param groups 联系人分组
 * @returns 扁平化的列表项
 */
export function flattenGroups(
  groups: ContactGroup[]
): Array<{ type: 'header' | 'item'; key: string; data?: Contact; header?: string }> {
  const result: Array<{ type: 'header' | 'item'; key: string; data?: Contact; header?: string }> = []

  groups.forEach(group => {
    // 添加分组头
    result.push({
      type: 'header',
      key: `header-${group.key}`,
      header: group.label
    })

    // 添加该组的联系人
    group.contacts.forEach(contact => {
      result.push({
        type: 'item',
        key: contact.wxid,
        data: contact
      })
    })
  })

  return result
}

/**
 * 搜索联系人（支持拼音搜索）
 * @param contacts 联系人列表
 * @param keyword 搜索关键词
 * @returns 匹配的联系人列表
 */
export function filterContacts(contacts: Contact[], keyword: string): Contact[] {
  if (!keyword || !keyword.trim()) {
    return contacts
  }

  const lowerKeyword = keyword.toLowerCase().trim()

  return contacts.filter(contact => {
    // 搜索昵称
    if (contact.nickname && contact.nickname.toLowerCase().includes(lowerKeyword)) {
      return true
    }

    // 搜索备注
    if (contact.remark && contact.remark.toLowerCase().includes(lowerKeyword)) {
      return true
    }

    // 搜索别名
    if (contact.alias && contact.alias.toLowerCase().includes(lowerKeyword)) {
      return true
    }

    // 搜索微信号
    if (contact.wxid && contact.wxid.toLowerCase().includes(lowerKeyword)) {
      return true
    }

    // 搜索拼音
    if (contact.sortKey && contact.sortKey.includes(lowerKeyword)) {
      return true
    }

    // 搜索拼音首字母
    if (contact.pinyinInitial && contact.pinyinInitial.toLowerCase() === lowerKeyword) {
      return true
    }

    return false
  })
}

/**
 * 切换联系人星标状态
 * @param contact 联系人对象
 * @param starred 是否星标
 */
export function toggleContactStar(contact: Contact, starred: boolean): void {
  contact.isStarred = starred

  if (starred) {
    contact.starredAt = Date.now()
  } else {
    contact.starredAt = undefined
  }

  // 重新计算索引（因为星标状态变化会改变索引字母）
  const name = contact.remark || contact.nickname || ''
  contact.pinyinInitial = getContactIndexKey(name, contact.isStarred)
}

/**
 * 获取分组统计信息
 * @param groups 联系人分组
 * @returns 统计信息
 */
export function getGroupStats(groups: ContactGroup[]): {
  total: number
  starred: number
  letters: number
  special: number
} {
  let total = 0
  let starred = 0
  let letters = 0
  let special = 0

  groups.forEach(group => {
    total += group.count

    if (group.type === 'starred') {
      starred += group.count
    } else if (group.type === 'letter') {
      letters += group.count
    } else if (group.type === 'special') {
      special += group.count
    }
  })

  return { total, starred, letters, special }
}
