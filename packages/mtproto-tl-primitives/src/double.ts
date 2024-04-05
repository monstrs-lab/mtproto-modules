/* Copy/Paste from https://github.com/tgsnake/core/blob/master/src/raw/core/primitive/Double.ts */

import type { BytesIO } from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import { Buffer }       from 'node:buffer'

export class Double {
  static write(value: number, little: boolean = true): Buffer {
    const buffer = Buffer.alloc(8)

    if (little) {
      buffer.writeDoubleLE(value)
    } else {
      buffer.writeDoubleBE(value)
    }

    return buffer
  }

  static async read(data: BytesIO, little: boolean = true): Promise<number> {
    if (little) {
      return data.readDoubleLE()
    }

    return data.readDoubleBE()
  }
}
