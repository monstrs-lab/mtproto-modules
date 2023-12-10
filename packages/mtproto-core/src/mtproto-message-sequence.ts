export class MTProtoMessageSequence {
  #sequence: number = 0

  generate(contentRelated: boolean = false): number {
    if (contentRelated) {
      const result = this.#sequence * 2 + 1

      this.#sequence += 1

      return result
    }

    return this.#sequence * 2
  }
}
