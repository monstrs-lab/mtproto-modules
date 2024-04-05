/* eslint-disable @typescript-eslint/no-useless-constructor */

import type { BytesIO }    from '@tgsnake/core/lib/src/raw/core/BytesIO.js'
import type { Buffer }     from 'node:buffer'

import type { TLRegistry } from './tl.registry.js'

export abstract class TLObject {
  constructorId!: number

  type!: string

  // @ts-expect-error
  constructor(params: unknown) {} // eslint-disable-line @typescript-eslint/no-empty-function

  static async read(data: BytesIO, registry: TLRegistry): Promise<InstanceType<typeof TLObject>> {
    // @ts-expect-error
    const _data = data // eslint-disable-line
    // @ts-expect-error
    const _registry = registry // eslint-disable-line

    throw new Error('Must be implemented')
  }

  abstract write(): Buffer
}
