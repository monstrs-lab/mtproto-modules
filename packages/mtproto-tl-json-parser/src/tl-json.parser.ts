import type { TLSchema }                    from '@monstrs/mtproto-tl-types'
import type { TLSchemaParam }               from '@monstrs/mtproto-tl-types'
import type { TLSchemaConstructor }         from '@monstrs/mtproto-tl-types'
import type { TLSchemaMethod }              from '@monstrs/mtproto-tl-types'
import type { TLExtendedSchemaParam }       from '@monstrs/mtproto-tl-types'
import type { TLExtendedSchemaConstructor } from '@monstrs/mtproto-tl-types'
import type { TLExtendedSchema }            from '@monstrs/mtproto-tl-types'
import type { TLExtendedSchemaMethod }      from '@monstrs/mtproto-tl-types'

export class TLJsonParser {
  parseParam(param: TLSchemaParam): TLExtendedSchemaParam {
    const config: TLExtendedSchemaParam = {
      ...param,
      isVector: false,
      isFlag: false,
      skipConstructorId: false,
      flagGroup: 0,
      flagIndex: -1,
      flagIndicator: true,
      type: param.type,
      useVectorId: false,
    }

    if (param.type !== '#') {
      config.flagIndicator = false
      config.type = param.type.replace(/^!+/, '')

      const flagMatch = config.type.match(/flags(\d*)\.(\d+)\?([\w<>.]+)/)

      if (flagMatch) {
        config.isFlag = true
        config.flagGroup = Number(flagMatch[1] || 1)
        config.flagIndex = Number(flagMatch[2])
        ;[, , , config.type] = flagMatch
      }

      const vectorMatch = config.type.match(/[Vv]ector<([\w\d.]+)>/)

      if (vectorMatch) {
        config.isVector = true
        config.useVectorId = config.type.startsWith('V')
        ;[, config.type] = vectorMatch
      }

      if (/^[a-z]$/.test(config.type.split('.').pop()!.charAt(0))) {
        config.skipConstructorId = true
      }
    }

    return config
  }

  parseConstructor(ctr: TLSchemaConstructor): TLExtendedSchemaConstructor {
    const [namespace, name] = ctr.predicate.includes('.')
      ? ctr.predicate.split('.')
      : [undefined, ctr.predicate]

    return {
      ...ctr,
      name,
      namespace,
      params: ctr.params.map((param) => this.parseParam(param)),
    }
  }

  parseMethod(method: TLSchemaMethod): TLExtendedSchemaMethod {
    const [namespace, name] = method.method.includes('.')
      ? method.method.split('.')
      : [undefined, method.method]

    return {
      ...method,
      name,
      namespace,
      params: method.params.map((param) => this.parseParam(param)),
    }
  }

  parse(schema: TLSchema): TLExtendedSchema {
    return {
      constructors: schema.constructors.map((ctr) => this.parseConstructor(ctr)),
      methods: schema.methods.map((method) => this.parseMethod(method)),
    }
  }
}
