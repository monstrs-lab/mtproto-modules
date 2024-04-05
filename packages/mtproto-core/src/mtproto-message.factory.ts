import { Buffer }                  from 'node:buffer'

import { MTProtoMessageIdFactory } from './mtproto-message-id.factory.js'
import { MTProtoMessageSequence }  from './mtproto-message-sequence.js'

export class MTProtoMessageFactory {
  #messageId: MTProtoMessageIdFactory

  #sequence: MTProtoMessageSequence

  constructor() {
    this.#messageId = new MTProtoMessageIdFactory()
    this.#sequence = new MTProtoMessageSequence()
  }

  setServerTime(serverTime: number): void {
    this.#messageId.setServerTime(serverTime)
  }

  encode(salt: bigint, sessionId: bigint, data: Buffer): Buffer {
    const buffer = Buffer.alloc(32)

    buffer.writeBigInt64BE(salt, 0)
    buffer.writeBigInt64BE(sessionId, 8)
    buffer.writeBigInt64LE(this.#messageId.generate().value, 16)
    buffer.writeInt32LE(this.#sequence.generate(), 24)
    buffer.writeInt32LE(data.length, 28)

    return Buffer.concat([buffer, data])
  }

  decode(data: Buffer): {
    salt: bigint
    sessionId: bigint
    messageId: bigint
    sequence: number
    messageLength: number
    message: Buffer
  } {
    const salt = data.readBigInt64BE(0)
    const sessionId = data.readBigInt64BE(8)
    const messageId = data.readBigInt64LE(16)
    const sequence = data.readInt32LE(24)
    const messageLength = data.readInt32LE(28)
    const message = data.subarray(32, data.length)

    return {
      salt,
      sessionId,
      messageId,
      sequence,
      messageLength,
      message,
    }
  }
}
