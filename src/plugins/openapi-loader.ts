// openapi-loader.ts
import fs from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'
import type { OpenAPIV3 } from 'openapi-types'
import { OpenApiRestClientGenerator } from './openapi-restclient-generator'

export class OpenApiLoader {
  static async fromFile(filePath: string): Promise<OpenApiRestClientGenerator> {
    const abs = path.resolve(filePath)
    const raw = await fs.readFile(abs, 'utf8')

    const spec = this.parse(raw, filePath)
    return new OpenApiRestClientGenerator(spec)
  }

  static async fromUrl(url: string): Promise<OpenApiRestClientGenerator> {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch OpenAPI spec from ${url}: ${res.status}`)
    }

    const text = await res.text()
    const spec = this.parse(text, url)
    return new OpenApiRestClientGenerator(spec)
  }

  private static parse(raw: string, source: string): OpenAPIV3.Document {
    const isYaml =
      source.endsWith('.yaml') || source.endsWith('.yml') || raw.trimStart().startsWith('openapi:')

    const data = isYaml ? YAML.parse(raw) : JSON.parse(raw)

    if (!data.openapi) {
      throw new Error("Invalid OpenAPI document: missing 'openapi' field")
    }

    return data as OpenAPIV3.Document
  }
}
