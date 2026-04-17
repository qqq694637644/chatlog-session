import { FileSizeBase, FileSizeUnits } from '@/types/message'

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(FileSizeBase))
  return Math.round((bytes / Math.pow(FileSizeBase, i)) * 100) / 100 + ' ' + FileSizeUnits[i]
}

/**
 * 获取媒体消息的文本描述
 */
export function getMediaPlaceholder(type: number, subType?: number, fileName?: string): string {
  if (type === 3) return '[图片]'
  if (type === 34) return '[语音]'
  if (type === 42) return '[个人名片]'
  if (type === 43) return '[视频]'
  if (type === 47) return '[表情]'
  if (type === 48) return '[位置]'
  if (type === 49) {
    if (subType === 3) return '[QQ音乐]'
    if (subType === 5) return '[链接]'
    if (subType === 6) return fileName ? `[文件] ${fileName}` : '[文件]'
    if (subType === 16) return '[微信卡包]'
    if (subType === 19) return '[聊天记录]'
    if (subType === 2000) return '[转账]'
  }
  return '[媒体]'
}