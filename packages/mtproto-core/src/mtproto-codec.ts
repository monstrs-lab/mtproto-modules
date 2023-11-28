export interface MTProtoCodec {
  receive: (payload: Buffer) => Promise<Buffer>

  send: (data: Buffer) => Promise<Buffer>
}
