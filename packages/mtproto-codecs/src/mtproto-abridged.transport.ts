import { fromBigIntToBuffer } from '@monstrs/buffer-utils'

export class MTProtoAbridgedTransport {
  static OBFUSCATED_TAG = Buffer.from('efefefef', 'hex')

  async receive(payload: Buffer): Promise<Buffer> {
    if (payload.subarray(0, 1).equals(Buffer.from('7f', 'hex'))) {
      const length = Buffer.concat([payload.subarray(1, 4), Buffer.alloc(1)]).readInt32LE(0) * 4

      return payload.subarray(4, length + 4)
    }

    return payload.subarray(1, payload[0] * 4 + 1)
  }

  async send(data: Buffer): Promise<Buffer> {
    const length = Math.round(data.length / 4)

    if (length < 127) {
      Buffer.concat([Buffer.from([length]), data])
    }

    return Buffer.concat([
      Buffer.concat([Buffer.from('7f', 'hex'), fromBigIntToBuffer(BigInt(length), 3)]),
      data,
    ])
  }
}
