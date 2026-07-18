# spec-v427.md — Vaughan Williams antiarrhythmic classification tile

> Status: **SHIPPED (2026-07-18).** Builds the `vaughan-williams` tile — the Vaughan Williams classification
> of antiarrhythmic drug actions, classes Ia/Ib/Ic/II/III/IV. Catalog **1278 → 1279**, group G.

## Why

The catalog had no antiarrhythmic-class classification — the standard Vaughan Williams framework for grouping
antiarrhythmics by mechanism. `vaughan williams` / `antiarrhythmic class` routed to nothing. This fills that
cardiology / pharmacology gap.

## What it does

The user picks the class; the tile reports the class, its mechanism, and representative agents.

- `lib/vaughan-williams-v427.js` — pure class → mechanism, the classic four-class scheme (Class I subdivided
  Ia/Ib/Ic). **Ia:** Na-channel blockers, moderate block (quinidine, procainamide). **Ib:** weak block
  (lidocaine, mexiletine). **Ic:** marked block (flecainide, propafenone). **II:** beta-blockers (metoprolol,
  propranolol). **III:** K-channel blockers (amiodarone, sotalol, dofetilide). **IV:** non-dihydropyridine
  Ca-channel blockers (verapamil, diltiazem). Accepts Ia-IV, 1a/1b/1c, and 2-4.
- `views/group-v427.js` (RV427) — one select (dom `vw-class`), real `<label for>`.
- `lib/meta.js` — Vaughan Williams 1984 (J Clin Pharmacol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v148 → v149); corpus → 1279.

**HIGH-STAKES:** it reports the class the user selects and its mechanism, never a prescribing decision, a dose,
a diagnosis, or a prognosis ([spec-v11](spec-v11.md) §5.3). Many antiarrhythmics act in more than one class
(e.g., amiodarone); the prescribing decision stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Vaughan Williams EM. A classification of antiarrhythmic actions reassessed after a decade of
  new drugs. *J Clin Pharmacol.* 1984;24(4):129-147.
- Cross-verified against cardiology / pharmacology references reproducing the same Na-channel (I) /
  beta-blocker (II) / K-channel (III) / Ca-channel (IV) grouping. This tile reports the classic four-class
  scheme; the modernized (Lei 2018) extension adding classes 0 and V-VII is out of scope.

## Verification

Lint (all catalog-truth surfaces at 1279), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: class III renders "potassium-channel blockers ... amiodarone," the other classes flip to their
mechanisms; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the class the user selects; it does not classify a specific drug by name, capture
multi-class agents, or make a prescribing decision. The MCP adapter + golden-probe promotion follow in a
separate wave.
