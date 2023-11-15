import type { MTProtoAuthKey } from './mtproto-auth-key.js'

export class MTProtoAuthKeyManager {
  #authKeys: Map<bigint, MTProtoAuthKey>

  constructor() {
    this.#authKeys = new Map()
  }

  async getAuthKey(authKeyId: bigint): Promise<MTProtoAuthKey | undefined> {
    return this.#authKeys.get(authKeyId)
  }

  async setAuthKey(authKeyId: bigint, authKey: MTProtoAuthKey): Promise<void> {
    this.#authKeys.set(authKeyId, authKey)
  }
}
