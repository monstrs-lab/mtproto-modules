import type { MTProtoAuthKey } from './mtproto-auth-key.js'

import { createHash }          from 'node:crypto'
import { randomBytes }         from 'node:crypto'

import { fromBigIntToBuffer }  from '@monstrs/buffer-utils'

import { IGE }                 from '@monstrs/mtproto-crypto'

import { MTProtoKeyPair }      from './mtproto-key-pair.js'
import { MTProtoKeyPairType }  from './mtproto-key-pair.js'

const mod = (n: number, m: number): number => ((n % m) + m) % m

export class MTProtoEncryptedRawMessage {
  #authKey: MTProtoAuthKey

  #messageData: Buffer

  constructor(authKey: MTProtoAuthKey, messageData: Buffer) {
    this.#authKey = authKey
    this.#messageData = messageData
  }

  static async decode(
    authKey: MTProtoAuthKey,
    payload: Buffer
  ): Promise<MTProtoEncryptedRawMessage> {
    const keyPair = MTProtoKeyPair.fromAuthAndMsgKey(
      authKey,
      payload.subarray(8, 24),
      MTProtoKeyPairType.CLIENT
    )

    const messageData = new IGE(keyPair.key, keyPair.iv).decrypt(
      payload.subarray(24, payload.length)
    )

    return new MTProtoEncryptedRawMessage(authKey, messageData)
  }

  encode(): Buffer {
    const padding = Buffer.from(randomBytes(mod(-(this.#messageData.length + 12), 16) + 12))

    const messageKeyLarge = createHash('sha256')
      .update(Buffer.concat([this.#authKey.key.subarray(88, 88 + 32), this.#messageData, padding]))
      .digest()
    const messageKey = messageKeyLarge.subarray(8, 24)

    const keyPair = MTProtoKeyPair.fromAuthAndMsgKey(
      this.#authKey,
      messageKey,
      MTProtoKeyPairType.SERVER
    )

    return Buffer.concat([
      fromBigIntToBuffer(this.#authKey.id, 8),
      messageKey,
      new IGE(keyPair.key, keyPair.iv).encrypt(Buffer.concat([this.#messageData, padding])),
    ])
  }

  getAuthKey(): MTProtoAuthKey {
    return this.#authKey
  }

  getMessageData(): Buffer {
    return this.#messageData
  }
}
