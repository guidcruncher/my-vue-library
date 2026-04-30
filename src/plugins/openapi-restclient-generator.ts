// openapi-rest-client-generator.ts
import type { OpenAPIV3 } from 'openapi-types'

export class OpenApiRestClientGenerator {
  constructor(private readonly spec: OpenAPIV3.Document) {}

  generate(): string {
    const parts: string[] = []

    parts.push(this.generateHeader())
    parts.push(this.generateTypes())
    parts.push(this.generateClientClass())

    return parts.join('\n\n')
  }

  // -------------------------------------------------------
  // HEADER
  // -------------------------------------------------------
  private generateHeader(): string {
    return `// AUTO‑GENERATED — DO NOT EDIT
// Generated from OpenAPI: ${this.spec.info.title} v${this.spec.info.version}

import { useRestClient } from "@/composables/useRestClient";
`
  }

  // -------------------------------------------------------
  // TYPES
  // -------------------------------------------------------
  private generateTypes(): string {
    const out: string[] = []

    const schemas = this.spec.components?.schemas ?? {}

    for (const [name, schema] of Object.entries(schemas)) {
      out.push(this.schemaToTs(name, schema as OpenAPIV3.SchemaObject))
    }

    return out.join('\n\n')
  }

  private schemaToTs(name: string, schema: OpenAPIV3.SchemaObject): string {
    if (schema.type === 'object' && schema.properties) {
      const fields = Object.entries(schema.properties)
        .map(([key, prop]) => {
          const p = prop as OpenAPIV3.SchemaObject
          return `  ${key}${this.optional(schema, key)}: ${this.resolveType(p)};`
        })
        .join('\n')

      return `export interface ${name} {\n${fields}\n}`
    }

    // fallback
    return `export type ${name} = any`
  }

  private optional(schema: OpenAPIV3.SchemaObject, key: string): string {
    return schema.required?.includes(key) ? '' : '?'
  }

  private resolveType(schema: OpenAPIV3.SchemaObject): string {
    if (schema.$ref) {
      return this.refToTs(schema.$ref)
    }

    switch (schema.type) {
      case 'string':
        return 'string'
      case 'integer':
      case 'number':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'array':
        return `${this.resolveType(schema.items as OpenAPIV3.SchemaObject)}[]`
      case 'object':
        if (schema.properties) {
          return (
            '{ ' +
            Object.entries(schema.properties)
              .map(([k, v]) => `${k}: ${this.resolveType(v as OpenAPIV3.SchemaObject)}`)
              .join('; ') +
            ' }'
          )
        }
        return 'Record<string, any>'
      default:
        return 'any'
    }
  }

  private refToTs(ref: string): string {
    return ref.replace('#/components/schemas/', '')
  }

  // -------------------------------------------------------
  // CLIENT CLASS
  // -------------------------------------------------------
  private generateClientClass(): string {
    const methods: string[] = []

    for (const [path, pathItem] of Object.entries(this.spec.paths)) {
      if (!pathItem) continue

      const ops = pathItem as OpenAPIV3.PathItemObject

      for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
        const op = ops[method]
        if (op) {
          methods.push(this.generateClientMethod(method, path, op))
        }
      }
    }

    return `
export class ApiClient {
  private readonly rest = useRestClient({ baseUrl: "${this.spec.servers?.[0]?.url ?? ''}" });

${methods.join('\n')}
}
`
  }

  private generateClientMethod(
    method: string,
    path: string,
    op: OpenAPIV3.OperationObject
  ): string {
    const name = op.operationId ?? this.makeOperationName(method, path)

    const params = this.extractParams(op)
    const responseType = this.extractResponseType(op)
    const bodyType = this.extractRequestBodyType(op)

    const pathExpr = this.interpolatePath(path, params.pathParams)

    return `
  async ${name}(args: {
    ${params.pathParams.map((p) => `${p.name}: string | number`).join('\n    ')}
    ${params.queryParams.length ? `query?: { ${params.queryParams.map((p) => `${p.name}?: string | number | boolean`).join('; ')} }` : ''}
    ${bodyType ? `body?: ${bodyType}` : ''}
  }): Promise<${responseType}> {
    return this.rest.${method}<${responseType}${bodyType ? `, ${bodyType}` : ''}>(
      ${pathExpr},
      ${bodyType ? 'args.body,' : 'undefined,'}
      {
        params: args.query
      }
    ).then(r => r.data as ${responseType});
  }
`
  }

  private makeOperationName(method: string, path: string): string {
    return (
      method +
      path
        .replace(/[{}]/g, '')
        .split('/')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('')
    )
  }

  private extractParams(op: OpenAPIV3.OperationObject) {
    const params = op.parameters ?? []
    const pathParams: { name: string }[] = []
    const queryParams: { name: string }[] = []

    for (const p of params) {
      const param = p as OpenAPIV3.ParameterObject
      if (param.in === 'path') pathParams.push({ name: param.name })
      if (param.in === 'query') queryParams.push({ name: param.name })
    }

    return { pathParams, queryParams }
  }

  private extractResponseType(op: OpenAPIV3.OperationObject): string {
    const responses = op.responses ?? {}
    const ok = responses['200'] ?? responses['201'] ?? responses['204']

    if (!ok) return 'void'

    const res = ok as OpenAPIV3.ResponseObject
    const content = res.content?.['application/json']

    if (!content) return 'void'

    const schema = content.schema as OpenAPIV3.SchemaObject

    if (schema.$ref) return this.refToTs(schema.$ref)

    return this.resolveType(schema)
  }

  private extractRequestBodyType(op: OpenAPIV3.OperationObject): string | null {
    const body = op.requestBody as OpenAPIV3.RequestBodyObject | undefined
    if (!body) return null

    const json = body.content?.['application/json']
    if (!json) return null

    const schema = json.schema as OpenAPIV3.SchemaObject

    if (schema.$ref) return this.refToTs(schema.$ref)

    return this.resolveType(schema)
  }

  private interpolatePath(path: string, params: { name: string }[]): string {
    if (!params.length) return `\`${path}\``

    let out = path
    for (const p of params) {
      out = out.replace(`{${p.name}}`, `\${args.${p.name}}`)
    }

    return `\`${out}\``
  }
}
