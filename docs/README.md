# Chatlog Session 文档中心

欢迎来到 Chatlog Session 的文档中心！这里包含了项目的所有技术文档、用户指南和开发资料。

## 📚 文档导航

### 🗺️ 项目路线图
- [ROADMAP](ROADMAP.md) - 项目开发路线图和版本规划
- [CHANGELOG](CHANGELOG.md) - 完整变更日志

### 🚀 快速开始
- [主布局快速开始](guides/quick-start/main-layout-quick-start.md) - 5分钟了解项目结构
- [Contact 功能快速参考](guides/quick-start/contact-db-quick-reference.md) - Contact 视图使用速查
- [API 设置快速指南](guides/quick-start/api-settings-quick-guide.md) - API 配置快速上手

### 👥 用户指南
- [用户使用手册](guides/user/user-guide.md) - 完整的用户使用说明
- [后台刷新使用指南](guides/user/background-refresh-guide.md) - 如何使用后台刷新功能
- [PWA 设置指南](guides/pwa-setup-guide.md) - Progressive Web App 配置指南

### 💻 开发指南
- [开发者指南](guides/developer/developer-guide.md) - 开发环境搭建和开发流程
- [测试指南](guides/developer/testing-guide.md) - 测试方法和最佳实践
- [版本管理](guides/developer/version-management.md) - 版本控制和发布流程
- [历史消息加载优化总结](guides/developer/history-loading-optimization-summary.md) - 历史消息加载技术总结

#### 调试指南
- [调试消息日期问题](guides/developer/debugging/debug-message-date.md) - 常见问题调试
- [自动刷新调试指南](guides/developer/debugging/auto-refresh-debugging.md) - 自动刷新问题排查
- [Empty Range 调试](guides/developer/debugging/debug-empty-range.md) - 空范围消息调试
- [虚拟间隔调试指南](guides/developer/debugging/virtual-gap-debug-guide.md) - 虚拟间隔消息调试

#### 实现指南
- [历史消息加载流程](guides/developer/implementation/history-message-loading-process.md) - 历史消息加载详细流程
- [时区使用指南](guides/developer/implementation/timezone-usage.md) - 时区处理最佳实践
- [间隔消息使用指南](guides/developer/implementation/gap-message-usage.md) - 间隔消息实现方法
- [实时消息实现](guides/developer/implementation/live-message-implementation.md) - 实时消息技术实现

#### 测试指南
- [Contact 中文索引测试](guides/developer/testing/contact-chinese-index-testing.md) - 中文索引功能测试
- [Empty Range 测试](guides/developer/testing/test-empty-range.md) - 空范围功能测试
- [时间间隔测试](guides/developer/testing/test-empty-range-time-gap.md) - 时间间隔功能测试
- [LoadMessages 空范围测试](guides/developer/testing/test-loadmessages-empty-range.md) - 消息加载空范围测试

### 🔌 API 文档
- [API 参考手册](api/reference.md) - 完整的 API 接口文档
- [HTTP API](api/http-api.md) - HTTP 接口详细说明
- [数据结构](api/data-structure.md) - 数据模型和字段说明
- [会话映射](api/session-mapping.md) - 会话数据处理
- [分页机制](api/pagination.md) - 分页参数和使用方法
- [响应修复](api/response-fix.md) - 常见响应问题处理

#### API 示例
- [自动解密示例](api/examples/auto-decrypt.md) - 自动解密功能示例
- [Chatlog 示例](api/examples/chatlog.md) - Chatlog 使用示例
- [Chatlog 2.0 示例](api/examples/chatlog-2.md) - Chatlog 2.0 使用示例
- [聊天室示例](api/examples/chatroom.md) - 聊天室功能示例
- [联系人示例](api/examples/contact.md) - 联系人数据示例
- [仪表板示例](api/examples/dashboard.md) - 仪表板功能示例
- [解密示例](api/examples/decrypt.md) - 解密功能示例
- [日记示例](api/examples/diary.md) - 日记功能示例
- [搜索示例](api/examples/search.md) - 搜索功能示例
- [会话示例](api/examples/session.md) - 会话功能示例
- [会话 2.0 示例](api/examples/session-v2.md) - 会话 2.0 功能示例
- [设置示例](api/examples/setting.md) - 设置功能示例

### ⚡ 功能特性

#### 核心功能
- [消息自动刷新与缓存总结](features/core/message-cache/message-auto-refresh-cache-summary.md) - 自动刷新缓存系统总结
- [消息缓存实现总结](features/core/message-cache/message-cache-implementation-summary.md) - 缓存实现技术总结
- [消息缓存自动刷新](features/core/message-cache/message-cache-autorefresh.md) - 自动刷新机制详解
- [IndexedDB 缓存](features/core/message-cache/indexeddb-cache.md) - 本地缓存实现
- [IndexedDB 集成](features/core/message-cache/indexeddb-integration.md) - 数据库集成方案

#### 消息加载
- [带时间戳的消息加载](features/core/message-loading/message-loading-with-createtime.md) - 时间戳消息加载
- [下拉加载历史消息](features/core/message-loading/pull-down-to-load-history.md) - 下拉刷新功能
- [进度条状态](features/core/message-loading/loading-progress-states.md) - LoadingProgress 组件说明

#### 滚动位置
- [滚动位置记忆](features/core/scroll-position/scroll-position-memory.md) - 滚动位置保持功能
- [滚动位置记忆流程图](features/core/scroll-position/scroll-position-memory-flowchart.md) - 滚动记忆流程图
- [滚动位置记忆检查清单](features/core/scroll-position/scroll-position-memory-checklist.md) - 滚动记忆功能检查
- [滚动到底部修复](features/core/scroll-position/scroll-to-bottom-fix.md) - 滚动问题解决方案

#### 虚拟消息
- [虚拟间隔消息](features/core/virtual-messages/virtual-gap-message.md) - 虚拟间隔消息实现
- [虚拟间隔消息文档索引](features/core/virtual-messages/virtual-gap-docs-index.md) - 虚拟间隔文档索引
- [空范围消息](features/core/virtual-messages/empty-range-message.md) - 空范围消息处理
- [空范围时间间隔检测](features/core/virtual-messages/empty-range-time-gap-detection.md) - 时间间隔检测

#### 后台功能
- [后台刷新实现](features/background/background-refresh-implementation.md) - 后台刷新技术实现
- [后台加载器](features/background/background-loading.md) - BackgroundLoader 使用说明
- [无感知刷新会话列表](features/background/silent-refresh-sessionlist.md) - 静默刷新技术
- [无感知刷新会话列表总结](features/background/silent-refresh-sessionlist-summary.md) - 静默刷新技术总结

#### 联系人功能
- [Contact 数据库模式](features/contact/contact-db-mode.md) - Contact 视图优化详解
- [Chat 自动加载](features/contact/contact-auto-load.md) - 自动加载联系人功能
- [联系人功能](features/contact/contact-features.md) - 联系人管理功能详解

#### 联系人索引
- [联系人中文索引](features/contact/contact-index/contact-chinese-index.md) - 中文索引功能
- [联系人中文索引实现](features/contact/contact-index/contact-chinese-index-implementation.md) - 中文索引技术实现
- [联系人索引优化](features/contact/contact-index/contact-index-optimization.md) - 索引性能优化

#### 联系人 IndexedDB
- [联系人索引数据库清理指南](features/contact/contact-indexeddb/contact-index-db-clear-guide.md) - 数据库清理方法
- [联系人索引数据库升级](features/contact/contact-indexeddb/contact-index-db-upgrade.md) - 数据库升级指南

#### 消息功能
- [消息气泡增强](features/ui/message-bubble-enhancement.md) - MessageBubble 组件扩展
- [转发消息对话框](features/messages/rich/forwarded-message-dialog.md) - 转发消息显示
- [转发消息增强](features/messages/rich/forwarded-message-enhancement.md) - 转发消息功能增强
- [接龙消息](features/messages/rich/jielong-message.md) - 接龙消息处理
- [转账消息](features/messages/rich/transfer-message.md) - 转账消息处理

#### 基础消息
- [名片消息](features/messages/basic/contact-card-message.md) - 名片消息处理
- [位置消息](features/messages/basic/location-message.md) - 位置消息处理
- [语音播放](features/messages/basic/voice-playback.md) - 语音消息播放
- [历史加载中的空范围](features/messages/basic/empty-range-in-history-loading.md) - 历史加载空范围处理

#### 媒体消息
- [媒体显示控制](features/messages/media/media-display-control.md) - 媒体显示控制功能
- [媒体显示控制实现](features/messages/media/media-display-control-implementation.md) - 媒体控制技术实现
- [媒体显示控制总结](features/messages/media/media-display-control-summary.md) - 媒体控制功能总结
- [媒体显示控制测试](features/messages/media/media-display-control-test.md) - 媒体控制功能测试
- [视频链接消息](features/messages/media/video-link-message.md) - 视频链接消息处理

#### 通知功能
- [消息通知](features/notification/message-notification.md) - 消息通知功能
- [消息通知总结](features/notification/message-notification-summary.md) - 通知功能技术总结
- [通知增强](features/notification/notification-enhancements.md) - 通知功能增强

#### 性能优化
- [虚拟滚动](features/performance/virtual-scroll.md) - 虚拟滚动技术实现

#### PWA 功能
- [PWA 实现](features/pwa/pwa-implementation.md) - Progressive Web App 技术实现

#### 搜索功能
- [搜索功能](features/search/search-feature.md) - 搜索功能实现

#### UI 功能
- [移动端 UI 适配](features/ui/mobile/mobile-ui-adaptation.md) - 移动端界面适配
- [移动端 UI 实现](features/ui/mobile/mobile-ui-implementation.md) - 移动端界面技术实现
- [移动端性能优化](features/ui/mobile/mobile-performance-optimization.md) - 移动端性能优化
- [新手引导](features/ui/onboarding-guide.md) - 首次使用引导功能

#### 其他功能
- [Live Photo 兼容性](features/live-photo-compatibility.md) - Live Photo 兼容支持
- [系统热键](features/system-hotkey.md) - 系统快捷键功能
- [P0 功能清单](features/README_p0_features.md) - 最高优先级功能列表

#### API 功能
- [API 配置统一](features/api/api-config-unification.md) - API 配置标准化
- [API 设置](features/api/api-settings.md) - API 设置功能

#### 调试功能
- [虚拟间隔调试模式](features/debug/virtual-gap-debug-mode.md) - 虚拟间隔调试
- [虚拟间隔调试 UI](features/debug/virtual-gap-debug-ui.md) - 虚拟间隔调试界面

### 🏗️ 架构设计
- [架构设计概述](architecture/README.md) - 架构设计总览
- [产品设计文档](architecture/product-design.md) - 产品需求和设计

#### 核心架构
- [消息加载流程](architecture/core/message-loading-flow.md) - 消息加载技术流程
- [消息加载快速参考](architecture/core/message-loading-quick-reference.md) - 消息加载速查指南

#### UI 架构
- [主布局架构](architecture/ui/main-layout.md) - 应用布局设计
- [视图切换设计](architecture/ui/view-switching.md) - 视图切换机制

### 📝 变更日志
- [v0.15.0](changelog/CHANGELOG_v0.15.0.md) - 本地会话置顶与管理、Live Photo 支持
- [v0.14.0](changelog/CHANGELOG_v0.14.0.md) - 聊天记录增强、消息列表优化
- [v0.13.0](changelog/CHANGELOG_v0.13.0.md) - PWA 支持、Service Worker 实现
- [v0.12.0](changelog/CHANGELOG_v0.12.0.md) - 通知内容优化、隐私设置
- [v0.11.0](changelog/CHANGELOG_v0.11.0.md) - 消息自动刷新与缓存、通知功能
- [v0.10.0](changelog/CHANGELOG_v0.10.0.md) - 图片占位符优化、ImageViewer 组件
- [v0.9.0](changelog/CHANGELOG_v0.9.0.md) - 移动端界面适配与性能优化
- [v0.8.0](changelog/CHANGELOG_v0.8.0.md) - MessageBubble 组件重构与消息类型扩展
- [v0.7.0](changelog/CHANGELOG_v0.7.0.md) - 功能增强
- [v0.6.0](changelog/CHANGELOG_v0.6.0.md) - 功能优化
- [v0.5.1](changelog/CHANGELOG_v0.5.1.md) - Bug 修复
- [v0.5.0](changelog/CHANGELOG_v0.5.0.md) - 新功能
- [v0.4.1](changelog/CHANGELOG_v0.4.1.md) - 后台刷新、数据库加载、自动初始化
- [v0.4.0](changelog/CHANGELOG_v0.4.0.md) - 消息增强、转发消息、引用回复
- [v0.3.3](changelog/CHANGELOG_v0.3.3.md) - 滚动到底部修复
- [v0.3.2](changelog/CHANGELOG_v0.3.2_summary.md) - 主布局重构
- [v0.3.1](changelog/CHANGELOG_v0.3.1.md) - MessageBubble 扩展
- [v0.3.0](changelog/CHANGELOG_v0.3.0.md) - IndexedDB 集成
- [v0.2.0](changelog/CHANGELOG_v0.2.0.md) - Chatlog API 适配
- [v0.9.2](changelog/CHANGELOG_v0.9.2.md) - 移动端优化补丁

### 📖 参考资料
- [版本历史](references/version-history.md) - 完整的版本发布记录
- [开发进度](references/progress.md) - 项目开发进度跟踪
- [最终总结](references/final-summary.md) - 项目里程碑总结
- [实现总结](references/implementation-summary.md) - v0.4.1 实现总结
- [自动后台刷新](references/auto-background-refresh.md) - 自动刷新机制说明
- [Contact 变更日志](references/contact-db-mode-changelog.md) - Contact 模式变更详情

### 🔧 故障排查
- [通知问题排查](troubleshooting/notification-issues.md) - 通知功能问题解决
- [通知调试](troubleshooting/notification_debug.md) - 通知功能调试指南

### 🛠️ 重构文档
- [重构概述](refactoring/README.md) - 重构工作总览
- [消息加载重构](refactoring/message-loading-refactor.md) - 消息加载模块重构
- [通知迁移总结](refactoring/notification-migration-summary.md) - 通知模块迁移
- [通知快速参考](refactoring/notification-quick-reference.md) - 通知功能速查
- [通知存储重构](refactoring/notification-store-refactor.md) - 通知存储模块重构
- [通知测试检查清单](refactoring/notification-testing-checklist.md) - 通知功能测试清单
- [通知存储变更日志](refactoring/CHANGELOG_notification_store.md) - 通知存储变更记录

#### 组件重构
- [MessageBubble 架构](refactoring/component/MessageBubble-Architecture.md) - MessageBubble 组件架构
- [MessageBubble 快速参考](refactoring/component/MessageBubble-QuickReference.md) - MessageBubble 速查指南
- [MessageBubble 重构](refactoring/component/MessageBubble-Refactoring.md) - MessageBubble 组件重构
- [MessageBubble 总结](refactoring/component/MessageBubble-Summary.md) - MessageBubble 重构总结

### 🐛 问题修复
- [会话列表自动刷新修复](fixes/2025-01_session_list_auto_refresh.md) - 会话列表刷新问题修复
- [虚拟消息显示修复](fixes/virtual-messages-display-fix.md) - 虚拟消息显示问题修复

#### 自动刷新修复
- [自动刷新缓存更新](fixes/auto-refresh/auto-refresh-cache-update.md) - 缓存更新问题修复
- [自动刷新消息增强](fixes/auto-refresh/auto-refresh-messages-enhancement.md) - 消息刷新功能增强

#### 历史加载修复
- [历史加载 HasMore 逻辑修复](fixes/history-loading/history-loading-hasmore-logic-fix.md) - HasMore 逻辑问题修复
- [历史加载偏移修复](fixes/history-loading/history-loading-offset-fix.md) - 偏移计算问题修复

#### 混合内容修复
- [混合内容问题](fixes/mix-content/mix-content.md) - 混合内容问题分析
- [解决方案](fixes/mix-content/solution.md) - 混合内容解决方案
- [隧道错误修复](fixes/mix-content/tunnel-error-fix.md) - 隧道错误问题修复
- [Worker 对比](fixes/mix-content/worker-comparison.md) - Worker 方案对比

#### 修复总结
- [v0.6.4 最终总结](fixes/summaries/FINAL_SUMMARY_v0.6.4.md) - v0.6.4 版本修复总结
- [快速参考](fixes/summaries/QUICK_REFERENCE.md) - 修复问题速查指南
- [v0.6.3 快速参考](fixes/summaries/QUICK_REFERENCE_v0.6.3.md) - v0.6.3 版本速查指南
- [验证检查清单](fixes/summaries/VERIFICATION_CHECKLIST.md) - 功能验证检查清单

### 📋 问题记录
- [问题概述](issues/README.md) - 问题记录总览
- [历史加载问题 2025-11-22](issues/history-loading-issues-2025-11-22.md) - 历史加载问题记录
- [历史加载问题修复补丁](issues/history-loading-issues-fix-patch.md) - 历史加载问题修复
- [空范围解决方案总结](issues/solutions/empty-range-solution-summary.md) - 空范围问题解决方案

### 🚀 部署指南
- [自定义路径部署](deployment/custom-path.md) - 自定义路径配置
- [GitHub Pages 部署](deployment/github-pages.md) - GitHub Pages 部署指南
- [其他平台部署](deployment/other-platforms.md) - 其他部署平台指南

### 📝 示例文档
- [示例概述](examples/README.md) - 示例文档总览
- [转发消息示例](examples/api/forwarded-message-example.md) - 转发消息数据示例
- [表情消息示例](examples/messages/emoji-message-example.md) - 表情消息示例
- [小程序消息示例](examples/messages/miniprogram-message-example.md) - 小程序消息示例
- [短视频消息示例](examples/messages/shortvideo-message-example.md) - 短视频消息示例

### 🛠️ 脚本工具
- [生成图标 HTML](scripts/generate-icons.html) - 图标生成工具 HTML
- [生成图标 JavaScript](scripts/generate-icons.js) - 图标生成工具 JS
- [生成图标 Shell](scripts/generate-icons.sh) - 图标生成工具 Shell

### 🔍 其他同类工具
- [留痕工具](其他同类工具/留痕.md) - 同类工具介绍
- [留痕工具 2](其他同类工具/留痕-2.md) - 同类工具补充介绍

## 🎯 按主题查找

### 性能优化
- [Contact 数据库模式](features/contact/contact-db-mode.md) - 20-40倍速度提升
- [虚拟滚动](features/performance/virtual-scroll.md) - 大数据量渲染优化
- [后台加载器](features/background/background-loading.md) - 非阻塞加载
- [IndexedDB 缓存](features/core/message-cache/indexeddb-cache.md) - 离线支持
- [移动端性能优化](features/ui/mobile/mobile-performance-optimization.md) - 移动端性能提升

### 用户体验
- [后台刷新实现](features/background/background-refresh-implementation.md) - 手动刷新控制
- [进度条状态](features/core/message-loading/loading-progress-states.md) - 加载进度反馈
- [Chat 自动加载](features/contact/contact-auto-load.md) - 自动数据准备
- [联系人功能](features/contact/contact-features.md) - 丰富的交互功能
- [移动端 UI 适配](features/ui/mobile/mobile-ui-adaptation.md) - 移动端界面优化
- [新手引导](features/ui/onboarding-guide.md) - 首次使用体验

### 数据管理
- [IndexedDB 集成](features/core/message-cache/indexeddb-integration.md) - 本地数据持久化
- [消息自动刷新与缓存](features/core/message-cache/message-auto-refresh-cache-summary.md) - 智能缓存系统
- [联系人中文索引](features/contact/contact-index/contact-chinese-index.md) - 中文搜索优化

### 组件开发
- [消息气泡增强](features/ui/message-bubble-enhancement.md) - 复杂消息类型支持
- [转发消息对话框](features/messages/rich/forwarded-message-dialog.md) - 对话框组件
- [主布局架构](architecture/ui/main-layout.md) - 布局组件设计
- [MessageBubble 架构](refactoring/component/MessageBubble-Architecture.md) - 组件架构设计

### 消息处理
- [虚拟间隔消息](features/core/virtual-messages/virtual-gap-message.md) - 消息间隔处理
- [历史消息加载流程](guides/developer/implementation/history-message-loading-process.md) - 消息加载技术
- [带时间戳的消息加载](features/core/message-loading/message-loading-with-createtime.md) - 时间戳消息处理

### 通知系统
- [消息通知](features/notification/message-notification.md) - 通知功能实现
- [通知增强](features/notification/notification-enhancements.md) - 通知功能优化
- [通知问题排查](troubleshooting/notification-issues.md) - 通知问题解决

### PWA 功能
- [PWA 实现](features/pwa/pwa-implementation.md) - Progressive Web App 技术
- [PWA 设置指南](guides/pwa-setup-guide.md) - PWA 配置指南

## 📁 目录结构

```
docs/
├── README.md                     # 本文件
├── CHANGELOG.md                  # 完整变更日志
├── ROADMAP.md                    # 项目路线图
├── api/                          # API 文档
│   ├── reference.md              # API 参考手册
│   ├── http-api.md               # HTTP API 文档
│   ├── data-structure.md         # 数据结构
│   ├── session-mapping.md        # 会话映射
│   ├── pagination.md             # 分页机制
│   ├── response-fix.md           # 响应修复
│   └── examples/                 # API 示例
│       ├── auto-decrypt.md
│       ├── chatlog.md
│       ├── chatlog-2.md
│       ├── chatroom.md
│       ├── contact.md
│       ├── dashboard.md
│       ├── decrypt.md
│       ├── diary.md
│       ├── search.md
│       ├── session.md
│       ├── session-v2.md
│       └── setting.md
├── architecture/                 # 架构设计
│   ├── README.md                 # 架构概述
│   ├── product-design.md         # 产品设计
│   ├── core/                     # 核心架构
│   │   ├── message-loading-flow.md
│   │   └── message-loading-quick-reference.md
│   └── ui/                       # UI 架构
│       ├── main-layout.md
│       └── view-switching.md
├── deployment/                   # 部署指南
│   ├── custom-path.md
│   ├── github-pages.md
│   └── other-platforms.md
├── examples/                     # 示例文档
│   ├── README.md
│   ├── api/
│   │   └── forwarded-message-example.md
│   └── messages/
│       ├── emoji-message-example.md
│       ├── miniprogram-message-example.md
│       └── shortvideo-message-example.md
├── features/                     # 功能特性
│   ├── README_p0_features.md    # P0 功能清单
│   ├── live-photo-compatibility.md
│   ├── system-hotkey.md
│   ├── api/                      # API 功能
│   │   ├── api-config-unification.md
│   │   └── api-settings.md
│   ├── background/               # 后台功能
│   │   ├── background-loading.md
│   │   ├── background-refresh-implementation.md
│   │   ├── silent-refresh-sessionlist.md
│   │   └── silent-refresh-sessionlist-summary.md
│   ├── contact/                  # 联系人功能
│   │   ├── contact-auto-load.md
│   │   ├── contact-db-mode.md
│   │   ├── contact-features.md
│   │   ├── contact-index/        # 联系人索引
│   │   │   ├── contact-chinese-index.md
│   │   │   ├── contact-chinese-index-implementation.md
│   │   │   └── contact-index-optimization.md
│   │   └── contact-indexeddb/    # 联系人 IndexedDB
│   │       ├── contact-index-db-clear-guide.md
│   │       └── contact-index-db-upgrade.md
│   ├── core/                     # 核心功能
│   │   ├── message-cache/        # 消息缓存
│   │   │   ├── indexeddb-cache.md
│   │   │   ├── indexeddb-integration.md
│   │   │   ├── message-auto-refresh-cache-summary.md
│   │   │   ├── message-cache-autorefresh.md
│   │   │   └── message-cache-implementation-summary.md
│   │   ├── message-loading/      # 消息加载
│   │   │   ├── loading-progress-states.md
│   │   │   ├── message-loading-with-createtime.md
│   │   │   └── pull-down-to-load-history.md
│   │   ├── scroll-position/      # 滚动位置
│   │   │   ├── README_scroll_position_memory.md
│   │   │   ├── scroll-position-memory-checklist.md
│   │   │   ├── scroll-position-memory-flowchart.md
│   │   │   ├── scroll-position-memory.md
│   │   │   └── scroll-to-bottom-fix.md
│   │   └── virtual-messages/     # 虚拟消息
│   │       ├── empty-range-message.md
│   │       ├── empty-range-time-gap-detection.md
│   │       ├── virtual-gap-docs-index.md
│   │       ├── virtual-gap-message-README.md
│   │       └── virtual-gap-message.md
│   ├── debug/                    # 调试功能
│   │   ├── virtual-gap-debug-mode.md
│   │   └── virtual-gap-debug-ui.md
│   ├── messages/                 # 消息功能
│   │   ├── basic/                # 基础消息
│   │   │   ├── contact-card-message.md
│   │   │   ├── empty-range-in-history-loading.md
│   │   │   ├── location-message.md
│   │   │   └── voice-playback.md
│   │   ├── media/                # 媒体消息
│   │   │   ├── media-display-control.md
│   │   │   ├── media-display-control-implementation.md
│   │   │   ├── media-display-control-summary.md
│   │   │   ├── media-display-control-test.md
│   │   │   └── video-link-message.md
│   │   └── rich/                 # 富文本消息
│   │       ├── forwarded-message-dialog.md
│   │       ├── forwarded-message-enhancement.md
│   │       ├── jielong-message.md
│   │       └── transfer-message.md
│   ├── notification/             # 通知功能
│   │   ├── message-notification.md
│   │   ├── message-notification-summary.md
│   │   └── notification-enhancements.md
│   ├── performance/              # 性能优化
│   │   └── virtual-scroll.md
│   ├── pwa/                      # PWA 功能
│   │   └── pwa-implementation.md
│   ├── search/                   # 搜索功能
│   │   └── search-feature.md
│   └── ui/                       # UI 功能
│       ├── message-bubble-enhancement.md
│       ├── mobile/               # 移动端 UI
│       │   ├── mobile-performance-optimization.md
│       │   ├── mobile-ui-adaptation.md
│       │   └── mobile-ui-implementation.md
│       └── onboarding-guide.md
├── fixes/                        # 问题修复
│   ├── 2025-01_session_list_auto_refresh.md
│   ├── virtual-messages-display-fix.md
│   ├── auto-refresh/             # 自动刷新修复
│   │   ├── auto-refresh-cache-update.md
│   │   └── auto-refresh-messages-enhancement.md
│   ├── history-loading/          # 历史加载修复
│   │   ├── history-loading-hasmore-logic-fix.md
│   │   └── history-loading-offset-fix.md
│   ├── mix-content/              # 混合内容修复
│   │   ├── mix-content.md
│   │   ├── solution.md
│   │   ├── tunnel-error-fix.md
│   │   └── worker-comparison.md
│   └── summaries/                # 修复总结
│       ├── FINAL_SUMMARY_v0.6.4.md
│       ├── QUICK_REFERENCE.md
│       ├── QUICK_REFERENCE_v0.6.3.md
│       └── VERIFICATION_CHECKLIST.md
├── guides/                       # 指南文档
│   ├── pwa-setup-guide.md
│   ├── quick-start/              # 快速开始
│   │   ├── api-settings-quick-guide.md
│   │   ├── contact-db-quick-reference.md
│   │   └── main-layout-quick-start.md
│   ├── user/                     # 用户指南
│   │   ├── background-refresh-guide.md
│   │   └── user-guide.md
│   └── developer/                # 开发指南
│       ├── developer-guide.md
│       ├── history-loading-optimization-summary.md
│       ├── testing-guide.md
│       ├── version-management.md
│       ├── debugging/            # 调试指南
│       │   ├── auto-refresh-debugging.md
│       │   ├── debug-empty-range.md
│       │   ├── debug-message-date.md
│       │   └── virtual-gap-debug-guide.md
│       ├── implementation/       # 实现指南
│       │   ├── gap-message-usage.md
│       │   ├── history-message-loading-process.md
│       │   ├── live-message-implementation.md
│       │   └── timezone-usage.md
│       └── testing/              # 测试指南
│           ├── contact-chinese-index-testing.md
│           ├── test-empty-range.md
│           ├── test-empty-range-time-gap.md
│           └── test-loadmessages-empty-range.md
├── issues/                       # 问题记录
│   ├── README.md
│   ├── history-loading-issues-2025-11-22.md
│   ├── history-loading-issues-fix-patch.md
│   └── solutions/
│       └── empty-range-solution-summary.md
├── refactoring/                  # 重构文档
│   ├── README.md
│   ├── CHANGELOG_notification_store.md
│   ├── message-loading-refactor.md
│   ├── notification-migration-summary.md
│   ├── notification-quick-reference.md
│   ├── notification-store-refactor.md
│   ├── notification-testing-checklist.md
│   └── component/                # 组件重构
│       ├── MessageBubble-Architecture.md
│       ├── MessageBubble-QuickReference.md
│       ├── MessageBubble-Refactoring.md
│       └── MessageBubble-Summary.md
├── references/                   # 参考资料
│   ├── auto-background-refresh.md
│   ├── contact-db-mode-changelog.md
│   ├── final-summary.md
│   ├── implementation-summary.md
│   ├── progress.md
│   └── version-history.md
├── scripts/                      # 脚本工具
│   ├── generate-icons.html
│   ├── generate-icons.js
│   └── generate-icons.sh
├── troubleshooting/              # 故障排查
│   ├── notification-issues.md
│   └── notification_debug.md
├── changelog/                    # 变更日志
│   ├── CHANGELOG_v0.2.0.md
│   ├── CHANGELOG_v0.3.0.md
│   ├── CHANGELOG_v0.3.1.md
│   ├── CHANGELOG_v0.3.2_summary.md
│   ├── CHANGELOG_v0.3.3.md
│   ├── CHANGELOG_v0.4.0.md
│   ├── CHANGELOG_v0.4.1.md
│   ├── CHANGELOG_v0.5.0.md
│   ├── CHANGELOG_v0.5.1.md
│   ├── CHANGELOG_v0.6.0.md
│   ├── CHANGELOG_v0.7.0.md
│   ├── CHANGELOG_v0.8.0.md
│   ├── CHANGELOG_v0.9.0.md
│   ├── CHANGELOG_v0.9.2.md
│   ├── CHANGELOG_v0.10.0.md
│   ├── CHANGELOG_v0.11.0.md
│   ├── CHANGELOG_v0.12.0.md
│   ├── CHANGELOG_v0.13.0.md
│   ├── CHANGELOG_v0.14.0.md
│   └── CHANGELOG_v0.15.0.md
└── 其他同类工具/                 # 其他同类工具
    ├── 留痕.md
    └── 留痕-2.md
```

## 📊 文档统计

```
总文档数: 190+ 篇
API 文档: 18 篇
功能特性: 85+ 篇
架构设计: 7 篇
用户指南: 4 篇
开发指南: 25+ 篇
快速开始: 3 篇
变更日志: 20 篇
参考资料: 6 篇
故障排查: 2 篇
重构文档: 10+ 篇
问题修复: 15+ 篇
部署指南: 3 篇
示例文档: 5 篇
脚本工具: 3 篇
其他工具: 2 篇
代码量: ~10,000+ 行
```

## 🔍 搜索建议

- **项目规划**: 查看[项目路线图](ROADMAP.md)了解开发计划
- **新用户**: 从[用户使用手册](guides/user/user-guide.md)开始
- **开发者**: 查看[开发者指南](guides/developer/developer-guide.md)
- **了解 API**: 参考[API 参考手册](api/reference.md)
- **性能问题**: 查看性能优化相关文档
- **功能使用**: 查看功能特性目录
- **问题排查**: 查看故障排查相关文档
- **消息处理**: 查看消息加载和虚拟消息相关文档
- **通知系统**: 查看通知功能相关文档
- **PWA 功能**: 查看 PWA 相关文档

## 📅 最新更新

### v0.15.0 (2025-12-05)
- ✅ 本地会话置顶与管理功能
- ✅ Live Photo 与视频播放支持
- ✅ Dashboard 重构与优化
- ✅ 架构与性能优化
- ✅ PWA 增强功能

### v0.14.0 (2025-11-25)
- ✅ 聊天记录/转发消息增强
- ✅ 消息列表体验优化
- ✅ 历史消息加载与虚拟消息
- ✅ 技术重构与性能提升

详见 [CHANGELOG v0.15.0](changelog/CHANGELOG_v0.15.0.md) 和 [项目路线图](ROADMAP.md)

## 📝 命名规范

本文档中心采用以下命名规范：

- **文件名**: 使用 kebab-case（小写字母 + 连字符）
  - 例如：`background-refresh-implementation.md`
- **目录名**: 使用小写字母，单词用连字符分隔
  - 例如：`quick-start/`
- **CHANGELOG**: 保持原有的 `CHANGELOG_vX.X.X.md` 格式
- **组件文档**: 使用 PascalCase + 描述性后缀
  - 例如：`MessageBubble-Architecture.md`

## 🤝 贡献文档

如果你想为文档做出贡献，请：
1. 遵循现有文档的格式和风格
2. 使用清晰的标题和结构
3. 提供代码示例和图表
4. 更新文档索引（本文件）
5. 遵循命名规范（kebab-case）
6. 将新文档添加到正确的分类目录
7. 更新本 README 中的相关部分

## 📧 联系方式

- **项目仓库**: [GitHub](https://github.com/your-repo)
- **问题反馈**: [Issues](https://github.com/your-repo/issues)
- **开发团队**: Development Team

---

**最后更新**: 2025-12-05  
**文档版本**: v0.15.0  
**维护者**: Development Team  
**文档总数**: 190+ 篇  
**覆盖功能**: 完整项目功能文档