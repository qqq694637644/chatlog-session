import { randomBytes } from 'node:crypto'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const envPath = join(rootDir, '.env.server')
const force = process.argv.includes('--force')

if (existsSync(envPath) && !force) {
  console.error('.env.server 已存在。为避免意外更换密钥，本次未覆盖。')
  console.error('如需主动轮换密钥，请先备份 BAT，再运行：npm run setup:auth -- --force')
  process.exit(1)
}

const apiKey = randomBytes(32).toString('hex')
const content = [
  'CHATLOG_API_KEY=' + apiKey,
  'CHATLOG_API_UPSTREAM=http://127.0.0.1:5030',
  'HOST=0.0.0.0',
  'PORT=5173',
  '',
].join('\n')

writeFileSync(envPath, content, { encoding: 'utf8', mode: 0o600 })
console.log('已生成服务器 API Key，并保存到 .env.server（该文件不会提交到 Git）。')
console.log('')
console.log('请将下面这一行中的值复制到你本机的 Chrome 启动 BAT：')
console.log('CHATLOG_API_KEY=' + apiKey)
console.log('')
console.log('注意：不要把这个 Key 发到聊天群、Issue 或 GitHub。')