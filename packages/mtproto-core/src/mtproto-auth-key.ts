import { createHash }         from 'node:crypto'

import { fromBufferToBigInt } from '@monstrs/buffer-utils'

export class MTProtoAuthKey {
  #key: Buffer

  #hash: Buffer

  #id: bigint

  #auxHash: bigint

  constructor(value: Buffer) {
    this.#key = value
    this.#hash = createHash('sha1').update(value).digest()
    this.#auxHash = fromBufferToBigInt(this.#hash.subarray(0, 8), true, false)
    this.#id = this.#hash.readBigUInt64LE(12)
  }

  get key(): Buffer {
    return this.#key
  }

  get hash(): Buffer {
    return this.#hash
  }

  get id(): bigint {
    return this.#id
  }

  get auxHash(): bigint {
    return this.#auxHash
  }
}
