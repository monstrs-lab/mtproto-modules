/* Copy/Paste from https://github.com/tgsnake/core/blob/master/src/raw/core/primitive/String.ts */

import type { BytesIO } from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

import { Buffer }       from 'node:buffer'

import { Bytes }        from './bytes.js'

export class String {
  static write(value: string): Buffer {
    return Bytes.write(Buffer.from(value, 'utf8')) as unknown as Buffer
  }

  static async read(data: BytesIO): Promise<string> {
    return (await Bytes.read(data)).toString('utf8')
  }
}
