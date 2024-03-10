import type { TLSchema }     from '@monstrs/mtproto-tl-types'

import { TLJsonParser }      from '@monstrs/mtproto-tl-json-parser'

import { TLSchemaGenerator } from './generators/index.js'

export interface TLToTypeScriptOptions {
  outDir: string
}

export class TLToTypeScript {
  private schemaGenerator: TLSchemaGenerator

  constructor(options: TLToTypeScriptOptions) {
    this.schemaGenerator = new TLSchemaGenerator(options)
  }

  async execute(schema: TLSchema): Promise<void> {
    await this.schemaGenerator.generate(new TLJsonParser().parse(schema))
  }

  async write(): Promise<void> {
    await this.schemaGenerator.write()
  }
}
