import { tmpdir }               from 'node:os'
import { join }                 from 'node:path'

import { describe }             from '@jest/globals'
import { expect }               from '@jest/globals'
import { it }                   from '@jest/globals'
import { Project }              from 'ts-morph'
import { ScriptTarget }         from 'ts-morph'
import { ModuleKind }           from 'ts-morph'
import { ModuleResolutionKind } from 'ts-morph'

import { TLObjectGenerator }    from './tl-object.generator.js'

describe('mtproto tl to typescript', () => {
  describe('tl object generator', () => {
    it('check generate core types', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      new TLObjectGenerator(project).generate({
        id: '85337187',
        predicate: 'test',
        type: 'TTest',
        name: 'test',
        params: [
          {
            name: 'int',
            type: 'int',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
          {
            name: 'int128',
            type: 'int128',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
          {
            name: 'int256',
            type: 'int256',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
          {
            name: 'long',
            type: 'long',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
          {
            name: 'double',
            type: 'double',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
          {
            name: 'bytes',
            type: 'bytes',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
          {
            name: 'string',
            type: 'string',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
          {
            name: 'Bool',
            type: 'Bool',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
        ],
      })

      expect(project.getSourceFile(join(tmpdir(), 'test.ts'))?.getFullText()).toMatchSnapshot()
    })

    it('check generate custom types', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      new TLObjectGenerator(project).generate({
        id: '85337187',
        predicate: 'test',
        type: 'TTest',
        name: 'test',
        params: [
          {
            name: 'param',
            type: 'Custom',
            isVector: false,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: false,
          },
        ],
      })

      expect(project.getSourceFile(join(tmpdir(), 'test.ts'))?.getFullText()).toMatchSnapshot()
    })

    it('check generate vector types', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      new TLObjectGenerator(project).generate({
        id: '85337187',
        predicate: 'test',
        type: 'TTest',
        name: 'test',
        params: [
          {
            name: 'param',
            type: 'int',
            isVector: true,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: true,
          },
        ],
      })

      expect(project.getSourceFile(join(tmpdir(), 'test.ts'))?.getFullText()).toMatchSnapshot()
    })

    it('check generate vector custom types', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      new TLObjectGenerator(project).generate({
        id: '85337187',
        predicate: 'test',
        type: 'TTest',
        name: 'test',
        params: [
          {
            name: 'param',
            type: 'Custom',
            isVector: true,
            isFlag: false,
            skipConstructorId: true,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: false,
            useVectorId: true,
          },
        ],
      })

      expect(project.getSourceFile(join(tmpdir(), 'test.ts'))?.getFullText()).toMatchSnapshot()
    })

    it('check generate flags types', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      new TLObjectGenerator(project).generate({
        id: '85337187',
        predicate: 'test',
        type: 'TTest',
        name: 'test',
        params: [
          {
            name: 'flags',
            type: '#',
            isVector: false,
            isFlag: false,
            skipConstructorId: false,
            flagGroup: 0,
            flagIndex: -1,
            flagIndicator: true,
            useVectorId: false,
          },
          {
            name: 'param',
            type: 'true',
            isVector: false,
            isFlag: true,
            skipConstructorId: true,
            flagGroup: 1,
            flagIndex: 0,
            flagIndicator: false,
            useVectorId: false,
          },
        ],
      })

      expect(project.getSourceFile(join(tmpdir(), 'test.ts'))?.getFullText()).toMatchSnapshot()
    })

    it('check generate empty params', async () => {
      const project = new Project({
        compilerOptions: {
          outDir: tmpdir(),
          module: ModuleKind.ES2022,
          target: ScriptTarget.ES2022,
          moduleResolution: ModuleResolutionKind.Bundler,
        },
      })

      new TLObjectGenerator(project).generate({
        id: '85337187',
        predicate: 'test',
        type: 'TTest',
        name: 'test',
        params: [],
      })

      expect(project.getSourceFile(join(tmpdir(), 'test.ts'))?.getFullText()).toMatchSnapshot()
    })
  })
})
