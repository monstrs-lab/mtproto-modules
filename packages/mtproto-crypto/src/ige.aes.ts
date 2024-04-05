import { Buffer }                   from 'node:buffer'
import { randomBytes }              from 'node:crypto'

import { IGE as AESIGE }            from '@cryptography/aes'
import { fromBufferToLittleBuffer } from '@monstrs/buffer-utils'

export class IGE {
  #ige: AESIGE

  constructor(key: Uint8Array | Uint32Array | string, iv: Uint8Array | Uint32Array | string) {
    this.#ige = new AESIGE(key, iv)
  }

  decrypt(message: Buffer): Buffer {
    return fromBufferToLittleBuffer(this.#ige.decrypt(message))
  }

  encrypt(message: Buffer): Buffer {
    let target = message

    const padding = target.length % 16

    if (padding) {
      target = Buffer.concat([target, Buffer.from(randomBytes(16 - padding))])
    }

    return fromBufferToLittleBuffer(this.#ige.encrypt(target))
  }
}
