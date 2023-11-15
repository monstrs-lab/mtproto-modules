import type { TLSchema }            from './schema.js'
import type { TLSchemaMethod }      from './schema.js'
import type { TLSchemaConstructor } from './schema.js'
import type { TLSchemaParam }       from './schema.js'

export interface TLExtendedSchemaParam extends TLSchemaParam {
  isVector: boolean
  useVectorId: boolean

  skipConstructorId: boolean

  isFlag: boolean
  flagGroup: number
  flagIndex: number
  flagIndicator: boolean
}

export interface TLExtendedSchemaConstructor extends TLSchemaConstructor {
  params: Array<TLExtendedSchemaParam>
  name: string
  namespace?: string
}

export interface TLExtendedSchemaMethod extends TLSchemaMethod {
  params: Array<TLExtendedSchemaParam>
  name: string
  namespace?: string
}

export interface TLExtendedSchema extends TLSchema {
  constructors: Array<TLExtendedSchemaConstructor>
  methods: Array<TLExtendedSchemaMethod>
}
