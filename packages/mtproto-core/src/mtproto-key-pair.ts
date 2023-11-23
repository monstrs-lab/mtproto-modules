import type { MTProtoAuthKey }            from './mtproto-auth-key.js'

import { createHash }                     from 'node:crypto'

import { fromBigIntToSignedLittleBuffer } from '@monstrs/buffer-utils'

export enum MTProtoKeyPairType {
  CLIENT = 0,
  SERVER = 1,
}

export class MTProtoKeyPair {
  constructor(
    public readonly key: Buffer,
    public readonly iv: Buffer
  ) {}

  static fromAuthAndMessageKey(
    authKey: MTProtoAuthKey,
    msgKey: Buffer,
    keyType: MTProtoKeyPairType = MTProtoKeyPairType.SERVER
  ): MTProtoKeyPair {
    const x = keyType === MTProtoKeyPairType.SERVER ? 8 : 0

    const [sha256a, sha256b] = [
      createHash('sha256')
        .update(Buffer.concat([msgKey, authKey.key.subarray(x, x + 36)]))
        .digest(),
      createHash('sha256')
        .update(Buffer.concat([authKey.key.subarray(x + 40, x + 76), msgKey]))
        .digest(),
    ]

    const key = Buffer.concat([
      sha256a.subarray(0, 8),
      sha256b.subarray(8, 24),
      sha256a.subarray(24, 32),
    ])

    const iv = Buffer.concat([
      sha256b.subarray(0, 8),
      sha256a.subarray(8, 24),
      sha256b.subarray(24, 32),
    ])

    return new MTProtoKeyPair(key, iv)
  }

  static fromNonce(serverNonce: bigint, newNonce: bigint): MTProtoKeyPair {
    const serverNonceBuffer = fromBigIntToSignedLittleBuffer(serverNonce, 16)
    const newNonceBuffer = fromBigIntToSignedLittleBuffer(newNonce, 32)

    const [hash1, hash2, hash3] = [
      createHash('sha1')
        .update(Buffer.concat([newNonceBuffer, serverNonceBuffer]))
        .digest(),
      createHash('sha1')
        .update(Buffer.concat([serverNonceBuffer, newNonceBuffer]))
        .digest(),
      createHash('sha1')
        .update(Buffer.concat([newNonceBuffer, newNonceBuffer]))
        .digest(),
    ]

    const key = Buffer.concat([hash1, hash2.subarray(0, 12)])
    const iv = Buffer.concat([hash2.subarray(12, 20), hash3, newNonceBuffer.subarray(0, 4)])

    return new MTProtoKeyPair(key, iv)
  }
}
