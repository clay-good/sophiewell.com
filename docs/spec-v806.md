# spec-v806.md — PSS-10 (Perceived Stress Scale)

> Status: **SHIPPED (2026-08-26).** Builds the `pss10` tile. Catalog **1597 → 1598**, group G.

## Why

spec-v780 and spec-v785 opened the clinician-wellbeing vein with two burnout inventories.
The PSS-10 is the measure that sits underneath both — the standard instrument for *perceived
stress*, and the one most often scored wrong.

## What it does

Ten items, 0 (never) to 4 (very often), total **0–40**, higher is more perceived stress.

**Items 4, 5, 7 and 8 are reverse scored.** They are the positively worded ones, and
reversing them is the entire difficulty of the instrument. The tile takes the raw answer and
applies the direction itself.

That structure gives the headline test: **answering every item the same way does *not* give a
uniform total.** All-zeros scores **16**, all-twos scores **20**, all-fours scores **24** — a
naive summer would return 0, 20 and 40. Reaching the true extremes requires answering the
reversed items the other way, which the tests do explicitly.

**Worked example:** every item answered 2 → **20 of 40**.

## No cutoff, and that is a verified fact

**The developer has never published score cut-offs and the scale is not a diagnostic
instrument.** Bands circulating online are not theirs. The tile reports the total, applies no
threshold, and says so in the result line; `abnormal` stays false even at 40, which a test
asserts.

This is the strongest version of a posture I have taken repeatedly this run — but here the
absence of a cutoff is itself documented by the source, rather than merely unfound by me.

## Licensing

The item wording is distributed under licence through Mapi Trust, so **it is not reproduced**.
Each item carries its number and its scoring direction, which is what a scorer actually needs
— the same approach spec-v785 took for the OLBI.

## Files

- `lib/pss10-v806.js` — `pss10()`, `PSS10_NOTE`, `REVERSE_SCORED`.
- `views/group-v806.js` (RV806) — ten 0–4 selects with literal DOM ids, per the spec-v785 rule; a11y-checked.
- `mcp/adapters/pss10-v806.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, scoring, the reverse list, the no-cutoff statement, related (cbi, olbi, k6).
- `test/unit/pss10.test.js` — 6 tests (the reverse list, non-uniform totals, both true extremes, opposite movement of a forward vs reverse item, nothing flagged at 40, required and bounded input).
- `docs/spec-v806.md` (this file).

## Gate note

`check-page-copy`'s 775-row cut ratchet fired again, exactly as in spec-v801, and the fix was
the same: shorten the **first sentence** of the adapter summary, not the summary as a whole,
because the hub and topic rows are cut at the first sentence boundary.

## A latent defect this tile surfaced, and fixed

Adding PSS-10 turned three MCP tests red — all of them asserting that a query which matches
nothing returns `NO_MATCH`. `answer_query` had started pointing "what is the meaning of life"
at the **Dermatology Life Quality Index**.

I isolated it rather than guessing: stashing the tile made the tests pass, and the candidate
list explained why. Before PSS-10 the ranker returned `crop-index, integrative-weaning-index,
dlqi, pk-suite` for that nonsense query; after, it returned `dlqi, pk-suite`. Adding any tile
shifts term frequencies, and that was enough to float `dlqi` to the top.

But the ranking was only the trigger. **The defect was in `queryNamesTile`**, which asked
`nameMatch(...).score > 0` — true when a *single* word of a tile's name appears anywhere in
the query. "life" is one word of five in DLQI's name. So the guard meant to stop `answer_query`
naming a calculator the caller never asked about did not stop it; it had simply never been
pointed at a tile whose name contained a common English word.

The fix uses `namesInFull` from `lib/name-match.js` — already imported, already shared with
the website so both surfaces rank names the same way, and already documented as requiring
**every** token of the name. "wells score for PE" names *Wells Score for PE* in full and still
returns `NO_VALUES`; "meaning of life" supplies one word of five and correctly returns
`NO_MATCH`.

The regression test pins **the rule rather than the ranking**, since the ranking is what moved:
`quality of life` and `index` must miss, and the full DLQI name must hit. MCP: 416/416.

## Sourcing (spec-v97)

Cohen S, Kamarck T, Mermelstein R. *J Health Soc Behav.* 1983;24(4):385-396 (PMID 6668417).
The 0–4 anchors, the reverse-scored set {4, 5, 7, 8} and the 0–40 range were confirmed against
two independent sources that agreed on all three. The absence of a published cutoff is stated
explicitly by the outcome-measure registry that distributes the scale, which is why it ships
as a fact about the instrument rather than as my failure to find one.
