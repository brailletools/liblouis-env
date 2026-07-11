# liblouis-env

Cross-platform locator/installer for the [liblouis](https://liblouis.io) `lou_translate` binary. liblouis is not published on conda-forge or PyPI, so every project that shells out to it (braille2latex, brailleocr, webeditor) previously had to document a platform-specific manual install step, and hardcode a path to the resulting binary. This package centralizes that logic in one place, including a working path on Windows (where liblouis has no package manager at all — the official GitHub release zip is the only source).

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
     [liblouis GitHub release](https://github.com/liblouis/liblouis/releases) and extracts
     `lou_translate.exe`
   - **macOS**: `brew install liblouis`
   - **Linux**: `apt-get install liblouis-bin` or `dnf install liblouis`

The pinned version lives in `src/liblouis_env/version.py` — update it there to roll
liblouis forward for all three consuming repos at once.

## Installing in a consuming repo

Add to `pixi.toml`:

```toml
[pypi-dependencies]
liblouis-env = { git = "https://github.com/brailletools/liblouis-env.git", tag = "v0.1.0" }
```

or with plain pip:

```
pip install git+https://github.com/brailletools/liblouis-env.git@v0.1.0
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
