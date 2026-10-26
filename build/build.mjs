/**
 * Build both halves of the skin:
 *  - lib/index.js  ESM host half (no-op)
 *  - lib/client.js CommonJS closure-factory artifact consumed by the DSH
 *                  web loader via window.__ModuleLoader__.load
 *
 * CSS and the SVG scene are inlined as strings by esbuild's text loader; the
 * browser bundle therefore has no runtime asset requests and no external
 * module requirements.
 */
import { build } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))

await mkdir(resolve(root, 'lib'), { recursive: true })

await build({
  absWorkingDir: root,
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  sourcemap: false,
  logLevel: 'info',
})

const client = await build({
  absWorkingDir: root,
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  sourcemap: false,
  logLevel: 'info',
  loader: {
    '.css': 'text',
    '.html': 'text',
    '.webp': 'dataurl',
  },
})

const js = client.outputFiles[0].text
const banner = `window.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => {`
const intro = 'var module = { exports: {} }; var exports = module.exports;'
const footer = 'return module.exports; } });'

await writeFile(
  resolve(root, 'lib/client.js'),
  `${banner}\n${intro}\n${js}\n${footer}\n`,
)

console.log(`built ${pkg.name} -> lib/index.js, lib/client.js (${js.length} B client)`)
