# spec-v370.md — Hartofilakidis classification (hip dysplasia) tile

> Status: **SHIPPED (2026-07-17).** Builds the `hartofilakidis-ddh` tile — the Hartofilakidis
> classification of adult developmental dysplasia of the hip (types A/B/C). Catalog **1221 → 1222**,
> group G.

## Why

The catalog carries the Crowe classification of adult DDH (`crowe-ddh`) but not the Hartofilakidis
classification — the second widely used adult-DDH classification, which grades the hip by the
relationship of the femoral head to the true acetabulum. `hartofilakidis` / `hartofilakidis
classification` / `low dislocation hip` routed to nothing. (Companion: Crowe grades by subluxation
percentage; Hartofilakidis grades by dysplasia vs low vs high dislocation.)

## What it does

The clinician picks the type; the tile reports the type, its description, and whether it is a dislocation
(type B–C).

- `lib/hartofilakidis-ddh-v370.js` — pure type → description. **A:** dysplasia (head within the true
  acetabulum). **B:** low dislocation (false acetabulum partially overlaps the true one) — flagged. **C:**
  high dislocation (false acetabulum with no connection to the true one) — flagged. Accepts A/B/C or 1–3,
  case-insensitive.
- `views/group-v370.js` (RV370) — one select (dom `hart-type`), real `<label for>`.
- `lib/meta.js` — Hartofilakidis 1988 (JBJS Br) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v91 → v92); corpus → 1222.

**HIGH-STAKES:** it reports the Hartofilakidis type the clinician has determined from the radiograph,
never a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The
reconstruction-complexity association (rising A → B → C) is the classically taught pattern, not an order;
the surgical decision stays with the orthopedic surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Hartofilakidis G, Stamos K, Ioannidis TT. Low friction arthroplasty for old untreated
  congenital dislocation of the hip. *J Bone Joint Surg Br.* 1988;70(2):182-186.
- Cross-verified against the CORR "Classifications in Brief" (2019) and orthopedic references reproducing
  the same three types (dysplasia / low dislocation / high dislocation).

## Verification

Lint (all catalog-truth surfaces at 1222), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type B renders the flagged "low dislocation" description, type A flips to the un-flagged
"dysplasia" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, measure the acetabulum, or
recommend a reconstruction. The MCP adapter + golden-probe promotion follow in a separate wave.
