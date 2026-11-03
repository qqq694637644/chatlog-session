# Chatlog Session: server-side API key proxy

The browser must not connect to the Go Chatlog service directly. Production uses this repository's small Node HTTP server as a same-origin gateway.

## Request flow

1. The Chrome launcher opens the site with a key in the URL fragment, for example #key=....
2. The fragment is not sent in the initial HTTP request. The Vue entry point reads it, removes it from the address bar, and posts it once to /auth/bootstrap.
3. The Node server compares the supplied key with CHATLOG_API_KEY from the server-only .env.server file. On success it sets a session-only HttpOnly; SameSite=Strict cookie named chatlog_api_key.
4. Every /api/, /image/, /video/, /voice/, /file/ and /data/ request automatically carries that cookie. The Node server validates it before forwarding the request to http://127.0.0.1:5030.
5. Only GET and HEAD are forwarded. MCP (/mcp, /sse, /message) is not exposed.
6. Protected API and media responses are Cache-Control: no-store; the Service Worker does not cache them. Old API/media caches are removed when the new Service Worker activates.

The Go repository and SQLite access layer are unchanged. The Go service must continue listening on loopback at 127.0.0.1:5030.

## First-time server setup

Run these commands in the chatlog-session directory on the machine that hosts both the web app and the local Go service:

~~~powershell
npm install
npm run setup:auth
~~~

The setup command creates .env.server with a random 256-bit key. It refuses to overwrite an existing key unless --force is explicitly supplied. .env.server is ignored by Git and must never be committed.

Copy the printed key into the local Chrome launcher BAT. Then start the production web server:

~~~bat
start.bat
~~~

start.bat builds the Vue app and starts server.mjs on port 5173. The Node server binds to 0.0.0.0:5173 and forwards protected data routes to 127.0.0.1:5030.

## Local Chrome launcher

Copy open-chatlog.bat.example to a BAT file on the user's PC. Replace the placeholder with the key printed by npm run setup:auth.

~~~bat
@echo off
setlocal
set "CHATLOG_API_KEY=PASTE_THE_KEY_FROM_SETUP_AUTH_HERE"
start "" chrome.exe --incognito "http://YOUR_WEB_SERVER:5173/#key=%CHATLOG_API_KEY%"
exit /b
~~~

Double-click the BAT. The key is exchanged for an HttpOnly session cookie and immediately removed from the URL. Closing all Incognito windows clears the session cookie; the next launch bootstraps again.

If the web site is moved, update only the site URL in the local BAT. Do not put the Go API address or API key into frontend source, Vite variables, or Git.

## HTTPS note

The current example URL is HTTP. On HTTP, the cookie remains HttpOnly and SameSite=Strict but cannot use the Secure attribute, and the bootstrap/API key traffic is not encrypted. This protects against unauthenticated direct API requests but does not protect against network sniffing. For full transport security, put the Node web server behind HTTPS and pass X-Forwarded-Proto: https; the proxy will then add the Secure cookie attribute automatically. Do not expose port 5030 publicly.

## Development

npm run dev is intentionally bound to 127.0.0.1 and uses Vite's local proxy for development. It bypasses the production API-key gate because it is loopback-only. Do not change the Vite development host back to 0.0.0.0 and do not expose the Vite dev server to the Internet. Production must use start.bat / npm run start.

## Key rotation

Run npm run setup:auth -- --force on the web host to generate a new key. Update the local Chrome launcher BAT to the newly printed key. Existing cookies become invalid immediately.