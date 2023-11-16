import type { MTProtoAuthKeyManager } from './mtproto-auth-key.manager.js'
import type { MTProtoCodec }          from './mtproto-codec.js'

import { MTProtoHandshake }           from './mtproto-handshake.js'

export class MTProtoState {
  #codec: MTProtoCodec

  #authKeyManager: MTProtoAuthKeyManager

  #handshake?: MTProtoHandshake

  constructor(codec: MTProtoCodec, authKeyManager: MTProtoAuthKeyManager) {
    this.#codec = codec
    this.#authKeyManager = authKeyManager
  }

  get codec(): MTProtoCodec {
    return this.#codec
  }

  get authKeyManager(): MTProtoAuthKeyManager {
    return this.#authKeyManager
  }

  get handshake(): MTProtoHandshake | undefined {
    return this.#handshake
  }

  setHandshake(nonce: bigint, serverNonce: bigint): void {
    this.#handshake = new MTProtoHandshake(nonce, serverNonce)
  }
}
