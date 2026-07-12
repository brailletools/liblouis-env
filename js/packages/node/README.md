# @brailletools/liblouis-env

Cross-platform locator/installer for the [liblouis](https://liblouis.io) `lou_translate`
binary, for Node.js CLI/subprocess use. The Node.js counterpart to the Python
[`liblouis-env`](../../../README.md) package — same version pin, same resolution
strategy, ported to JS.

## Usage

```js
import { resolveLouTranslate, getLouTranslate } from '@brailletools/liblouis-env';

// Resolve-only: checks LOU_TRANSLATE_PATH env var and PATH. Returns null if not
// found. Never installs anything, never touches the network — safe to call from
// inside a CLI tool without surprising the user.
const path = resolveLouTranslate();

// Full resolution: resolveLouTranslate(), falling back to a platform-specific
// fetch/install (brew/apt/dnf/GitHub release zip) if nothing is found.
const path2 = await getLouTranslate();
```

## Installing in a consuming repo (pnpm)

```
pnpm add "@brailletools/liblouis-env@github:brailletools/liblouis-env#path:/js/packages/node"
```

## Explicit fetch (CI / Docker)

```
npx liblouis-fetch
```

Resolves/installs `lou_translate` and prints its path.

## Developing this package

```
pnpm install
pnpm test
```
