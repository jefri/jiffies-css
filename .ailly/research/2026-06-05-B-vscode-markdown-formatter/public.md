# Public: Markdown Formatter Extensions for VSCode

## Findings

VSCode has no built-in markdown formatter. The official docs point to the Marketplace without recommending a specific tool. Four extensions cover this use case with meaningfully different design philosophies.

### markdownlint (`DavidAnson.vscode-markdownlint`)

The most-installed option at 11.4M installs with a 4.5-star rating. Primarily a linter across 60+ configurable rules, but many rules carry auto-fix implementations. Fix on save is enabled via `source.fixAll.markdownlint`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.markdownlint": true
  }
}
```

It also registers as a document formatter, so `editor.formatOnSave` works too. Configuration lives in `.markdownlint.json` / `.markdownlint.yaml` / `.markdownlint.cjs` or directly in `settings.json`. Not all rules are auto-fixable; the extension focuses on style enforcement rather than cosmetic layout. ([Marketplace](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint), [GitHub](https://github.com/DavidAnson/vscode-markdownlint))

### Prettier (`esbenp.prettier-vscode`)

69M installs, 3.5-star rating. General-purpose formatter with markdown support since version 1.8. Rewraps prose to a configurable print width, normalizes heading whitespace, and aligns tables. Format on save config:

```json
{
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

Prose wrapping is the most controversial feature: it inserts hard line breaks at the print width, which can conflict with documentation workflows that prefer soft-wrapped paragraphs. Set `"proseWrap": "preserve"` in `.prettierrc` to disable. ([Marketplace](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [README](https://github.com/prettier/prettier-vscode/blob/main/README.md))

### vscode-remark (`unifiedjs.vscode-remark`)

The most extensible option, built on the remark unified ecosystem with 150+ available plugins. Acts as both a linter and formatter. Format on save config:

```json
{
  "[markdown]": {
    "editor.defaultFormatter": "unifiedjs.vscode-remark",
    "editor.formatOnSave": true
  }
}
```

Requires a remark configuration file (`.remarkrc`, `package.json`, etc.) in the workspace unless `remark.requireConfig` is set to `false`. Plugin selection determines both what is checked and how formatting is applied, giving fine-grained control. Intended for workspaces you control, since it dynamically loads plugins. Best choice when you also want remark-cli in CI for consistent local/CI behavior. ([GitHub](https://github.com/remarkjs/vscode-remark))

### Markdown Formatter (`jameslanska.markdownformatter`)

Smaller install base but a focused, opinionated pure-formatter. Implemented in Rust/WebAssembly for performance. Handles:

- GFM-compliant table alignment (Unicode/emoji/CJK aware via Unicode 15.1.0)
- Ordered list renumbering
- Whitespace normalization

Single dependency (`markdownlint`). No linting built in; pairs well with markdownlint for a separation of concerns. Spec-compliant table formatting is its distinguishing strength over the other options. ([GitHub](https://github.com/jameslanska/markdown-formatter))

## Recommendation

For a project that already uses prettier across JS/CSS/HTML, adding `"[markdown]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }` is the lowest-friction choice. Set `"proseWrap": "preserve"` to avoid prose rewrapping.

For markdown-heavy documentation work with strict style requirements, pairing `markdownlint` (fix on save) with `jameslanska.markdownformatter` (format on save) gives independent linting and formatting with no overlap.

For monorepos with a unified remark toolchain, `vscode-remark` integrates the CI and local workflows.

## Sources

- [markdownlint - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) — primary extension page, install count, rating
- [DavidAnson/vscode-markdownlint - GitHub](https://github.com/DavidAnson/vscode-markdownlint) — configuration docs and rule list
- [Prettier - Code formatter - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) — markdown support and format-on-save details
- [prettier/prettier-vscode README](https://github.com/prettier/prettier-vscode/blob/main/README.md) — configuration reference
- [remarkjs/vscode-remark - GitHub](https://github.com/remarkjs/vscode-remark) — setup instructions, plugin ecosystem, security note
- [jameslanska/markdown-formatter - GitHub](https://github.com/jameslanska/markdown-formatter) — Rust/WASM implementation, GFM table spec compliance
- [Markdown and Visual Studio Code](https://code.visualstudio.com/docs/languages/markdown) — official VSCode docs confirming no built-in formatter
- [Prettier 1.8: Markdown Support](https://prettier.io/blog/2017/11/07/1.8.0.html) — when Prettier added markdown support
