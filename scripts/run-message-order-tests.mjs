import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const tempDir = await mkdtemp(path.join(tmpdir(), 'chatlog-session-tests-'))
const outputFile = path.join(tempDir, 'message-order.test.mjs')

try {
  await build({
    entryPoints: [path.resolve(process.cwd(), 'tests/message-order.test.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    outfile: outputFile,
    logLevel: 'silent'
  })

  await import(pathToFileURL(outputFile).href)
  console.log('消息顺序回归测试通过')
} finally {
  await rm(tempDir, { recursive: true, force: true })
}
