import { TLObject } from './tl.object.js'

export abstract class TLConstructor<
  TLConstructorValues extends Record<string, any>,
> extends TLObject<TLConstructorValues> {}
