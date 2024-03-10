/* Copy/Paste from https://github.com/tgsnake/core/blob/master/src/raw/core/primitive/Bytes.ts */

/* eslint-disable no-else-return */

import type { BytesIO }   from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import { bufferToBigint } from '@tgsnake/core/lib/src/helpers.js'
import { bigintToBuffer } from '@tgsnake/core/lib/src/helpers.js'
import { mod }            from '@tgsnake/core/lib/src/helpers.js'

export class Bytes {
  static write(value: Buffer): Buffer {
    const length = value.length // eslint-disable-line prefer-destructuring

    if (length <= 253) {
      return Buffer.concat([Buffer.from([length]), value, Buffer.alloc(mod(-(length + 1), 4))])
    } else {
      return Buffer.concat([
        Buffer.from([254]),
        bigintToBuffer(BigInt(length), 3),
        value,
        Buffer.alloc(mod(-length, 4)),
      ])
    }
  }

  static async read(data: BytesIO): Promise<Buffer> {
    let length = data.read(1)[0]

    if (length <= 253) {
      const x = data.read(length)
      data.read(mod(-(length + 1), 4))
      return x
    } else {
      length = Number(bufferToBigint(data.read(3)))
      const x = data.read(length)
      data.read(mod(-length, 4))
      return x
    }
  }
}
