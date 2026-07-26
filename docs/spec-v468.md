# spec-v468.md — Brouet classification (cryoglobulinemia) tile

> Status: **SHIPPED (2026-07-19).** Builds the `brouet-cryoglobulinemia` tile — the Brouet classification of
> cryoglobulinemia, types I/II/III. Catalog **1318 → 1319**, group G.

## Why

The catalog had hematology staging (myeloma ISS, CLL Binet/Rai) and vasculitis prognosis (FFS) but no Brouet
classification — the standard immunochemical typing of cryoglobulinemia. `brouet` / `cryoglobulinemia type`
routed to nothing. This fills that hematology / rheumatology gap.

## What it does

The clinician picks the type; the tile reports the type and its clonality / disease-association description.

- `lib/brouet-cryoglobulinemia-v468.js` — pure type → description, the three Brouet types by clonality. **I:**
  a single monoclonal immunoglobulin (lymphoproliferative disorders). **II:** mixed — a monoclonal
  immunoglobulin plus polyclonal IgG (strongly linked to hepatitis C). **III:** mixed — polyclonal
  immunoglobulins only. Types II and III are "mixed" cryoglobulinemia. Accepts I-III and 1-3.
- `views/group-v468.js` (RV468) — one select (dom `brouet-type`), real `<label for>`.
- `lib/meta.js` — Brouet 1974 (Am J Med) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v188 → v189); corpus → 1319.

**HIGH-STAKES:** it reports the immunochemical type the clinician has determined from the cryoglobulin
characterization, never a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the
management decision stays with the hematology / rheumatology team.

## Sourcing (spec-v97)

- **Citation:** Brouet JC, Clauvel JP, Danon F, Klein M, Seligmann M. Biologic and clinical significance of
  cryoglobulins. A report of 86 cases. *Am J Med.* 1974;57(5):775-788. The citation URL is a PubMed term
  search for the classic paper.
- Cross-verified against hematology / rheumatology references reproducing the same monoclonal-only (I) /
  mixed-monoclonal-plus-polyclonal (II) / mixed-polyclonal-only (III) grouping.

## Verification

Lint (all catalog-truth surfaces at 1319), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "a monoclonal immunoglobulin ... plus polyclonal IgG," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not characterize the cryoglobulin or recommend
management (antiviral, immunosuppression). The MCP adapter + golden-probe promotion follow in the next wave
(293).
