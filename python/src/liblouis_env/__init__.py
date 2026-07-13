from __future__ import annotations

import os
import shutil
from pathlib import Path

from .fetch import ensure_installed, ensure_tables_installed
from .version import LIBLOUIS_VERSION

__all__ = [
    "get_lou_translate",
    "resolve_lou_translate",
    "get_liblouis_tables",
    "resolve_liblouis_tables",
    "LIBLOUIS_VERSION",
]


def resolve_lou_translate() -> Path | None:
    """Resolve a working lou_translate binary path, without installing anything.

    Resolution order:
      1. LOU_TRANSLATE_PATH env var, if set
      2. lou_translate already on PATH

    Returns None if neither is found — never fetches/installs, never touches
    the network. The Python analog of the Node package's resolveLouTranslate();
    safe to call from tools that shouldn't surprise users with network access
    or sudo prompts.
    """
    if override := os.environ.get("LOU_TRANSLATE_PATH"):
        return Path(override)

    if found := shutil.which("lou_translate"):
        return Path(found)

    return None


def get_lou_translate() -> Path:
    """Return a usable path to the lou_translate binary, fetching/installing it if needed.

    Resolution order:
      1. LOU_TRANSLATE_PATH env var, if set (escape hatch for unusual setups)
      2. lou_translate already on PATH
      3. platform-specific fetch/install (see fetch.py), cached under a
         version-specific directory so upgrades don't collide with old binaries
    """
    return resolve_lou_translate() or ensure_installed()


def resolve_liblouis_tables() -> Path | None:
    """Resolve the liblouis tables directory, without downloading anything.

    Checks the LOUIS_TABLE_PATH env var (the same variable liblouis's own
    tools read) — the first entry, if it's an OS-path-separated list.
    Returns None if unset, never touches the network.
    """
    if override := os.environ.get("LOUIS_TABLE_PATH"):
        return Path(override.split(os.pathsep)[0])

    return None


def get_liblouis_tables() -> Path:
    """Return a usable path to the liblouis tables directory, downloading it if needed.

    Resolution order:
      1. LOUIS_TABLE_PATH env var, if set
      2. downloaded from the pinned release's source tarball (see fetch.py),
         cached under a version-specific directory
    """
    return resolve_liblouis_tables() or ensure_tables_installed()
