# spec-v348.md — Strasberg classification (bile duct injury) tile

> Status: **SHIPPED (2026-07-16).** Builds the `strasberg-bdi` tile — the Strasberg classification of a
> bile duct injury (types A–E). Catalog **1199 → 1200**, group G.

## Why

The catalog carries the Tokyo Guidelines cholangitis / cholecystitis grading but had no bile duct injury
classification — the standard way to describe an iatrogenic bile duct injury (most often during
laparoscopic cholecystectomy). The Strasberg classification is the modern standard (a modification of the
Bismuth classification that separates the minor leaks from the major main-duct injuries). `strasberg
classification` / `bile duct injury type` routed to nothing.

## What it does

The clinician picks the injury type; the tile reports the type, its description, and whether it is a
major (type D–E) injury.

- `lib/strasberg-bdi-v348.js` — pure type → description. **A:** leak from a small duct in continuity
  (cystic stump / Luschka). **B:** occlusion of an aberrant sectoral duct. **C:** leak from an aberrant
  sectoral duct not in continuity. **D:** lateral injury to the extrahepatic duct — flagged. **E:**
  transection of the main bile duct (E1–E5 by level) — flagged. Accepts A–E, case-insensitive.
- `views/group-v348.js` (RV348) — one select (dom `strasberg-type`), real `<label for>`.
- `lib/meta.js` — Strasberg 1995 citation + accessed date + grouped bands. No citation-staleness row
  (the J Am Coll Surg citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v69 → v70); corpus → 1200.

**HIGH-STAKES:** it reports the Strasberg type the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The minor (A–C, often ERCP-managed)
vs major (D–E, often surgical) split is the classically taught association, not an order; the management
decision stays with the hepatobiliary surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Strasberg SM, Hertl M, Soper NJ. An analysis of the problem of biliary injury during
  laparoscopic cholecystectomy. *J Am Coll Surg.* 1995;180(1):101-125 (types A–E; E1–E5 by level, the
  Bismuth analogue).
- Cross-verified against hepatobiliary references (Radiopaedia / surgical reviews) reproducing the same
  A–E definitions.

## Verification

Lint (all catalog-truth surfaces at 1200), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (type D) renders the "lateral extrahepatic injury / major" warn description, type A
flips to the "small duct in continuity, minor" description, and the tile does not scroll horizontally at
320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, distinguish the E1–E5 subtypes
as separate inputs (they are described in the note), or recommend a specific repair. The MCP adapter +
golden-probe promotion follow in a separate wave.
