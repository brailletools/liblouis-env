from __future__ import annotations

import os
import shutil
from pathlib import Path

from .fetch import ensure_installed
from .version import LIBLOUIS_VERSION

__all__ = ["get_lou_translate", "resolve_lou_translate", "LIBLOUIS_VERSION"]


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
