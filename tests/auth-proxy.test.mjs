import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import test from 'node:test'
import { createAuthProxy } from '../server/auth-proxy.mjs'

const API_KEY = 'a'.repeat(64)

async function listen(server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  return server.address().port
}

async function close(server) {
  if (!server.listening) return
  server.close()
  await once(server, 'close')
}

async function createFixture(t) {
  let upstreamRequests = 0
  const upstream = createServer((req, res) => {
    upstreamRequests += 1
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    })
    res.end(JSON.stringify({
      url: req.url,
      method: req.method,
      range: req.headers.range || null,
    }))
  })
  const upstreamPort = await listen(upstream)

  const proxy = createAuthProxy({
    apiKey: API_KEY,
    upstream: 'http://127.0.0.1:' + upstreamPort,
  })
  const gateway = createServer(async (req, res) => {
    try {
      const handled = await proxy.handle(req, res)
      if (!handled) {
        res.writeHead(404)
        res.end('not found')
      }
    } catch (error) {
      res.writeHead(500)
      res.end(error.message)
    }
  })
  const gatewayPort = await listen(gateway)
  const baseUrl = 'http://127.0.0.1:' + gatewayPort

  t.after(async () => {
    await close(gateway)
    await close(upstream)
  })

  return {
    baseUrl,
    get upstreamRequests() {
      return upstreamRequests
    },
  }
}

test('protected API rejects requests without the API key cookie', async (t) => {
  const fixture = await createFixture(t)
  const response = await fetch(fixture.baseUrl + '/api/v1/session?format=json')

  assert.equal(response.status, 401)
  assert.equal((await response.json()).error, 'UNAUTHORIZED')
  assert.equal(fixture.upstreamRequests, 0)
  assert.match(response.headers.get('cache-control') || '', /no-store/)
})

test('bootstrap rejects an incorrect API key', async (t) => {
  const fixture = await createFixture(t)
  const response = await fetch(fixture.baseUrl + '/auth/bootstrap', {
    method: 'POST',
    headers: {
      Origin: fixture.baseUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey: 'b'.repeat(64) }),
  })

  assert.equal(response.status, 401)
  assert.equal(response.headers.get('set-cookie'), null)
})

test('bootstrap cookie authorizes API and media requests, including Range', async (t) => {
  const fixture = await createFixture(t)
  const bootstrap = await fetch(fixture.baseUrl + '/auth/bootstrap', {
    method: 'POST',
    headers: {
      Origin: fixture.baseUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey: API_KEY }),
  })

  assert.equal(bootstrap.status, 204)
  const setCookie = bootstrap.headers.get('set-cookie') || ''
  assert.match(setCookie, /HttpOnly/)
  assert.match(setCookie, /SameSite=Strict/)
  assert.doesNotMatch(setCookie, /Max-Age|Expires/i)

  const cookie = setCookie.split(';')[0]
  const apiResponse = await fetch(fixture.baseUrl + '/api/v1/session?format=json', {
    headers: { Cookie: cookie },
  })
  assert.equal(apiResponse.status, 200)
  assert.match(apiResponse.headers.get('cache-control') || '', /no-store/)
  assert.deepEqual(await apiResponse.json(), {
    url: '/api/v1/session?format=json',
    method: 'GET',
    range: null,
  })

  const mediaResponse = await fetch(fixture.baseUrl + '/video/example.mp4', {
    headers: {
      Cookie: cookie,
      Range: 'bytes=0-1023',
    },
  })
  assert.equal(mediaResponse.status, 200)
  assert.deepEqual(await mediaResponse.json(), {
    url: '/video/example.mp4',
    method: 'GET',
    range: 'bytes=0-1023',
  })
  assert.equal(fixture.upstreamRequests, 2)
})

test('proxy rejects non-read methods and does not expose MCP routes', async (t) => {
  const fixture = await createFixture(t)
  const postResponse = await fetch(fixture.baseUrl + '/api/v1/session', {
    method: 'POST',
  })
  assert.equal(postResponse.status, 405)

  const mcpResponse = await fetch(fixture.baseUrl + '/mcp')
  assert.equal(mcpResponse.status, 404)
  assert.equal(fixture.upstreamRequests, 0)
})

test('bootstrap rejects cross-origin requests', async (t) => {
  const fixture = await createFixture(t)
  const response = await fetch(fixture.baseUrl + '/auth/bootstrap', {
    method: 'POST',
    headers: {
      Origin: 'https://attacker.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey: API_KEY }),
  })

  assert.equal(response.status, 403)
})