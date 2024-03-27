import type { Project }            from 'ts-morph'

import { basename }                from 'node:path'
import { join }                    from 'node:path'

import { VariableDeclarationKind } from 'ts-morph'

export class TLRegistryGenerator {
  constructor(private readonly project: Project) {}

  generate(): void {
    const sourceFile = this.project.createSourceFile(
      join(this.project.compilerOptions.get().outDir!, 'registry.ts'),
      '',
      {
        overwrite: true,
      }
    )

    sourceFile.addImportDeclaration({
      moduleSpecifier: '@monstrs/mtproto-tl-core',
      namedImports: ['TLObject'],
      isTypeOnly: true,
    })

    sourceFile.addImportDeclaration({
      moduleSpecifier: '@monstrs/mtproto-tl-core',
      namedImports: ['TLRegistry'],
    })

    const classMap: Map<string, { name: string; path: string }> = new Map()

    this.project.getSourceFiles().forEach((sf) => {
      sf.getClasses().forEach((clazz) => {
        const idConstructor = clazz
          .getProperties()
          .find((property) => property.getName() === 'constructorId')

        if (idConstructor) {
          classMap.set(idConstructor.getInitializer()!.getText(), {
            name: clazz.getName()!,
            path: `./${basename(sf.getFilePath().replace('.ts', '.js'))}`,
          })
        }
      })
    })

    sourceFile.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: 'registry',
          initializer: `new TLRegistry(new Map<number, typeof TLObject>([${Array.from(
            classMap.keys()
          )
            .map(
              (key) =>
                `[${key}, async () => (await import('${classMap.get(key)!.path}')).${classMap.get(key)!.name}]`
            )
            .join(',')}]))`,
        },
      ],
    })
  }
}
