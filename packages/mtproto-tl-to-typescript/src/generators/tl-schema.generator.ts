import type { TLExtendedSchema } from '@monstrs/mtproto-tl-types'

import { Project }               from 'ts-morph'
import { ScriptTarget }          from 'ts-morph'
import { ModuleKind }            from 'ts-morph'
import { ModuleResolutionKind }  from 'ts-morph'

import { TLIndexGenerator }      from './tl-index.generator.js'
import { TLObjectGenerator }     from './tl-object.generator.js'
import { TLRegistryGenerator }   from './tl-registry.generator.js'

export interface TLSchemaGeneratorOptions {
  outDir: string
}

export class TLSchemaGenerator {
  private project: Project

  private registryGenerator: TLRegistryGenerator

  private objectGenerator: TLObjectGenerator

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

    this.registryGenerator = new TLRegistryGenerator(this.project)
    this.objectGenerator = new TLObjectGenerator(this.project)
    this.indexGenerator = new TLIndexGenerator(this.project)
  }

  async generate(schema: TLExtendedSchema): Promise<void> {
    schema.constructors.forEach((ctr) => {
      this.objectGenerator.generate(ctr)
    })

    schema.methods.forEach((method) => {
      this.objectGenerator.generate(method)
    })
  }

  async write(): Promise<void> {
    this.registryGenerator.generate()
    this.indexGenerator.generate()

    await this.project.save()
  }
}
