import type { BytesIO }  from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import type { TLObject } from './tl.object.js'

export class TLRegistry {
  constructor(private readonly mapping: Map<number, () => Promise<typeof TLObject>>) {}

  async read<T extends TLObject>(data: BytesIO): Promise<T> {
    const id = data.readUInt32LE(4)

    const clazz = await this.mapping.get(id)

    if (!clazz) {
      throw new Error(`Registry mapping for ${id} not found`)
    }

    return (await clazz()).read(data, this) as Promise<T>
  }
}
