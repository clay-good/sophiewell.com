# spec-v467.md — Bromage scale (neuraxial motor block) tile

> Status: **SHIPPED (2026-07-19).** Builds the `bromage-scale` tile — the Bromage scale of motor block after
> neuraxial anesthesia, grades I/II/III/IV. Catalog **1317 → 1318**, group G.

## Why

The catalog had post-anesthesia recovery scoring (Aldrete) but no Bromage scale — the standard bedside grade of
motor block after epidural / spinal anesthesia. `bromage` / `motor block scale` routed to nothing. This
companions the Aldrete tile (anesthesia recovery).

## What it does

The clinician picks the grade; the tile reports the grade and its residual-movement description.

- `lib/bromage-scale-v467.js` — pure grade → description, the four (original) Bromage grades. **I:** nil (free
  knees and feet). **II:** partial (just able to flex the knees). **III:** almost complete (unable to flex the
  knees, some foot movement). **IV:** complete (unable to move the legs or feet). Accepts I-IV and 1-4.
- `views/group-v467.js` (RV467) — one select (dom `bromage-grade`), real `<label for>`.
- `lib/meta.js` — Bromage 1965/1978 citation + accessed date + grouped bands. No citation-staleness row (the
  citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v187 → v188); corpus → 1318.

**HIGH-STAKES:** it reports the motor-block grade the clinician has determined on examination, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays
with the anesthesia team.

## Sourcing (spec-v97)

- **Citation:** Bromage PR. *Epidural Analgesia.* Philadelphia: WB Saunders; 1978 (originating from Bromage
  1965). The citation URL is a PubMed term search.
- Cross-verified against anesthesia references reproducing the same nil (I) / partial (II) / almost-complete
  (III) / complete (IV) grading. A widely used modified Bromage renumbers these 0-3; this tile uses the
  original I-IV numbering and notes the modified equivalence.

## Verification

Lint (all catalog-truth surfaces at 1318), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade II renders "partial: just able to flex the knees," the other grades flip to their descriptions;
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not examine the patient or recommend management. The
MCP adapter + golden-probe promotion follow in the next wave (292).
