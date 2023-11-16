/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */

import type { BinaryReader }              from '@monstrs/mtproto-extensions'
import type { TLExtendedSchemaParam }     from '@monstrs/mtproto-tl-types'

import { fromDateToBuffer }               from '@monstrs/buffer-utils'
import { fromBigIntToSignedLittleBuffer } from '@monstrs/buffer-utils'
import camelcase                          from 'camelcase'

import { serializeBytes }                 from './tl.utils.js'

export abstract class TLObject<TLObjectValues extends Record<string, any>> {
  static CONSTRUCTOR_ID: number

  static PARAMS: Array<TLExtendedSchemaParam> = []

  #values: TLObjectValues

  constructor(values: TLObjectValues) {
    this.#values = values
  }

  static readParamFromReader<P extends Record<string, any>>(
    reader: BinaryReader<TLObject<P>>,
    param: TLExtendedSchemaParam
  ): unknown {
    if (param.isVector) {
      if (param.useVectorId) {
        reader.readInt()
      }

      const temp: Array<unknown> = []
      const len = reader.readInt()

      // eslint-disable-next-line no-param-reassign
      param.isVector = false

      for (let i = 0; i < len; i++) {
        // TODO: rest param with isVector false
        temp.push(TLObject.readParamFromReader(reader, param))
      }

      // eslint-disable-next-line no-param-reassign
      param.isVector = true

      return temp
    }

    if (param.flagIndicator) {
      return reader.readInt()
    }

    switch (param.type) {
      case 'int':
        return reader.readInt()
      case 'long':
        return reader.readLong()
      case 'int128':
        return reader.readLargeInt(128)
      case 'int256':
        return reader.readLargeInt(256)
      case 'double':
        return reader.readDouble()
      case 'string':
        return reader.readString()
      case 'Bool':
        return reader.readBool()
      case 'true':
        return true
      case 'bytes':
        return reader.readBytes()
      case 'date':
        return reader.readDate()
      default:
        if (!param.skipConstructorId) {
          return reader.readObject()
        }

        throw new Error(`Unknown type ${param.name}`)
    }
  }

  static fromReader<P extends Record<string, any>>(reader: BinaryReader<TLObject<P>>): TLObject<P> {
    const values: Record<string, unknown> = {}

    for (const param of this.PARAMS) {
      const name = camelcase(param.name, {
        pascalCase: false,
        preserveConsecutiveUppercase: true,
      })

      if (param.isFlag) {
        const flagGroupSuffix = param.flagGroup > 1 ? param.flagGroup : ''
        const flagGroup: any = this.PARAMS.find((flag) => flag.name === `flags${flagGroupSuffix}`)
        const flagValue = flagGroup & (1 << param.flagIndex)

        if (param.type === 'true') {
          values[name] = Boolean(flagValue)

          // eslint-disable-next-line no-continue
          continue
        }

        values[name] = flagValue ? TLObject.readParamFromReader(reader, param) : undefined
      } else {
        values[name] = TLObject.readParamFromReader(reader, param)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return new (this.prototype.constructor as any)(values) as TLObject<P>
  }

  fromReader(reader: BinaryReader<TLObject<TLObjectValues>>): TLObject<TLObjectValues> {
    return (this.constructor as typeof TLObject).fromReader(reader)
  }

  getParamValue<T>(paramName: string): T {
    const name = camelcase(paramName, {
      pascalCase: false,
      preserveConsecutiveUppercase: true,
    })

    return this.#values[name] as T
  }

  getParamValueBytes(paramValue: unknown, type: string): Buffer {
    switch (type) {
      case 'int': {
        const int = Buffer.alloc(4)

        int.writeInt32LE(paramValue as number, 0)

        return int
      }
      case 'long':
        return fromBigIntToSignedLittleBuffer(paramValue as bigint, 8)
      case 'int128':
        return fromBigIntToSignedLittleBuffer(paramValue as bigint, 16)
      case 'int256':
        return fromBigIntToSignedLittleBuffer(paramValue as bigint, 32)
      case 'double': {
        const double = Buffer.alloc(8)

        double.writeDoubleLE(paramValue as number, 0)

        return double
      }
      case 'string':
        return serializeBytes(paramValue as string)
      case 'Bool':
        return paramValue ? Buffer.from('b5757299', 'hex') : Buffer.from('379779bc', 'hex')
      case 'true':
        return Buffer.alloc(0)
      case 'bytes':
        return serializeBytes(paramValue as Buffer)
      case 'date':
        return fromDateToBuffer(paramValue as Date)
      default:
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return (paramValue as TLObject<TLObjectValues>).getBytes() as Buffer
    }
  }

  getBytes(): Buffer {
    const params: Array<TLExtendedSchemaParam> = (this.constructor as any).PARAMS
    const constructorId: number = (this.constructor as any).CONSTRUCTOR_ID

    const constructorIdBuffer = Buffer.alloc(4)

    constructorIdBuffer.writeInt32LE(constructorId, 0)

    const buffers: Array<Buffer> = [constructorIdBuffer]

    for (const param of params) {
      if (param.isFlag) {
        if (
          (this.getParamValue<boolean>(param.name) === false && param.type === 'true') ||
          this.getParamValue<boolean>(param.name) === undefined
        ) {
          // eslint-disable-next-line no-continue
          continue
        }
      }

      if (param.isVector) {
        if (param.useVectorId) {
          buffers.push(Buffer.from('15c4b51c', 'hex'))
        }

        const vectorLength = Buffer.alloc(4)

        vectorLength.writeInt32LE(this.getParamValue<Array<any>>(param.name).length, 0)

        buffers.push(
          vectorLength,
          Buffer.concat(
            this.getParamValue<Array<any>>(param.name).map((v: any) =>
              this.getParamValueBytes(v, param.type))
          )
        )
      } else if (param.flagIndicator) {
        if (!params.some((p) => p.isFlag)) {
          buffers.push(Buffer.alloc(4))
        } else {
          let flagCalculate = 0

          for (const flagParam of params) {
            if (flagParam.isFlag) {
              if (
                (this.getParamValue<boolean>(flagParam.name) === false &&
                  flagParam.type === 'true') ||
                this.getParamValue<boolean>(flagParam.name) === undefined
              ) {
                flagCalculate |= 0
              } else {
                flagCalculate |= 1 << flagParam.flagIndex
              }
            }
          }

          const flagBuffer = Buffer.alloc(4)

          flagBuffer.writeUInt32LE(flagCalculate, 0)

          buffers.push(flagBuffer)
        }
      } else {
        buffers.push(this.getParamValueBytes(this.getParamValue<any>(param.name), param.type))

        if (
          typeof this.getParamValue<TLObject<TLObjectValues>>(param.name)?.getBytes === 'function'
        ) {
          const boxed = param.type.charAt(param.type.indexOf('.') + 1)

          if (boxed !== boxed.toUpperCase()) {
            buffers.shift()
          }
        }
      }
    }

    return Buffer.concat(buffers)
  }
}
