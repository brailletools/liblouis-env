# liblouis-env

Cross-platform locator/installer for [liblouis](https://liblouis.io), for three access modes used across brailletools projects (braille2latex, brailleocr, webeditor):

- **Python CLI/subprocess access** — [`python`](python/README.md)
  (`liblouis-env`): locates/installs the native `lou_translate` binary.
- **Node.js CLI/subprocess access** — [`js/packages/node`](js/packages/node/README.md)
  (`@brailletools/liblouis-env`): same resolution strategy, ported to JS.
- **Browser/WASM access** — [`js/packages/web`](js/packages/web/README.md)
  (`@brailletools/liblouis-env-web`): fetches/vendors a liblouis browser build + tables.

liblouis is not published on conda-forge, PyPI, or (in a currently-maintained form) npm, so every project that needs it previously had to document a platform-specific manual install step, hand-vendor build artifacts, or hardcode a path to the resulting binary. This repo centralizes all of that in one place, including a working path on Windows (where liblouis has no package manager at all — the official GitHub release zip is the only source) and in the browser (where the official npm packages are abandoned — see [`js/packages/web/README.md`](js/packages/web/README.md) for how that's handled). 

The native/Python/Node side share one version pin (`python/src/liblouis_env/version.py`, kept in sync with `js/packages/node/src/version.js` by a test); the browser side tracks a separate upstream source and pin (see `js/packages/web/README.md`).

## Python

See [`python/README.md`](python/README.md).

```
cd python
pixi install
pixi run test
```

## Node.js and browser

- **Node CLI/subprocess** — [`js/packages/node`](js/packages/node/README.md)
  (`@brailletools/liblouis-env`). Install with:
  ```
  pnpm add "@brailletools/liblouis-env@github:brailletools/liblouis-env#path:/js/packages/node"
  ```
- **Browser/WASM** — [`js/packages/web`](js/packages/web/README.md)
  (`@brailletools/liblouis-env-web`). Install with:
  ```
  pnpm add -D "@brailletools/liblouis-env-web@github:brailletools/liblouis-env#path:/js/packages/web"
  ```

Both live under `js/` as a pnpm workspace, developed independently of the Python package:

```
cd js
pnpm install
pnpm test
```
