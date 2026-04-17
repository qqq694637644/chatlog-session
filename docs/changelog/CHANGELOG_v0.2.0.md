# 变更日志

所有值得注意的项目更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### 待发布功能
- UI 组件开发
- 数据集成与展示
- 消息搜索功能
- 多媒体预览

---

## [0.2.0] - 2025-11-17

### 新增
- ✨ 完整的 API 接口层（4 个模块，~1,000 行代码）
  - chatlog.ts - 聊天记录 API（186 行）
  - session.ts - 会话管理 API（174 行）
  - contact.ts - 联系人 API（251 行）
  - media.ts - 多媒体 API（289 行）
  - index.ts - 统一导出

- ✨ 完整的状态管理系统（4 个 Store，~2,000 行代码）
  - app.ts - 应用状态管理（完善）
  - chat.ts - 聊天消息状态（542 行）
  - session.ts - 会话状态（563 行）
  - contact.ts - 联系人状态（593 行）
  - index.ts - 统一导出

- ✨ 完整的工具函数库（4 个模块，~1,400 行代码）
  - date.ts - 日期时间处理（499 行，20+ 函数）
  - storage.ts - 本地存储（351 行，完整 Storage 类）
  - format.ts - 格式化工具（470 行，25+ 函数）
  - index.ts - 统一导出

- ✨ Vue Router 路由配置（支持懒加载）
- ✨ 临时页面占位（Chat, Contact, Search, Settings）

### 修复
- 🐛 修复所有 TypeScript 类型错误（0 错误）
- 🐛 修复 Sass 弃用警告（使用 modern-compiler API）
- 🐛 修复 ChatroomMember 类型重复导出
- 🐛 修复 Message、Session、Contact 类型定义缺失属性

### 改进
- ⚡ 使用现代 Sass API（@use 替代 @import）
- ⚡ 优化 Vite 配置（支持 CSS 预处理）
- 📝 完善类型定义（添加 id, createTime 等属性）
- 📝 更新开发状态文档

### 技术栈
- API 接口：完整对接后端 Chatlog API
- 状态管理：Pinia Store（组合式 API）
- 工具函数：日期、存储、格式化等
- 类型系统：完整的 TypeScript 类型定义

### 统计
- 文件数量：43+ 个
- 代码行数：~7,500 行
- 开发进度：15% → 40%

---

## [0.1.0] - 2025-11-17

### 新增
- 🎉 项目初始化
- ✨ 基础架构搭建
  - Vite + Vue 3 + TypeScript
  - Element Plus UI 组件库
  - Pinia 状态管理
  - Vue Router 路由
  - Axios HTTP 客户端

- ✨ 开发环境配置
  - ESLint + Prettier 代码规范
  - TypeScript 类型检查
  - Vite 构建配置
  - 环境变量配置

- ✨ 类型定义系统
  - message.ts - 消息类型
  - session.ts - 会话类型
  - contact.ts - 联系人类型
  - api.ts - API 类型
  - index.ts - 类型导出

- ✨ HTTP 请求封装
  - request.ts - Axios 封装
  - 请求/响应拦截器
  - 错误统一处理
  - 上传/下载支持

- ✨ 基础样式系统
  - variables.scss - CSS 变量
  - mixins.scss - Sass 混入
  - index.scss - 全局样式

- ✨ App Store 基础实现
  - 应用配置
  - 主题切换
  - 加载状态
  - 移动端检测

- ✨ 完整的项目文档
  - README.md - 项目介绍
  - GETTING_STARTED.md - 快速开始
  - DEV_STATUS.md - 开发状态
  - docs/ - 完整文档体系
    - USER_GUIDE.md - 用户手册
    - DEVELOPER_GUIDE.md - 开发者指南
    - PRODUCT_DESIGN.md - 产品设计
    - API_REFERENCE.md - API 参考
    - README.md - 文档索引

### 配置
- package.json - 项目配置
- vite.config.ts - Vite 配置
- tsconfig.json - TypeScript 配置
- .eslintrc.cjs - ESLint 配置
- .prettierrc.json - Prettier 配置
- .gitignore - Git 忽略配置

### 统计
- 文件数量：25+ 个
- 代码行数：~2,000 行
- 开发进度：0% → 15%

---

## 开发阶段说明

### 阶段 1: 基础架构 ✅ (100%)
- 项目初始化
- 环境配置
- 类型定义
- 工具函数
- 基础组件

### 阶段 2: 核心功能 ✅ (100%)
- API 接口层
- 状态管理
- 路由配置
- 工具函数

### 阶段 3: 界面开发 🚧 (0%)
- 布局组件
- 通用组件
- 聊天组件
- 页面组件
- 样式开发

### 阶段 4: 测试优化 🔜 (0%)
- 单元测试
- E2E 测试
- 性能优化
- Bug 修复

### 阶段 5: 文档完善 ✅ (100%)
- 用户文档
- 开发文档
- 产品文档
- API 文档

---

## 版本说明

- `[Unreleased]` - 开发中的功能
- `[0.2.0]` - 核心功能完成（API + Store + Utils）
- `[0.1.0]` - 项目初始化和基础架构
- `[1.0.0]` - 预计 2026-01-15 发布（MVP 版本）

---

## 贡献指南

欢迎贡献！请查看 [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) 了解详细信息。

## 许可证

本项目采用 Apache-2.0 许可证 - 详见 [LICENSE](./LICENSE) 文件。

---

**最后更新**: 2025-11-17  
**维护者**: Chatlog Session Team