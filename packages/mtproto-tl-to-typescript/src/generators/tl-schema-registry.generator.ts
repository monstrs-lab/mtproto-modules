import type { Project }            from 'ts-morph'

import { basename }                from 'node:path'
import { join }                    from 'node:path'

import { VariableDeclarationKind } from 'ts-morph'

export class TLSchemaRegistryGenerator {
  constructor(
    private readonly project: Project,
    private readonly outDir: string
  ) {}

  generate(): void {
    const sourceFile = this.project.createSourceFile(join(this.outDir, 'schema.registry.ts'), '', {
      overwrite: true,
    })

    sourceFile.addImportDeclaration({
      moduleSpecifier: '@monstrs/mtproto-tl-core',
      namedImports: ['TLObject'],
    })

    const classMap: Map<string, string> = new Map()

    this.project.getSourceFiles().forEach((sf) => {
      sf.getClasses().forEach((clazz) => {
        const idConstructor = clazz
          .getProperties()
          .find((property) => property.getName() === 'CONSTRUCTOR_ID')

        if (idConstructor) {
          classMap.set(idConstructor.getInitializer()!.getText()!, clazz.getName()!)

          sourceFile.addImportDeclaration({
            moduleSpecifier: `./${basename(sf.getFilePath().replace('.ts', '.js'))}`,
            namedImports: [clazz.getName()!],
          })
        }
      })
    })

    sourceFile.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: 'SchemaRegistry',
          initializer: `new Map<number, typeof TLObject<any>>([${Array.from(classMap.keys())
            .map((key) => `[${key}, ${classMap.get(key)}]`)
            .join(',')}])`,
        },
      ],
    })
  }
}
