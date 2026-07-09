#!/usr/bin/env python3
"""
Generate offline Japanese narration for each cat fact.

Reads the facts straight out of Assets/Scripts/CatFacts.ts (the single source of
truth), synthesizes each one with macOS `say` using a Japanese voice, and writes
index-numbered mp3 clips to Assets/Audio/Facts/fact_XX.mp3. The clip index
matches the position of the fact in CAT_FACTS, so audio can never drift from the
displayed text.

Re-run this whenever you add or edit facts in CatFacts.ts.

Requirements: macOS (`say`), a Japanese voice installed (Kyoko (Enhanced)), and
ffmpeg on PATH.

Usage:
    python3 tools/generate_audio.py
"""
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
CATFACTS_TS = os.path.join(PROJ, "Assets/Scripts/CatFacts.ts")
OUT_DIR = os.path.join(PROJ, "Assets/Audio/Facts")

VOICE = "Kyoko (Enhanced)"
RATE = 150  # words/min — natural narration pace

# Spoken-only reading fixes. macOS TTS misreads some proper nouns (esp. place
# names); map the kanji to its correct kana here. These are applied as substring
# replacements to the SPOKEN text only — the on-screen kanji is never affected.
# Overriding to the correct reading is harmless if the voice already had it right,
# so we pre-seed the well-established tricky readings. Add more after a listen pass.
READING_SUBSTITUTIONS: dict[str, str] = {
    "相島": "あいのしま",      # Ainoshima (Fukuoka) — TTS commonly says "Aishima"
    "青島": "あおしま",        # Aoshima (Ehime) — avoid the "Seitō/Qingdao" reading
    "田代島": "たしろじま",    # Tashirojima (Miyagi)
    "真鍋島": "まなべしま",    # Manabeshima (Okayama)
    "国芳": "くによし",        # Utagawa Kuniyoshi
}


def to_spoken(display: str) -> str:
    spoken = display
    for kanji, kana in READING_SUBSTITUTIONS.items():
        spoken = spoken.replace(kanji, kana)
    return spoken


def extract_facts() -> list[str]:
    """Pull the string literals from NATIVE_CAT_FACTS then CAT_ISLAND_FACTS,
    matching `CAT_FACTS = [...NATIVE_CAT_FACTS, ...CAT_ISLAND_FACTS]`."""
    src = open(CATFACTS_TS, encoding="utf-8").read()
    facts: list[str] = []
    for array_name in ("NATIVE_CAT_FACTS", "CAT_ISLAND_FACTS"):
        m = re.search(array_name + r"\s*:\s*string\[\]\s*=\s*\[(.*?)\]", src, re.S)
        if not m:
            sys.exit(f"ERROR: could not find array {array_name} in CatFacts.ts")
        # Facts contain 「」 but no embedded double quotes, so this is safe.
        facts.extend(re.findall(r'"([^"]+)"', m.group(1)))
    if not facts:
        sys.exit("ERROR: no facts parsed from CatFacts.ts")
    return facts


def main():
    facts = extract_facts()
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Generating {len(facts)} clips with voice '{VOICE}' at rate {RATE} …")

    for i, display in enumerate(facts):
        spoken = to_spoken(display)
        base = os.path.join(OUT_DIR, f"fact_{i:02d}")
        aiff, mp3 = base + ".aiff", base + ".mp3"

        subprocess.run(
            ["say", "-v", VOICE, "-r", str(RATE), "-o", aiff, spoken], check=True)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", aiff,
             "-ac", "1", "-ar", "24000", "-b:a", "64k", mp3], check=True)
        os.remove(aiff)

        tag = " (reading fix)" if spoken != display else ""
        print(f"  fact_{i:02d}.mp3{tag}  {display[:24]}…")

    total = sum(os.path.getsize(os.path.join(OUT_DIR, f))
                for f in os.listdir(OUT_DIR) if f.endswith(".mp3"))
    print(f"Done. {len(facts)} clips, {total/1024:.0f} KB total, in {OUT_DIR}")


if __name__ == "__main__":
    main()
