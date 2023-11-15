export interface TLSchemaParam {
  name: string
  type: string
}

export interface TLSchemaConstructor {
  id: string
  predicate: string
  type: string
  params: Array<TLSchemaParam>
}

export interface TLSchemaMethod {
  id: string
  method: string
  type: string
  params: Array<TLSchemaParam>
}

export interface TLSchema {
  constructors: Array<TLSchemaConstructor>
  methods: Array<TLSchemaMethod>
}
