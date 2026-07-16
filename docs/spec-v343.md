# spec-v343.md — Sanders classification (calcaneal fracture) tile

> Status: **SHIPPED (2026-07-16).** Builds the `sanders-calcaneal` tile — the Sanders classification of
> an intra-articular calcaneal fracture (types I–IV). Catalog **1194 → 1195**, group G.

## Why

The catalog carries the talar-neck (Hawkins), ankle (Danis-Weber), tibial-plateau (Schatzker),
femoral-neck (Garden), physeal (Salter-Harris), proximal-humerus (Neer), and radial-head (Mason)
fracture classifications but had no calcaneal classification — the foot-trauma companion to the Hawkins
talar tile. The Sanders classification is the CT-based standard for grading an intra-articular calcaneal
fracture. `sanders classification` / `calcaneal fracture type` routed to nothing.

## What it does

The clinician picks the CT-based fragmentation pattern; the tile reports the type, its description, and
whether it is a more comminuted (type III–IV) pattern.

- `lib/sanders-calcaneal-v343.js` — pure type → description. **I:** nondisplaced (< 2 mm). **II:**
  two-part (one fracture line). **III:** three-part (two fracture lines) with a depressed middle
  fragment — flagged. **IV:** four or more parts (highly comminuted) — flagged. Accepts roman I–IV or
  numeric 1–4, case-insensitive.
- `views/group-v343.js` (RV343) — one select (dom `sanders-type`), real `<label for>`.
- `lib/meta.js` — Sanders 1993 citation + accessed date + grouped bands. No citation-staleness row (the
  Clin Orthop Relat Res citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v64 → v65); corpus → 1195.

**HIGH-STAKES:** it reports the Sanders type the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The prognostic / operative
implications each type carries are the classically taught association, not an order; the management
decision stays with the surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Sanders R, Fortin P, DiPasquale T, Walling A. Operative treatment in 120 displaced
  intraarticular calcaneal fractures. Results using a prognostic computed tomography scan
  classification. *Clin Orthop Relat Res.* 1993;(290):87-95 (the four CT types + A/B/C fracture lines).
- Cross-verified against foot-and-ankle trauma references (OrthoConsult / Radiopaedia / UW emergency
  radiology) reproducing the same type-I–IV coronal-CT definitions.

## Verification

Lint (all catalog-truth surfaces at 1195), unit suite (+5 + fuzz), build — all green. Verified in a
real browser: the example (type III) renders the "three-part / more comminuted" warn description, type I
flips to the "nondisplaced (< 2 mm)" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the CT, count fragments, or predict an
individual patient's outcome. The A/B/C subtype letters are described in the note, not taken as separate
inputs. The MCP adapter + golden-probe promotion follow in a separate wave.
