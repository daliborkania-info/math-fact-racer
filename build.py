#!/usr/bin/env python3
"""Assemble the single-file game from the sources in src/.

Outputs:
  index.html          the playable page, everything inlined
  dist/artifact.html  the same page without the html/head/body wrapper,
                      for hosts that supply their own document skeleton

Run it from anywhere:  python3 build.py
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
DIST = ROOT / "dist"


def read(name: str) -> str:
    path = SRC / name
    if not path.exists():
        sys.exit(f"missing source file: {path}")
    return path.read_text(encoding="utf-8").rstrip("\n")


def build() -> str:
    page = read("index.template.html")
    for marker, source in (
        ("/*<<STYLES>>*/", read("styles.css")),
        ("/*<<I18N>>*/", read("i18n.js")),
        ("/*<<APP>>*/", read("app.js")),
    ):
        if marker not in page:
            sys.exit(f"marker {marker} not found in the template")
        page = page.replace(marker, source)
    return page + "\n"


def strip_wrapper(page: str) -> str:
    """Remove the document skeleton for hosts that provide their own."""
    out = page
    for pattern in (
        r"<!DOCTYPE html>\s*",
        r'<html lang="en">\s*',
        r"</html>\s*",
        r"<head>\s*",
        r"</head>\s*",
        r"<body>\s*",
        r"</body>\s*",
        r"<meta[^>]*>\s*",
        r'<link rel="manifest"[^>]*>\s*',
        r'<link rel="icon"[^>]*>\s*',
        r'<link rel="apple-touch-icon"[^>]*>\s*',
    ):
        out = re.sub(pattern, "", out)
    # the service worker lives on the hosted copy only
    out = re.sub(r'<script>\s*/\* Register the offline worker.*?</script>\s*', "", out, flags=re.S)
    return out.strip() + "\n"


def main() -> None:
    page = build()
    (ROOT / "index.html").write_text(page, encoding="utf-8")
    DIST.mkdir(exist_ok=True)
    (DIST / "artifact.html").write_text(strip_wrapper(page), encoding="utf-8")
    print(f"index.html          {len(page) // 1024} kB")
    print(f"dist/artifact.html  {len(strip_wrapper(page)) // 1024} kB")


if __name__ == "__main__":
    main()
