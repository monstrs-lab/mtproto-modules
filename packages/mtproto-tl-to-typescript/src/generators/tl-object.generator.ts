import type { TLExtendedSchemaConstructor } from '@monstrs/mtproto-tl-types'
import type { TLExtendedSchemaMethod }      from '@monstrs/mtproto-tl-types'
import type { TLExtendedSchemaParam }       from '@monstrs/mtproto-tl-types'
import type { InterfaceDeclaration }        from 'ts-morph'
import type { Project }                     from 'ts-morph'
import type { SourceFile }                  from 'ts-morph'

import { join }                             from 'node:path'

import camelcase                            from 'camelcase'
import decamelize                           from 'decamelize'

import { isCoreType }                       from './tl-generator.utils.js'
import { resolveNativeTypeForParam }        from './tl-generator.utils.js'

export class TLObjectGenerator {
  constructor(private readonly project: Project) {}

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
        isTypeOnly: true,
      })
    }

    return paramType
  }

  resolveTypeForParam(sourceFile: SourceFile, param: TLExtendedSchemaParam): string {
    const paramType = resolveNativeTypeForParam(param)

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

  getParamName(paramName: string): string {
    switch (paramName) {
      case 'default':
        return '_default'
      case 'delete':
        return '_delete'
      case 'static':
        return '_static'
      case 'public':
        return '_public'
      case 'private':
        return '_private'
      default:
        return paramName
    }
  }

  importRegistry(sourceFile: SourceFile): void {
    if (
      !sourceFile
        .getImportDeclarations()
        .find(
          (importDeclaration) =>
            importDeclaration.getModuleSpecifierValue() === './registry.js' &&
            importDeclaration
              .getNamedImports()
              .find((importSpecifier) => importSpecifier.getText() === 'registry')
        )
    ) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: './registry.js',
        namedImports: ['registry'],
      })
    }
  }

  generate(schema: TLExtendedSchemaConstructor | TLExtendedSchemaMethod): void {
    const sourceFile = this.project.createSourceFile(
      join(
        this.project.compilerOptions.get().outDir!,
        schema.namespace
          ? `${schema.namespace}.${decamelize(schema.name, {
              separator: '-',
              preserveConsecutiveUppercase: false,
            })}.ts`
          : `${decamelize(schema.name, { separator: '-', preserveConsecutiveUppercase: false })}.ts`
      )
        .toLowerCase()
        .replaceAll('_', '-'),
      '',
      { overwrite: true }
    )

    sourceFile.addImportDeclaration({
      moduleSpecifier: '@monstrs/mtproto-tl-core',
      namedImports: ['TLObject'],
    })

    sourceFile.addImportDeclaration({
      moduleSpecifier: '@monstrs/mtproto-tl-primitives',
      namespaceImport: 'Primitive',
    })

    let paramsInterfaceDeclaration: InterfaceDeclaration | undefined

    if (Object.keys(schema.params).length > 0) {
      paramsInterfaceDeclaration = sourceFile.addInterface({
        isExported: true,
        name: `${camelcase(schema.name, {
          pascalCase: true,
          preserveConsecutiveUppercase: true,
        })}Params`,
      })

      schema.params.forEach((param) => {
        if (param.name !== 'flags') {
          paramsInterfaceDeclaration!.addProperty({
            hasQuestionToken: param.isFlag,
            type: this.getTypeForParam(sourceFile, param),
            name: this.getParamName(
              camelcase(param.name, {
                pascalCase: false,
                preserveConsecutiveUppercase: true,
              })
            ),
          })
        }
      })
    }

    const classDeclaration = sourceFile.addClass({
      isExported: true,
      name: camelcase(schema.name, {
        pascalCase: true,
        preserveConsecutiveUppercase: true,
      }),
      extends: `TLObject`,
      properties: [
        {
          name: 'constructorId',
          type: 'number',
          hasOverrideKeyword: true,
          initializer: `0x${Number(schema.id).toString(16).padStart(8, '0')}`,
        },
      ],
    })

    schema.params.forEach((param) => {
      if (param.name !== 'flags') {
        classDeclaration.addProperty({
          isStatic: false,
          hasOverrideKeyword: false,
          hasExclamationToken: !param.isFlag,
          hasQuestionToken: param.isFlag,
          type: this.getTypeForParam(sourceFile, param),
          name: this.getParamName(
            camelcase(param.name, {
              pascalCase: false,
              preserveConsecutiveUppercase: true,
            })
          ),
          leadingTrivia: (writer) => writer.newLine(),
        })
      }
    })

    if (paramsInterfaceDeclaration) {
      const ctor = classDeclaration.addConstructor({
        parameters: [
          {
            name: 'params',
            type: paramsInterfaceDeclaration.getName(),
          },
        ],
      })

      ctor.setBodyText((writer) => {
        writer.writeLine('super(params)')

        schema.params.forEach((param) => {
          if (param.name !== 'flags') {
            const name = this.getParamName(
              camelcase(param.name, {
                pascalCase: false,
                preserveConsecutiveUppercase: true,
              })
            )

            writer.writeLine(`this.${name} = params.${name}`)
          }
        })
      })
    }

    const readMethodDeclaration = classDeclaration.addMethod({
      isStatic: true,
      isAsync: true,
      hasOverrideKeyword: true,
      name: 'read',
      parameters:
        schema.params.length > 0
          ? [
              {
                name: 'b',
                type: 'Primitive.BytesIO',
              },
            ]
          : [],
      returnType: `Promise<${camelcase(schema.name, {
        pascalCase: true,
        preserveConsecutiveUppercase: true,
      })}>`,
    })

    readMethodDeclaration.setBodyText((writer) => {
      schema.params.forEach((param) => {
        const name = this.getParamName(
          camelcase(param.name, {
            pascalCase: false,
            preserveConsecutiveUppercase: true,
          })
        )

        const type = camelcase(param.type, {
          pascalCase: true,
        })

        if (param.name === 'flags') {
          writer.writeLine('let flags = await Primitive.Int.read(b)')
        } else if (param.isVector) {
          const vectorType = isCoreType(param.type) ? `Primitive.${type}` : type

          if (!isCoreType(param.type)) {
            this.importRegistry(sourceFile)
          }

          if (param.isFlag) {
            writer.writeLine('await Primitive.Int.read(b)')

            if (isCoreType(param.type)) {
              writer.writeLine(
                `const ${name} = flags & (1 << ${param.flagIndex}) ? await Primitive.Vector.read(b, ${vectorType}) : [] // eslint-disable-line no-bitwise`
              )
            } else {
              writer.writeLine(
                `const ${name} = flags & (1 << ${param.flagIndex}) ? await Primitive.Vector.read(b, undefined, registry) : [] // eslint-disable-line no-bitwise`
              )
            }
          } else {
            writer.writeLine('await Primitive.Int.read(b)')

            if (isCoreType(param.type)) {
              writer.writeLine(`const ${name} = await Primitive.Vector.read(b, ${vectorType})`)
            } else {
              writer.writeLine(
                `const ${name} = await Primitive.Vector.read(b, undefined, registry)`
              )
            }
          }
        } else if (param.type === 'true') {
          writer.writeLine(
            `const ${name} = flags & (1 << ${param.flagIndex}) ? true : false // eslint-disable-line no-bitwise, no-unneeded-ternary`
          )
        } else if (isCoreType(param.type)) {
          if (param.isFlag) {
            writer.writeLine(
              `const ${name} = flags & (1 << ${param.flagIndex}) ? await Primitive.${type}.read(b) : undefined // eslint-disable-line no-bitwise`
            )
          } else {
            writer.writeLine(`const ${name} = await Primitive.${type}.read(b)`)
          }
        } else {
          this.importRegistry(sourceFile)

          if (param.isFlag) {
            writer.writeLine(
              `const ${name} = flags & (1 << ${param.flagIndex}) ? await registry.read<${param.type}>(b) : undefined // eslint-disable-line no-bitwise`
            )
          } else {
            writer.writeLine(`const ${name} = await registry.read<${param.type}>(b)`)
          }
        }
      })

      const names = schema.params
        .map((param) =>
          this.getParamName(
            camelcase(param.name, {
              pascalCase: false,
              preserveConsecutiveUppercase: true,
            })
          ))
        .filter((name) => name !== 'flags')

      writer.writeLine(
        `return new ${camelcase(schema.name, {
          pascalCase: true,
          preserveConsecutiveUppercase: true,
        })}({ ${names.join(', ')} })`
      )
    })

    const writeDeclaration = classDeclaration.addMethod({
      name: 'write',
      returnType: 'Buffer',
    })

    writeDeclaration.setBodyText((writer) => {
      writer.writeLine('const b: Primitive.BytesIO = new Primitive.BytesIO()')
      writer.writeLine('b.write(Primitive.Int.write(this.constructorId, false))')

      if (schema.params.some((param) => param.isFlag)) {
        writer.writeLine('const flags = 0')

        schema.params.forEach((param) => {
          const name = this.getParamName(
            camelcase(param.name, {
              pascalCase: false,
              preserveConsecutiveUppercase: true,
            })
          )

          if (param.isFlag) {
            if (param.isVector) {
              writer.writeLine(
                `flags |= this.${name} ? 1 << ${param.flagIndex} : 0 // eslint-disable-line no-bitwise`
              )
            } else if (param.type === 'true') {
              writer.writeLine(
                `flags |= this.${name} ? 1 << ${param.flagIndex} : 0 // eslint-disable-line no-bitwise`
              )
            } else if (isCoreType(param.type)) {
              writer.writeLine(
                `flags |= this.${name} !== undefined ? 1 << ${param.flagIndex} : 0 // eslint-disable-line no-bitwise`
              )
            } else {
              writer.writeLine(
                `flags |= this.${name} !== undefined ? 1 << ${param.flagIndex} : 0 // eslint-disable-line no-bitwise`
              )
            }
          }
        })

        writer.writeLine('b.write(Primitive.Int.write(flags))')
      }

      schema.params.forEach((param) => {
        const name = this.getParamName(
          camelcase(param.name, {
            pascalCase: false,
            preserveConsecutiveUppercase: true,
          })
        )

        const type = camelcase(param.type, {
          pascalCase: true,
        })

        if (param.type !== 'true' && param.name !== 'flags') {
          if (param.isVector) {
            if (isCoreType(param.type)) {
              writer.write(`if (this.${name})`).block(() => {
                writer.write(`b.write(Primitive.Vector.write(this.${name}, Primitive.${type}))`)
              })
            } else {
              writer.write(`if (this.${name})`).block(() => {
                writer.write(`b.write(Primitive.Vector.write(this.${name}))`)
              })
            }
          } else if (isCoreType(param.type)) {
            writer.write(`if (this.${name} !== undefined)`).block(() => {
              writer.write(`b.write(Primitive.${type}.write(this.${name}))`)
            })
          } else {
            writer.write(`if (this.${name} !== undefined)`).block(() => {
              writer.write(`b.write(this.${name}.write())`)
            })
          }
        }
      })

      writer.writeLine('return b.buffer')
    })
  }
}
