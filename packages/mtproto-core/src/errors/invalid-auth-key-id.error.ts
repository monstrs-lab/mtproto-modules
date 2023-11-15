export class InvalidAuthKeyIdError extends Error {
  constructor(public readonly authKeyId: bigint) {
    super(`Invalid auth key id: ${authKeyId}`)
  }
}
