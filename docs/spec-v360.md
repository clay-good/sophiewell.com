# spec-v360.md — Keith-Wagener-Barker (hypertensive retinopathy) tile

> Status: **SHIPPED (2026-07-16).** Builds the `kwb-retinopathy` tile — the Keith-Wagener-Barker
> classification of hypertensive retinopathy (grades 1–4). Catalog **1211 → 1212**, group G.

## Why

The catalog carries the ICDR diabetic-retinopathy severity scale but no hypertensive-retinopathy grade.
The Keith-Wagener-Barker classification is the classic fundoscopic grading of the retinal changes of
systemic hypertension. `keith wagener barker` / `hypertensive retinopathy grade` / `kwb grade` routed to
nothing. (Companion-gap: ICDR grades diabetic retinopathy; KWB grades hypertensive retinopathy.)

## What it does

The clinician picks the grade; the tile reports the grade, its fundoscopic description, and whether it is
a severe (grade 3–4) retinopathy.

- `lib/kwb-retinopathy-v360.js` — pure grade → description. **1:** mild generalized arteriolar narrowing.
  **2:** focal narrowing and AV nicking. **3:** plus hemorrhages, cotton-wool spots, and exudates —
  flagged. **4:** plus optic disc swelling (papilledema), the hallmark of malignant hypertension —
  flagged. Accepts 1–4 or roman I–IV, case-insensitive.
- `views/group-v360.js` (RV360) — one select (dom `kwb-grade`), real `<label for>`.
- `lib/meta.js` — Keith, Wagener & Barker 1939 (Am J Med Sci) citation + accessed date + grouped bands.
  No citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v81 → v82); corpus → 1212.

**HIGH-STAKES:** it reports the KWB grade the clinician has determined from the fundus exam, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Grade 4 (papilledema) is
the fundoscopic hallmark of malignant hypertension, a clinical emergency assessed on its own; the
management decision stays with the treating clinician (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Keith NM, Wagener HP, Barker NW. Some different types of essential hypertension: their
  course and prognosis. *Am J Med Sci.* 1939;197(3):332-343 (the original four-grade classification).
- Cross-verified against ophthalmology / internal-medicine references (StatPearls and standard texts)
  reproducing the same grade 1–4 fundoscopic definitions.

## Verification

Lint (all catalog-truth surfaces at 1212), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade 3) renders the "hemorrhages / cotton-wool spots / exudates" warn
description, grade 1 flips to the "mild arteriolar narrowing" description, and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the fundus, distinguish KWB from the
simplified (mild/moderate/malignant) system, or recommend treatment. The MCP adapter + golden-probe
promotion follow in a separate wave.
