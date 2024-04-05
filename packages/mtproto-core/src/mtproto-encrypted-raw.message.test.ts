import { Buffer }                     from 'node:buffer'

import { describe }                   from '@jest/globals'
import { expect }                     from '@jest/globals'
import { it }                         from '@jest/globals'

import { MTProtoAuthKey }             from './mtproto-auth-key.js'
import { MTProtoEncryptedRawMessage } from './mtproto-encrypted-raw.message.js'

describe('mtproto encrypted raw message', () => {
  it('check encode decode', async () => {
    const authKey = MTProtoAuthKey.create()

    const raw = new MTProtoEncryptedRawMessage(authKey, Buffer.alloc(8, 0))
    const decrypted = await MTProtoEncryptedRawMessage.decode(authKey, raw.encode())

    expect(decrypted.getMessageData().subarray(0, 8).equals(raw.getMessageData())).toBe(true)
  })
})
