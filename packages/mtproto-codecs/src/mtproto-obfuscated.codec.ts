import type { MTProtoCodec }        from '@monstrs/mtproto-core'

import { createCipheriv }           from 'node:crypto'
import { createDecipheriv }         from 'node:crypto'
import { randomBytes }              from 'node:crypto'

import { MTProtoAbridgedTransport } from './mtproto-abridged.transport.js'

export class MTProtoObfuscatedCodec implements MTProtoCodec {
  public readonly header: Buffer

  protected key: Buffer

  protected iv: Buffer

  protected transport: MTProtoAbridgedTransport

  constructor(header: Buffer, transport = MTProtoAbridgedTransport) {
    if (header.length !== 64) {
      throw new Error('Invalid header size')
    }

    this.header = header
    this.key = header.subarray(8, 40)
    this.iv = header.subarray(40, 56)
    this.transport = new transport() // eslint-disable-line new-cap

    const obfuscaded = createDecipheriv('AES-256-CTR', this.key, this.iv).update(header)

    const protocolType = obfuscaded.subarray(56, obfuscaded.length).readUint32BE()

    if (protocolType !== transport.OBFUSCATED_TAG.readUint32BE()) {
      throw new Error('Invalid protocol')
    }
  }

  static async init(transport = MTProtoAbridgedTransport): Promise<MTProtoObfuscatedCodec> {
    const keywords = [
      Buffer.from('50567247', 'hex'),
      Buffer.from('504f5354', 'hex'),
      Buffer.from('eeeeeeee', 'hex'),
      Buffer.from('474554', 'hex'),
    ]

    let random

    // eslint-disable-next-line no-constant-condition
    while (true) {
      random = randomBytes(64)

      if (random[0] !== 0xef && !random.subarray(4, 8).equals(Buffer.alloc(4))) {
        let ok = true

        for (const key of keywords) {
          if (key.equals(random.subarray(0, 4))) {
            ok = false
            break
          }
        }

        if (ok) {
          break
        }
      }
    }

    random = Buffer.from(random.toJSON().data)

    const encryptKey = random.subarray(8, 40)
    const encryptIv = random.subarray(40, 56)

    const encryptor = createCipheriv('AES-256-CTR', encryptKey, encryptIv)

    const header = Buffer.concat([
      random.subarray(0, 56),
      encryptor
        .update(
          Buffer.concat([random.subarray(0, 56), transport.OBFUSCATED_TAG, random.subarray(60)])
        )
        .subarray(56, 64),
    ])

    return new MTProtoObfuscatedCodec(header, transport)
  }

  async receive(payload: Buffer): Promise<Buffer> {
    return this.transport.receive(
      createDecipheriv('AES-256-CTR', this.key, this.iv).update(payload)
    )
  }

  async send(data: Buffer): Promise<Buffer> {
    return createCipheriv('AES-256-CTR', this.key, this.iv).update(await this.transport.send(data))
  }
}
