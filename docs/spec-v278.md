# spec-v278.md — Pediatric sepsis at the bedside: the Phoenix Sepsis Score (+1 tile)

> Status: **BUILT (2026-07-10).** `phoenix-sepsis` is live (catalog 1137 → 1138). Every
> point table was re-fetched and cross-verified against ≥ 2 independent open sources per
> [spec-v97](spec-v97.md): the open-access `phoenix` R-package vignette (CRAN) and an
> independent Phoenix-logic reference agree on every threshold. **Correction applied at
> implementation:** the §2.1 draft sketched the cardiovascular lactate bands as "2-4.9 / ≥ 5";
> the verified consensus bands are **5 to < 11 mmol/L (+1)** and **≥ 11 mmol/L (+2)** — the
> value now shipped. This is exactly the re-verification spec-v97 mandates.
>
> Superseded status line — First feature spec of the **Advanced
> Prognostic & Classification Instruments** program (§1.1). Proposes **1** deterministic
> instrument a pediatric or emergency team reaches for at the sepsis-recognition decision
> point — the 2024 international-consensus organ-dysfunction score that now *defines*
> pediatric sepsis. **The id was verified absent** ([spec-v85 §6.2](spec-v85.md)) by a
> fixed-string scan of the extracted `app.js` id/name list: the catalog carries
> `qsofa-sofa`, `psofa`, `pelod2`, `sirs`, `pews`, and the neonatal `eos-calculator`, but
> **not** the Phoenix Sepsis Score.
>
> Catalog effect, if built: **live `UTILITIES.length` + 1**, enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)); no number is copied here.
>
> Every prior spec remains in force. v278 adds no runtime network call and no AI; the tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**no diagnosis, admission,
> antibiotic, or escalation order in Sophie's voice** — it computes an organ-dysfunction
> score and states the consensus threshold; the decision to treat stays with the clinician).
> **Every threshold and point weight is re-fetched and cross-verified against ≥2 independent
> open sources at implementation** ([spec-v97](spec-v97.md)); uncertain values carry an
> explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing
> session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the adult Sepsis-3 pair (qSOFA/SOFA), the pediatric organ-dysfunction
scores that *preceded* the new definition (pSOFA, PELOD-2), the adult SIRS criteria, the
Kaiser neonatal early-onset-sepsis calculator, and PEWS. It does **not** carry the
instrument that, since 2024, *is* the international consensus definition of pediatric
sepsis: the **Phoenix Sepsis Score**. The prior pediatric standard — the 2005 IPSCC
SIRS-based criteria — was retired by the SCCM Pediatric Sepsis Definition Task Force, which
replaced it with a data-derived four-organ-system score. Phoenix is a transparent, additive
point model, freely reproducible from the open-access JAMA consensus papers, and is decision
support — **never a diagnosis or a treatment order**.

### 1.1 Program: Advanced Prognostic & Classification Instruments

v278–v281 add seven deterministic instruments that a sub-specialist reaches for at a
prognostic, staging, or case-definition decision point — is this child septic, how likely
is this resected kidney cancer to recur, how disabled is this arthritis patient, does this
back pain classify as axial spondyloarthritis, is this a hepatocellular carcinoma. Each is
Class A, freely reproducible from open sources, and **verified absent from the catalog at
draft** ([spec-v85 §6.2](spec-v85.md)). The program adds no new module theme beyond the
existing Group G (clinical scoring & risk) surface and no runtime dependency. It succeeds
the completed **Composite Index / lab-ratio** program (spec-v267–v277) and, before it, the
**Advanced Sub-specialty Prognostic Instruments** program ([spec-v264](spec-v264.md) §1.1).

## 2. What v278 adds (1 tile)

### 2.1 `phoenix-sepsis` — Phoenix Sepsis Score (2024 international consensus)

- **Citation:** Schlapbach LJ, Watson RS, Sorce LR, et al; Society of Critical Care Medicine
  Pediatric Sepsis Definition Task Force. International Consensus Criteria for Pediatric
  Sepsis and Septic Shock. *JAMA.* 2024;331(8):665-674. Companion derivation/validation:
  Sanchez-Pinto LN, Bennett TD, DeWitt PE, et al. Development and Validation of the Phoenix
  Criteria for Pediatric Sepsis and Septic Shock. *JAMA.* 2024;331(8):675-686.
- **citationUrl:** https://doi.org/10.1001/jama.2024.0179
- **Group:** G. **Specialties:** `pediatric-critical-care`, `pediatric-emergency`,
  `pediatrics`, `critical-care`.
- **Inputs — four organ-system sub-scores** *(each threshold and point weight is transcribed
  verbatim from the JAMA consensus tables at implementation, [spec-v97](spec-v97.md))*:
  - **Respiratory (0-3):** graded on PaO₂/FiO₂ (or SpO₂/FiO₂ when SpO₂ ≤ 97 %) together with
    the level of respiratory support (any support, invasive mechanical ventilation) — 0 to 3
    points.
  - **Cardiovascular (0-6):** the count of vasoactive medications (1 = 1 point, ≥ 2 = 2
    points), the lactate band (2-4.9 mmol/L, ≥ 5 mmol/L), and age-adjusted mean arterial
    pressure — each contributing up to 2 points, capped at 6.
  - **Coagulation (0-2):** one point each (max 2) for platelets < 100 ×10³/µL, INR > 1.3,
    D-dimer > 2 mg/L FEU, and fibrinogen < 100 mg/dL.
  - **Neurological (0-2):** Glasgow Coma Scale ≤ 10 (1 point); bilaterally fixed pupils
    (2 points).
- **Output:** the **Phoenix Sepsis Score (0-13)** as the sum of the four sub-scores, with the
  consensus case definitions stated inline: **suspected/confirmed infection + Phoenix ≥ 2 =
  sepsis**; **sepsis + cardiovascular sub-score ≥ 1 = septic shock**. The tile names which
  organ systems are dysfunctional and reports each sub-score. The extended **Phoenix-8**
  (adding endocrine, immunologic, renal, and hepatic systems) is noted as a research-cohort
  variant and is **out of scope** here. Framed as the organ-dysfunction score that now
  *defines* pediatric sepsis; **it reports a score and the consensus threshold, never a
  diagnosis or a treatment order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links
  `psofa`, `pelod2`, `qsofa-sofa`, `pews`.

## 3. Per-tile robustness

- **The compute routes through `lib/num.js` and is finite-guarded** — a missing input in an
  organ system renders a "complete the fields" fallback rather than a `NaN`, and the total
  clamps to [0, 13].
- **The tile reports each organ sub-score and the fired thresholds** ([spec-v59](spec-v59.md))
  — so the ≥ 2 sepsis threshold and the cardiovascular-≥ 1 shock rider are never read without
  their basis.
- **It renders a score and a consensus category, not an order** ([spec-v11](spec-v11.md) §5.3)
  and renders the [spec-v50](spec-v50.md) §3 posture note.
- **It flows through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks**,
  fuzzed at the sub-score caps, the Phoenix ≥ 2 boundary, and the cardiovascular ≥ 1 shock
  rider.

## 4. CI/CD & maintenance

- **Maintenance class (§6.3):** **Class A** — a fixed, data-derived point model; the citation
  names journal + authors. The implementing session confirms whether the SCCM/JAMA issuer
  trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the compute lives in a new `lib/peds-sepsis-v278.js`, added
  to `test/unit/fuzz-tools.test.js` `MODULES`; the age-band MAP table and the sub-score
  thresholds live as named constants with the JAMA source tables cited in a comment. The
  renderer lives in a new `views/group-v278.js`; its `RV278` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count moves
  on all catalog-truth surfaces using the live `UTILITIES.length + 1`; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness` sweep
  pass.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary; all tags used
  here already exist.
- **MCP exposure (post-ship):** a Class A deterministic compute, routinely MCP-adaptable — a
  follow-up MCP wave exposes it per the [spec-v85](spec-v85.md) recipe, self-describing the
  four sub-scores and the sepsis/shock thresholds so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v278.md                        (this file)
app.js                                   (+1 UTILITIES row; import group-v278 RV278 into RENDERERS)
lib/peds-sepsis-v278.js                  (new: phoenixSepsis + age-band MAP + sub-score threshold constants)
lib/meta.js                              (+1 META entry: inline citation + citationUrl + accessed; cross-links psofa, pelod2, qsofa-sofa)
views/group-v278.js                      (new renderer module: 1 renderer)
docs/clinical-citations.md               (+1 row)
test/unit/phoenix-sepsis.test.js         (>=3 worked examples: a sub-2 no-sepsis case, a >=2 sepsis case, a shock case with cardiovascular >=1)
test/unit/fuzz-tools.test.js             (add lib/peds-sepsis-v278.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+1; record the v278 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+1; spec-progression line)
```

## 6. Acceptance criteria

v278 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed `phoenix-sepsis` is absent (as verified at draft).
- The tile is live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and ≥ 3 worked examples — including a **Phoenix < 2 (no sepsis)**, a
  **Phoenix ≥ 2 (sepsis)**, and a **sepsis + cardiovascular ≥ 1 (septic shock)** case.
- The four organ-system sub-score tables, the age-banded MAP thresholds, and the ≥ 2 /
  cardiovascular-≥ 1 case definitions are reproduced from the JAMA consensus papers and
  re-verified against ≥ 2 independent references at implementation ([spec-v97](spec-v97.md)).
- The compute is finite-guarded, routes through `lib/num.js`, clamps the total to [0, 13],
  and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 1** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v278
  with the +1 delta.

## 7. Out of scope for v278

- **No diagnosis, admission, antibiotic, or escalation order** — the tile computes an
  organ-dysfunction score and states the consensus threshold; recognition and treatment stay
  with the clinician ([spec-v11](spec-v11.md) §5.3).
- **No Phoenix-8 extended score** — the four-organ Phoenix Sepsis Score is the deployed
  consensus definition; the eight-organ research variant is deferred to a later slice. If any
  organ-system sub-table cannot be reproduced from ≥ 2 open sources at implementation, that
  branch is parked (not approximated), per [spec-v97](spec-v97.md) and the
  [spec-v259](spec-v259.md) precedent.
