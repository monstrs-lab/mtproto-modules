import type { TLSchema }  from '@monstrs/mtproto-tl-types'

import { readFile }       from 'node:fs/promises'
import { join }           from 'node:path'
import { fileURLToPath }  from 'node:url'

import { describe }       from '@jest/globals'
import { it }             from '@jest/globals'

import { TLToTypeScript } from '../src/index.js'

describe('mtproto tl to typescript', () => {
  it('check generate index file', async () => {
    const schema = await readFile(
      join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures/test.schema.json'),
      'utf-8'
    )

    const tlToTypeScript = new TLToTypeScript({
      outDir: join(fileURLToPath(new URL('.', import.meta.url)), 'results'),
    })

    tlToTypeScript.execute(JSON.parse(schema) as TLSchema)

    await tlToTypeScript.write()
  })
})
