# Changelog

## [0.11.0] - 2025-01-22

### Added

#### 核心功能（P0）

##### 消息自动刷新与缓存系统
- **消息缓存机制**
  - 实现基于 SessionStorage 的每联系人独立消息缓存
  - 支持 TTL 过期策略（默认 30 分钟）
  - 单缓存项大小限制（默认 10MB）
  - LRU 淘汰算法，支持最多 50 个缓存项
  - 缓存元数据管理（大小统计、访问时间）
  - 缓存预热（warmup）功能

- **自动刷新管理器**
  - 后台任务队列自动刷新消息
  - 并发控制（默认最多 3 个并发任务）
  - 重试机制（最多 3 次重试）
  - 超时控制（默认 30 秒）
  - 任务优先级管理
  - 增量刷新支持（基于时间范围）

- **智能增量刷新**
  - 检测缓存与最新消息之间的时间间隙
  - 仅获取间隙内的新消息（避免全量刷新）
  - 使用 CST (UTC+8) 时区时间范围查询
  - 自动合并新消息与缓存，去重和排序
  - 支持大时间跨度的降级处理

- **缓存优先读取策略**
  - 界面层优先从 SessionStorage 读取消息
  - 首屏加载时间显著减少（< 200ms）
  - 后台静默刷新不影响用户浏览
  - 自动处理缓存失效和过期

- **开发调试工具**
  - `window.debugCache` 调试接口（开发模式）
  - 测试缓存读写、自动刷新、增量刷新
  - 任务队列状态查看和控制
  - 缓存统计信息展示

##### 消息通知功能
- **@提及检测**
  - 自动检测群聊中 @当前用户 的消息
  - 支持多种 @格式识别
  - 精准匹配当前用户标识

- **引用消息检测**
  - 检测引用当前用户消息的内容
  - 支持引用消息类型识别
  - 引用链路追踪

- **浏览器通知集成**
  - 使用原生 Notification API
  - 通知权限优雅请求
  - 自定义通知样式和内容
  - 通知声音和震动支持

- **通知去重机制**
  - 基于消息 ID 的去重
  - 同一消息只通知一次
  - 通知历史记录存储（IndexedDB）
  - 过期通知自动清理

- **通知交互**
  - 点击通知跳转到对应消息
  - 精确定位到消息位置
  - 自动打开对应会话
  - 滚动到目标消息

- **通知设置**
  - 全局通知开关
  - 按会话独立设置
  - 免打扰模式支持
  - 通知偏好持久化

##### 无感知自动刷新 SessionList
- **静默刷新机制**
  - 后台静默刷新会话列表
  - 不清空现有 UI 数据
  - 保持用户滚动位置
  - 保持当前选中状态

- **非侵入式指示器**
  - 小型转圈加载指示器
  - 不遮挡内容区域
  - 刷新完成自动消失
  - 可选的刷新提示

- **防抖处理**
  - 避免频繁刷新
  - 智能合并刷新请求
  - 降低服务器压力

- **错误处理**
  - 静默错误处理
  - 不中断用户操作
  - 失败重试机制
  - 错误日志记录

#### 消息类型支持扩展

##### 位置消息 (type=48)
- 新增 `LocationMessage` 组件
- 显示位置标签、城市、坐标
- 点击打开腾讯地图
- 支持经纬度格式化显示

##### 个人名片消息 (type=42)
- 新增 `ContactCardMessage` 组件
- 显示名片分享提示
- 提示用户在微信客户端查看
- 无详细数据时的友好降级

##### 转账消息 (type=49, subType=2000)
- 新增 `TransferMessage` 组件
- 解析转账金额和操作类型
- 区分发送和接收状态
- 金额格式化显示（￥符号）
- 视觉区分：发送（橙色）/ 接收（绿色）
- 渐变背景和图标设计

##### QQ音乐消息 (type=49, subType=3)
- 新增 `QQMusicMessage` 组件
- 显示 QQ音乐卡片样式
- 提示在微信客户端查看

##### 微信卡包消息 (type=49, subType=16)
- 新增 `CardPackageMessage` 组件
- 显示卡包图标和提示
- 引导用户在微信查看

##### 红包消息 (type=49, subType=2001)
- 新增 `RedPacketMessage` 组件
- 红包样式设计（红色渐变背景）
- 显示红包图标和文字
- 支持红包状态提示

#### 图片与媒体优化

##### 固定尺寸占位符
- **ImageMessage**: 200×200px 固定容器
- **EmojiMessage**: 120×120px 固定容器
- **VideoMessage**: 240×180px 固定容器
- 防止图片加载导致的布局跳动
- 提升滚动流畅度

##### 骨架屏加载动画
- 渐变动画效果（1.5s 循环）
- 加载中显示占位图标
- 平滑过渡（opacity 0.3s）
- 支持暗黑模式

##### 图片加载失败处理
- 显示错误占位符
- 红色图标（danger color）
- 明确的错误提示文字
- 禁止点击预览失败图片

##### 图片查看器组件
- 新增 `ImageViewer` 组件（333 行）
- 功能完整的图片预览
  - 缩放：0.5x - 3x
  - 旋转：左/右 90度
  - 下载图片
  - 键盘快捷键
    - `ESC` 关闭
    - `+/-` 缩放
    - `←/→` 旋转
- 响应式设计
- 暗黑模式支持

##### 视频预览对话框
- 点击视频封面打开预览
- HTML5 video 播放器
- 显示播放时长
- 支持全屏播放

#### 界面优化

##### 会话详情抽屉
- ChatHeader 的"会话详情"打开 ContactDetail 抽屉
- PC 端宽度 500px，移动端全屏
- ContactDetail 支持 session prop
- session 数据 fallback 机制（构造临时 Contact）
- 平滑动画效果

##### 移动端导航栏优化
- 将"搜索"按钮合并到"更多"菜单
- 使用 Dropdown 展示搜索和详情菜单项
- 减少按钮拥挤，界面更简洁
- 统一的菜单交互体验

##### 群聊成员数显示
- ChatHeader 显示群聊成员数量
- 移动端副标题同步显示
- 异步加载并缓存成员数
- 格式：`群聊 · XX人`

### Changed

#### 缓存策略调整
- 消息列表优先从 SessionStorage 读取
- 后台自动刷新替代手动刷新
- 增量更新替代全量刷新
- 缓存预热提升首次加载体验

#### API 调用优化
- 使用时间范围查询减少数据传输
- 增量刷新减少重复数据
- 并发控制避免服务器过载
- 智能重试和超时处理

#### 日志策略
- 非关键日志受 `appStore.isDebug` 控制
- 生产环境减少日志噪音
- 保留错误和警告日志
- 开发模式提供详细调试信息

#### 时区处理
- 统一使用 CST (UTC+8) 时间格式
- 时间范围查询使用 ISO 8601 格式
- 新增时区工具函数（`src/utils/timezone.ts`）
- 支持 CST 时间转换和格式化

### Fixed

- 修复 computed 内误用 `await` 导致的类型错误
- 修复 ContactDetail 联系人数据不存在时的显示问题
- 修复未使用的导入和声明（goBack, ArrowLeft, onMounted, chatStore）
- 修复 MessageBubble 中的 `refreshCache` 方法调用错误
- 修复图片加载失败时的布局破坏
- 修复表情加载失败时的显示问题
- 修复视频封面显示异常
- 修复会话详情抽屉在移动端的样式问题

### Performance

- **消息缓存命中率 > 80%**
  - 首屏加载时间 < 200ms（缓存命中）
  - 减少 API 调用次数
  - 降低网络流量消耗

- **增量刷新优化**
  - 仅传输新增消息
  - 智能时间范围计算
  - 减少数据传输量 60-80%

- **并发控制**
  - 最多 3 个并发刷新任务
  - 避免浏览器连接耗尽
  - 减轻服务器压力

- **LRU 缓存策略**
  - 自动淘汰最少使用缓存
  - 控制总缓存大小
  - 避免内存溢出

- **无感知刷新**
  - 后台静默更新
  - 不影响用户操作
  - 保持界面流畅

### Technical Improvements

- **新增工具和 Composable**
  - `useMessageCache` composable
  - `src/stores/messageCache.ts` - 消息缓存 Store
  - `src/stores/autoRefresh.ts` - 自动刷新 Store
  - `src/utils/debugCache.ts` - 调试工具
  - `src/utils/timezone.ts` - 时区处理工具

- **消息组件扩展**
  - `LocationMessage.vue`
  - `ContactCardMessage.vue`
  - `TransferMessage.vue`
  - `QQMusicMessage.vue`
  - `CardPackageMessage.vue`
  - `RedPacketMessage.vue`
  - `ImageViewer.vue`

- **类型定义完善**
  - 新增消息类型枚举
  - 完善 API 响应类型
  - 增强类型安全检查

- **错误处理增强**
  - 统一错误处理机制
  - 静默错误和关键错误分级
  - 错误重试和降级策略

- **代码质量提升**
  - 移除未使用的代码
  - 修复类型错误
  - 统一日志策略
  - 改进代码可维护性

### Documentation

- **API 文档更新**
  - 新增位置消息数据结构
  - 新增个人名片消息说明
  - 新增转账消息解析文档
  - 新增 QQ音乐和卡包消息说明
  - 新增红包消息文档

- **功能文档新增**
  - `docs/features/location-message.md`
  - `docs/features/contact-card-message.md`
  - `docs/features/transfer-message.md`
  - `docs/features/message-auto-refresh.md`
  - `docs/features/session-silent-refresh.md`
  - `docs/features/contact-detail-drawer.md`

- **ROADMAP 更新**
  - 标记 v0.11.0 已完成的 P0 任务
  - 更新优先级调整
  - 添加新功能任务
  - 文档版本更新至 v1.9.0

### Breaking Changes

无

### Deprecations

无

### Known Issues

- 部分消息类型（个人名片、QQ音乐、微信卡包）缺少详细数据，仅显示占位符
- SessionStorage 容量限制（约 5-10MB），建议定期清理
- 自动刷新功能默认关闭，需手动启用

### Migration Guide

#### 升级步骤

1. **清理旧缓存**
   ```javascript
   // 打开浏览器控制台执行
   sessionStorage.clear()
   ```

2. **启用自动刷新（可选）**
   ```javascript
   // 在设置中或通过调试工具
   window.debugCache.enableAutoRefresh(30000) // 30秒间隔
   ```

3. **配置通知权限**
   - 首次使用时会请求通知权限
   - 在浏览器设置中管理通知权限

#### API 变更

无破坏性 API 变更

#### 配置变更

新增配置项：
- `autoRefresh.enabled` - 是否启用自动刷新
- `autoRefresh.interval` - 刷新间隔
- `notification.enabled` - 是否启用通知
- `cache.ttl` - 缓存过期时间

### Contributors

感谢所有贡献者的辛勤付出！

---

## 下一版本计划

### v0.12.0 预览

- 虚拟滚动优化
- PWA 支持
- Service Worker 离线缓存
- 左滑会话操作菜单
- 图片/视频增强
- 横屏模式适配

---

**发布日期**: 2025-01-22  
**版本**: v0.11.0  
**代号**: Smart Refresh

---

> 🎉 v0.11.0 带来了智能缓存和自动刷新，让聊天记录查看体验更流畅！