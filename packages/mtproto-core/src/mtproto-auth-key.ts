import { createHash } from 'node:crypto'

export class MTProtoAuthKey {
  #key: Buffer

  #hash: Buffer

  #id: bigint

  #auxHash: bigint

  constructor(value: Buffer) {
    this.#key = value
    this.#hash = createHash('sha1').update(value).digest()
    this.#auxHash = this.#hash.readBigUInt64LE(0)
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
