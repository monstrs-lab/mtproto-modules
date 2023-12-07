import type { MTProtoCodec }    from '@monstrs/mtproto-core'
import type { Cipher }          from 'node:crypto'

import { createCipheriv }       from 'node:crypto'
import { randomBytes }          from 'node:crypto'

import { MTProtoAbridgedCodec } from './mtproto-abridged.codec.js'

export class MTProtoObfuscadetCodec implements MTProtoCodec {
  public readonly header: Buffer

  protected decryptor: Cipher

  protected encryptor: Cipher

  protected codec: MTProtoAbridgedCodec

  constructor(header: Buffer) {
    if (header.length !== 64) {
      throw new Error('Invalid header size')
    }

    const reservedHeader = Buffer.from(header.subarray(8, 56)).reverse()

    this.decryptor = createCipheriv('AES-256-CTR', header.subarray(8, 40), header.subarray(40, 56))
    this.encryptor = createCipheriv(
      'AES-256-CTR',
      reservedHeader.subarray(0, 32),
      reservedHeader.subarray(32, 48)
    )

    const obfuscaded = this.decryptor.update(header)

    const protocolType = obfuscaded.subarray(56, obfuscaded.length).readUint32BE()

    if (protocolType !== 0xefefefef) {
      throw new Error('Invalid protocol')
    }

    this.header = header
    this.codec = new MTProtoAbridgedCodec()
  }

  static async init(): Promise<MTProtoObfuscadetCodec> {
    const keywords = [
      Buffer.from('50567247', 'hex'),
      Buffer.from('474554', 'hex'),
      Buffer.from('504f5354', 'hex'),
      Buffer.from('eeeeeeee', 'hex'),
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

    random = random.toJSON().data

    const encryptKey = Buffer.from(random.slice(8, 40))
    const encryptIv = Buffer.from(random.slice(40, 56))
    const encryptor = createCipheriv('AES-256-CTR', encryptKey, encryptIv)

    random = Buffer.concat([
      Buffer.from(random.slice(0, 56)),
      Buffer.from('efefefef', 'hex'),
      Buffer.from(random.slice(60)),
    ])

    random = Buffer.concat([
      random.subarray(0, 56),
      encryptor.update(random).subarray(56, 64),
      random.subarray(64),
    ])

    return new MTProtoObfuscadetCodec(random)
  }

  async receive(payload: Buffer): Promise<Buffer> {
    return this.codec.receive(this.decryptor.update(payload))
  }

  async send(data: Buffer): Promise<Buffer> {
    return this.encryptor.update(await this.codec.send(data))
  }
}
