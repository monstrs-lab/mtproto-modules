import type { Project } from 'ts-morph'

import { basename }     from 'node:path'
import { join }         from 'node:path'

import decamelize       from 'decamelize'

export class TLTypesGenerator {
  constructor(private readonly project: Project) {}

  generate(): void {
    const types = new Map<string, Set<{ name: string; path: string }>>()

    this.project.getSourceFiles().forEach((sf) => {
      sf.getClasses().forEach((clazz) => {
        const t = clazz.getProperties().find((property) => property.getName() === 'type')

        if (t) {
          const typeName = t.getInitializer()!.getText()

          if (!types.has(typeName)) {
            types.set(typeName, new Set())
          }

          types.get(typeName)?.add({
            name: clazz.getName()!,
            path: `./${basename(sf.getFilePath().replace('.ts', '.js'))}`,
          })
        }
      })
    })

    types.forEach((params, name) => {
      const sourceFile = this.project.createSourceFile(
        join(
          this.project.compilerOptions.get().outDir!,
          `${decamelize(name, { separator: '-', preserveConsecutiveUppercase: false })}.ts`
        )
          .toLowerCase()
          .replaceAll('_', '-'),
        '',
        { overwrite: true }
      )

      params.forEach((param) => {
        sourceFile.addImportDeclaration({
          moduleSpecifier: param.path,
          namedImports: [param.name],
        })
      })

      sourceFile.addTypeAlias({
        isExported: true,
        type: Array.from(params)
          .map((param) => param.name)
          .join(' | '),
        name,
      })
    })
  }
}
