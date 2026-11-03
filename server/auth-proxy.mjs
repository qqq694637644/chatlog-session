import { timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { request as httpRequest } from 'node:http'

const COOKIE_NAME = 'chatlog_api_key'
const PROTECTED_PREFIXES = ['/api/', '/image/', '/video/', '/voice/', '/file/', '/data/']
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'set-cookie',
  'access-control-allow-origin',
  'access-control-allow-credentials',
])

function parseEnvFile(text) {
  const values = {}
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!match || match[1].startsWith('#')) continue
    let value = match[2]
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[match[1]] = value
  }
  return values
}

export function loadServerConfig(rootDir = process.cwd()) {
  const envPath = join(rootDir, '.env.server')
  const fileValues = existsSync(envPath)
    ? parseEnvFile(readFileSync(envPath, 'utf8'))
    : {}

  return {
    apiKey: process.env.CHATLOG_API_KEY || fileValues.CHATLOG_API_KEY || '',
    upstream:
      process.env.CHATLOG_API_UPSTREAM ||
      fileValues.CHATLOG_API_UPSTREAM ||
      'http://127.0.0.1:5030',
    host: process.env.HOST || fileValues.HOST || '0.0.0.0',
    port: Number(process.env.PORT || fileValues.PORT || 5173),
  }
}

function safeEqual(candidate, expected) {
  if (typeof candidate !== 'string' || candidate.length !== expected.length) {
    return false
  }
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected))
}

function getCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const item of header.split(';')) {
    const separator = item.indexOf('=')
    if (separator < 0) continue
    if (item.slice(0, separator).trim() === name) {
      return item.slice(separator + 1).trim()
    }
  }
  return ''
}

function sendJson(res, statusCode, body, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, private',
    Pragma: 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  })
  res.end(JSON.stringify(body))
}

function isSameOriginRequest(req) {
  const origin = req.headers.origin
  if (!origin || !req.headers.host) return false
  try {
    const parsedOrigin = new URL(origin)
    const expectedProtocol = isSecureRequest(req) ? 'https:' : 'http:'
    return parsedOrigin.host.toLowerCase() === req.headers.host.toLowerCase() &&
      parsedOrigin.protocol === expectedProtocol
  } catch {
    return false
  }
}

function isSecureRequest(req) {
  if (req.socket && req.socket.encrypted) return true
  return String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase() === 'https'
}

function readRequestBody(req, maxBytes = 4096) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let tooLarge = false

    req.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBytes) {
        tooLarge = true
        chunks.length = 0
        return
      }
      if (!tooLarge) chunks.push(chunk)
    })
    req.on('end', () => {
      if (tooLarge) {
        reject(new Error('REQUEST_BODY_TOO_LARGE'))
        return
      }
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', reject)
  })
}

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isSafePath(pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return false
  }
  return !decoded.includes('\0') &&
    !decoded.includes('\\') &&
    !decoded.split('/').includes('..')
}

function proxyToChatlog(req, res, url, upstream) {
  const target = new URL(url.pathname + url.search, upstream)
  const headers = {}

  for (const name of [
    'accept',
    'accept-encoding',
    'range',
    'if-range',
    'if-none-match',
    'if-modified-since',
    'user-agent',
  ]) {
    if (req.headers[name]) headers[name] = req.headers[name]
  }

  const upstreamRequest = httpRequest(
    target,
    { method: req.method, headers },
    (upstreamResponse) => {
      const responseHeaders = {}
      for (const [name, value] of Object.entries(upstreamResponse.headers)) {
        if (value === undefined || HOP_BY_HOP_HEADERS.has(name.toLowerCase())) continue
        responseHeaders[name] = value
      }

      responseHeaders['Cache-Control'] = 'no-store, private'
      responseHeaders.Pragma = 'no-cache'
      responseHeaders.Vary = 'Cookie'
      responseHeaders['X-Content-Type-Options'] = 'nosniff'

      res.writeHead(upstreamResponse.statusCode || 502, responseHeaders)
      if (req.method === 'HEAD') {
        upstreamResponse.resume()
        res.end()
      } else {
        upstreamResponse.pipe(res)
      }
    },
  )

  upstreamRequest.on('error', (error) => {
    if (res.headersSent) {
      res.destroy(error)
      return
    }
    sendJson(res, 502, {
      error: 'CHATLOG_UPSTREAM_UNAVAILABLE',
      message: 'Chatlog 数据服务暂时不可用',
    })
  })

  res.on('close', () => {
    if (!upstreamRequest.destroyed) upstreamRequest.destroy()
  })

  req.pipe(upstreamRequest)
}

export function createAuthProxy(options = {}) {
  const apiKey = String(options.apiKey || '').trim()
  if (!/^[a-f0-9]{64}$/i.test(apiKey)) {
    throw new Error('CHATLOG_API_KEY 缺失或格式错误，请先运行 npm run setup:auth')
  }

  const upstream = new URL(options.upstream || 'http://127.0.0.1:5030')
  if (
    upstream.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost', '::1'].includes(upstream.hostname)
  ) {
    throw new Error('Chatlog 上游地址必须是本机 HTTP 地址，例如 http://127.0.0.1:5030')
  }

  async function handle(req, res) {
    const url = new URL(req.url || '/', 'http://' + (req.headers.host || 'localhost'))
    const pathname = url.pathname

    if (pathname === '/auth/bootstrap') {
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED' }, { Allow: 'POST' })
        return true
      }
      if (!isSameOriginRequest(req)) {
        sendJson(res, 403, { error: 'INVALID_ORIGIN' })
        return true
      }

      let body
      try {
        body = JSON.parse(await readRequestBody(req))
      } catch (error) {
        sendJson(res, error.message === 'REQUEST_BODY_TOO_LARGE' ? 413 : 400, {
          error: 'INVALID_BOOTSTRAP_REQUEST',
        })
        return true
      }

      if (!safeEqual(body && body.apiKey, apiKey)) {
        sendJson(res, 401, { error: 'INVALID_API_KEY' })
        return true
      }

      const secure = isSecureRequest(req) ? '; Secure' : ''
      res.writeHead(204, {
        'Set-Cookie':
          COOKIE_NAME + '=' + apiKey + '; Path=/; HttpOnly; SameSite=Strict' + secure,
        'Cache-Control': 'no-store, private',
        Pragma: 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      })
      res.end()
      return true
    }

    if (pathname === '/auth/status') {
      const authorized = safeEqual(getCookie(req, COOKIE_NAME), apiKey)
      sendJson(res, authorized ? 200 : 401, { authorized })
      return true
    }

    if (pathname === '/auth/logout') {
      if (req.method !== 'POST' || !isSameOriginRequest(req)) {
        sendJson(res, 403, { error: 'INVALID_LOGOUT_REQUEST' })
        return true
      }
      const secure = isSecureRequest(req) ? '; Secure' : ''
      res.writeHead(204, {
        'Set-Cookie':
          COOKIE_NAME + '=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' + secure,
        'Cache-Control': 'no-store, private',
      })
      res.end()
      return true
    }

    if (pathname === '/mcp' || pathname.startsWith('/mcp/') ||
        pathname === '/sse' || pathname.startsWith('/sse/') ||
        pathname === '/message' || pathname.startsWith('/message/')) {
      sendJson(res, 404, { error: 'NOT_FOUND' })
      return true
    }

    if (!isProtectedPath(pathname)) return false

    if (!isSafePath(pathname)) {
      sendJson(res, 400, { error: 'INVALID_PATH' })
      return true
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED' }, { Allow: 'GET, HEAD' })
      return true
    }

    if (!safeEqual(getCookie(req, COOKIE_NAME), apiKey)) {
      sendJson(res, 401, { error: 'UNAUTHORIZED' })
      return true
    }

    proxyToChatlog(req, res, url, upstream)
    return true
  }

  return { handle }
}