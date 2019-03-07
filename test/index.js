import * as babel from '@babel/core';
import babelPluginSyntaxDynamicImport from '@babel/plugin-syntax-dynamic-import';
import { expect } from 'chai';
import babelPluginRequireHook from '../src';
describe('babel-plugin-require-hook', function() {
  const cjsOpts = {
    plugins: [
      babelPluginSyntaxDynamicImport,
      [
        babelPluginRequireHook,
        {
          hook: 'hook.cjs.js'
        }
      ]
    ]
  };
  const esmOpts = {
    plugins: [
      babelPluginSyntaxDynamicImport,
      [
        babelPluginRequireHook,
        {
          hook: 'hook.esm.js'
        }
      ]
    ]
  };
  const funcOpts = {
    plugins: [
      babelPluginSyntaxDynamicImport,
      [
        babelPluginRequireHook,
        {
          hook(src, file, state) {
            if (src === 'shouldchange') {
              return 'changed';
            }
          }
        }
      ]
    ]
  };
  describe('use cjsOpts', function() {
    foo(cjsOpts);
  });
  describe('use esmOpts', function() {
    foo(esmOpts);
  });
});

function foo(babelConfig) {
  describe('CallExpression', function() {
    describe('require', function() {
      it("shouldn't change", function() {
        const code = `require("shouldntchange");`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`require("shouldntchange");`);
      });
      it('should change', function() {
        const code = `require("shouldchange");`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`require("changed");`);
      });
    });
    describe('require.method', function() {
      it("shouldn't change", function() {
        const code = `require.method("shouldntchange");`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`require.method("shouldntchange");`);
      });
      it('should change', function() {
        const code = `require.method("shouldchange");`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`require.method("changed");`);
      });
    });
    describe("import('xx')", function() {
      it("shouldn't change", function() {
        const code = `import("shouldntchange");`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`import("shouldntchange");`);
      });
      it('should change', function() {
        const code = `import("shouldchange");`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`import("changed");`);
      });
    });
  });
  describe('ExportDeclaration', function() {
    describe("export * from 'xx'", function() {
      it("shouldn't change", function() {
        const code = `export * from "shouldntchange";`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`export * from "shouldntchange";`);
      });
      it('should change', function() {
        const code = `export * from "shouldchange";`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`export * from "changed";`);
      });
    });
  });
  describe('ImportDeclaration', function() {
    describe("import 'xx'", function() {
      it("shouldn't change", function() {
        const code = `import "shouldntchange";`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`import "shouldntchange";`);
      });
      it('should change', function() {
        const code = `import "shouldchange";`;
        var result = babel.transform(code, babelConfig).code;
        expect(result).to.equal(`import "changed";`);
      });
    });
  });
}
