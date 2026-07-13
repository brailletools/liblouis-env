# @brailletools/liblouis-env-web

Versioned locator/fetcher for a liblouis browser build (`easy-api.js` + a
`build-*.js` + tables), for client-side/WASM use. Replaces hand-copying these
files into a `static/`/`public/` directory.

## Known limitation: version gap

liblouis's own npm packages (`liblouis`/`liblouis-build`) have been unmaintained
since 2017-2018 (~liblouis C 3.2.0-rc), years behind the `3.38.0` pinned for the
native/Python side of `liblouis-env`. There is no npm-published, current browser
build of liblouis — so this package doesn't depend on npm for any of it.

Instead, both files are fetched directly from GitHub at a pinned commit:

- the build file + tables come from
  [`liblouis/js-build`](https://github.com/liblouis/js-build), which
  continuously auto-builds liblouis **master** (not release tags) — see
  `src/jsBuildVersion.js`
- `easy-api.js` — hand-written JS glue, not compiled output — comes from
  [`liblouis/liblouis-js`](https://github.com/liblouis/liblouis-js), which is
  mostly dormant (last real commit 2020-12-11) but is still the canonical
  source, and is pinned the same way — see `src/easyApiVersion.js`

This means the browser build's underlying liblouis version will never exactly
match `LIBLOUIS_VERSION` from the Python/Node native-binary side. Bump
`JS_BUILD_REF`/`EASY_API_REF` periodically to track upstream.

### `easy-api.js` is patched, not vendored verbatim

The pinned `easy-api.js` sizes its output buffer to exactly the input's byte
length, in both `translateString` and `backTranslateString`. liblouis output
routinely needs more room than the input (numeric/capital indicators,
multi-cell punctuation, grade-2 contraction back-translation, etc.), so the
unmodified file silently overflows the WASM heap for a large fraction of real
inputs — corrupting adjacent allocations and crashing later, typically inside
an unrelated `_free()` call. Since `liblouis-js` is dormant, this bug is
presumably present at every commit, so bumping `EASY_API_REF` alone won't fix
it.

`fetchEasyApi()` (`src/fetchEasyApi.js`) applies a fix — see
`src/patchEasyApi.js` — to the downloaded source before caching/vendoring it,
giving the output buffer a generous fixed-minimum margin instead. If
`EASY_API_REF` is ever bumped and `patchEasyApi`'s string match no longer
finds the buggy block, it throws rather than silently vendoring the
unpatched, unsafe file — update `src/patchEasyApi.js` to match the new
upstream shape when that happens.

## Usage

```
npx liblouis-fetch-web ./static/liblouis
```

Writes `easy-api.js`, a build file, (if needed) a `tables/` directory, and a
`manifest.json` describing what was written, into the destination directory.
Consumers should read `manifest.json` at runtime rather than hardcoding
filenames — the exact build variant (tables-embedded vs. no-tables) depends on
what the pinned `js-build` commit happens to ship:

```json
{
  "easyApiFile": "easy-api.js",
  "buildFile": "build-no-tables-utf32.js",
  "variant": "no-tables",
  "tablesDir": "tables"
}
```

When `variant` is `"no-tables"`, the consumer must call
`asyncLiblouis.enableOnDemandTableLoading(tablesUrl)` on the `EasyApiAsync`
instance before use (see `@brailletools/braille2latex`'s `configure()` and
webeditor's `+page.svelte` for a working example).

> **Important:** `tablesUrl` (and any `liblouisTablesUrl` passed to
> `configure()`) **must end with a trailing slash**, e.g.
> `"https://example.com/static/liblouis/tables/"`. `easy-api.js` appends
> table filenames with a plain string concatenation, not URL joining, so a
> missing trailing slash will cause table loads to silently fail with a
> wrong URL.

## Installing in a consuming repo (pnpm)

```
pnpm add -D "@brailletools/liblouis-env-web@github:brailletools/liblouis-env#path:/js/packages/web"
```

Then chain the fetch into your dev/build scripts (pnpm doesn't run
`pre`/`post` lifecycle scripts by default, so call it explicitly):

```json
{
  "scripts": {
    "dev": "liblouis-fetch-web static/liblouis && vite dev",
    "build": "liblouis-fetch-web static/liblouis && vite build"
  }
}
```

## Developing this package

```
pnpm install
pnpm test
```
