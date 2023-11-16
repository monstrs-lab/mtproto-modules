/* eslint-disable no-bitwise */

import { bitwise } from '@monstrs/bigint-utils'

export class MTProtoMessageId {
  #value: bigint

  constructor(value: bigint) {
    this.#value = value
  }

  get value(): bigint {
    return this.#value
  }

  static generate(timeOffset = 0): MTProtoMessageId {
    const now = new Date().getTime() / 1000 + timeOffset
    const nanoseconds = Math.floor((now - Math.floor(now)) * 1e9)

    const value = bitwise(
      BigInt(Math.floor(now)) << BigInt(32),
      BigInt(nanoseconds) << BigInt(2),
      (a, b) => a | b
    )

    return new MTProtoMessageId(value)
  }

  static generateGreaterThen(target: MTProtoMessageId, timeOffset = 0): MTProtoMessageId {
    const current = MTProtoMessageId.generate(timeOffset)

    if (target.value >= current.value) {
      return new MTProtoMessageId(target.value + BigInt(4))
    }

    return current
  }
}
