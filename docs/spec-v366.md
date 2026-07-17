# spec-v366.md — Penetrating neck trauma zones tile

> Status: **SHIPPED (2026-07-16).** Builds the `neck-zone` tile — the anatomic zones of the neck for
> penetrating trauma (Zones I–III). Catalog **1217 → 1218**, group G.

## Why

The catalog has trauma scores (ISS/RTS, TRISS, MESS) but no neck-zone reference — the classic division of
the neck used to describe the location of a penetrating injury and the structures at risk. `neck zone` /
`penetrating neck trauma zone` / `zone 2 neck` routed to nothing.

## What it does

The clinician picks the zone; the tile reports the zone's boundaries, the structures at risk, and the
surgical-access consideration.

- `lib/neck-zone-v366.js` — pure zone → description. **I:** sternal notch/clavicles → cricoid (great
  vessels, lung apices, trachea, esophagus; treated like an upper thoracic injury). **II:** cricoid →
  angle of the mandible (carotids, jugulars, larynx, proximal esophagus; the most surgically accessible
  zone). **III:** angle of the mandible → skull base (distal carotid, vertebral artery; treated like a
  head injury). Accepts I/II/III or 1–3, case-insensitive.
- `views/group-v366.js` (RV366) — one select (dom `neck-zone`), real `<label for>`.
- `lib/meta.js` — Roon & Christensen 1979 citation (+ StatPearls/EAST) + accessed date + grouped bands.
  No citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v87 → v88); corpus → 1218 (with a
  `band` CAP 108 → 100 trim to restore gzip-budget headroom).

**HIGH-STAKES:** it reports the anatomic zone the clinician has identified, never a diagnosis, a
management decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Any penetrating neck injury is
high-stakes; the modern **"no-zone" approach** drives management by hard signs of injury and hemodynamic
stability with CT angiography rather than by zone alone (surfaced in the tile note). No zone is flagged
abnormal (the zone is an anatomic descriptor). The management decision stays with the trauma team.

## Sourcing (spec-v97)

- **Citation:** Roon AJ, Christensen N. Evaluation and treatment of penetrating cervical injuries. *J
  Trauma.* 1979;19(6):391-397, with the zone boundaries as reproduced in StatPearls (Neck Trauma) and the
  EAST practice guidelines.
- Cross-verified against Radiopaedia and standard trauma references reproducing the same three zones
  bounded by the cricoid cartilage and the angle of the mandible.

## Verification

Lint (all catalog-truth surfaces at 1218), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: Zone II renders the "cricoid → angle of the mandible / most surgically accessible" description,
Zone I flips to the "thoracic-outlet" description, and the tile does not scroll horizontally at 320px.

## Corpus budget

At 1218 tiles the gzipped search corpus approached its fixed 200 KB budget; the `band` CAP was reduced
108 → 100 chars in `scripts/build-search-corpus.mjs` (the lowest-signal corpus text) to restore headroom,
with zero search-relevance change — all 181 golden probes still route into top-3.

## Out of scope

The tile echoes the zone the clinician selects; it does not assess the injury, apply the no-zone
algorithm, or recommend imaging/exploration. The MCP adapter + golden-probe promotion follow in a
separate wave.
