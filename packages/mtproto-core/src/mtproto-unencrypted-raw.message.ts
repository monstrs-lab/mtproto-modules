import { MTProtoMessageId } from './mtproto-message-id.js'

export class MTProtoUnencryptedRawMessage {
  #messageId: MTProtoMessageId

  #messageLength: number

  #messageData: Buffer

  constructor(messageId: MTProtoMessageId, messageLength: number, messageData: Buffer) {
    this.#messageId = messageId
    this.#messageLength = messageLength
    this.#messageData = messageData
  }

  static async decode(payload: Buffer): Promise<MTProtoUnencryptedRawMessage> {
    const messageId = payload.readBigUint64LE(8)
    const messageLength = payload.readUInt32LE(16)
    const messageData = payload.subarray(20, payload.length)

    if (messageId === BigInt(0)) {
      throw new Error('Bad message id')
    }

    if (messageLength <= 0) {
      throw new Error('Bad message length')
    }

    return new MTProtoUnencryptedRawMessage(
      new MTProtoMessageId(messageId),
      messageLength,
      messageData
    )
  }

  encode(): Buffer {
    const authKeyId = Buffer.alloc(8)
    const messageId = Buffer.alloc(8)
    const messageLength = Buffer.alloc(4)

    authKeyId.writeBigUint64LE(BigInt(0))
    messageId.writeBigUInt64LE(this.#messageId.value)
    messageLength.writeUInt32LE(this.#messageLength)

    return Buffer.concat([authKeyId, messageId, messageLength, this.#messageData])
  }

  getMessageData(): Buffer {
    return this.#messageData
  }

  getMessageId(): MTProtoMessageId {
    return this.#messageId
  }
}
