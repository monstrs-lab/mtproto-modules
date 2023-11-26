import { createHash }         from 'node:crypto'
import { randomBytes }        from 'node:crypto'

import { fromBufferToBigInt } from '@monstrs/buffer-utils'

export enum MTProtoAuthKeyType {
  UNKNOWN = -1,
  PERM = 0,
  TEMP = 1,
  MEDIA_TEMP = 2,
}

export class MTProtoAuthKey {
  #type: MTProtoAuthKeyType

  #key: Buffer

  #hash: Buffer

  #auxHash: bigint

  #authKeyId: bigint

  #permAuthKeyId: bigint

  #tempAuthKeyId: bigint

  #mediaTempAuthKeyId: bigint

  constructor(value?: Buffer, type: MTProtoAuthKeyType = MTProtoAuthKeyType.UNKNOWN) {
    if (value) {
      this.#key = value
      this.#hash = createHash('sha1').update(value).digest()
      this.#auxHash = fromBufferToBigInt(this.#hash.subarray(0, 8), true, false)
      this.#authKeyId = this.#hash.readBigInt64BE(12)
    } else {
      this.#key = Buffer.alloc(0)
      this.#hash = Buffer.alloc(0)
      this.#authKeyId = 0n
      this.#auxHash = 0n
    }

    this.#type = type
    this.#permAuthKeyId = type === MTProtoAuthKeyType.PERM ? this.#authKeyId : 0n
    this.#tempAuthKeyId = type === MTProtoAuthKeyType.TEMP ? this.#authKeyId : 0n
    this.#mediaTempAuthKeyId = type === MTProtoAuthKeyType.MEDIA_TEMP ? this.#authKeyId : 0n
  }

  get type(): MTProtoAuthKeyType {
    return this.#type
  }

  get key(): Buffer {
    return this.#key
  }

  get hash(): Buffer {
    return this.#hash
  }

  get auxHash(): bigint {
    return this.#auxHash
  }

  get authKeyId(): bigint {
    return this.#authKeyId
  }

  get permAuthKeyId(): bigint {
    return this.#permAuthKeyId
  }

  get tempAuthKeyId(): bigint {
    return this.#tempAuthKeyId
  }

  get mediaTempAuthKeyId(): bigint {
    return this.#mediaTempAuthKeyId
  }

  static create(type?: MTProtoAuthKeyType): MTProtoAuthKey {
    return new MTProtoAuthKey(randomBytes(256), type)
  }
}
