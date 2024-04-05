import { Buffer }                         from 'node:buffer'
import { createHash }                     from 'node:crypto'

import { fromBigIntToSignedLittleBuffer } from '@monstrs/buffer-utils'
import { fromBigIntToBuffer }             from '@monstrs/buffer-utils'
import { fromBufferToBigInt }             from '@monstrs/buffer-utils'

export const calculateNonceHash = (nonce: bigint, hash: bigint, num: number): bigint => {
  const nonceBuffer = fromBigIntToSignedLittleBuffer(nonce, 32)
  const n = Buffer.alloc(1)

  n.writeUInt8(num, 0)

  const data = Buffer.concat([nonceBuffer, Buffer.concat([n, fromBigIntToBuffer(hash, 8, true)])])

  return fromBufferToBigInt(createHash('sha1').update(data).digest().subarray(4, 20), true, true)
}
