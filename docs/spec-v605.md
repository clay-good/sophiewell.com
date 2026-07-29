# spec-v605 — Harrington classification (periacetabular metastases)

## What this gives you

The Harrington class for an acetabulum destroyed by metastasis — and an explicit account of why class IV is
not the top of a severity ladder.

## Why it exists

A **companion on a different bone** to `mirels-score`: Mirels grades an impending pathological fracture of a
**long bone**; this classifies the **acetabulum**.

## The classes

| Class | Definition | Described reconstruction |
|---|---|---|
| I | Intact subchondral bone; contained cavitary defect | Cemented total hip arthroplasty |
| II | Medial wall + quadrilateral plate deficient, lateral wall and roof **spared** | Anti-protrusion device / flanged cup |
| III | Medial wall, lateral wall **and** roof deficient | Acetabuloplasty with large Steinmann pins |
| IV | **Solitary** metastasis resectable **for cure** | Saddle prosthesis after en-bloc resection |

## Class IV is not "worse than class III"

Classes I–III are a ladder of destruction. **Class IV is defined by resectability and by the disease burden
elsewhere — not by the acetabulum at all.** So:

| Finding | Class | Destruction ladder alone |
|---|---|---|
| Solitary, resectable, **intact** acetabulum | **IV** | I |
| Medial + lateral + roof deficient, disseminated | III | III |

**Class III is the one described as most challenging to reconstruct**, which follows directly.

## A rendering that inverts it

Some sources re-define class IV as "widespread destruction all the way to the wing of the ilium." That
**inverts the meaning**: under the original, class IV is not a hopeless acetabulum but the one patient who
might be cured. Two renderings disagreed; a third — a paper restating the original in order to extend it —
adjudicated in favour of resectability.

## The classes are reconstruction plans, not severity bands

Each carries a specific named construct. The class states **what operation the bone will accept**.

## Scope (spec-v11 §5.3)

Classifies a **pattern of destruction** and the reconstruction it demands. It does not decide whether to
operate at all, does not estimate **survival** — a separate axis covered by `bauer-score`,
`tokuhashi-revised` and `tomita-score` — and does not weigh radiotherapy, ablation, cementoplasty or
non-operative management against surgery. The named reconstructions are the classification's own, from an era
before modern implants and systemic therapy, and are **provenance rather than a recommendation**.

## Source

- Harrington KD. *J Bone Joint Surg Am.* 1981;63(4):653-664.

## Files

`lib/harrington-acetabular-v605.js`, `views/group-v605.js`,
`mcp/adapters/harrington-acetabular-v605.js` (wave 430), `test/unit/harrington-acetabular.test.js`.
Catalog 1454 → 1455; MCP 1391 → 1392.
