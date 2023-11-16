export class MTProtoHandshake {
  #nonce: bigint

  #serverNonce: bigint

  #newNonce?: bigint

  #a?: bigint

  constructor(nonce: bigint, serverNonce: bigint) {
    this.#nonce = nonce
    this.#serverNonce = serverNonce
  }

  get nonce(): bigint {
    return this.#nonce
  }

  get serverNonce(): bigint {
    return this.#serverNonce
  }

  get newNonce(): bigint | undefined {
    return this.#newNonce
  }

  set newNonce(newNonce: bigint) {
    this.#newNonce = newNonce
  }

  get a(): bigint | undefined {
    return this.#a
  }

  set a(a: bigint) {
    this.#a = a
  }
}
