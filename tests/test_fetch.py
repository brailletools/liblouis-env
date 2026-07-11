import subprocess

from liblouis_env import get_lou_translate


def test_get_lou_translate_returns_working_binary():
    path = get_lou_translate()
    assert path.exists()

    result = subprocess.run(
        [str(path), "en-ueb-g2.ctb"],
        input="hello",
        capture_output=True,
        text=True,
        check=True,
    )
    assert result.stdout.strip()
