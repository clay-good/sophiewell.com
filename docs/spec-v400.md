# spec-v400.md — Nyhus classification (groin hernia) tile

> Status: **SHIPPED (2026-07-17).** Builds the `nyhus-hernia` tile — the Nyhus classification of groin
> (inguinal / femoral) hernias (types I/II/IIIa/IIIb/IIIc/IVa/IVb/IVc/IVd). Catalog **1251 → 1252**, group G.

## Why

The general-surgery classification tiles had no anatomic classification for a groin hernia — the entity a
general surgeon describes and repairs most often. The Nyhus classification, by the anatomy of the defect, is
the classic. `nyhus` / `groin hernia classification` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type and its anatomic description.

- `lib/nyhus-hernia-v400.js` — pure type → description. **I:** indirect, normal internal ring. **II:**
  indirect, dilated ring, posterior wall intact. **IIIa:** direct. **IIIb:** large indirect encroaching on
  the posterior wall (sliding / pantaloon). **IIIc:** femoral. **IVa-d:** recurrent (direct / indirect /
  femoral / combined). Accepts the roman types, 1/2, and the 3a-3c / 4a-4d subtypes; bare `III` or `IV` is
  ambiguous → invalid.
- `views/group-v400.js` (RV400) — one select (dom `nyhus-type`), real `<label for>`.
- `lib/meta.js` — Nyhus 1991/2004 citation + accessed date + grouped bands. No citation-staleness row (the
  citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v121 → v122); corpus → 1252.

**HIGH-STAKES:** it reports the anatomic type the clinician has determined at examination / operation, never
a diagnosis, a repair recommendation, or a prognosis ([spec-v11](spec-v11.md) §5.3). The type describes the
defect; the repair decision stays with the operating surgeon.

## Sourcing (spec-v97)

- **Citation:** Nyhus LM. Individualization of hernia repair: a new era. *Surgery.* 1991;110(1):1-2; Nyhus
  LM. Classification of groin hernia: milestones. *Hernia.* 2004;8(2):87-88.
- Cross-verified against general-surgery / hernia references reproducing the same intact-ring (I) /
  dilated-ring (II) / posterior-wall-defect (III: a direct, b indirect, c femoral) / recurrent (IV: a
  direct, b indirect, c femoral, d combined) grouping.

## Verification

Lint (all catalog-truth surfaces at 1252), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type IIIa renders "direct inguinal hernia," I/II flip to the normal / dilated internal ring, IIIc
to femoral, and the IVa-d recurrent subtypes each resolve; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not examine the patient, resolve the subtype, or
recommend a repair (open vs laparoscopic, mesh choice). The MCP adapter + golden-probe promotion follow in a
separate wave.
