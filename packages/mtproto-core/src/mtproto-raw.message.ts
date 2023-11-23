import type { MTProtoAuthKeyManager }   from './mtproto-auth-key.manager.js'

import { InvalidAuthKeyIdError }        from './errors/index.js'
import { MTProtoAuthKey }               from './mtproto-auth-key.js'
import { MTProtoEncryptedRawMessage }   from './mtproto-encrypted-raw.message.js'
import { MTProtoUnencryptedRawMessage } from './mtproto-unencrypted-raw.message.js'

export interface MTProtoRawMessageContext {
  authKeyManager: MTProtoAuthKeyManager
}

export class MTProtoRawMessage {
  #message: MTProtoEncryptedRawMessage | MTProtoUnencryptedRawMessage

  constructor(message: MTProtoEncryptedRawMessage | MTProtoUnencryptedRawMessage) {
    this.#message = message
  }

  static async decode(
    payload: Buffer,
    context: MTProtoRawMessageContext
  ): Promise<MTProtoRawMessage> {
    const authKeyId = payload.readBigUInt64BE(0)

    if (authKeyId === 0n) {
      return new MTProtoRawMessage(
        await MTProtoUnencryptedRawMessage.decode(new MTProtoAuthKey(), payload)
      )
    }

    const authKey = await context.authKeyManager.getAuthKey(authKeyId)

    if (!authKey) {
      throw new InvalidAuthKeyIdError(authKeyId)
    }

    return new MTProtoRawMessage(await MTProtoEncryptedRawMessage.decode(authKey, payload))
  }

  encode(): Buffer {
    return this.#message.encode()
  }

  getAuthKeyId(): bigint {
    return this.#message.getAuthKey().id
  }

  getMessage(): MTProtoEncryptedRawMessage | MTProtoUnencryptedRawMessage {
    return this.#message
  }
}
