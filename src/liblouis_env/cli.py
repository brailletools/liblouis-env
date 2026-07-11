"""liblouis-fetch: explicitly resolve/install lou_translate ahead of time.

Useful in CI or Docker builds where you don't want the first import of a
consuming script to trigger a network call.
"""

from . import get_lou_translate


def main() -> None:
    path = get_lou_translate()
    print(path)


if __name__ == "__main__":
    main()
