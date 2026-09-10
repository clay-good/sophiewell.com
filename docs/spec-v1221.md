# spec-v1221 — the probe that had half the vocabulary

[spec-v1192](spec-v1192.md) closed with a named deferral: `ASKING` carries
`cannot be` for range refusals, it had matched a tile's own option label, and
three rows on `reference-change-value` were exempt on that phrase alone. *"That is
a one-tile question now, and a wave of its own."*

**That deferral is already closed.** [spec-v1196](spec-v1196.md)'s movement rule —
match the vocabulary against what a reading **added**, not against all of it —
removed the exemption, and `probe-static-exemption` now reads two rows, neither of
them `reference-change-value`. Checking a ledger line before working it is the
cheap half of this wave.

The expensive half is what checking it turned up.

## One sibling learned the rule; the other did not

`one-blank-field.spec.js` and `one-blank-field-probe.spec.js` ask the same
question — clear one field of a filled worked example, and see whether the tile
recomputes in silence. The gate got spec-v1196's movement rule. The probe did not,
and it was **also missing half the vocabulary**:

| | `one-blank-field.spec.js` (gate) | `one-blank-field-probe.spec.js` (report) |
| --- | --- | --- |
| matches against | what the reading **added** | the **whole** reading |
| vocabularies | `ASKING` **and** `DISCLOSING` | `ASKING` only |

The second row is the one that mattered. A tile that says what it is missing
rather than asking for it is disclosing perfectly well, and this probe had no word
for it. `glasgow-imrie` drops an item to *"Age > 55 years: **not assessed**"* and
retitles itself *"7 of 8 items assessed (partial 48-hour panel)"*;
`kings-college-nonapap` says *"Age under 10 or over 40 years: **not entered**"*.
Both were being reported as though they had recomputed from the blank.

Shard 0 goes from **20 rows to 2**.

The same shape as [spec-v1216](spec-v1216.md)'s `r1`: a fix applied to one copy
and not its sibling. Neither file is wrong on its own terms; they simply stopped
agreeing, and nothing was checking that they still did.

## The two that survive, and what they are

Both are one limitation of the shared `addedText`, and it is worth naming because
the **gate** uses it too.

`addedText` splits on sentence boundaries. A reading that runs values together
without punctuation has none to split on:

```js
addedText('Anion gap: 26Albumin-corrected AG: 26delta-AG = 14…',
          'Anion gap: 26delta-AG = 14…')
// -> the whole 92-character block, reported as ADDED

addedText('Anion gap: 26. Albumin-corrected AG: 26. Ratio 1.40.',
          'Anion gap: 26. Ratio 1.40.')
// -> '' , which is correct
```

So `anion-gap-dd`, whose optional albumin removes one line and adds nothing, reads
as a reading that added ninety-two characters. `carboxyhemoglobin` is the same.
Neither tile fabricates anything; the helper cannot see that.

**This makes the gate stricter, not looser** — a tile that only loses a line looks
like one that disclosed nothing — so the risk it carries is a false failure and
the exemption ledger that would be written to silence it. spec-v1056's line
applies: *a tile exempted for nothing is a tile the gate is not protecting.*
Teaching `addedText` to segment a reading that has no sentence punctuation is the
next chunk, and it belongs with the gate rather than in a report.

## Scope, honestly

This file is a **report**, not a gate — it ends `expect(true).toBe(true)` — and
`playwright.config` excludes `**/*-probe.spec.js` unless `RUN_PROBES=1`, so it
never runs in CI. The defect was therefore under-reporting real work, not a
disabled check, and this change carries no CI risk.

One measurement caveat: the 20-row figure is from a run taken **after** the
movement-rule edit and before the vocabulary edit, so it is not a pristine
baseline. Narrowing a match from the whole reading to the added text can only
remove exemptions and add rows, never the reverse, so 20 is at or above what the
shipped version reported. The 20 → 2 drop is entirely attributable to
`DISCLOSING`.

## Proof

`RUN_PROBES=1 npx playwright test test/integration/one-blank-field-probe.spec.js
--project=chromium -g "shard 1"` prints `PROBEHITS shard0 n=2`, against `n=20`
before. The `addedText` behaviour above is reproduced directly rather than
inferred. Lint (19 gates) passes; no library, view or unit test changed.
