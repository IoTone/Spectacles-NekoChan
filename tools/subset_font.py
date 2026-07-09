#!/usr/bin/env python3
"""
Rebuild the bundled Japanese font (Assets/Fonts/NekoChanJP.ttf).

The Lens ships a *subset* of Noto Sans JP containing only the glyphs the app
actually renders, so the font stays ~300 KB instead of several MB. Re-run this
whenever you add or edit text in CatFacts.ts or CatFactAnimator.ts.

Usage:
    python3 -m venv .venv && ./.venv/bin/pip install fonttools brotli
    ./.venv/bin/python tools/subset_font.py

It will download the Noto Sans JP variable font on first run (cached in tools/).
The output keeps the same file path, so Lens Studio's font asset GUID is
preserved and no scene re-wiring is needed.
"""
import os
import urllib.request
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SRC_FILES = [
    os.path.join(PROJ, "Assets/Scripts/CatFacts.ts"),
    os.path.join(PROJ, "Assets/Scripts/CatFactAnimator.ts"),
]
VF_CACHE = os.path.join(HERE, "NotoSansJP-VF.ttf")
VF_URL = "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"
OUT = os.path.join(PROJ, "Assets/Fonts/NekoChanJP.ttf")
WEIGHT = 500  # Medium — friendly and readable in AR


def collect_codepoints() -> list[int]:
    """Every glyph used by the app, plus safety ranges for small future edits."""
    chars = set()
    for path in SRC_FILES:
        for ch in open(path, encoding="utf-8").read():
            if (ord(ch) > 0x2000 or ch in "!.,:;'\"()[]{}") and not ch.isspace():
                chars.add(ch)

    def add_range(lo, hi):
        chars.update(chr(cp) for cp in range(lo, hi + 1))

    add_range(0x0020, 0x007E)   # basic ASCII
    add_range(0x3040, 0x309F)   # Hiragana
    add_range(0x30A0, 0x30FF)   # Katakana
    add_range(0x3000, 0x303F)   # CJK symbols & punctuation（、。「」・… etc.）
    add_range(0xFF00, 0xFF60)   # Fullwidth ASCII variants
    add_range(0xFF61, 0xFF9F)   # Halfwidth katakana
    return sorted(ord(c) for c in chars)


def main():
    if not os.path.exists(VF_CACHE):
        print("Downloading Noto Sans JP variable font …")
        urllib.request.urlretrieve(VF_URL, VF_CACHE)

    unicodes = collect_codepoints()
    kanji = sum(1 for cp in unicodes if 0x4E00 <= cp <= 0x9FFF)
    print(f"Subsetting to {len(unicodes)} codepoints ({kanji} kanji).")

    # Pin the variable font to a single weight, then subset.
    font = TTFont(VF_CACHE)
    instantiateVariableFont(font, {"wght": WEIGHT}, inplace=True)

    ss = subset.Subsetter(options=subset.Options(
        layout_features="*", name_IDs="*", recalc_bounds=True, glyph_names=False))
    ss.options.drop_tables += ["DSIG"]
    ss.populate(unicodes=unicodes)
    ss.subset(font)

    # Clean, unambiguous names so Lens Studio's picker shows "NekoChan JP".
    name = font["name"]
    for nid, val in {1: "NekoChan JP", 2: "Regular", 4: "NekoChan JP",
                     6: "NekoChanJP", 16: "NekoChan JP", 17: "Regular"}.items():
        name.setName(val, nid, 3, 1, 0x409)  # Windows / Unicode / US-English
        name.setName(val, nid, 1, 0, 0)      # Mac / Roman

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    font.save(OUT)

    # Fail loudly if any character in the sources is not covered.
    cmap = set(TTFont(OUT).getBestCmap().keys())
    missing = {ch for path in SRC_FILES
               for ch in open(path, encoding="utf-8").read()
               if ord(ch) > 0x2000 and not ch.isspace() and ord(ch) not in cmap}
    if missing:
        raise SystemExit(f"ERROR: glyphs missing from subset: {sorted(missing)}")

    print(f"Wrote {OUT} ({os.path.getsize(OUT):,} bytes) — all content glyphs covered.")


if __name__ == "__main__":
    main()
