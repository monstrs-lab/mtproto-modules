import { createHash }         from 'node:crypto'

import { fromBufferToBigInt } from '@monstrs/buffer-utils'

export class MTProtoAuthKey {
  #key: Buffer

  #hash: Buffer

  #id: bigint

  #auxHash: bigint

  constructor(value?: Buffer) {
    if (value) {
      this.#key = value
      this.#hash = createHash('sha1').update(value).digest()
      this.#auxHash = fromBufferToBigInt(this.#hash.subarray(0, 8), true, false)
      this.#id = this.#hash.readBigUInt64BE(12)
    } else {
      this.#key = Buffer.alloc(0)
      this.#hash = Buffer.alloc(0)
      this.#id = 0n
      this.#auxHash = 0n
    }
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
