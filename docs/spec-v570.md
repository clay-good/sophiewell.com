# spec-v570.md — New Global Definition of ARDS tile

> Status: **SHIPPED (2026-07-28).** Builds the `global-ards` tile. Catalog **1419 → 1420**, group G.

## Why

A **revised-successor gap**. `berlin-ards` (Berlin, 2012) is in the catalog; its 2023/2024 successor was not.

**What the successor changed:** Berlin required intubation and an arterial blood gas. The global definition
adds two categories Berlin could not express — a **nonintubated** category on high-flow or noninvasive
support, and a **resource-limited** category needing neither a blood gas nor any positive pressure — and it
admits pulse oximetry and lung ultrasound as evidence.

## What it does

**Criteria applying to every category:** an acute predisposing risk factor; edema not primarily cardiogenic
and hypoxemia not primarily atelectatic; onset/worsening within 1 week; bilateral opacities on imaging.

| Category | Oxygenation | Severity? |
| --- | --- | --- |
| Nonintubated (HFNO ≥30 L/min, or NIV/CPAP ≥5 cm H₂O) | P/F ≤300 or S/F ≤315 | **None** |
| Intubated (PEEP ≥5 cm H₂O required) | Mild 200<P/F≤300 or 235<S/F≤315; Moderate 100<P/F≤200 or 148<S/F≤235; Severe P/F≤100 or S/F≤148 | Mild / Moderate / Severe |
| Resource-limited | S/F ≤315 only; no PEEP or flow requirement | **None** |

## The four rules a plausible implementation breaks

**1. Nonintubated ARDS has no severity grading at all.** Mild/moderate/severe exist **only** for intubated
ARDS. There is no "moderate nonintubated ARDS". A definition that grades one branch invites grading all of
them — the lib returns `severity: null` elsewhere, and a test sweeps five nonintubated ratios asserting none
produces a grade.

**2. The resource-limited branch is a terminal dead end, not a milder category.** No PEEP requirement, no
minimum oxygen flow, SpO₂:FiO₂ only, no severity grade. A patient meeting it has not been shown to be less
sick — only to have been assessed with fewer resources. The lib refuses a PaO₂:FiO₂ ratio there.

**3. The saturation ratio is invalid above SpO₂ 97% — a hard gate, not a caveat.** Above 97% the saturation
sits on the flat part of the dissociation curve and the ratio stops tracking oxygenation. The lib **refuses
to assess** rather than returning a confident number from a measurement the source excludes. Tests pin 97
(accepted) and 99 (refused).

**4. Every intubated severity category requires a minimum PEEP of 5 cm H₂O.** Severity is not read off the
ratio alone.

## Two corrections the source specifies

- Estimated FiO₂ on nasal flow = ambient (≈0.21) + **0.03 × flow rate (L/min)**.
- Above **1,000 m** altitude, multiply the ratio by **barometric pressure ÷ 760**.

Patients **move between categories** during their illness, so a severity grade describes one moment rather
than labelling the admission.

## Scope (spec-v11 §5.3)

A **definition** for identifying a syndrome — not a severity score and not a prognostic model. It does
**not** identify the cause, which is what gets treated (pneumonia, aspiration, pancreatitis, transfusion and
trauma all produce it and diverge sharply in management). It does **not** exclude cardiogenic pulmonary
edema — that is a clinical judgment the definition requires the user to have already made. It does not
indicate intubation, prone positioning, neuromuscular blockade or extracorporeal support, and meeting a
severity category is not by itself an indication for any of them.

## Files

- `lib/global-ards-v570.js` — `globalArds()`, `ARDS_SETTINGS`, `RATIO_TYPES`, `COMMON_CRITERIA`,
  `SPO2_VALIDITY_CEILING`, `MIN_PEEP`, `MIN_HFNO_FLOW`.
- `views/group-v570.js` (RV570) — category first (it decides whether a grade exists), then criteria,
  support, and oxygenation under **h2** headings.
- `mcp/adapters/global-ards-v570.js` — wave 395.
- `test/unit/global-ards.test.js` — 19 tests.
- `docs/spec-v570.md` (this file).

## Sourcing (spec-v97)

Transcribed from the published table and verified against an independent rendering with correct inequality
glyphs (the PDF renders `≤` as `<` and `<` as `,`).

- Matthay MA, Arabi Y, Arroliga AC, et al. A New Global Definition of Acute Respiratory Distress Syndrome.
  *Am J Respir Crit Care Med.* 2024;209(1):37-47.
