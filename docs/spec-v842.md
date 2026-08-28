# spec-v842 — Heart Failure Stages A to D (ACC/AHA)

## What this gives you

Tick the risk factors, the structural and biomarker findings and the symptom history; get the
stage.

`nyha-class` describes how a patient *feels today*. These stages describe how far the disease
has *progressed*, and the two answer different questions.

## §1 The stages

| | |
|---|---|
| **A** | At risk — hypertension, cardiovascular disease, obesity, diabetes, cardiotoxic exposure, a cardiomyopathy variant or family history — with **no** symptoms, structural disease or biomarker abnormality |
| **B** | Pre-HF, no symptoms, with one of: structural heart disease; raised filling pressures on echo; or **stage A risk factors plus** a raised natriuretic peptide or persistently elevated troponin |
| **C** | Structural heart disease with **current or previous** symptoms |
| **D** | Advanced — symptoms interfering with daily life, resistant to control, causing recurrent hospitalizations despite guideline-directed therapy |

## §2 Stage C includes previous symptoms, and that is the point

A patient whose symptoms have resolved on treatment is **still stage C**. They do not return
to stage B.

So current and previous symptoms are **separate inputs** — a single "symptoms" tick could not
express the resolved case, which is exactly the one wrongly moved back. When symptoms are
recorded as resolved, the tile says so explicitly.

**This is the opposite of `af-stages-2023`**, where patients move in both directions,
including out of stage 4. Two staging systems for two cardiac diseases, one directional and
one not — easy to reason about interchangeably and wrongly, so each tile states its own
behavior rather than leaving the reader to assume.

## §3 The biomarker route into stage B is new

The 2022 guideline added it: **stage A risk factors plus** a raised natriuretic peptide or a
persistently elevated troponin. A hypertensive patient with a structurally normal heart and a
raised BNP is **stage B, not stage A** — a treatment-relevant difference a structure-only
reading misses, and the tile names it.

It requires the risk factors alongside: a raised biomarker on its own does not open the route,
and the tile says so rather than silently staging.

## §4 Sourcing (spec-v97 gate)

- Heidenreich PA, Bozkurt B, Aguilar D, et al. 2022 AHA/ACC/HFSA Guideline for the Management
  of Heart Failure. *Circulation.* 2022;145(18):e895-e1032.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §5 Posture

Decision support, not a verdict. It applies a published staging to findings already gathered.
It does not select or adjust therapy.

Catalog 1633 → 1634.
