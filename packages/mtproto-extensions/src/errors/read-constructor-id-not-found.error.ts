export class ReadConstructorIdNotFoundError extends Error {
  constructor(
    public readonly constructorId: number,
    public readonly remaining: Buffer
  ) {
    super(`Could not find a matching Constructor ID for the TLObject that was supposed to be
            read with ID ${constructorId}. Most likely, a TLObject was trying to be read when
             it should not be read. Remaining bytes: ${remaining.length}`)
  }
}
