import { MTProtoMessageId } from './mtproto-message-id.js'

export class MTProtoMessageIdFactory {
  #serverTime: number = 0

  #lastMessageId?: bigint

  setServerTime(serverTime: number): void {
    this.#serverTime = serverTime
  }

  generate(): MTProtoMessageId {
    const messageId = MTProtoMessageId.generate(this.#serverTime)

    if (this.#lastMessageId && this.#lastMessageId >= messageId.value) {
      return MTProtoMessageId.generateGreaterThen(messageId, this.#serverTime)
    }

    return messageId
  }
}
