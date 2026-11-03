# Chatlog Session deployment

## Architecture

The browser talks only to this web server. The Node server checks the HttpOnly API-key cookie and proxies the allowed read-only API/media routes to http://127.0.0.1:5030. The Go repository and SQLite access layer are unchanged.

## Build on GitHub Actions

The workflow at .github/workflows/build.yml runs on GitHub-hosted Ubuntu runners:

- npm ci
- npm test
- npm run build
- package the static dist output and the small Node gateway into a ZIP

A push to main uploads a downloadable Actions artifact (kept for 30 days). Pushing a version tag such as v0.15.0 also publishes the ZIP and SHA-256 file to GitHub Releases. Pull requests run tests and the build but do not publish deployment packages.

## Deploy on the 4 GB Windows server

Do not build the Vue application on the server.

1. Open the repository's Actions page, open the latest successful Build and package run, and download its chatlog-session ZIP artifact. Alternatively, download the ZIP from Releases.
2. Extract the ZIP. It contains the chatlog-session deployment folder.
3. When upgrading an existing installation, keep the existing .env.server file. It contains the server API key and is intentionally not included in the ZIP.
4. On first installation only, run setup-auth.bat. It creates .env.server and prints the random API key. Copy that key into the local Chrome launcher BAT.
5. Run start.bat.

start.bat only executes node server.mjs. It does not run npm install, npm run build, Vite, vue-tsc or esbuild. The deployment ZIP contains the prebuilt frontend, Node server and key setup script; node_modules is not required on the server.

Node.js 22 or later is recommended. The Go Chatlog service must continue listening on 127.0.0.1:5030.

## API key and Chrome Incognito

The API key is generated on the web server and stored only in .env.server. The setup script refuses to overwrite an existing key unless --force is explicitly supplied.

Copy the printed key into the local launcher BAT:

~~~bat
@echo off
setlocal
set "CHATLOG_API_KEY=PASTE_THE_KEY_FROM_SETUP_AUTH_HERE"
start "" chrome.exe --incognito "http://YOUR_WEB_SERVER:5173/#key=%CHATLOG_API_KEY%"
exit /b
~~~

The Vue entry point reads the fragment, removes it from the address bar and exchanges it for an HttpOnly session cookie. Closing all Incognito windows clears the session cookie; double-clicking the BAT again starts a fresh session.

## HTTPS

The sample launcher uses HTTP. On HTTP, the bootstrap key and subsequent requests are not encrypted in transit. The cookie is still HttpOnly and SameSite=Strict, but the Secure attribute is only enabled when the web server is reached through HTTPS. For protection against network sniffing, put the Node web server behind HTTPS and pass X-Forwarded-Proto: https. Do not expose port 5030 publicly.

## Local development

npm run dev is intended for local development only and binds to 127.0.0.1. It uses Vite's local proxy and bypasses the production API-key gate. Do not expose the Vite development server to the Internet.

## Key rotation

To rotate the key, run node scripts/setup-auth.mjs --force, then update the local Chrome launcher BAT. Existing cookies become invalid immediately.