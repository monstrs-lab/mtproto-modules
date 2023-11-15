/* eslint-disable no-bitwise */

import type { MTProtoRawMessageContext } from '@monstrs/mtproto-core'

import { fromBigIntToBuffer }            from '@monstrs/buffer-utils'

import { MTProtoRawMessage }             from '@monstrs/mtproto-core'

export class MTProtoAbridgedCodec {
  async receive(payload: Buffer, context: MTProtoRawMessageContext): Promise<MTProtoRawMessage> {
    let length = payload[0]

    if (length >= 127) {
      length = Buffer.concat([payload.subarray(0, 3), Buffer.alloc(1)]).readInt32LE(0)
    }

    const data = payload.subarray(1, (length << 2) + 1)

    return MTProtoRawMessage.decode(data, context)
  }

  async send(data: Buffer): Promise<Buffer> {
    const length = data.length >> 2

    if (length < 127) {
      const lengthBuffer = Buffer.alloc(1)

      lengthBuffer.writeUInt8(length, 0)

      return Buffer.concat([lengthBuffer, data])
    }

    const lengthBuffer = Buffer.concat([
      Buffer.from('7f', 'hex'),
      fromBigIntToBuffer(BigInt(length), 3),
    ])

    return Buffer.concat([lengthBuffer, data])
  }
}
