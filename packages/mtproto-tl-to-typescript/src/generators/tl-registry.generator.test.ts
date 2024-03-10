import { tmpdir }               from 'node:os'
import { join }                 from 'node:path'

import { describe }             from '@jest/globals'
import { expect }               from '@jest/globals'
import { it }                   from '@jest/globals'
import { Project }              from 'ts-morph'
import { ScriptTarget }         from 'ts-morph'
import { ModuleKind }           from 'ts-morph'
import { ModuleResolutionKind } from 'ts-morph'

import { TLRegistryGenerator }  from './tl-registry.generator.js'

describe('mtproto tl to typescript', () => {
  describe('tl registry generator', () => {
    it('check generate registry file', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      project.createSourceFile(join(tmpdir(), 'test.ts')).addClass({
        isExported: true,
        name: 'Test',
        properties: [
          {
            name: 'constructorId',
            type: 'number',
            initializer: '0x00000000',
          },
        ],
      })

      new TLRegistryGenerator(project).generate()

      expect(project.getSourceFile(join(tmpdir(), 'registry.ts'))?.getFullText()).toMatchSnapshot()
    })
  })
})
