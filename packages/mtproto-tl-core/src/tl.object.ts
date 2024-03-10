/* eslint-disable @typescript-eslint/no-useless-constructor */

import type { BytesIO }    from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import type { TLRegistry } from './tl.registry.js'

export abstract class TLObject {
  // @ts-expect-error
  constructorId: number

  // @ts-expect-error
  constructor(params: unknown) {} // eslint-disable-line @typescript-eslint/no-empty-function

  static async read(data: BytesIO, registry: TLRegistry): Promise<TLObject> {
    // @ts-expect-error
    const _data = data // eslint-disable-line
    // @ts-expect-error
    const _registry = registry // eslint-disable-line

    throw new Error('Must be implemented')
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  abstract write(value: any): Buffer
}
