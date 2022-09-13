const modules = new Map();

function require(/** @type string */ name) {
  return modules.get(name);
}

function define(
  /** @type string */ name,
  /** @type {string[]} */ deps,
  /** @type {(...deps: unknown[]) => void} */ fn
) {
  if (!modules.has(name)) {
    const module = {};
    const resolved = [require, module, ...deps.slice(2).map(require)];
    fn(...resolved);
    modules.set(name, module);
  }
}
