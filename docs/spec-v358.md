# spec-v358.md — Ramsay Sedation Scale tile

> Status: **SHIPPED (2026-07-16).** Builds the `ramsay-sedation` tile — the Ramsay Sedation Scale
> (levels 1–6). Catalog **1209 → 1210**, group G.

## Why

The catalog carries the RASS (Richmond) and SAS/Riker sedation scales but not the Ramsay scale they
descend from — the original, still widely used clinical scale for the depth of sedation. `ramsay
sedation scale` / `ramsay score` / `sedation level` routed to nothing. (Companion-gap: the ICU sedation
cluster had RASS and SAS/Riker but not Ramsay.)

## What it does

The clinician picks the sedation level; the tile reports the level, its description, whether the patient
is awake or asleep, and whether the level falls outside the cooperative-to-lightly-sedated range (2–4).

- `lib/ramsay-sedation-v358.js` — pure level → description. Awake: **1** agitated/restless — flagged;
  **2** cooperative, tranquil; **3** responds to commands only. Asleep: **4** brisk response to a
  glabellar tap / loud stimulus; **5** sluggish response — flagged; **6** no response — flagged. Accepts
  1–6 (string or number); out-of-range is guarded.
- `views/group-v358.js` (RV358) — one select (dom `ramsay-level`), real `<label for>`.
- `lib/meta.js` — Ramsay et al. 1974 (BMJ) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v79 → v80); corpus → 1210.

**HIGH-STAKES:** it reports the Ramsay level the clinician has determined at the bedside, never a
diagnosis, a titration order, or a target ([spec-v11](spec-v11.md) §5.3). The sedation target depends on
the clinical context and local protocol; the titration decision stays with the treating clinician
(surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Ramsay MA, Savege TM, Simpson BR, Goodwin R. Controlled sedation with
  alphaxalone-alphadolone. *Br Med J.* 1974;2(5920):656-659 (the original six-level scale).
- Cross-verified against ICU / anesthesia references reproducing the same awake (1–3) / asleep (4–6)
  level definitions.

## Verification

Lint (all catalog-truth surfaces at 1210), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (level 2) renders the "cooperative, tranquil" description with the awake state,
level 6 flips to the flagged "no response" deep-sedation description, and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the level the clinician selects; it does not assess the patient, set a sedation target,
or titrate. The MCP adapter + golden-probe promotion follow in a separate wave.
