# spec-v508.md — Voice Handicap Index-10 (VHI-10) tile

> Status: **SHIPPED (2026-07-23).** Builds the `vhi10` tile — the 10-item Voice Handicap Index, total 0-40.
> Catalog **1357 → 1358**, group G.

## Why

Laryngology was a **whole-concept gap**: `voice handicap`, `dysphonia`, `hoarseness`, and `grbas` were all
zero-hit across the corpus. The VHI-10 is the standard patient-reported voice outcome measure — the number an
ENT or voice clinic records at the first visit and tracks through therapy.

> **Note on numbering:** spec-v507 and MCP wave 332 were used by a tile that was shipped and then reverted the
> same day as a duplicate (see the *Duplicate check* section). Those numbers are burned; this spec takes v508.

## What it does

The patient rates ten statements 0 (never) to 4 (always); the tile sums them and compares to the threshold.

- `lib/vhi10-v508.js` — pure answers → total. Exports `VHI10_ITEMS` (the ten statements) so the renderer and
  the tests share one source of wording. Total 0-40; **11 or more** is the commonly cited abnormal threshold.
  Rejects a missing item, a non-integer, and anything outside 0-4.
- `views/group-v508.js` (RV508) — ten selects (dom `vhi-q1` … `vhi-q10`), each with a real `<label for>`,
  generated from `VHI10_ITEMS`; surfaces the lib's validation message rather than a half-result.
- `lib/meta.js` — Rosen and colleagues 2004 (Laryngoscope) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v227 → v228); corpus → 1358.

**HIGH-STAKES:** it sums the answers the patient gives. It is **not** a diagnosis, **not** a laryngeal
examination, and **not** an indication for laryngoscopy, therapy, or surgery
([spec-v11](spec-v11.md) §5.3). A high score reflects how much handicap the patient *perceives*, not what is
causing it, and the copy states that **persistent hoarseness warrants laryngeal visualization regardless of
the score** — the one thing a low score must not be read as permission to skip.

**Item-wording note:** item 10 is conventionally quoted as a question others ask the patient. It is written
without quotation marks or an apostrophe to stay inside this codebase's string rules, with the meaning
preserved.

## Duplicate check (the procedure that failed earlier today)

Before building, the candidate was checked four ways — eponym/abbreviation (`vhi`), full name words (`voice
handicap index`), a related-instrument probe (`grbas`, `dysphonia`), each against **both** `corpus.json` and
`app.js`; plus `ls test/unit/<slug>.test.js` and a `lib/` scan. All clean. The earlier `hearing-loss-degree`
tile was reverted because only the first of those checks had been run, and the existing `pure-tone-average`
tile (group E, inside the shared `oneformula-v167.js`) was invisible to it.

## Sourcing (spec-v97)

- **Citation:** Rosen CA, Lee AS, Osborne J, Zullo T, Murry T. Development and validation of the Voice Handicap
  Index-10. *Laryngoscope.* 2004;114(9):1549-1556.
- Cross-verified against laryngology references reproducing the same ten items, the same 0-4 per-item scale,
  and the commonly cited abnormal threshold of 11.

## Verification

Lint (all catalog-truth surfaces at 1358), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: the example answers total 18 and read as at-or-above threshold, 10 versus 11 flips the wording, and
the tile does not scroll horizontally at 320px.

## Out of scope

The tile does not administer the full 30-item VHI, compute subscale scores (functional, physical, emotional),
or track change over time. The GRBAS perceptual rating is a separate build. The MCP adapter + golden-probe
promotion follow in the next wave (333).
