/* Copy/Paste from https://github.com/tgsnake/core/blob/master/src/raw/core/primitive/Vector.ts */

import { BytesIO } from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import { Int }     from './int.js'
import { Long }    from './int.js'

export class Vector {
  static ID: number = 0x1cb5c415

  static write(value: Array<any>, t: { write: (data: any) => any }): Buffer {
    const b = new BytesIO()

    b.write(Int.write(Vector.ID, false))
    b.write(Int.write(value.length))

    for (const i of value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      b.write(t.write(i))
    }

    return b.buffer
  }

  static async readBare(
    data: BytesIO,
    size: number,
    r: { read: (data: BytesIO) => Promise<any> }
  ): Promise<any> {
    if (size === 4) {
      return Int.read(data)
    }

    if (size === 8) {
      return Long.read(data)
    }

    return r.read(data)
  }

  static async read(
    data: BytesIO,
    t?: { read: (data: BytesIO) => Promise<any> },
    r?: { read: (data: BytesIO) => Promise<any> }
  ): Promise<Array<any>> {
    const results: Array<any> = []
    const count = await Int.read(data)
    const left = data.read().length
    const size = count ? left / count : 0

    data.seek(-left, 1)

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < count; i++) {
      if (t) {
        // eslint-disable-next-line no-await-in-loop
        results.push(await t.read(data))
      } else if (r) {
        // eslint-disable-next-line no-await-in-loop
        results.push(await Vector.readBare(data, size, r))
      } else {
        throw Error('Uknown vector reader type')
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return results
  }
}
