# spec-v452.md — Brooker classification (heterotopic ossification) tile

> Status: **SHIPPED (2026-07-19).** Builds the `brooker` tile — the Brooker classification of heterotopic
> (ectopic) ossification about the hip, classes I/II/III/IV. Catalog **1303 → 1304**, group G.

## Why

The catalog's orthopedic imaging tiles (Outerbridge cartilage, Kellgren-Lawrence) had no Brooker grade — the
standard grading of heterotopic ossification about the hip, most often after total hip arthroplasty. `brooker`
/ `heterotopic ossification grade` routed to nothing. This fills that orthopedic-radiology gap.

## What it does

The clinician picks the class; the tile reports the class and its radiographic-extent description.

- `lib/brooker-v452.js` — pure class → description, the four Brooker classes by radiographic extent. **I:**
  islands of bone within the soft tissues. **II:** bone spurs leaving at least 1 cm between opposing bone
  surfaces. **III:** bone spurs reducing the gap to less than 1 cm. **IV:** apparent bony ankylosis. Accepts
  I-IV and 1-4.
- `views/group-v452.js` (RV452) — one select (dom `brooker-class`), real `<label for>`.
- `lib/meta.js` — Brooker 1973 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v173 → v174); corpus → 1304.

**HIGH-STAKES:** it reports the radiographic class the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Brooker AF, Bowerman JW, Robinson RA, Riley LH Jr. Ectopic ossification following total hip
  replacement. Incidence and a method of classification. *J Bone Joint Surg Am.* 1973;55(8):1629-1632.
- Cross-verified against orthopedic / radiology references reproducing the same islands (I) /
  spurs-with-≥1cm-gap (II) / spurs-with-<1cm-gap (III) / ankylosis (IV) grouping. The 1 cm threshold between
  opposing bone surfaces is the discriminator between classes II and III.

## Verification

Lint (all catalog-truth surfaces at 1304), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: class II renders "at least 1 cm between opposing bone surfaces," the other classes flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the class the clinician selects; it does not read the radiograph, measure the gap, or recommend
management (prophylaxis, excision). The MCP adapter + golden-probe promotion follow in the next wave (277).
