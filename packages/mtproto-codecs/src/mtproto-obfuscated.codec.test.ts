import { describe }               from '@jest/globals'
import { expect }                 from '@jest/globals'
import { it }                     from '@jest/globals'

import { MTProtoObfuscatedCodec } from './mtproto-obfuscated.codec.js'

describe('mtproto obfuscated codec', () => {
  it('receive send', async () => {
    const codec = MTProtoObfuscatedCodec.init()

    expect(
      (await codec.receive(await codec.send(Buffer.alloc(40, 0)))).equals(Buffer.alloc(40, 0))
    ).toBe(true)
  })
})
