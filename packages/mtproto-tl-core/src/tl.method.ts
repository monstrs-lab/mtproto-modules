import { TLObject } from './tl.object.js'

export abstract class TLMethod<
  TLMethodValues extends Record<string, any>,
> extends TLObject<TLMethodValues> {}
