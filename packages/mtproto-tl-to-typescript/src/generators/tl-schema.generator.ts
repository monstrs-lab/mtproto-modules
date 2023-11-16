import type { TLExtendedSchema }     from '@monstrs/mtproto-tl-types'

import { Project }                   from 'ts-morph'
import { ScriptTarget }              from 'ts-morph'
import { ModuleKind }                from 'ts-morph'
import { ModuleResolutionKind }      from 'ts-morph'

import { TLConstructorGenerator }    from './tl-constructor.generator.js'
import { TLIndexGenerator }          from './tl-index.generator.js'
import { TLMethodGenerator }         from './tl-method.generator.js'
import { TLSchemaRegistryGenerator } from './tl-schema-registry.generator.js'

export interface TLSchemaGeneratorOptions {
  outDir: string
}

export class TLSchemaGenerator {
  private project: Project

  private schemaRegistryGenerator: TLSchemaRegistryGenerator

  private constructorGenerator: TLConstructorGenerator

  private methodGenerator: TLMethodGenerator

  private indexGenerator: TLIndexGenerator

  constructor(options: TLSchemaGeneratorOptions) {
    this.project = new Project({
      compilerOptions: {
        outDir: options.outDir,
        module: ModuleKind.ES2022,
        target: ScriptTarget.ES2022,
        moduleResolution: ModuleResolutionKind.Bundler,
      },
    })

    this.schemaRegistryGenerator = new TLSchemaRegistryGenerator(this.project, options.outDir)
    this.constructorGenerator = new TLConstructorGenerator(this.project, options.outDir)
    this.methodGenerator = new TLMethodGenerator(this.project, options.outDir)
    this.indexGenerator = new TLIndexGenerator(this.project, options.outDir)
  }

  async generate(schema: TLExtendedSchema): Promise<void> {
    schema.constructors.forEach((ctr) => {
      this.constructorGenerator.generate(ctr)
    })

    schema.methods.forEach((method) => {
      this.methodGenerator.generate(method)
    })
  }

  async write(): Promise<void> {
    this.schemaRegistryGenerator.generate()
    this.indexGenerator.generate()

    await this.project.save()
  }
}
