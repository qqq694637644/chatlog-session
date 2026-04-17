import assert from 'node:assert/strict'
import type { Message } from '../src/types/message'
import { buildMessageGroups, getMessageTimestampMs, sortMessagesChronologically } from '../src/utils/message-order'

function createMessage(id: number, time: string, overrides: Partial<Message> = {}): Message {
  return {
    id,
    seq: id,
    time,
    createTime: Math.floor(new Date(time).getTime() / 1000),
    talker: 'demo-session',
    talkerName: '演示会话',
    sender: 'demo-user',
    senderName: '演示用户',
    isSelf: false,
    isSend: 0,
    isChatRoom: false,
    type: 1,
    subType: 0,
    content: `message-${id}`,
    ...overrides
  }
}

{
  const mixedMessages = [
    createMessage(4112, '2026-04-11T18:30:00+08:00'),
    createMessage(4111, '2026-04-11T09:30:00+08:00'),
    createMessage(4011, '2026-04-01T20:00:00+08:00'),
    createMessage(4151, '2026-04-15T09:30:00+08:00'),
    createMessage(4141, '2026-04-14T21:00:00+08:00'),
    createMessage(3131, '2026-03-13T10:00:00+08:00')
  ]

  const sortedMessages = sortMessagesChronologically(mixedMessages)
  assert.deepEqual(
    sortedMessages.map(message => message.id),
    [3131, 4011, 4111, 4112, 4141, 4151],
    '历史加载返回倒序数据时，消息列表应恢复为时间正序'
  )

  const groups = buildMessageGroups(mixedMessages)
  assert.deepEqual(
    groups.map(group => group.date),
    ['2026-03-13', '2026-04-01', '2026-04-11', '2026-04-14', '2026-04-15'],
    '日期分组和右侧日期导航应始终按时间正序输出'
  )

  assert.deepEqual(
    groups.find(group => group.date === '2026-04-11')?.messages.map(message => message.id),
    [4111, 4112],
    '同一天内的消息也应保持时间正序，避免日期分组标题下内容倒序'
  )
}

{
  const secondBasedMessage = createMessage(1, '', {
    time: '',
    createTime: 1713193200
  })
  const millisecondBasedMessage = createMessage(2, '', {
    time: '',
    createTime: 1713196800000
  })

  assert.equal(
    getMessageTimestampMs(secondBasedMessage),
    1713193200000,
    '秒级 createTime 应被正确换算为毫秒'
  )
  assert.equal(
    getMessageTimestampMs(millisecondBasedMessage),
    1713196800000,
    '毫秒级 createTime 不应被重复放大'
  )
}
