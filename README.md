# NekoChan 🐱 — 日本の猫豆知識

A Snap Spectacles Lens. A 3D cat sits in your space; tap it and it shares a fact
— in Japanese — about **native Japanese cats** and **Japan's cat islands (猫島)**.

Everything runs **fully on-device**: the facts are bundled with the Lens, so no
internet connection is required and no experimental APIs are used.

## Design goals

| Goal | How it's met |
|------|--------------|
| **Fully local, no internet** | Facts are stored in a bundled TypeScript array; nothing is fetched over the network. The Internet capability is not requested. |
| **Japanese cat history & culture** | Curated facts about native breeds (ジャパニーズボブテイル, 三毛猫…), folklore (招き猫, 猫又…), and cat islands (田代島, 青島, 相島…). |
| **Rendered in Japanese** | A subset of Noto Sans JP is bundled so every kanji/kana glyph renders correctly. |
| **No experimental APIs** | Uses only stable modules: Text, AnimationPlayer, Spectacles Interaction Kit, LSTween, Audio. |

## How it works

```
tap on cat  →  Interactable.onTriggerStart
            →  CatFactAnimator.activateCat(true)
            →  FetchCatFacts.getCatFacts()      // picks a random local fact
            →  catFactReceived event
            →  CatFactAnimator writes it into the thought-bubble Text
```

### Key files

| File | Role |
|------|------|
| `Assets/Scripts/CatFacts.ts` | **The content.** A plain array of Japanese fact strings (native cats + cat islands). Edit here to change what NekoChan says. |
| `Assets/Scripts/FetchCatFacts.ts` | Serves a random fact from `CatFacts.ts`, never repeating the same one twice in a row, and fires the `catFactReceived` event. *(Name kept for historical/scene-wiring reasons — it no longer fetches from the network.)* |
| `Assets/Scripts/CatFactAnimator.ts` | Drives the cat animation state machine (sleep/stand), the thought-bubble fade-in, and the nap/wake messages. Listens for `catFactReceived` and updates the Text. |
| `Assets/Scripts/Events.ts` | Tiny typed pub/sub helper used by the event above. |
| `Assets/Fonts/NekoChanJP.ttf` | Subsetted Noto Sans JP (~305 KB). Assigned to the thought-bubble Text component. |
| `tools/subset_font.py` | Regenerates the font subset (see below). |

## Editing the facts

1. Open `Assets/Scripts/CatFacts.ts` and edit the `NATIVE_CAT_FACTS` /
   `CAT_ISLAND_FACTS` arrays. Keep each fact to roughly **45 full-width
   characters or fewer** so it fits the thought bubble.
2. **Rebuild the font subset** (next section) so any new kanji are included —
   otherwise a new character will render as a blank box (tofu) on-device.
3. Reload the project in Lens Studio and re-test in Preview.

## Rebuilding the font subset

The bundled font contains **only the glyphs the app renders**, which keeps it at
~305 KB instead of several MB. After changing any Japanese text in
`CatFacts.ts` or `CatFactAnimator.ts`, rebuild it:

```bash
cd <project root>
python3 -m venv tools/.venv
./tools/.venv/bin/pip install fonttools brotli
./tools/.venv/bin/python tools/subset_font.py
```

The script downloads Noto Sans JP once (cached in `tools/`), pins it to Medium
weight, subsets to exactly the glyphs used, and writes
`Assets/Fonts/NekoChanJP.ttf`. It **fails loudly if any character in the sources
is missing** from the subset. The output path is stable, so Lens Studio keeps the
same font asset and no scene re-wiring is needed.

## Testing

**In Lens Studio Preview:**
- Tap the cat: a fact appears with real kanji/kana (no blank boxes).
- Tap repeatedly: facts vary and never repeat twice in a row.
- The longest fact wraps inside the bubble without clipping.
- Disable your machine's network — facts still appear, no errors.

**On Spectacles:**
- Put the device in **airplane mode**, launch the Lens → the full experience
  works with no connection.
- Japanese text is crisp and legible at real viewing distance.
- Physical tap reliably advances facts; no hitching over a long session.

## Credits & licensing

Font: **Noto Sans JP**, © The Noto Project Authors, licensed under the
[SIL Open Font License 1.1](Assets/Fonts/OFL.txt). The bundled `NekoChanJP.ttf`
is a subset/instance of that font and is redistributed under the same license.
