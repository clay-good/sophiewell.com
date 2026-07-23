# spec-v498.md — Narakas classification (obstetric brachial plexus palsy) tile

> Status: **SHIPPED (2026-07-23).** Builds the `narakas-obpp` tile — the Narakas classification of obstetric
> brachial plexus palsy by root involvement, groups I-IV. Catalog **1348 → 1349**, group G.

## Why

`brachial plexus` was zero-hit across the entire corpus — the plexus was uncovered. The one nerve tile,
`seddon-sunderland`, grades the *degree* of injury to a nerve (neurapraxia through neurotmesis); it says
nothing about which roots a birth-related plexus lesion involves. Different axis, and the commonest pediatric
plexus injury had no descriptor at all.

## What it does

The clinician picks the group; the tile reports the group and its root-involvement description.

- `lib/narakas-obpp-v498.js` — pure group → description, the four Narakas groups. **I:** C5-C6, the upper
  trunk (Erb palsy). **II:** C5-C7, adding wrist and finger extension. **III:** C5-T1, a complete flaccid limb
  without Horner syndrome. **IV:** C5-T1 with Horner syndrome. Accepts I-IV and 1-4.
- `views/group-v498.js` (RV498) — one select (dom `narakas-group`), real `<label for>`.
- `lib/meta.js` — Narakas 1987 (The Paralysed Hand) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author book chapter, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v218 → v219); corpus → 1349.

**HIGH-STAKES:** it reports the group the clinician has determined from the examination, never a diagnosis, a
decision to operate or refer for nerve reconstruction, and **never a recovery prediction for an individual
infant** ([spec-v11](spec-v11.md) §5.3). The groups are ordered by increasing extent of root involvement; the
tile deliberately states that ordering as anatomy, not as prognosis. The management decision stays with the
brachial-plexus team.

## Sourcing (spec-v97)

- **Citation:** Narakas AO. Obstetrical brachial plexus injuries. In: Lamb DW, ed. *The Paralysed Hand.*
  Edinburgh: Churchill Livingstone; 1987:116-135. The citation URL is a PubMed term search (the primary source
  is a book chapter).
- Cross-verified against pediatric brachial-plexus references reproducing the same C5-C6 (I) / C5-C7 (II) /
  C5-T1 (III) / C5-T1-with-Horner (IV) grouping.

## Verification

Lint (all catalog-truth surfaces at 1349), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: group II renders "plus affected wrist and finger extension," III and IV flip on Horner syndrome; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the group the clinician selects; it does not examine the infant, localize the lesion to
pre- or post-ganglionic, or time a referral. The Mallet shoulder-function score (a five-movement scored
instrument) is a separate build. The MCP adapter + golden-probe promotion follow in the next wave (323).
