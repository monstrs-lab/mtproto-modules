/* Copy/Paste from https://github.com/tgsnake/core/blob/master/src/raw/core/primitive/Vector.ts */

import { BytesIO } from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import { Int }     from './int.js'

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

  static async read(
    data: BytesIO,
    t: { read: (data: BytesIO) => Promise<any> }
  ): Promise<Array<any>> {
    const results: Array<any> = []
    const count = await Int.read(data)
    const left = data.read().length

    data.seek(-left, 1)

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      results.push(await t.read(data))
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return results
  }
}
