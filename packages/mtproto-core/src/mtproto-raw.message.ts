import type { MTProtoAuthKeyManager }   from './mtproto-auth-key.manager.js'

import { InvalidAuthKeyIdError }        from './errors/index.js'
import { MTProtoEncryptedRawMessage }   from './mtproto-encrypted-raw.message.js'
import { MTProtoUnencryptedRawMessage } from './mtproto-unencrypted-raw.message.js'

export interface MTProtoRawMessageContext {
  authKeyManager: MTProtoAuthKeyManager
}

export class MTProtoRawMessage {
  #authKeyId: bigint

  #message: MTProtoEncryptedRawMessage | MTProtoUnencryptedRawMessage

  constructor(
    authKeyId: bigint,
    message: MTProtoEncryptedRawMessage | MTProtoUnencryptedRawMessage
  ) {
    this.#authKeyId = authKeyId
    this.#message = message
  }

  static async decode(
    payload: Buffer,
    context: MTProtoRawMessageContext
  ): Promise<MTProtoRawMessage> {
    const authKeyId = payload.readBigUint64LE(0)

    if (authKeyId === BigInt(0)) {
      return new MTProtoRawMessage(authKeyId, await MTProtoUnencryptedRawMessage.decode(payload))
    }

    const authKey = await context.authKeyManager.getAuthKey(authKeyId)

    if (!authKey) {
      throw new InvalidAuthKeyIdError(authKeyId)
    }

    return new MTProtoRawMessage(
      authKeyId,
      await MTProtoEncryptedRawMessage.decode(payload, context)
    )
  }

  encode(): Buffer {
    return this.#message.encode()
  }

  getAuthKeyId(): bigint {
    return this.#authKeyId
  }

  getMessage(): MTProtoEncryptedRawMessage | MTProtoUnencryptedRawMessage {
    return this.#message
  }
}
