/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */

import { fromBufferToBigInt }             from '@monstrs/buffer-utils'

import { ReadConstructorIdNotFoundError } from '../errors/index.js'

export class BinaryReader<
  T extends { fromReader: (reader: BinaryReader<T>) => Array<T> | T | boolean },
> {
  #offset: number = 0

  #input: Buffer

  #schemaRegistry: Map<number, T>

  constructor(input: Buffer, schemaRegistry: Map<number, T>) {
    this.#input = input
    this.#schemaRegistry = schemaRegistry
  }

  getBuffer(): Buffer {
    return this.#input
  }

  tellPosition(): number {
    return this.#offset
  }

  setPosition(position: number): void {
    this.#offset = position
  }

  seek(offset: number): void {
    this.#offset += offset
  }

  readByte(): number {
    return this.read(1)[0]
  }

  readInt(signed = true): number {
    const result = signed
      ? this.#input.readInt32LE(this.#offset)
      : this.#input.readUInt32LE(this.#offset)

    this.#offset += 4

    return result
  }

  readLong(signed = true): bigint {
    return this.readLargeInt(64, signed)
  }

  readFloat(): number {
    return this.read(4).readFloatLE(0)
  }

  readDouble(): number {
    return this.read(8).readDoubleLE(0)
  }

  readLargeInt(bits: number, signed = true): bigint {
    return fromBufferToBigInt(this.read(Math.floor(bits / 8)), true, signed)
  }

  read(l = -1): Buffer {
    const length = l === -1 ? this.#input.length - this.#offset : l
    const result = this.#input.subarray(this.#offset, this.#offset + length)

    this.#offset += length

    if (result.length !== length) {
      throw Error(
        `No more data left to read (need ${length}, got ${result.length}: ${result.toString(
          'base64'
        )}).`
      )
    }

    return result
  }

  readBytes(): Buffer {
    let padding
    let length

    const firstByte = this.readByte()

    if (firstByte === 254) {
      length = this.readByte() | (this.readByte() << 8) | (this.readByte() << 16)
      padding = length % 4
    } else {
      length = firstByte
      padding = (length + 1) % 4
    }

    const data = this.read(length)

    if (padding > 0) {
      padding = 4 - padding
      this.read(padding)
    }

    return data
  }

  readString(): string {
    return this.readBytes().toString('utf-8')
  }

  readBool(): boolean {
    const value = this.readInt(false)

    if (value === 0x997275b5) {
      return true
    }

    if (value === 0xbc799737) {
      return false
    }

    throw new Error(`Invalid boolean code ${value.toString(16)}`)
  }

  readDate(): Date {
    return new Date(this.readInt() * 1000)
  }

  readVector(): Array<Array<T> | T | boolean> {
    if (this.readInt(false) !== 0x1cb5c415) {
      throw new Error('Invalid constructor code, vector was expected')
    }

    const temp: Array<Array<T> | T | boolean> = []
    const count = this.readInt()

    for (let i = 0; i < count; i++) {
      temp.push(this.readObject())
    }

    return temp
  }

  readObject<O extends T>(): Array<O> | O | boolean {
    const constructorId = this.readInt()

    const clazz = this.#schemaRegistry.get(constructorId)

    if (clazz === undefined) {
      const value = constructorId

      if (value === 0x997275b5) {
        return true
      }

      if (value === 0xbc799737) {
        return false
      }

      if (value === 0x1cb5c415) {
        const length = this.readInt()
        const temp = []

        for (let i = 0; i < length; i++) {
          temp.push(this.readObject())
        }

        return temp as Array<O>
      }

      if (clazz === undefined) {
        this.seek(-4)
        this.setPosition(this.tellPosition())

        throw new ReadConstructorIdNotFoundError(constructorId, this.read())
      }
    }

    return clazz.fromReader(this) as O
  }
}
