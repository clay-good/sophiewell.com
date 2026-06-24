# spec-v162.md — Cross-Discipline Completion program: EBM bedside math, ophthalmology, radiology classification, pharmacokinetics & one-formula gaps (program-of-record)

> Status: **PROPOSED (2026-06-23).** Program-of-record for the **Cross-Discipline
> Completion** initiative — the *third pass* after [spec-v150](spec-v150.md)
> (under-represented specialties) and [spec-v157](spec-v157.md) (subspecialty
> quantification). This pass reaches the disciplines a clinician uses but that a
> calculator catalog rarely indexes: **evidence-based-medicine bedside math**
> (the Fagan/2×2/NNT family), **ophthalmology** (IOL power, acuity conversion),
> **diagnostic radiology classification** (TI-RADS, adrenal washout, Bosniak),
> **generic pharmacokinetics**, and a set of **single-formula gaps** scattered one
> per subspecialty. It reserves the band **v163–v167**.
>
> Catalog effect of the whole program: **+19** across five feature specs (nominal
> 722 after v161 → 741). v162 itself ships **no tile**; it is the umbrella + the
> third-pass audit.
>
> Every prior spec (v4 through v161) remains in force. No tile adds a runtime
> network call or AI. Each obeys the [spec-v100](spec-v100.md) §2 doctrine
> (including the §2 classification-tile clarification), the §6 CI/CD contract,
> [spec-v59](spec-v59.md) output safety, [spec-v50](spec-v50.md) §3 posture, and
> [spec-v11](spec-v11.md) §5.3. Each ships its primary citation inline
> ([spec-v54](spec-v54.md)) and passes the [spec-v29](spec-v29.md) §3 one-line
> test. **Every formula, coefficient, and threshold is re-fetched and
> cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); nothing here is implemented from recall.

## 1. The third-pass audit question

Two passes covered specialties and subspecialty quantification. This pass asks:
what *deterministic, free* tools do clinicians use that live **outside** the usual
"clinical score" framing a calculator catalog defaults to? Five clusters survive:

| Spec | Theme | Tiles | Why it is a real gap |
|---|---|---|---|
| v163 | EBM bedside math | Fagan post-test probability, diagnostic 2×2, NNT/ARR (3) | The catalog *cites* sensitivity/LR in tile notes but has **no tool to compute post-test probability, predictive values, or NNT** — the core bedside-EBM arithmetic. |
| v164 | Ophthalmology | IOL power, visual-acuity converter, ocular perfusion pressure (3) | Ophthalmology has **zero** tiles; IOL power is computed for every cataract operation and acuity conversion is universal. |
| v165 | Radiology classification & quantification | ACR TI-RADS, adrenal CT washout, Bosniak, CT effective dose (4) | Diagnostic radiology has **no** structured-reporting classifier despite TI-RADS/Bosniak/washout being daily, deterministic, and free. |
| v166 | Pharmacokinetics & psych dosing | PK suite, chlorpromazine equivalents, lithium maintenance nomogram (3) | The catalog has drug-specific PK (vanc/aminoglycoside/digoxin) but **no generic PK math**, and the antipsychotic equivalence parallel to the live opioid/benzo/steroid converters is missing. |
| v167 | One-formula subspecialty gaps | mean airway pressure, cerebroplacental ratio, toe-brachial index, stool osmotic gap, pure tone average, Rutgeerts (6) | Each is a single deterministic instrument filling a named hole (vent, fetal Doppler, vascular, GI, audiology, IBD endoscopy). |

**Total: 19 tiles.**

## 2. What is deliberately EXCLUDED (carried forward + new)

- **Copyright / closed-coefficient / paywalled** (from [spec-v150](spec-v150.md) §2
  and [spec-v157](spec-v157.md) §2): MoCA, MMSE, ACT, CAT, FIM, SNOT-22, SCAT5,
  FRAX, STS, MDS-UPDRS, HIT-6, SGRQ, Grobman VBAC — **not added.**
- **Deterministic but large proprietary coefficient tables — candidate for a future
  *data-sourced* spec, not this one:** the transplant allocation models **KDPI/KDRI,
  EPTS** (OPTN) and **Lung Allocation Score** are reproducible only from sizable
  published coefficient tables; they fit the growth-LMS data-sourcing pattern
  ([spec-v141](spec-v141.md)) **if** a verbatim source is fetched, and are parked
  with `gail-bcrat`/`crib-ii` until then. **Not added here.**
- **Imaging-AI / planimetry / descriptive lookups:** BI-RADS and PI-RADS assessment
  categories (descriptive, not computed), LI-RADS (algorithmic but largely
  narrative). **Not added.**

## 3. Fourth-pass micro-backlog (real, deterministic, free — genuinely niche)

Named for completeness; each is implementable but low-frequency, parked pending a
request: `toe-pressure-index` variants, `corrected-retic` (already live as
`retic-index`), DMFT dental index, `stroke-volume-index` (subset of
`hemodynamic-suite`), `qt-dispersion`, `g8`/`crash`/`dlco-correction`/
`bronchodilator-response`/`esas-r`/`uas7`/`poisoning-severity-score` (the
[spec-v157](spec-v157.md) §3 Wave-3 list, still open).

## 4. Program doctrine (binds v163–v167)

Identical to [spec-v150](spec-v150.md) §3 / [spec-v157](spec-v157.md) §4: per-spec
`lib/<theme>-vNNN.js` module + `views/group-vNNN.js` renderer with `RVNNN` export;
catalog-truth delta on all **13 surfaces** using **live `UTILITIES.length` +
delta**; [spec-v85 §6.2](spec-v85.md) collision check first. **New specialty tags
required:** `ophthalmology`, `radiology`, `audiology`, and `clinical-epidemiology`
are **not yet in** the `specialty-coverage.test.js` closed vocabulary — v164/v165/
v167/v163 must **add them to `ALLOWED_SPECIALTIES`** (the one vocabulary edit this
program needs; prior programs needed none). All other tags
(`pharmacy`, `psychiatry`, `nephrology`, `gastroenterology`, `vascular-surgery`,
`maternal-fetal-medicine`, `critical-care`, `pulmonology`) already exist.

## 5. Feature specs

- [spec-v163](spec-v163.md) — EBM bedside math.
- [spec-v164](spec-v164.md) — Ophthalmology.
- [spec-v165](spec-v165.md) — Radiology classification & quantification.
- [spec-v166](spec-v166.md) — Pharmacokinetics & psych dosing.
- [spec-v167](spec-v167.md) — One-formula subspecialty gaps.

## 6. Acceptance criteria (program level)

- All five feature specs (v163–v167) ship, each meeting its own §6, or a tile is
  explicitly deferred with the [spec-v97](spec-v97.md) sourcing rationale recorded.
- The new specialty tags are added to `ALLOWED_SPECIALTIES` and
  `specialty-coverage.test.js` passes.
- `UTILITIES.length` advances by the sum of shipped deltas (≤19); all 13
  catalog-truth surfaces agree; `docs/scope-cross-discipline.md` records the running
  count.
- No tile implemented from recall; each carries an inline primary citation +
  `citationUrl` + `accessed`, cross-verified to ≥2 sources.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build` pass at each
  feature-spec close; the CHANGELOG records each spec with its delta.

## 7. Out of scope for the program

- **No re-implementation of any live tile** — every tile in v163–v167 was confirmed
  absent by an `app.js` `UTILITIES` grep at audit time (2026-06-23; non-zero
  substring hits like "IOL" inside "period"/"violation" and "loading dose" inside
  warfarin narrative were verified as noise).
- **No new clinical doctrine, no new group.**
- **No copyrighted, closed-coefficient, or paywalled instrument** (§2); the
  transplant-allocation models are parked for a possible future data-sourced spec.
