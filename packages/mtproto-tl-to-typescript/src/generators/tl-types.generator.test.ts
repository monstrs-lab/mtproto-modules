import { tmpdir }               from 'node:os'
import { join }                 from 'node:path'

import { describe }             from '@jest/globals'
import { expect }               from '@jest/globals'
import { it }                   from '@jest/globals'
import { Project }              from 'ts-morph'
import { ScriptTarget }         from 'ts-morph'
import { ModuleKind }           from 'ts-morph'
import { ModuleResolutionKind } from 'ts-morph'

import { TLTypesGenerator }     from './tl-types.generator.js'

describe('mtproto tl to typescript', () => {
  describe('tl types generator', () => {
    it('check generate types', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      project.createSourceFile(join(tmpdir(), 'test1.ts')).addClass({
        isExported: true,
        name: 'Test1',
        properties: [
          {
            name: 'type',
            type: 'string',
            initializer: 'Test',
          },
        ],
      })

      project.createSourceFile(join(tmpdir(), 'test2.ts')).addClass({
        isExported: true,
        name: 'Test2',
        properties: [
          {
            name: 'type',
            type: 'string',
            initializer: 'Test',
          },
        ],
      })

      new TLTypesGenerator(project).generate()

      expect(project.getSourceFile(join(tmpdir(), 'test.ts'))?.getFullText()).toMatchSnapshot()
    })
  })
})
