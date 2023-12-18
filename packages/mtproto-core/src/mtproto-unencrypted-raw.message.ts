import type { MTProtoAuthKey } from './mtproto-auth-key.js'

import { MTProtoMessageId }    from './mtproto-message-id.js'

export class MTProtoUnencryptedRawMessage {
  #authKey: MTProtoAuthKey

  #messageId: MTProtoMessageId

  #messageLength: number

  #messageData: Buffer

  constructor(
    authKey: MTProtoAuthKey,
    messageId: MTProtoMessageId,
    messageLength: number,
    messageData: Buffer
  ) {
    this.#authKey = authKey
    this.#messageId = messageId
    this.#messageLength = messageLength
    this.#messageData = messageData
  }

  static async decode(
    authKey: MTProtoAuthKey,
    payload: Buffer
  ): Promise<MTProtoUnencryptedRawMessage> {
    const messageId = payload.readBigInt64BE(8)
    const messageLength = payload.readUInt32LE(16)
    const messageData = payload.subarray(20, payload.length)

    if (messageId === BigInt(0)) {
      throw new Error('Bad message id')
    }

    if (messageLength <= 0) {
      throw new Error('Bad message length')
    }

    return new MTProtoUnencryptedRawMessage(
      authKey,
      new MTProtoMessageId(messageId),
      messageLength,
      messageData
    )
  }

  encode(): Buffer {
    const authKeyId = Buffer.alloc(8)
    const messageId = Buffer.alloc(8)
    const messageLength = Buffer.alloc(4)

    authKeyId.writeBigUInt64LE(BigInt(0))
    messageId.writeBigInt64BE(this.#messageId.value)
    messageLength.writeUInt32LE(this.#messageLength)

    return Buffer.concat([authKeyId, messageId, messageLength, this.#messageData])
  }

  getAuthKey(): MTProtoAuthKey {
    return this.#authKey
  }

  getMessageData(): Buffer {
    return this.#messageData
  }

  getMessageId(): MTProtoMessageId {
    return this.#messageId
  }
}
