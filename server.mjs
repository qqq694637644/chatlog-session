import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAuthProxy, loadServerConfig } from './server/auth-proxy.mjs'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const distDir = resolve(rootDir, 'dist')
if (!existsSync(join(distDir, 'index.html'))) {
  throw new Error('dist/index.html 不存在，请先运行 npm run build')
}

const config = loadServerConfig(rootDir)
const authProxy = createAuthProxy(config)

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
}

function sendError(res, status, message) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(message)
}

function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendError(res, 405, 'Method Not Allowed')
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname)
  } catch {
    sendError(res, 400, 'Bad Request')
    return
  }

  if (pathname.includes('\0') || pathname.includes('\\')) {
    sendError(res, 400, 'Bad Request')
    return
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  let filePath = resolve(distDir, relativePath)
  if (filePath !== distDir && !filePath.startsWith(distDir + sep)) {
    sendError(res, 403, 'Forbidden')
    return
  }

  let isFallback = false
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    if (extname(pathname)) {
      sendError(res, 404, 'Not Found')
      return
    }
    filePath = join(distDir, 'index.html')
    isFallback = true
  }

  const extension = extname(filePath).toLowerCase()
  const headers = {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
  }

  if (extension === '.html' || isFallback) {
    headers['Cache-Control'] = 'no-store'
  } else if (pathname.startsWith('/assets/') || pathname.startsWith('/js/') || pathname.startsWith('/css/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  } else {
    headers['Cache-Control'] = 'public, max-age=3600'
  }

  const file = createReadStream(filePath)
  file.on('error', () => {
    if (!res.headersSent) sendError(res, 500, 'Internal Server Error')
    else res.destroy()
  })
  res.writeHead(200, headers)
  if (req.method === 'HEAD') {
    file.destroy()
    res.end()
  } else {
    file.pipe(res)
  }
}

const server = createServer(async (req, res) => {
  try {
    if (await authProxy.handle(req, res)) return
    serveStatic(req, res)
  } catch (error) {
    console.error('[Chatlog Web] Request failed:', error)
    if (!res.headersSent) sendError(res, 500, 'Internal Server Error')
    else res.destroy()
  }
})

server.requestTimeout = 120000
server.headersTimeout = 65000
server.keepAliveTimeout = 60000

server.listen(config.port, config.host, () => {
  console.log('[Chatlog Web] Listening on http://' + config.host + ':' + config.port)
  console.log('[Chatlog Web] Chatlog upstream: ' + config.upstream)
  console.log('[Chatlog Web] API key authorization: enabled')
})