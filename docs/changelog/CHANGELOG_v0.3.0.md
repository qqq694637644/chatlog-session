# Changelog

## [0.3.0-dev]

### Added
- 核心 UI 组件开发完成
  - Avatar 通用头像组件 (140行)
  - SessionItem 会话列表项组件 (228行)
  - SessionList 会话列表组件 (344行)
  - MessageBubble 消息气泡组件 (461行)
  - MessageList 消息列表组件 (480行)
- Chat 页面完整重构 (496行)
  - 三栏布局（侧边栏/会话列表/消息区域）
  - 会话搜索和筛选功能
  - 消息分页加载
  - 按日期分组显示
  - 移动端响应式支持
- 消息类型支持
  - 文本消息
  - 图片消息（带预览）
  - 语音消息
  - 视频消息
  - 表情消息
  - 文件消息
  - 系统消息
- 会话管理功能
  - 会话列表展示
  - 搜索会话
  - 筛选（全部/私聊/群聊）
  - 排序（按时间/名称/未读）
  - 置顶会话
  - 未读消息统计

### Changed
- **[重要]** 统一添加 `format=json` 参数到所有 API 请求
  - 修改位置: `src/utils/request.ts` 请求拦截器
  - 影响范围: 所有通过 request 工具发起的 API 调用
  - 优势: 确保所有 Chatlog API 响应都是 JSON 格式，便于前端解析
  - 详细说明: 见 `docs/API_FORMAT_CHANGE.md`

### Fixed
- 修复所有 TypeScript 类型错误
- 完善 Session 类型定义（添加 id 字段）
- 完善 Message 类型定义（添加 talkerAvatar、isSend 字段）
- 修复 Store 方法调用不一致问题
- 修复时间格式化函数参数类型错误
- 修复 Sass 弃用警告（使用 modern-compiler API）

## [0.2.0-dev] - 2025-11-17

### Added
- 项目初始化
  - Vue 3 + TypeScript + Vite 基础架构
  - Element Plus UI 组件库集成
  - Pinia 状态管理
  - Vue Router 路由配置
  - ESLint + Prettier 代码规范
- 类型定义系统 (5个文件, ~400行)
  - Message 消息类型
  - Session 会话类型
  - Contact 联系人类型
  - API 接口类型
  - 应用配置类型
- API 接口层 (5个文件, ~1,000行)
  - chatlog.ts - 聊天记录接口 (186行)
  - session.ts - 会话管理接口 (174行)
  - contact.ts - 联系人接口 (251行)
  - media.ts - 多媒体接口 (289行)
  - index.ts - 统一导出
- 状态管理 (5个文件, ~2,000行)
  - app.ts - 应用状态
  - chat.ts - 聊天状态 (542行)
  - session.ts - 会话状态 (563行)
  - contact.ts - 联系人状态 (593行)
  - index.ts - 统一导出
- 工具函数库 (5个文件, ~1,400行)
  - request.ts - HTTP 请求封装
  - date.ts - 日期时间处理 (499行)
  - storage.ts - 本地存储管理 (351行)
  - format.ts - 格式化工具 (470行)
  - index.ts - 统一导出
- 路由配置
  - 主页面路由
  - 聊天页面路由
  - 联系人页面路由
  - 设置页面路由
  - 搜索页面路由
- 完整的项目文档
  - 用户使用手册
  - 开发者指南
  - 产品设计文档
  - API 参考文档
  - 开发规范
  - 贡献指南

### Technical Highlights
- 100% TypeScript 覆盖
- 完整的类型安全
- 现代化的 Sass API（modern-compiler）
- 响应式设计
- 深色模式支持
- 移动端适配

### Development Progress
- 基础架构: 100%
- 核心功能: 100%
- 界面开发: 50%
- 测试优化: 0%
- 文档完善: 100%
- **总体进度: 55%**

---

## Release Notes

### v1.0.0-dev (2025-11-17)

第一个开发版本，完成了项目的基础架构和核心 UI 组件开发。

**主要功能:**
- ✅ 会话列表展示和管理
- ✅ 消息列表展示（支持多种消息类型）
- ✅ 搜索和筛选功能
- ✅ 响应式设计和深色模式
- ✅ 完整的状态管理和 API 接口

**技术栈:**
- Vue 3.4+ (Composition API)
- TypeScript 5.3+
- Vite 5.4+
- Pinia 2.1+
- Element Plus 2.8+
- Axios 1.7+

**代码统计:**
- 文件数量: 50+
- 代码行数: ~10,000
- 组件数量: 6 个
- API 接口: 20+

**下一步计划:**
1. 测试真实数据加载
2. 实现搜索和导出功能
3. 开发联系人、搜索、设置页面
4. 性能优化和用户体验提升

---

## Future Plans

### v1.1.0 (计划中)
- [ ] 全局搜索功能
- [ ] 会话内搜索
- [ ] 消息导出（JSON/CSV/TXT）
- [ ] 图片预览增强
- [ ] 视频播放支持
- [ ] 语音播放支持

### v1.2.0 (计划中)
- [ ] 联系人管理页面
- [ ] 群成员查看
- [ ] 联系人详情
- [ ] 好友列表

### v1.3.0 (计划中)
- [ ] 高级设置
- [ ] 主题定制
- [ ] 快捷键配置
- [ ] 数据统计

### v2.0.0 (未来)
- [ ] 实时同步
- [ ] 多账号支持
- [ ] 云端存储
- [ ] 跨设备同步

---

## Contributing

如果您想为这个项目做出贡献，请查看 [贡献指南](docs/CONTRIBUTING.md)。

## License

MIT License - 详见 [LICENSE](LICENSE) 文件。

---

**最后更新**: 2025-11-17  
**当前版本**: v1.0.0-dev  
**开发进度**: 55%
