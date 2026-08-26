# spec-v781.md — STarT Back Screening Tool

> Status: **SHIPPED (2026-08-26).** Builds the `startback` tile. Catalog **1572 → 1573**, group G.

## Why

The catalog could measure back and neck **disability** — `oswestry-odi`,
`roland-morris-disability`, `neck-disability-index` — but had nothing on the psychosocial
axis that actually predicts who stays disabled. A sweep for STarT Back, fear-avoidance, pain
catastrophizing and kinesiophobia returned nothing.

STarT Back is the tool that turns that axis into a decision: it is what stratified-care
pathways in primary care key on when choosing how much treatment someone gets.

## What it does

Nine items about the last two weeks.

- **Items 1–8** are agree/disagree and score **1 for agree**.
- **Item 9** rates overall bothersomeness on five levels and scores **1 only for "very much"
  or "extremely"** — not at all, slightly and moderately all score 0.

| Number | Covers | Range |
| --- | --- | --- |
| Total | all nine items | 0–9 |
| Psychosocial subscore | items 5–9 only | 0–5 |

**Risk group needs both numbers:**

| Group | Rule |
| --- | --- |
| Low | total ≤ 3 |
| Medium | total ≥ 4 **and** subscore ≤ 3 |
| High | total ≥ 4 **and** subscore ≥ 4 |

**The group, not the total, is the output.** A total of **7** with a subscore of 3 is
*medium*; a total of **5** where all five points are psychosocial is *high*. Both cases are
pinned by tests, because a tool that reported only the total would rank those two backwards.

**Worked example:** items 1–6 endorsed plus "extremely" bothersome → total **7 of 9**,
subscore **3 of 5**, **medium risk**.

## Posture (spec-v97)

A prognostic screen for matching treatment intensity to risk. Not a diagnosis, and it does
**not** identify serious spinal pathology — red flags are assessed separately. Only neutral
item-topic labels ship; the form wording is Keele University copyright, free for clinical use.

## Files

- `lib/startback-v781.js` — `startBack()`, `STARTBACK_NOTE`.
- `views/group-v781.js` (RV781) — eight checkboxes and one five-level select; a11y-checked.
- `mcp/adapters/startback-v781.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, scoring + the three group rules, related (roland-morris-disability, oswestry-odi, neck-disability-index).
- `test/unit/startback.test.js` — 7 tests (0, the bothersomeness threshold, the 7-is-medium worked example, the 5-is-high inversion, the 3/4 boundary, subscore membership, invalid input).
- `docs/spec-v781.md` (this file).

## Sourcing (spec-v97)

Hill JC, Dunn KM, Lewis M, et al. *Arthritis Rheum.* 2008;59(5):632-641 (PMID 18438893). The
nine items, the agree=1 scoring, the item-9 rule where only the top two levels score, the
items 5–9 subscore and the three-group classification were read off the Keele University form
itself and cross-checked against an independent description, which agreed on every element.
