# spec-v438.md — Eaton-Littler stage (thumb CMC arthritis) tile

> Status: **SHIPPED (2026-07-19).** Builds the `eaton-littler` tile — the Eaton-Littler classification of thumb
> carpometacarpal (basal-joint) osteoarthritis, stages I/II/III/IV. Catalog **1289 → 1290**, group G.

## Why

The catalog had no staging for thumb-base (basal-joint) arthritis — the standard Eaton-Littler radiographic
staging. `eaton littler` / `thumb cmc arthritis stage` routed to nothing. This fills that hand / orthopedics
gap.

## What it does

The clinician picks the stage; the tile reports the stage and its radiographic description.

- `lib/eaton-littler-v438.js` — pure stage → description, the four Eaton-Littler stages. **I:** normal or
  slightly widened TM joint (synovitis). **II:** slight narrowing, osteophytes < 2 mm, subluxation up to
  one-third. **III:** marked narrowing, osteophytes ≥ 2 mm, subluxation > one-third, scaphotrapezial joint
  spared. **IV:** pantrapezial arthritis. Accepts I-IV and 1-4.
- `views/group-v438.js` (RV438) — one select (dom `eaton-stage`), real `<label for>`.
- `lib/meta.js` — Eaton & Littler 1973 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v159 → v160); corpus → 1290.

**HIGH-STAKES:** it reports the radiographic stage the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the hand
/ orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Eaton RG, Littler JW. Ligament reconstruction for the painful thumb carpometacarpal joint. *J
  Bone Joint Surg Am.* 1973;55(8):1655-1666 (refined by Eaton & Glickel 1987).
- Cross-verified against hand / orthopedic references reproducing the same normal/widened (I) /
  slight-narrowing (II) / marked-narrowing (III) / pantrapezial (IV) staging.

## Verification

Lint (all catalog-truth surfaces at 1290), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: stage II renders "slight narrowing of the TM joint," the other stages flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read the radiograph, choose between splinting,
injection, or arthroplasty, or estimate outcome. The MCP adapter + golden-probe promotion follow in a separate
wave.
