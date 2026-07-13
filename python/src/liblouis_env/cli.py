"""liblouis-fetch / liblouis-fetch-tables: explicitly resolve/install
lou_translate or the tables directory ahead of time.

Useful in CI or Docker builds where you don't want the first import of a
consuming script to trigger a network call.
"""

from . import get_liblouis_tables, get_lou_translate


def main() -> None:
    path = get_lou_translate()
    print(path)


def main_tables() -> None:
    path = get_liblouis_tables()
    print(path)


if __name__ == "__main__":
    main()
