# spec-v361.md — Tanner staging (Sexual Maturity Rating) tile

> Status: **SHIPPED (2026-07-16).** Builds the `tanner-staging` tile — Tanner staging / Sexual Maturity
> Rating (stages 1–5) across the three Marshall-Tanner scales. Catalog **1212 → 1213**, group G.

## Why

The catalog has pediatric growth tiles (`mid-parental-height`, `who-growth-zscore`) but no Tanner
(pubertal) staging reference — a fundamental, constantly-used pediatric/endocrine assessment. `tanner
stage` / `sexual maturity rating` / `smr` routed to nothing.

## What it does

The clinician picks the development scale (breast / genital / pubic hair) and the stage (1–5); the tile
reports the standard Marshall-Tanner description. This is the first two-select tile in the recent
classification batch.

- `lib/tanner-staging-v361.js` — pure (scale, stage) → description. Three scales — **breast (female)**,
  **genital (male)**, **pubic hair** — each stage **1** (prepubertal) → **5** (adult). Scale aliases
  (b/g/ph, female/male); stage 1–5 (string or number). Invalid scale/stage guarded.
- `views/group-v361.js` (RV361) — two selects (dom `tanner-scale`, `tanner-stage`), real `<label for>`.
- `lib/meta.js` — Marshall & Tanner 1969/1970 (Arch Dis Child) citation + accessed date + grouped bands.
  No citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v82 → v83); corpus → 1213.

**HIGH-STAKES:** it reports the Tanner stage description the clinician has determined on examination,
never a diagnosis (precocious or delayed puberty), an age assessment, or a treatment decision
([spec-v11](spec-v11.md) §5.3). Whether a stage is early or late for age is an age-in-context judgment
the clinician makes; the assessment stays with the treating clinician (surfaced in the tile note). The
tile does not flag any stage as abnormal (the stages are developmental, not pathological). Audience is
clinicians/educators only.

## Sourcing (spec-v97)

- **Citation:** Marshall WA, Tanner JM. Variations in pattern of pubertal changes in girls. *Arch Dis
  Child.* 1969;44(235):291-303; and Variations in the pattern of pubertal changes in boys. *Arch Dis
  Child.* 1970;45(239):13-23.
- Cross-verified against StatPearls (Tanner Stages) and standard pediatric references reproducing the
  same stage 1–5 breast / genital / pubic-hair descriptions.

## Verification

Lint (all catalog-truth surfaces at 1213), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (breast / stage 2) renders the "breast bud stage" description, switching to genital
/ stage 5 renders "adult genitalia", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the (scale, stage) the clinician selects; it does not assess the patient, estimate bone
age, or diagnose a pubertal disorder. The MCP adapter + golden-probe promotion follow in a separate wave.
