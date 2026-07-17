# spec-v378.md — Delbet classification (pediatric femoral neck fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `delbet-femoral-neck` tile — the Delbet (Delbet-Colonna)
> classification of a pediatric femoral neck / proximal femur fracture (types I-IV). Catalog
> **1229 → 1230**, group G.

## Why

The catalog carries the adult hip-fracture eponyms (Garden, Pauwels, Pipkin, Crowe, Hartofilakidis) but
not the Delbet classification — the standard grading of a **pediatric** femoral neck fracture, by the
anatomic level of the fracture line, which stratifies the risk of avascular necrosis (AVN) of the femoral
head. `delbet` / `pediatric femoral neck fracture classification` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type, its anatomic description, and whether it is a
higher-AVN-risk (type I-II) fracture.

- `lib/delbet-femoral-neck-v378.js` — pure type → description. **I:** transepiphyseal (proximal femoral
  epiphysis separation) — the highest AVN risk, worst outcomes; flagged. **II:** transcervical (mid neck)
  — the most common, high AVN risk; flagged. **III:** cervicotrochanteric / basicervical — lower risk.
  **IV:** intertrochanteric — the lowest AVN risk. Accepts I/II/III/IV or 1-4, case-insensitive.
- `views/group-v378.js` (RV378) — one select (dom `delbet-type`), real `<label for>`.
- `lib/meta.js` — Colonna 1929 (+ JAAOS 2018 review) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v99 → v100); corpus → 1230.

**HIGH-STAKES:** it reports the Delbet type the clinician has determined from the imaging, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The falling-AVN-risk
gradient (I → IV) is the classically taught pattern, not an order; the management decision stays with the
orthopedic / trauma team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Colonna PC. Fracture of the neck of the femur in children. *Am J Surg.*
  1929;6:793-797 (the classic English description of the Delbet types). Reviewed in Spence D, et al.
  Management of pediatric femoral neck fractures. *J Am Acad Orthop Surg.* 2018;26(11):389-402.
- Cross-verified against POSNA and orthopedic references reproducing the same four anatomic levels and
  the descending AVN gradient (~type I 38-100% / II 28-50% / III 18-27% / IV 5-14%).

## Verification

Lint (all catalog-truth surfaces at 1230), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type I renders the flagged "transepiphyseal / highest AVN risk" description, type IV flips to the
"intertrochanteric / lowest AVN risk" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, subclassify type I (with vs
without epiphyseal dislocation), or recommend fixation. The MCP adapter + golden-probe promotion follow
in a separate wave.
