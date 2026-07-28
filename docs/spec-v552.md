# spec-v552.md — SNOT-22 tile

> Status: **SHIPPED (2026-07-28).** Builds the `snot22` tile — the 22-item Sino-Nasal Outcome Test.
> Catalog **1401 → 1402**, group G.

## Why

`snot`, `snot-22`, `sinonasal` and `outcome-test` were all zero-hit.

**A companion to `lund-mackay`, on a different axis.** That tile stages the **CT scan**; SNOT-22 asks the
**patient**. The two correlate poorly by design — a near-normal CT can accompany a severe symptom burden,
and the reverse — so this is not a duplicate, and the tile says so rather than letting a reader treat one as
a proxy for the other.

## What it does

22 items, each 0-5 over the **past two weeks** (the recall period is part of the instrument, not a setting),
for a total of **0-110**. Higher is worse.

| Points | Anchor |
| --- | --- |
| 0 | No problem |
| 1 | Very mild problem |
| 2 | Mild or slight problem |
| 3 | Moderate problem |
| 4 | Severe problem |
| 5 | Problem as bad as it can be |

## The two rules a plausible implementation breaks

**1. A score below 8 is not "mild".** The stratification defines mild as **8-20 inclusive**, moderate as
**>20 to 50**, severe as **>50** — and defines *nothing* below 8, describing such a score as having no
clinically significant symptoms. A three-band scale whose lowest band starts at 8 rather than 0 looks like an
off-by-one to fix. It is not: rounding 0-7 into mild would invent a band the source does not contain, and
would file a symptom-free patient alongside one scoring 20. The lib returns a distinct band with
`namedBand: false`, and a test pins every boundary (7/8, 20/21, 50/51).

**2. The form's "most important items" question is never scored.** It asks the patient to mark up to five
items most affecting their health — a separate checkbox column that is not summed, not weighted, and does
not modify any item's contribution. A total that included it would not be a SNOT-22 score. The lib records
the selection, caps it at five, drops unknown keys, and a test asserts the total is unchanged by it.

## Two provenance disclosures

**The bands are not part of the instrument.** The 22 items and their anchors are the Washington University
questionnaire, which defines **no** severity bands. The cut points come from a separate 2016 stratification
study of 65 patients, and are reported as that study's proposal — a reader who believes the questionnaire
ships with bands will over-trust them and will not weigh the small derivation sample.

**The MCID belongs to a comparison, not a score.** An absolute difference of **8.9** or more between two
SNOT-22 scores *from the same patient* is considered clinically meaningful. Attached to a lone total it would
read as a threshold, which it is not.

## Scope (spec-v11 §5.3)

A patient-reported symptom measure. It does **not** diagnose chronic rhinosinusitis, which requires symptom
duration together with objective confirmation by endoscopy or CT, and does not distinguish it from allergic
rhinitis, migraine, or the other causes of facial pain and nasal symptoms. Many items — sleep, fatigue,
concentration, sadness — are **not specific to the nose** and move with depression, sleep disorders and
general health, so a high total is not by itself evidence of sinus disease. It is not an indication for
surgery and does not select medical therapy.

## Files

- `lib/snot22-v552.js` — `snot22()`, `SNOT22_ITEMS`, `SNOT22_OPTIONS`, `SNOT22_MAX`, `SNOT22_MCID`.
- `views/group-v552.js` (RV552) — items and the not-scored checkboxes under separate **h2** headings.
- `mcp/adapters/snot22-v552.js` — wave 377.
- `test/unit/snot22.test.js` — 16 tests, weighted to the band floor and the not-scored selection.
- `docs/spec-v552.md` (this file).

## Sourcing (spec-v97)

Items and anchors transcribed word for word from the copyright-bearing instrument and verified against an
independent reproduction with an identical item list; the stratification taken from its own source:

- SNOT-20 © 1996 Jay F. Piccirillo MD, Washington University School of Medicine; SNOT-22 developed from it
  by the National Comparative Audit of Surgery for Nasal Polyposis and Rhinosinusitis, Royal College of
  Surgeons of England. © 2006 Washington University in St. Louis.
- Hopkins C, Gillett S, Slack R, Lund VJ, Browne JP. Psychometric validity of the 22-item Sinonasal Outcome
  Test. *Clin Otolaryngol.* 2009;34(5):447-454.
- Toma S, Hopkins C. Stratification of SNOT-22 scores into mild, moderate or severe. *Rhinology.* 2016.
