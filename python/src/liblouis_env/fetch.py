from __future__ import annotations

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import platformdirs
import requests

from .version import GITHUB_RELEASE_BASE, LIBLOUIS_VERSION


class LiblouisNotFoundError(RuntimeError):
    """Raised when lou_translate could not be located or installed."""


def _cache_dir() -> Path:
    d = platformdirs.user_cache_path("liblouis-env") / LIBLOUIS_VERSION
    d.mkdir(parents=True, exist_ok=True)
    return d


def _download(url: str, dest: Path) -> None:
    with requests.get(url, stream=True, timeout=60) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            shutil.copyfileobj(r.raw, f)


def _find_binary(root: Path, name: str) -> Path | None:
    matches = list(root.rglob(name))
    return matches[0] if matches else None


def _fetch_windows(cache_dir: Path) -> Path:
    arch = "win64" if sys.maxsize > 2**32 else "win32"
    zip_path = cache_dir / f"liblouis-{arch}.zip"
    if not zip_path.exists():
        _download(f"{GITHUB_RELEASE_BASE}/liblouis-{LIBLOUIS_VERSION}-{arch}.zip", zip_path)
    extract_dir = cache_dir / arch
    if not extract_dir.exists():
        with zipfile.ZipFile(zip_path) as z:
            z.extractall(extract_dir)
    binary = _find_binary(extract_dir, "lou_translate.exe")
    if binary is None:
        raise LiblouisNotFoundError(
            f"lou_translate.exe not found inside {zip_path} — release layout may have changed."
        )
    return binary


def _fetch_macos(cache_dir: Path) -> Path:
    if shutil.which("brew") is None:
        raise LiblouisNotFoundError(
            "Homebrew not found. Install it from https://brew.sh, then run "
            "`brew install liblouis`, or set LOU_TRANSLATE_PATH yourself."
        )
    subprocess.run(["brew", "install", "liblouis"], check=True)
    prefix = subprocess.run(
        ["brew", "--prefix", "liblouis"], check=True, capture_output=True, text=True
    ).stdout.strip()
    binary = Path(prefix) / "bin" / "lou_translate"
    if not binary.exists():
        raise LiblouisNotFoundError(f"brew installed liblouis but {binary} is missing.")
    return binary


def _fetch_linux(cache_dir: Path) -> Path:
    if shutil.which("lou_translate"):
        return Path(shutil.which("lou_translate"))
    for manager, install_cmd in (
        ("apt-get", ["sudo", "apt-get", "install", "-y", "liblouis-bin"]),
        ("dnf", ["sudo", "dnf", "install", "-y", "liblouis"]),
    ):
        if shutil.which(manager):
            subprocess.run(install_cmd, check=True)
            found = shutil.which("lou_translate")
            if found:
                return Path(found)
    raise LiblouisNotFoundError(
        "Could not find or install lou_translate via apt-get/dnf. Install liblouis "
        "manually for your distro, or set LOU_TRANSLATE_PATH."
    )


def ensure_installed() -> Path:
    cache_dir = _cache_dir()
    if sys.platform == "win32":
        return _fetch_windows(cache_dir)
    if sys.platform == "darwin":
        return _fetch_macos(cache_dir)
    if sys.platform.startswith("linux"):
        return _fetch_linux(cache_dir)
    raise LiblouisNotFoundError(f"Unsupported platform: {sys.platform}")
