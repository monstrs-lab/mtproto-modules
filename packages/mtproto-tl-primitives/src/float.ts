/* Copy/Paste from https://github.com/tgsnake/core/blob/master/src/raw/core/primitive/Float.ts */

import type { BytesIO } from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import { Buffer }       from 'node:buffer'

export class Float {
  static write(value: number, little: boolean = true): Buffer {
    const buffer = Buffer.alloc(4)

    if (little) {
      buffer.writeFloatLE(value)
    } else {
      buffer.writeFloatBE(value)
    }

    return buffer
  }

  static async read(data: BytesIO, little: boolean = true): Promise<number> {
    if (little) {
      return data.readFloatLE()
    }

    return data.readFloatBE()
  }
}
