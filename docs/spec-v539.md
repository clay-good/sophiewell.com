# spec-v539.md — ISL lymphedema staging (stage and volume severity) tile

> Status: **SHIPPED (2026-07-28).** Builds the `isl-lymphedema` tile — the ISL stage plus the separate
> volume-based severity grade. Catalog **1388 → 1389**, group G.

## Why

Whole-concept gap: `lymphedema`, `isl`, `elephantiasis`, `lymphoscintigraphy`, and `stemmer` were **all**
zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`. The catalog had no lymphedema content of any
kind.

## What it does

**Stage and severity are two separate axes, and the consensus applies them together.** The stage describes
what the **tissue** has become; the severity grade describes how much **volume** the limb has gained. They do
not track each other — a stage III limb is not automatically severe, and a severe-by-volume limb can be
stage II. The tile reports both and refuses to collapse them, because "stage III lymphedema" and "severe
lymphedema" are different statements that get used interchangeably. A test asserts both cross-combinations.

| Stage | Elevation | Pitting |
| --- | --- | --- |
| 0 (latent/subclinical) | n/a | n/a — no overt edema |
| I | **Subsides** with elevation | **May** occur |
| II | Elevation **rarely** reduces it | **Manifest** |
| late II | No | **May not** pit — fat and fibrosis developing |
| III (lymphostatic elephantiasis) | No | **Can be absent** |

### Pitting is non-monotonic, and that is the trap

Pitting **rises** from stage I to stage II and then **falls away again** through late stage II to stage III.
A reader who treats "does it pit?" as a severity dial gets stage III backwards: the absence of pitting in an
advanced limb means **fibrosis has replaced fluid**, not that the limb has improved. The tile says so
explicitly at both advanced stages, and a test asserts the wording.

**A limb may exhibit more than one stage** — the consensus says so outright, because different lymphatic
territories within one limb can be affected differently. The stage is a description of a region rather than a
verdict on a person, and it refers to the **physical condition of the extremities only**. Every stage's
result carries both statements.

### Severity, and why bilateral swelling breaks it

Graded by excess volume difference between limbs: **minimal** >5% to <20%, **moderate** 20-40%, **severe**
>40%. The consensus notes in the same paragraph that some clinics instead use >5-10% as minimal and >10-<20%
as mild, so the tile **names the convention it applies** rather than presenting one set of cut points as the
only one. It also offers a `none` grade, because subclinical lymphedema is measurable from about **3-5%** —
*below* the minimal grade — so a limb can be measurably abnormal and still ungraded.

Because the grade is an **inter-limb comparison**, bilateral swelling understates the disease. The tile
**requires** a bilateral answer and, when it is yes, attaches the caveat rather than silently returning a
falsely reassuring grade on exactly the patients with the most disease.

- `lib/isl-lymphedema-v539.js` — pure stage + severity + bilateral → both axes, with a `pittingFallsAway`
  flag. Exports `ISL_STAGES` and `ISL_SEVERITY`.
- `views/group-v539.js` (RV539) — three selects (dom `isl-stage`, `isl-severity`, `isl-bilateral`) under two
  **h2** headings, one per axis.
- `lib/meta.js` — ISL 2020 Consensus Document citation + accessed date + bands. No citation-staleness row
  (`ISL` is not in `ISSUER_PATTERN`).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1389.

**HIGH-STAKES:** this is a clinical description. It does **not diagnose lymphedema** or distinguish it from
the other causes of a swollen limb — venous insufficiency, heart, kidney or liver failure, deep vein
thrombosis, lipedema, and infection all present this way, and **some are urgent**. It does not identify
whether a lymphedema is primary or secondary, and it is not an indication for compression, manual lymphatic
drainage, or surgery ([spec-v11](spec-v11.md) §5.3). An acutely painful, red, or hot limb needs assessment
for **cellulitis or thrombosis** rather than staging — a test asserts the copy says so.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the condition (`lymphedema`, `elephantiasis`), the issuing
society (`isl`), the investigation (`lymphoscintigraphy`), and the classic sign (`stemmer`) — each against
**both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. All zero.

## Sourcing (spec-v97)

- **Citation:** International Society of Lymphology. The diagnosis and treatment of peripheral lymphedema:
  2020 Consensus Document of the International Society of Lymphology. *Lymphology.* 2020;53(1):3-19.
- Transcribed **directly from the ISL's own hosted consensus PDF** and corroborated against an independent
  reproduction of the identically worded earlier edition. This was the best-sourced instrument of its
  research batch.

## Verification

Lint (all catalog-truth surfaces at 1389), unit suite (+10 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute limb volume from circumference measurements, interpret lymphoscintigraphy or
bioimpedance, elicit or grade the Stemmer sign, diagnose lymphedema, distinguish primary from secondary
disease, or recommend therapy. The MCP adapter + golden-probe promotion ship in the same wave (364).
