# liblouis-env (Python)

Cross-platform locator/installer for the [liblouis](https://liblouis.io) `lou_translate`binary, for Python subprocess use. See the [repo-level README](../README.md) for the Node.js and browser/WASM counterparts.

## Usage

```python
from liblouis_env import get_lou_translate

LOU_TRANSLATE = get_lou_translate()  # Path to a working lou_translate binary
```

`get_lou_translate()` resolves, in order:

1. the `LOU_TRANSLATE_PATH` environment variable, if set
2. `lou_translate` already on `PATH`
3. a platform-specific fetch/install, cached under a version-specific directory:
   - **Windows**: downloads the official `win64`/`win32` zip from the pinned
     [liblouis GitHub release](https://github.com/liblouis/liblouis/releases) and extracts     `lou_translate.exe`
   - **macOS**: `brew install liblouis`
   - **Linux**: `apt-get install liblouis-bin` or `dnf install liblouis`

`resolve_lou_translate()` does only steps 1-2 — returns `None` instead of falling back to
a fetch/install, for callers that don't want to risk a surprise network call or `sudo`
prompt (the Python analog of the Node package's `resolveLouTranslate()`).

The pinned version lives in `src/liblouis_env/version.py` — update it there to roll liblouis forward for the native/Python/Node side at once (`../js/packages/node/src/version.js` is kept in sync automatically by a test; the browser side tracks separately, see `../js/packages/web/README.md`). A weekly CI check (`../.github/workflows/check-liblouis-release.yml`) files a GitHub issue when a newer liblouis release exists — it doesn't bump the pin itself, since that's a deliberate human decision.

### Translation tables

```python
from liblouis_env import get_liblouis_tables

TABLE_PATH = get_liblouis_tables()  # Path to a directory of .ctb/.utb/etc. tables
```

`get_liblouis_tables()` resolves, in order:

1. the `LOUIS_TABLE_PATH` environment variable, if set (same variable liblouis's own tools read; first entry used if it's an OS-path-separated list)
2. downloaded from the pinned release's source tarball on GitHub and cached under a version-specific directory (the platform binary zips don't reliably include the full table set)

`resolve_liblouis_tables()` does only step 1 — returns `None` instead of downloading, same rationale as `resolve_lou_translate()`.

## Installing in a consuming repo

Add to `pixi.toml`:

```toml
[pypi-dependencies]
liblouis-env = { git = "https://github.com/brailletools/liblouis-env.git", tag = "v0.1.0", subdirectory = "python" }
```

or with plain pip:

```
pip install "git+https://github.com/brailletools/liblouis-env.git@v0.1.0#subdirectory=python"
```

## Explicit fetch (CI / Docker)

```
liblouis-fetch
```

Resolves/installs `lou_translate` and prints its path, without waiting for a consuming
script's first import to trigger the network call.

## Developing this package

```
pixi install
pixi run test
pixi run lint
```
