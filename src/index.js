import * as path from 'path';
function resolveRequireHookFunc() {
  let resolveResult;
  return function passPluginOpts(func) {
    if (resolveResult === undefined && typeof func === 'object') {
      if (typeof func.hook === 'string') {
        const absPath = path.resolve(process.cwd(), func.hook);
        resolveResult = resolveFuckESModule(require(absPath)) || null;
      } else {
        resolveResult = func.hook || null;
      }
    }
    return function callIfIsFunction(...args) {
      if (typeof resolveResult === 'function') {
        return resolveResult(...args);
      }
      return null;
    };
  };
}

function resolveFuckESModule(mod) {
  return mod && mod.__esModule ? mod.default : mod;
}

export default ({ types: t }) => {
  const requireHookFunc = resolveRequireHookFunc();
  function requireHookFuncCall(src, file, state) {
    return requireHookFunc(state.opts)(src, file, state);
  }

  function requireCallHook(path, state) {
    if (
      !t.isIdentifier(path.node.callee, { name: 'require' }) &&
      !t.isImport(path.node.callee) &&
      !(
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object, { name: 'require' })
      )
    ) {
      return;
    }
    const sourceNode = path.node.arguments[0];
    if (sourceNode && t.isStringLiteral(sourceNode)) {
      const newSourceStr = requireHookFuncCall(
        sourceNode.value,
        state.file.opts.filename,
        state
      );
      if (newSourceStr && sourceNode.value !== newSourceStr) {
        path.replaceWith(
          t.callExpression(path.node.callee, [t.stringLiteral(newSourceStr)])
        );
      }
    }
  }

  function importHook(path, state) {
    const sourceNode = path.node.source;
    if (sourceNode && t.isStringLiteral(sourceNode)) {
      const newSourceStr = requireHookFuncCall(
        sourceNode.value,
        state.file.opts.filename,
        state
      );
      if (newSourceStr && sourceNode.value !== newSourceStr) {
        path.node.source = t.stringLiteral(newSourceStr);
      }
    }
  }

  return {
    visitor: {
      CallExpression: {
        exit(path, state) {
          return requireCallHook(path, state);
        }
      },
      ImportDeclaration: {
        exit(path, state) {
          return importHook(path, state);
        }
      },
      ExportDeclaration: {
        exit(path, state) {
          return importHook(path, state);
        }
      }
    }
  };
};
