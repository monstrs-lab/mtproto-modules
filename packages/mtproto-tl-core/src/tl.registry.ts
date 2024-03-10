import type { BytesIO }  from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import type { TLObject } from './tl.object.js'

export class TLRegistry {
  constructor(private readonly mapping: Map<number, typeof TLObject>) {}

  async read(data: BytesIO): Promise<any> {
    const id = data.readUInt32LE(4)

    const clazz = this.mapping.get(id)

    if (!clazz) {
      throw new Error(`Registry mapping for ${id} not found`)
    }

    return clazz.read(data, this)
  }
}
