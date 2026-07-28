# spec-v566.md — NIH-CPSI tile

> Status: **SHIPPED (2026-07-28).** Builds the `nih-cpsi` tile — NIH Chronic Prostatitis Symptom Index.
> Catalog **1415 → 1416**, group G.

## Why

`cpsi` and `prostatitis` were both zero-hit, and `grep -c "id: 'nih-cpsi'" app.js` returned 0.

## What it does

| Subscale | Items | Range |
| --- | --- | --- |
| Pain | 1a-1d, 2a, 2b, 3, 4 | 0-21 |
| Urinary | 5, 6 | 0-10 |
| Quality-of-life impact | 7, 8, 9 | 0-12 |
| **Total** | sum of subscales | **0-43** |

All items refer to **the last week**.

## The four rules a plausible implementation breaks

**1. Nine numbered questions, thirteen scored items — and both counts are correct.** The literature calls
this a 13-item index; the form shows 9 questions. Q1 has four yes/no sub-parts and Q2 has two, so 4 + 2 + 7
= 13. Someone who has met only one of the counts will think the other describes a different instrument.

**2. The per-item ranges are heterogeneous, and one item carries ~23% of the total.** Six items are 0-1, two
0-3, three 0-5, one 0-6, and the average-pain rating 0-10 — worth **ten times** any one yes/no item. Every
field has its own option list; a test asserts the exact distribution (`{1:6, 3:2, 5:3, 6:1, 10:1}`).

**3. The development paper published no total-score severity bands.** The widely quoted mild 0-14 / moderate
15-29 / severe 30-43 come from a *later* multinational cohort. They are reported labeled with their own
source, because a reader who believes the instrument ships with bands will over-trust them.

**4. The MGUPI/GUPI is a different instrument.** Two extra pain items give a pain subscale of 0-23 and a
total of 0-45. A total of 44 is impossible here and ordinary there — the two must never be mixed or
compared.

## Two smaller structural notes

**Q4 is conditional in wording but unconditional in scoring.** It asks for average pain "on the days that
you had it", which does not apply if Q3 is "never" — yet the instrument still requires a 0-10 value. The lib
requires it too (that is what the instrument does) and sets `painFrequencyConflict` when Q3 = 0 and Q4 > 0,
reporting the contradiction rather than resolving it.

**Q9's neutral point is not a general midpoint.** The satisfaction ladder runs from "delighted" (0) to
"terrible" (6), and the neutral answer "mixed" scores **3** — the midpoint of that item alone and of nothing
else on the form.

## Scope (spec-v11 §5.3)

A **symptom index**. It does **not** diagnose chronic prostatitis or chronic pelvic pain syndrome, and does
not distinguish the NIH categories, which turn on inflammatory findings and cultures it cannot see. It does
not exclude the conditions that present the same way and are managed very differently — bacterial infection,
bladder pain syndrome, urethral stricture, pelvic floor dysfunction. It does **not** detect what needs urgent
assessment: hematuria, fever with pain, acute retention and a suspicious examination all need attention
*regardless of the score*. It does not select therapy, and a high score is not by itself an indication for
antibiotics.

## Files

- `lib/nih-cpsi-v566.js` — `nihCpsi()`, `CPSI_ITEMS`, `SUBSCALE_MAXIMA`, `CPSI_MAX`, `MGUPI_MAX`.
- `views/group-v566.js` (RV566) — one **h2** per subscale; every item select built from its own option list.
- `mcp/adapters/nih-cpsi-v566.js` — wave 391.
- `test/unit/nih-cpsi.test.js` — 16 tests.
- `docs/spec-v566.md` (this file).

## Sourcing (spec-v97)

Item text and response codes transcribed from an NIH-hosted case report form carrying the instrument; the
subscale ranges and item-range distribution independently confirmed by two later publications.

- Litwin MS, McNaughton-Collins M, Fowler FJ Jr, et al. *J Urol.* 1999;162(2):369-375.
- Wagenlehner FME, et al. *Eur Urol.* 2013;63(5):953-959 — severity bands and item-range distribution.
