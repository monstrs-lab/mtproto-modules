import type { MTProtoRawMessage }        from './mtproto-raw.message.js'
import type { MTProtoRawMessageContext } from './mtproto-raw.message.js'

export interface MTProtoCodec {
  receive: (payload: Buffer, context: MTProtoRawMessageContext) => Promise<MTProtoRawMessage>

  send: (message: MTProtoRawMessage) => Promise<Buffer>
}
