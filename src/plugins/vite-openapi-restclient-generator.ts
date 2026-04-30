// vite-plugin-openapi-rest-client.ts
import fs from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'
import type { Plugin } from 'vite'
import type { OpenAPIV3 } from 'openapi-types'
import { OpenApiRestClientGenerator } from './openapi-rest-client-generator'

export interface OpenApiPluginOptions {
  source: string // file path or URL
  output: string // generated TS file
}

export function openApiRestClientPlugin(options: OpenApiPluginOptions): Plugin {
  const isRemote = options.source.startsWith('http://') || options.source.startsWith('https://')

  const outputPath = path.resolve(options.output)

  let isDev = false

  return {
    name: 'vite-plugin-openapi-rest-client',

    configResolved(config) {
      isDev = config.command === 'serve'
    },

    async buildStart() {
      if (!isDev) return // ⛔ skip in build mode

      await this.generateClient()

      if (!isRemote) {
        this.addWatchFile(path.resolve(options.source))
      }
    },

    async handleHotUpdate(ctx) {
      if (!isDev) return

      if (!isRemote && ctx.file.endsWith(options.source)) {
        await this.generateClient()
      }
    },

    async generateClient() {
      if (!isDev) return

      const spec = await loadOpenApi(options.source)
      const generator = new OpenApiRestClientGenerator(spec)
      const code = generator.generate()

      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, code, 'utf8')

      console.log(`[openapi] generated client → ${options.output}`)
    },
  }
}

// ------------------------------------------------------------
// Loader: file or URL, YAML or JSON
// ------------------------------------------------------------
async function loadOpenApi(source: string): Promise<OpenAPIV3.Document> {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const res = await fetch(source)
    if (!res.ok) throw new Error(`Failed to fetch OpenAPI spec: ${res.status}`)
    const text = await res.text()
    return parseSpec(text, source)
  }

  const abs = path.resolve(source)
  const raw = await fs.readFile(abs, 'utf8')
  return parseSpec(raw, abs)
}

function parseSpec(raw: string, source: string): OpenAPIV3.Document {
  const isYaml =
    source.endsWith('.yaml') || source.endsWith('.yml') || raw.trimStart().startsWith('openapi:')

  const data = isYaml ? YAML.parse(raw) : JSON.parse(raw)

  if (!data.openapi) {
    throw new Error("Invalid OpenAPI document: missing 'openapi' field")
  }

  return data as OpenAPIV3.Document
}
