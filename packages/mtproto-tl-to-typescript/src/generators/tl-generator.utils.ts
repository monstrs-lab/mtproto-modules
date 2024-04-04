import type { TLExtendedSchemaParam } from '@monstrs/mtproto-tl-types'

const CORE_TYPES = new Set([
  'int',
  'long',
  'int128',
  'int256',
  'double',
  'bytes',
  'string',
  'Bool',
  'true',
])

export const isCoreType = (t: string): boolean => CORE_TYPES.has(t)

export const resolveNativeTypeForParam = (param: TLExtendedSchemaParam): string | undefined => {
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
