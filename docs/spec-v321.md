# spec-v321.md — Hinchey classification of acute diverticulitis tile

> Status: **SHIPPED (2026-07-15).** Builds the `hinchey` tile — the original Hinchey classification that
> stages perforated/complicated diverticulitis I–IV. Catalog **1172 → 1173**, group G.

## Why

The catalog had no Hinchey tile ("hinchey" had zero corpus hits) — yet it is the standard severity staging
for complicated diverticulitis and the peer of the existing `mannheim-peritonitis-index`. `hinchey` /
`diverticulitis stage` routed to nothing.

## What it does

The clinician picks the stage (I–IV) from the operative/CT findings; the tile reports the stage and its
standard definition.

- `lib/hinchey-v321.js` — pure stage → definition. **I:** localized pericolic/mesocolic abscess or
  phlegmon. **II:** pelvic, distant intra-abdominal, or retroperitoneal abscess. **III:** generalized
  purulent peritonitis. **IV:** generalized fecal (feculent) peritonitis. Accepts roman I–IV or arabic 1–4.
  Stages III–IV are the severe (generalized-peritonitis) end.
- `views/group-v321.js` (RV321) — one select (Deauville-style), real `<label for>`.
- `lib/meta.js` — Hinchey 1978 citation + accessed date + per-stage bands. No citation-staleness row (the
  Adv Surg citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v42 → v43); corpus → 1173.

**HIGH-STAKES:** it reports the stage the clinician has determined from the findings, never a diagnosis or a
management order ([spec-v11](spec-v11.md) §5.3); the drainage-vs-surgery decision stays with the clinician.

## Sourcing (spec-v97)

- **Citation:** Hinchey EJ, Schaal PG, Richards GK. Treatment of perforated diverticular disease of the
  colon. *Adv Surg.* 1978;12:85-109 (the original four-stage classification). Cross-verified across
  Radiopaedia / Wikipedia reproductions of the original I–IV stages.
- The tile uses the **original** four stages. A CT-era modified Hinchey (Wasvary) adds stage 0 (mild
  clinical diverticulitis) and splits stage I into Ia (phlegmon) / Ib (abscess); that is noted but not
  built here.

## Verification

Lint (all catalog-truth surfaces at 1173), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: the example (stage III) renders the "generalized purulent peritonitis" definition, and selecting
stage IV flips the result to the severe "fecal peritonitis" band.

## Out of scope

The tile echoes the stage the clinician selects; it does not diagnose diverticulitis, read the CT, or choose
between drainage and surgery. The modified Hinchey (0/Ia/Ib) is out of scope. The MCP adapter +
golden-probe promotion follow in a separate wave.
