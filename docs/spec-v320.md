# spec-v320.md — Clavien-Dindo classification of surgical complications tile

> Status: **SHIPPED (2026-07-15).** Builds the `clavien-dindo` tile — the Clavien-Dindo grading of
> surgical complications (I, II, IIIa, IIIb, IVa, IVb, V). Catalog **1171 → 1172**, group G.

## Why

The catalog had no Clavien-Dindo tile ("clavien" had zero corpus hits) — yet it is one of the most widely
used surgical-outcome grading systems, the standard way a postoperative complication's severity is
reported. `clavien dindo` / `surgical complication grade` routed to nothing.

## What it does

The clinician picks the grade from the therapy the complication required; the tile reports the grade and its
standard definition.

- `lib/clavien-dindo-v320.js` — pure grade → definition. **I:** no treatment beyond antiemetics/analgesics/
  electrolytes/physiotherapy (or bedside wound opening). **II:** pharmacological treatment beyond grade I
  (incl. transfusion, TPN). **IIIa/IIIb:** surgical/endoscopic/radiological intervention without / under
  general anesthesia. **IVa/IVb:** life-threatening, IC/ICU, single- / multi-organ dysfunction. **V:** death.
  Accepts case-insensitive input and normalizes the sub-grade suffix (IIIA → IIIa).
- `views/group-v320.js` (RV320) — one select (Deauville-style), real `<label for>`.
- `lib/meta.js` — Dindo 2004 citation + accessed date + grouped bands. No citation-staleness row (the Ann
  Surg citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v41 → v42); corpus → 1172.

**HIGH-STAKES:** it reports the severity grade the clinician has assigned from the therapy the complication
required, never a diagnosis or a management order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

- **Citation:** Dindo D, Demartines N, Clavien PA. Classification of surgical complications: a new proposal
  with evaluation in a cohort of 6336 patients and results of a survey. *Ann Surg.* 2004;240(2):205-213.
  Cross-verified against the 2009 five-year-experience paper (Ann Surg 2009;250(2):187-196).
- The grades are defined by the treatment required as above; the IIIa/IIIb (general anesthesia) and
  IVa/IVb (single- vs multi-organ) splits are the canonical sub-grades.

## Verification

Lint (all catalog-truth surfaces at 1172), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: the example (grade IIIa) renders the "intervention, not under general anesthesia" definition, and
selecting grade V flips the result to the severe "death of the patient" band.

## Out of scope

The tile echoes the grade the clinician selects; it does not detect the complication, choose the
intervention, or compute the Comprehensive Complication Index (CCI). The MCP adapter + golden-probe
promotion follow in a separate wave.
