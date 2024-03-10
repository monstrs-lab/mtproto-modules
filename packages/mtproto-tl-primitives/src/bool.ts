/* Copy/Paste from https://github.com/tgsnake/core/blob/master/src/raw/core/primitive/Bool.ts */

/* eslint-disable max-classes-per-file */

import type { BytesIO } from '@tgsnake/core/lib/src/raw/core/BytesIO.js'

export class BoolFalse {
  static ID: number = 0xbc799737

  static value: boolean = false

  static write(): Buffer {
    const buff = Buffer.alloc(4)

    buff.writeUInt32LE(BoolFalse.ID)

    return buff
  }

  static async read(): Promise<boolean> {
    return BoolFalse.value
  }
}

export class BoolTrue extends BoolFalse {
  static override ID: number = 0x997275b5

  static override value: boolean = true

  static override write(): Buffer {
    const buff = Buffer.alloc(4)

    buff.writeUInt32LE(BoolTrue.ID)

    return buff
  }

  static override async read(): Promise<boolean> {
    return BoolTrue.value
  }
}

export class Bool {
  static write(value: boolean): Buffer {
    return value ? BoolTrue.write() : BoolFalse.write()
  }

  static async read(data: BytesIO): Promise<boolean> {
    return data.readUInt32LE(4) === BoolTrue.ID
  }
}
