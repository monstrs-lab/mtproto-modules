import { tmpdir }               from 'node:os'
import { join }                 from 'node:path'

import { describe }             from '@jest/globals'
import { expect }               from '@jest/globals'
import { it }                   from '@jest/globals'
import { Project }              from 'ts-morph'
import { ScriptTarget }         from 'ts-morph'
import { ModuleKind }           from 'ts-morph'
import { ModuleResolutionKind } from 'ts-morph'

import { TLIndexGenerator }     from './tl-index.generator.js'

describe('mtproto tl to typescript', () => {
  describe('tl index generator', () => {
    it('check generate index file', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      project.createSourceFile(join(tmpdir(), 'test.ts'))

      new TLIndexGenerator(project).generate()

      expect(project.getSourceFile(join(tmpdir(), 'index.ts'))?.getFullText()).toMatchSnapshot()
    })
  })
})
