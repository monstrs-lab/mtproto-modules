import type { Project } from 'ts-morph'

import { basename }     from 'node:path'
import { join }         from 'node:path'

export class TLIndexGenerator {
  constructor(private readonly project: Project) {}

  generate(): void {
    const sourceFiles = this.project.getSourceFiles()

    const sourceFile = this.project.createSourceFile(
      join(this.project.compilerOptions.get().outDir!, 'index.ts'),
      '',
      {
        overwrite: true,
      }
    )

    sourceFiles.forEach((sf) => {
      sourceFile
        .addExportDeclaration({
          moduleSpecifier: `./${basename(sf.getFilePath().replace('.ts', '.js'))}`,
        })
        .toNamespaceExport()
    })
  }
}
