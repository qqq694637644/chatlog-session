import type { Message } from '../types/message'
import { formatDate, formatDateGroup } from './date'

export interface MessageDateGroup {
  date: string
  formattedDate: string
  messages: Message[]
}

type MessageTimeLike = Pick<Message, 'time' | 'createTime'> & Partial<Pick<Message, 'id' | 'seq'>>

/**
 * 统一获取消息时间戳（毫秒）。
 * 历史加载接口可能返回秒级 createTime，也可能直接带 ISO time，
 * 这里统一归一化，避免不同入口各自处理后出现顺序错乱。
 */
export function getMessageTimestampMs(message: MessageTimeLike): number {
  if (message.time) {
    const timeFromIso = new Date(message.time).getTime()
    if (!Number.isNaN(timeFromIso)) {
      return timeFromIso
    }
  }

  if (message.createTime) {
    return message.createTime < 10000000000
      ? message.createTime * 1000
      : message.createTime
  }

  return Number.NaN
}

/**
 * 按时间正序排序消息。
 * 历史消息接口在 `bottom=1` 时会返回从新到旧的数据，
 * 如果直接 prepend，会导致日期分组、右侧导航和下一次 beforeTime 计算全部失真。
 */
export function sortMessagesChronologically<T extends MessageTimeLike>(messages: T[]): T[] {
  return [...messages].sort((left, right) => {
    const leftTime = getMessageTimestampMs(left)
    const rightTime = getMessageTimestampMs(right)
    const leftInvalid = Number.isNaN(leftTime)
    const rightInvalid = Number.isNaN(rightTime)

    if (leftInvalid && rightInvalid) return 0
    if (leftInvalid) return 1
    if (rightInvalid) return -1
    if (leftTime !== rightTime) return leftTime - rightTime

    const leftSeq = typeof left.seq === 'number' ? left.seq : 0
    const rightSeq = typeof right.seq === 'number' ? right.seq : 0
    if (leftSeq !== rightSeq) return leftSeq - rightSeq

    const leftId = typeof left.id === 'number' ? left.id : 0
    const rightId = typeof right.id === 'number' ? right.id : 0
    return leftId - rightId
  })
}

/**
 * 根据消息时间正序构建日期分组。
 * 这样即使原始消息数组被不同加载路径打乱，渲染层和日期导航也能稳定按时间顺序显示。
 */
export function buildMessageGroups(messages: Message[]): MessageDateGroup[] {
  const grouped = new Map<string, { formattedDate: string, messages: Message[] }>()

  sortMessagesChronologically(messages).forEach(message => {
    const timestampMs = getMessageTimestampMs(message)
    if (Number.isNaN(timestampMs)) {
      return
    }

    const dateObj = new Date(timestampMs)
    const canonicalDate = formatDate(dateObj)
    const timestampForLabel = message.time || timestampMs

    if (!grouped.has(canonicalDate)) {
      grouped.set(canonicalDate, {
        formattedDate: formatDateGroup(timestampForLabel),
        messages: []
      })
    }

    grouped.get(canonicalDate)!.messages.push(message)
  })

  return Array.from(grouped.entries()).map(([date, data]) => ({
    date,
    formattedDate: data.formattedDate,
    messages: data.messages
  }))
}
