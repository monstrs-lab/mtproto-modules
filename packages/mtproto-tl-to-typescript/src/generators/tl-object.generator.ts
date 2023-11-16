import type { TLExtendedSchemaParam } from '@monstrs/mtproto-tl-types'
import type { SourceFile }            from 'ts-morph'

import camelcase                      from 'camelcase'
import decamelize                     from 'decamelize'

export class TLObjectGenerator {
  resolvePlainTypeForParam(param: TLExtendedSchemaParam): string | undefined {
    switch (param.type) {
      case 'int':
        return 'number'
      case 'long':
        return 'bigint'
      case 'int128':
        return 'bigint'
      case 'int256':
        return 'bigint'
      case 'double':
        return 'number'
      case 'string':
        return 'string'
      case 'Bool':
        return 'boolean'
      case 'true':
        return 'boolean'
      case 'bytes':
        return 'Buffer'
      case 'date':
        return 'Date'
      default:
        return undefined
    }
  }

  resolveCustomTypeForParam(sourceFile: SourceFile, param: TLExtendedSchemaParam): string {
    const moduleSpecifier = `./${decamelize(param.type.replaceAll('_', '-'), {
      separator: '-',
      preserveConsecutiveUppercase: false,
    })}.js`

    const paramType = camelcase(param.type, {
      pascalCase: true,
      preserveConsecutiveUppercase: true,
    })

    if (
      !sourceFile
        .getImportDeclarations()
        .find(
          (importDeclaration) =>
            importDeclaration.getModuleSpecifierValue() === moduleSpecifier &&
            importDeclaration
              .getNamedImports()
              .find((importSpecifier) => importSpecifier.getText() === paramType)
        )
    ) {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: [paramType],
      })
    }

    return paramType
  }

  resolveTypeForParam(sourceFile: SourceFile, param: TLExtendedSchemaParam): string {
    if (!param.skipConstructorId) {
      return 'any'
    }

    const paramType = this.resolvePlainTypeForParam(param)

    if (paramType) {
      return paramType
    }

    return this.resolveCustomTypeForParam(sourceFile, param)
  }

  getTypeForParam(sourceFile: SourceFile, param: TLExtendedSchemaParam): string {
    const paramType = this.resolveTypeForParam(sourceFile, param)

    if (param.isVector) {
      return `Array<${paramType}>`
    }

    return paramType
  }
}
