import type { TLSchema }  from '@monstrs/mtproto-tl-types'

import { readFile }       from 'node:fs/promises'
import { join }           from 'node:path'

import { program }        from 'commander'

import { TLToTypeScript } from './tl-to-typescript.js'

program
  .option('-s, --schema [schemas...]', 'Input schema')
  .option('-o, --output <output>', 'Output directory')

program.parse()

const options = program.opts()

const tlToTypeScript = new TLToTypeScript({
  outDir: options.output,
})

const schemas: Array<string> = await Promise.all(
  (options.schema as Array<string>).map(async (schema: string) =>
    readFile(join(process.cwd(), schema), 'utf8'))
)

await Promise.all(
  schemas.map(async (schema) => tlToTypeScript.execute(JSON.parse(schema) as TLSchema))
)

await tlToTypeScript.write()
