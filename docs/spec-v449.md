# spec-v449.md — Fielding-Hawkins (atlantoaxial rotatory subluxation) tile

> Status: **SHIPPED (2026-07-19).** Builds the `fielding-hawkins` tile — the Fielding-Hawkins classification of
> atlantoaxial rotatory subluxation / fixation, types I/II/III/IV. Catalog **1300 → 1301**, group G.

## Why

The catalog's craniocervical tiles (Traynelis AOD, Anderson-Montesano condyle) had no Fielding-Hawkins type —
the standard classification of atlantoaxial rotatory subluxation. `fielding hawkins` / `atlantoaxial rotatory
subluxation type` routed to nothing. This continues the craniocervical cluster.

## What it does

The clinician picks the type; the tile reports the type and its displacement description.

- `lib/fielding-hawkins-v449.js` — pure type → description, the four Fielding-Hawkins types by atlas
  displacement. **I:** no anterior displacement (ADI ≤ 3 mm), odontoid pivot. **II:** anterior 3-5 mm,
  transverse ligament deficient. **III:** anterior > 5 mm, transverse and alar ligaments deficient. **IV:**
  posterior displacement. Accepts I-IV and 1-4.
- `views/group-v449.js` (RV449) — one select (dom `fh-type`), real `<label for>`.
- `lib/meta.js` — Fielding & Hawkins 1977 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v170 → v171); corpus → 1301.

**HIGH-STAKES:** it reports the imaging type the clinician has determined, never a diagnosis, a stability
determination, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision
stays with the spine / neurosurgery team.

## Sourcing (spec-v97)

- **Citation:** Fielding JW, Hawkins RJ. Atlanto-axial rotatory fixation. (Fixed rotatory subluxation of the
  atlanto-axial joint). *J Bone Joint Surg Am.* 1977;59(1):37-44.
- Cross-verified against spine / neuroradiology references reproducing the same no-displacement (I) / 3-5 mm
  (II) / > 5 mm (III) / posterior (IV) grouping.

## Verification

Lint (all catalog-truth surfaces at 1301), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type II renders "anterior displacement of 3 to 5 mm," the other types flip to their descriptions;
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the CT, measure the atlanto-dental interval,
or determine stability. The MCP adapter + golden-probe promotion follow in a separate wave.
