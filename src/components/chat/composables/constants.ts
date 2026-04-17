// 文件大小单位（已弃用，请使用 @/types/message 中的 FileSizeUnits 和 FileSizeBase）
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const
export const FILE_SIZE_BASE = 1024

// 小写版本（推荐使用）
export const fileSizeUnits = ['B', 'KB', 'MB', 'GB'] as const
export const fileSizeBase = 1024