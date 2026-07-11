# spec-v289.md — Two-intent queries: coverage wins the synonym tie-break

> Status: **BUILT (2026-07-10).** Fourth ranker-program slice gated by the
> [spec-v285](spec-v285.md) golden set. One function (`matchSynonym`, `lib/synonyms.js`), both
> surfaces, no signature or table-format change.

## Why

The synonym matcher's tier 3 (a phrase contained in the typed query) broke ties by *shorter
phrase first*. For a two-intent query — "anticoagulation bleeding risk atrial fibrillation" —
both "atrial fibrillation" (chads) and "anticoagulation bleeding risk" (hasbled) match, and the
shorter one won, routing a bleeding question to a stroke-risk score. This was the last
multi-slice "known limitation" recorded in the golden set apart from derivational stemming.

## What shipped

Tier-3 ties now prefer the **longer** phrase: the phrase covering more of the typed query is
the dominant intent; the shorter match is the incidental mention. Tier 2 (query contained in a
phrase) keeps *shorter first* — there, the tightest phrase around the query is the most
specific reading. Tier order, audience boost, and the exact-match tier are untouched.

## Verification

Two new `matchSynonym` unit tests pin the flip (tier-3 coverage win, tier-2 tightness
preserved); the two-intent probe joined the golden set (77 → 78, all top-3, marquee afib
routes — "stroke risk afib" → chads, "afib bleeding risk" → hasbled — unchanged). Full suites
green: unit 7,571; `test:mcp` 158; lint; build; 30-test chromium smoke sweep. The golden set's
sole remaining recorded limitation is transfuse/transfusion derivational folding (the ing/ion
stem work).
