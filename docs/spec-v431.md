# spec-v431.md — Modified Bell staging (NEC) tile

> Status: **SHIPPED (2026-07-18).** Builds the `bell-nec` tile — the modified Bell staging of necrotizing
> enterocolitis, stages IA/IB/IIA/IIB/IIIA/IIIB. Catalog **1282 → 1283**, group G.

## Why

The neonatology cluster gained the Sarnat HIE staging ([spec-v429](spec-v429.md)) and the Papile IVH grade
([spec-v430](spec-v430.md)) but had no staging for necrotizing enterocolitis — the standard modified Bell
staging. `bell staging` / `necrotizing enterocolitis stage` routed to nothing. This completes the trio.

## What it does

The clinician picks the stage; the tile reports the stage and its hallmark systemic, intestinal, and
radiographic findings.

- `lib/bell-nec-v431.js` — pure stage → findings, the modified Bell (Walsh & Kliegman 1986) staging. **IA/IB:**
  suspected (IB adds grossly bloody stool). **IIA:** proven, mildly ill (pneumatosis intestinalis). **IIB:**
  proven, moderately ill (portal venous gas, acidosis, thrombocytopenia). **IIIA:** advanced, severely ill,
  bowel intact (peritonitis, ascites). **IIIB:** advanced, perforated (pneumoperitoneum). Accepts the stages
  and 1a-3b forms.
- `views/group-v431.js` (RV431) — one select (dom `bell-stage`), real `<label for>`.
- `lib/meta.js` — Walsh & Kliegman 1986 (Pediatr Clin North Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v152 → v153); corpus → 1283.

**HIGH-STAKES:** it reports the stage the clinician has assigned, never a diagnosis, a treatment decision
(medical management vs surgery), or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays
with the neonatology / pediatric-surgery team.

## Sourcing (spec-v97)

- **Citation:** Walsh MC, Kliegman RM. Necrotizing enterocolitis: treatment based on staging criteria.
  *Pediatr Clin North Am.* 1986;33(1):179-201 (the modified Bell staging, refining Bell MJ, et al. *Ann
  Surg.* 1978).
- Cross-verified against neonatology / pediatric-surgery references reproducing the same suspected (I) /
  proven (II) / advanced (III) staging with the A/B substages.

## Verification

Lint (all catalog-truth surfaces at 1283), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: stage IIA renders "pneumatosis intestinalis," the other stages flip to their findings; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not examine the newborn, choose between medical and
surgical management, or estimate outcome. The MCP adapter + golden-probe promotion follow in a separate wave.
