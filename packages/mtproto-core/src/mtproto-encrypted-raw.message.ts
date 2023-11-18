import type { MTProtoAuthKey }           from './mtproto-auth-key.js'
import type { MTProtoRawMessageContext } from './mtproto-raw.message.js'

import { IGE }                           from '@monstrs/mtproto-crypto'

import { InvalidAuthKeyIdError }         from './errors/index.js'
import { MTProtoKeyPair }                from './mtproto-key-pair.js'
import { MTProtoKeyPairType }            from './mtproto-key-pair.js'

export class MTProtoEncryptedRawMessage {
  #authKey: MTProtoAuthKey

  #messageData: Buffer

  constructor(authKey: MTProtoAuthKey, messageData: Buffer) {
    this.#authKey = authKey
    this.#messageData = messageData
  }

  static async decode(
    payload: Buffer,
    context: MTProtoRawMessageContext
  ): Promise<MTProtoEncryptedRawMessage> {
    const authKeyId = payload.readBigUint64LE(0)

    const authKey = await context.authKeyManager.getAuthKey(authKeyId)

    if (!authKey) {
      throw new InvalidAuthKeyIdError(authKeyId)
    }

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
    throw new Error('TODO')
  }

  getAuthKey(): MTProtoAuthKey {
    return this.#authKey
  }

  getMessageData(): Buffer {
    return this.#messageData
  }
}
