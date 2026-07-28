# spec-v544.md — NEMS (Nine Equivalents of Nursing Manpower Use) tile

> Status: **SHIPPED (2026-07-28).** Builds the `nems` tile — the nine-item ICU nursing-workload score, total
> 0-56. Catalog **1393 → 1394**, group G.

## Why

All probe tokens were zero-hit: `nems`, `nursing manpower`, `tiss`, `miranda`, `workload`.

**A genuinely different axis from every other ICU tile in the catalog.** APACHE, SOFA, SAPS, LODS, PELOD and
OASIS score how **sick** the patient is, or how likely they are to die. NEMS scores how much **nursing
resource** the patient consumes over a shift. Those come apart constantly: a stable ventilated patient on two
vasoactive infusions is enormously expensive in nursing time and may have an unremarkable severity score,
while a patient dying of an untreatable illness may consume very little. NEMS is the instrument that maps to
**staffing**, and nothing in the catalog answered that question.

## What it does

| Item | Points |
| --- | --- |
| Basic monitoring | 9 |
| Intravenous medication (**not** vasoactive) | 6 |
| Mechanical ventilatory support | 12 |
| Supplementary ventilatory care | 3 |
| Single vasoactive medication | 7 |
| Multiple vasoactive medication | 12 |
| Dialysis techniques | 6 |
| Specific interventions **in** the ICU | 5 |
| Specific interventions **outside** the ICU | 6 |

### Two pairs are mutually exclusive, and the tile makes that structural

Items 3 and 4 cannot both score — the source states that mechanical ventilatory support *excludes*
supplementary ventilatory care. Items 5 and 6 likewise: "multiple" **replaces** "single", it does not add to
it. The tile offers ventilation as **one** three-way choice and vasoactive support as **one** three-way
choice, so an implementation cannot score both members of either pair.

**The arithmetic is the proof.** Summing all nine weights naively gives **66**. The published maximum is
**56**, reachable only as `9 + 6 + 12 + 12 + 6 + 5 + 6` — exactly one of {3,4} and one of {5,6}. The
exclusivity is not an interpretation; it is the only reading under which the instrument's own stated maximum
is achievable. A test asserts both the 56 ceiling and the 66 naive sum, so the distinction cannot silently
regress.

**One published source states the maximum as 63.** That is inconsistent with the item weights under any
exclusivity rule; 56 is what the weights produce and is corroborated elsewhere. The tile uses 56 and records
the disagreement rather than hiding it.

**Item 8 excludes routine care, the commonest scoring error.** "Specific interventions in the ICU" means
intubation, pacemaker insertion, cardioversion, endoscopy, emergency operation in the past 24 hours, gastric
lavage. It does **not** include routine radiographs, echocardiograms, ECGs, dressings, or venous and arterial
line insertion — counting those inflates a large fraction of ICU patients by five points.

- `lib/nems-v544.js` — pure items → total with the ventilation and vasoactive contributions reported
  separately. Exports `NEMS_INDEPENDENT`, `NEMS_VENTILATION`, `NEMS_VASOACTIVE`, `NEMS_MAX`, and
  `NEMS_NAIVE_SUM` (the latter kept as an exported constant so the 56-vs-66 distinction is testable).
- `views/group-v544.js` (RV544) — two three-way selects and five yes/no selects under two **h2** headings.
- `lib/meta.js` — Reis Miranda and colleagues 1997 citation + accessed date + bands. No citation-staleness
  row (a named-author article, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1394.
- Audiences include `nursing-icu`, since this is a nursing instrument first.

**HIGH-STAKES AND OFTEN MISUSED:** NEMS measures **consumed** nursing workload for a period already worked.
It is **not** an illness-severity score, **not** a mortality predictor, and **not** a triage tool — a high
NEMS does not mean a sicker patient and a low one does not mean a safe one. It is **not a nurse-to-patient
ratio** and does not by itself determine safe staffing, which depends on skill mix, unit layout, patient
acuity NEMS does not capture, and local standards. It says nothing about the psychological and
family-support work that occupies real nursing time and appears in none of its nine items, so it
**systematically under-counts the care of the dying and of distressed families**
([spec-v11](spec-v11.md) §5.3).

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`nems`), the full name (`nursing manpower`), the
predecessor instrument (`tiss`), the first author (`miranda`), and the concept (`workload`) — each against
**both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. All zero.

## Sourcing (spec-v97)

- **Citation:** Reis Miranda D, Moreno R, Iapichino G. Nine equivalents of nursing manpower use score (NEMS).
  *Intensive Care Med.* 1997;23(7):760-765.
- Items, weights, both exclusivity rules, and the 0-56 range were transcribed from two faithful reproductions
  of the scoring table agreeing on every value, with the sum-to-56 arithmetic as independent corroboration.
  The 1997 original is paywalled; one reproduction is noted as "slightly adapted", which is why the
  arithmetic check mattered.

## Verification

Lint (all catalog-truth surfaces at 1394), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute TISS-28, convert a NEMS total into nursing hours or a staffing ratio, score illness
severity, or predict mortality. The MCP adapter + golden-probe promotion ship in the same wave (369).
