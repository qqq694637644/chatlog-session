# Chatlog Session 迁移需求与实施记录

- 项目：chatlog-session
- 当前版本：0.15.0
- 当前分支：main
- 当前发布标签：v0.15.0
- 文档状态：核心迁移已实施；GitHub Actions 构建和 Release 已验证
- 更新日期：2026-11-03

---

## 1. 背景与问题

原网页端由浏览器直接访问 Chatlog Go HTTP 服务。前端通过 localStorage 中的 apiBaseUrl 或 Vite 环境变量保存后端地址，再由 Axios 请求 Go API 和媒体接口。

原方案存在以下问题：

1. 浏览器必须知道 Go 服务 IP 和端口，后端地址会进入前端代码、浏览器配置和网络请求。
2. Go HTTP 读取接口没有网页授权边界，能够直接访问 Go 服务的客户端可以绕过网页。
3. 图片、视频、语音和文件也可能直接访问 Go 服务，不能只保护 Axios API。
4. Service Worker 曾缓存 API 和媒体响应，聊天记录等数据可能留在浏览器缓存中。
5. 服务器 A 只有 4GB RAM，在服务器上执行 Vite 构建时发生 Node 堆内存不足和 Windows VirtualAlloc errno=1455。
6. 服务器只需要运行网页和代理，不应该承担依赖安装、TypeScript 检查、前端编译和打包。

迁移目标：保留 Vue 页面和 Go 数据读取能力，只在网页服务端增加轻量授权代理，并把生产构建迁移到 GitHub Actions Runner。

## 2. 需求范围

### 2.1 必须实现

- 浏览器只访问网页服务同源地址，不再直接访问 Go 服务。
- API、图片、视频、语音、文件和数据资源统一经过网页服务端代理。
- 网页服务端保存唯一 API Key，并校验每个受保护请求。
- API Key 不进入前端编译产物、Vite 环境变量或 Git 仓库。
- Chrome 隐私窗口通过桌面 BAT 一键启动，不要求用户手动登录。
- 隐私窗口关闭后会话 Cookie 清理；下次启动重新授权。
- Go 服务继续监听本机回环地址，数据库访问层保持不变。
- GitHub Actions 在 GitHub 托管 Runner 上完成测试、构建和部署包制作。
- 服务器只下载、解压并运行预构建产物，不安装前端开发依赖、不执行构建。

### 2.2 明确不做

本项目是个人使用，不引入与需求无关的复杂系统：

- 不修改 Go 项目、SQLite 或微信数据库。
- 不重写 Chatlog 数据访问层。
- 不引入多用户、租户或角色权限系统。
- 不引入 JWT、OAuth 或独立用户登录系统。
- 不引入 Express 等大型 Web 框架。
- 不在服务器 A 上运行 Vite、vue-tsc 或 esbuild 构建。
- 不把 API Key 写入前端源码、Vite 环境变量或公开仓库。

## 3. 目标架构

~~~text
Chrome 隐私窗口
    |
    | 同源网页地址
    | 首次启动时通过 URL Fragment 提交一次 API Key
    v
Vue 3 前端
    |
    | POST /auth/bootstrap
    | 获得 HttpOnly 会话 Cookie
    |
    | 后续 API / 媒体请求自动携带 Cookie
    v
Node 网页服务端（端口 5173）
    |
    | 校验 Cookie 中的 API Key
    | 仅允许 GET / HEAD
    | 代理白名单路径
    v
127.0.0.1:5030
    |
    v
原有 Chatlog Go HTTP 服务
    |
    v
原有数据库访问层 / SQLite
~~~

架构边界：

- 浏览器只知道网页服务器地址。
- Go 服务地址只存在于服务端配置和 Node 代理代码中。
- 浏览器不直接访问 Go 服务。
- Node 校验通过后，才向本机 Go 服务转发。
- API Key 不需要传给 Go；Go 不参与本次授权逻辑。

## 4. API Key 授权流程

### 4.1 生成和保存

首次部署时，在网页服务器运行：

~~~bat
setup-auth.bat
~~~

底层运行：

~~~powershell
node scripts/setup-auth.mjs
~~~

脚本使用 Node crypto.randomBytes(32) 生成 256 bit 随机密钥，并以 64 位十六进制字符串保存到服务器本地 .env.server。

配置示例：

~~~ini
CHATLOG_API_KEY=由初始化脚本生成的64位随机密钥
CHATLOG_API_UPSTREAM=http://127.0.0.1:5030
HOST=0.0.0.0
PORT=5173
~~~

真实 .env.server 已加入 .gitignore，不得提交到 Git、Release 或部署 ZIP。初始化脚本默认拒绝覆盖已有密钥；只有明确执行 node scripts/setup-auth.mjs --force 才会轮换密钥。

### 4.2 Chrome 隐私窗口启动

本机 BAT 保存服务器生成的 API Key：

~~~bat
@echo off
setlocal
set "CHATLOG_API_KEY=替换为服务器生成的密钥"
start "" chrome.exe --incognito "http://网页服务器地址:5173/#key=%CHATLOG_API_KEY%"
exit /b
~~~

使用者只需双击 BAT。

### 4.3 一次性授权交换

1. 浏览器打开网页，URL Fragment 中包含 key。
2. Fragment 不会随初始 HTTP 页面请求发送给服务器。
3. Vue 初始化代码读取 Fragment 中的 key。
4. 页面立即使用 history.replaceState 清除地址栏中的 Fragment。
5. 页面向同源 POST /auth/bootstrap 发送一次 API Key。
6. Node 校验请求 Origin、请求方法和 API Key。
7. 校验成功后，Node 返回会话 Cookie。
8. 前端请求 /auth/status，确认授权成功后才挂载 Vue 应用并加载聊天数据。

### 4.4 Cookie 规则

Cookie 名称：chatlog_api_key。

属性：

- HttpOnly：JavaScript 无法读取 Cookie。
- SameSite=Strict：限制跨站携带。
- Path=/：API 和媒体资源均可携带。
- Secure：HTTPS 请求启用。
- 不设置 Max-Age / Expires：使用会话 Cookie。

当前实现中 Cookie 的值就是 API Key 本身。浏览器后续每次请求自动携带 Cookie，Node 逐请求比较 Cookie 与服务器配置中的 API Key。

因此，“每个请求携带 API Key”通过 HttpOnly Cookie 实现，不使用 URL 查询参数，也不要求前端手动设置 Authorization 请求头。

关闭全部 Chrome 隐私窗口后，隐私会话 Cookie 清理；再次双击 BAT 时重新授权。

## 5. 代理范围与访问规则

| 路径前缀 | 用途 | 是否代理 |
|---|---|---|
| /api/ | Chatlog API | 是 |
| /image/ | 图片 | 是 |
| /video/ | 视频 | 是 |
| /voice/ | 语音 | 是 |
| /file/ | 文件 | 是 |
| /data/ | 数据和媒体资源 | 是 |
| /mcp | MCP | 否 |
| /sse | MCP SSE | 否 |
| /message | MCP 消息 | 否 |

访问规则：

- 受保护路径必须先通过 Cookie 校验。
- 只转发 GET 和 HEAD；其他方法返回 405。
- MCP 相关路径直接返回 404。
- 未授权请求返回 401。
- 非法路径返回 400。
- 上游不可用返回 502。
- 代理响应设置 Cache-Control: no-store, private 和 Pragma: no-cache。
- 代理只转发必要请求头，包括 Accept、Range、If-Range、缓存验证头和 User-Agent。
- 不把浏览器 Cookie 或 API Key 转发给 Go 服务。

## 6. 前端迁移范围

### 6.1 同源 API

浏览器直接使用 Go 服务 URL 的方式已移除。前端使用相对路径，例如：

~~~typescript
request.get('/api/v1/chatlog')
~~~

Axios 使用同源请求并启用 Cookie 携带。

### 6.2 媒体 URL

图片、视频、语音和文件统一通过同源网页服务器访问。媒体 URL 工具会将旧的、指向 Go 5030 端口且路径属于受保护资源范围的绝对 URL 转换成同源相对路径。

前端不再显示或配置 Go 服务 IP 和端口。

### 6.3 授权初始化

- src/utils/auth.ts：读取启动 Fragment、清理地址栏、完成 bootstrap 和检查授权状态。
- src/main.ts：授权成功后才挂载 Vue 应用，避免未授权状态下先发起聊天数据请求。
- src/utils/request.ts：使用同源请求并携带 Cookie。

### 6.4 Service Worker 缓存

聊天 API 和媒体路径采用 Network Only：

- 不从 CacheStorage 读取聊天数据。
- 不把 API 和媒体响应写入 Service Worker 缓存。
- 通过缓存版本更新清理旧版本的 Chatlog 缓存。
- 静态 JS、CSS、图标等资源仍可按原策略缓存。

### 6.5 旧 API 配置清理

已移除旧的浏览器 apiBaseUrl 配置和停用的 Onboarding API 地址设置入口，避免旧 Go 地址继续进入前端配置或生产构建产物。

## 7. GitHub Actions 构建与发布

工作流文件：.github/workflows/build.yml。

使用 GitHub 托管的 ubuntu-latest Runner 和 Node.js 22。

### 7.1 构建步骤

~~~bash
npm ci --no-audit --no-fund
npm test
npm run build
~~~

npm run build 会执行 vue-tsc 和 vite build。

### 7.2 自动触发

| 触发条件 | 行为 |
|---|---|
| push 到 main | 测试、构建、打包并上传 Actions Artifact |
| Pull Request 到 main | 测试和构建，不发布部署包 |
| push v* 标签 | 测试、构建、打包并发布 GitHub Release |
| workflow_dispatch | 手动触发构建 |

### 7.3 部署 ZIP 内容

GitHub Runner 生成的 ZIP 包含：

- dist/：预构建网页静态资源。
- server.mjs：Node 网页服务入口。
- server/auth-proxy.mjs：API Key 校验与反向代理。
- scripts/setup-auth.mjs：首次生成 API Key 的脚本。
- package.json：项目版本和脚本元数据。
- start.bat：纯运行启动脚本。
- setup-auth.bat：首次授权初始化脚本。
- .env.server.example：配置示例。
- docs/SECURE_PROXY.md：安全代理部署说明。
- DEPLOY.txt：简要部署说明。

不包含真实 .env.server、真实 API Key、node_modules、Go 程序或数据库文件。

Actions Artifact 保留 30 天。版本标签触发的 Release 作为长期下载渠道，并附带 SHA-256 校验文件。

## 8. 服务器 A 部署要求

服务器 A 只有 4GB RAM，生产服务器不再执行前端构建。

### 8.1 已知运行环境

- Windows Server，4GB RAM。
- Node.js x64，当前检查版本 v26.13.0。
- Node V8 heap_size_limit 查询结果约 2143.75 MiB。
- Win32_PageFileUsage 查询没有返回记录。
- 服务器构建时曾出现 Node process out of memory 和 Windows VirtualAlloc errno=1455。

本次迁移不依赖服务器增加内存或调整 Node 堆上限，而是将构建移到 GitHub Runner。

### 8.2 服务器只运行 Node

新的 start.bat 只负责检查 Node 和 .env.server，然后启动 server.mjs：

~~~bat
@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not in PATH.
  pause
  exit /b 1
)

if not exist ".env.server" (
  echo .env.server is missing.
  echo Run setup-auth.bat once.
  pause
  exit /b 1
)

node server.mjs
if errorlevel 1 (
  echo Chatlog web server exited with an error.
  pause
)
~~~

启动时不执行 npm install、npm run build、vue-tsc、Vite 或 esbuild。Node 网页服务器使用 Node 内置 HTTP 和文件模块，部署包不要求 node_modules。

### 8.3 首次部署

1. 从 GitHub Actions Artifact 或 GitHub Release 下载部署 ZIP。
2. 解压到服务器的 chatlog-session 目录。
3. 首次部署时运行 setup-auth.bat，生成 .env.server。
4. 将控制台输出的 Key 填入本机 Chrome 启动 BAT。
5. 运行 start.bat。
6. 确认网页端口 5173 正常监听。
7. 确认 Go 服务仍在 127.0.0.1:5030 正常运行。

### 8.4 后续升级

1. 从 GitHub Release 下载新版 ZIP。
2. 解压覆盖旧版本。
3. 保留原有 .env.server，不要覆盖或删除。
4. 不需要重新生成 API Key。
5. 启动 start.bat。

回滚时可以重新解压上一个已验证的 Release 包；同样保留现有 .env.server。

### 8.5 网络边界

- 公网只开放网页入口所需端口。
- Go 的 5030 端口保持本机回环监听，不应直接暴露公网。
- 生产部署必须使用 start.bat / node server.mjs，不要把 Vite 开发服务器暴露到公网。
- 当前 BAT 示例使用 HTTP。HTTP 下授权密钥和数据请求没有传输加密。
- 正式公网使用建议在 Node 前配置 HTTPS 反向代理，并正确传递 X-Forwarded-Proto: https，使 Cookie 启用 Secure。

## 9. 验收标准

### 9.1 授权与代理

- [x] 无 Cookie 访问受保护 API 返回 401。
- [x] 错误 API Key 无法换取 Cookie。
- [x] 正确 API Key 可以换取 HttpOnly、SameSite=Strict 会话 Cookie。
- [x] Cookie 可以授权 API 请求。
- [x] Cookie 可以授权媒体请求。
- [x] Range 请求头可以转发，支持媒体分段读取。
- [x] 非 GET / HEAD 方法返回 405。
- [x] MCP、SSE 和 message 路由不对外代理。
- [x] 跨 Origin bootstrap 请求被拒绝。

### 9.2 构建与发布

- [x] npm test 通过。
- [x] GitHub Runner 上 npm ci 成功。
- [x] GitHub Runner 上测试成功。
- [x] GitHub Runner 上 Vue 生产构建成功。
- [x] GitHub Runner 上部署 ZIP 打包成功。
- [x] Actions Artifact 上传成功。
- [x] GitHub Release 发布成功。
- [x] Release ZIP 包含 dist 和 Node 服务端文件。
- [x] Release ZIP 不包含真实 .env.server。
- [x] 下载后的 ZIP SHA-256 与 Release 校验文件一致。

### 9.3 服务器部署

- [x] start.bat 已改为 ASCII 无 BOM。
- [x] start.bat 不再运行 npm run build。
- [x] 服务器运行不需要 node_modules。
- [ ] 在服务器 A 上使用 Release ZIP 完成实际覆盖部署。
- [ ] 部署后验证网页、API、图片、视频、语音和文件的完整链路。
- [ ] 确认 5030 端口没有公网直达路径。
- [ ] 配置 HTTPS 后验证 Secure Cookie。

未勾选项目代表仍需在实际服务器环境执行验收，不以本地构建或 GitHub Runner 成功代替。

## 10. 当前发布记录

- 仓库：https://github.com/qqq694637644/chatlog-session
- 仓库可见性：Public
- 默认分支：main
- 发布标签：v0.15.0
- 发布页面：https://github.com/qqq694637644/chatlog-session/releases/tag/v0.15.0
- 构建工作流：https://github.com/qqq694637644/chatlog-session/actions
- 已验证 Release 包：chatlog-session-583ecad.zip
- 已验证 SHA-256：0b418e8d179c949296a886353bc210c6bd6d2d8981350802e31da603bbe2755f

## 11. 后续变更原则

1. 个人使用优先，避免引入不必要的账号体系和服务组件。
2. Go 数据服务和 SQLite 访问逻辑保持独立，除非出现明确需求，不修改 Go 项目。
3. 所有浏览器数据请求必须走同源 Node 代理。
4. API Key 只保存在服务器 .env.server 和用户本机启动 BAT，不进入源码、构建产物和 Git。
5. 新增媒体资源类型时，必须同步更新代理路径白名单、媒体 URL 转换和 Service Worker Network Only 规则。
6. 新增 HTTP 方法或 API 路径时，必须重新评估是否需要开放，默认拒绝写操作。
7. 生产构建始终在 GitHub Actions Runner 完成，服务器只运行预构建产物。
8. 每次发布必须通过测试、构建、部署包完整性和密钥排除检查。
9. 更新服务器时保留 .env.server，避免无意轮换 API Key。
10. 任何公开仓库提交都不得包含真实密钥、服务器私有配置或本地敏感数据。

---

本文件记录的是当前已实施方案及其验收状态。若代码实现与本文不一致，应先核对实际代码和 GitHub Actions 工作流，再更新文档；不要将计划中的事项描述为已经完成。
