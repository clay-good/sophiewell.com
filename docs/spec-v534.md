# spec-v534.md — Ridley-Jopling classification (leprosy spectrum) tile

> Status: **SHIPPED (2026-07-28).** Builds the `ridley-jopling` tile — the five-group immunologic spectrum of
> leprosy, plus indeterminate. Catalog **1383 → 1384**, group G.

## Why

Whole-disease gap: `ridley`, `jopling`, `leprosy`, `lepromatous`, and `bacillary` were **all** zero-hit
across `corpus.json`, `app.js`, and `lib/meta.js`. The catalog had no leprosy content of any kind. The
`hansen` hits are orthopedic eponyms (Winquist-Hansen femoral shaft, Lauge-Hansen ankle), not Hansen disease.

## What it does

**A spectrum, not a ladder of severity.** The five groups are ordered by the patient's **cell-mediated immune
response**: TT (high resistance) → BT → BB (unstable middle) → BL → LL (little or none). Everything else
follows from where a case sits — few asymmetric lesions and a positive lepromin test at the tuberculoid pole,
many symmetric lesions and an absent response at the lepromatous pole. The tile reports immunity, lesion
pattern, nerve involvement, lepromin response, and histology for each group.

**Indeterminate sits outside the five.** The original paper's title is "a five-group system"; indeterminate
is a pre-spectrum stage in a patient who has not yet mounted a classifiable response. The tile offers it as a
distinct answer and exposes an `onSpectrum` flag, rather than forcing it into TT. Pure neuritic leprosy is
likewise outside these five and is named as out of scope.

### The tile attaches no bacterial index number to a group, and that is deliberate

The BI **scale** is unambiguous and is reproduced in full (0 through 6+, by bacilli per field). But four
independent reproductions give **four different** per-group BI values — one puts BB at 2+, another 2-3+,
another 2-4+, another "≥2+" — partly because some quote the bacterial index of *granuloma* (tissue) rather
than the slit-skin smear BI, which runs higher. Per [spec-v97](spec-v97.md), where sources disagree the tile
reports only what they agree on: the **direction** (negative at the tuberculoid pole, rising across the
borderline groups, highest at the lepromatous pole). Quoting a number per group would manufacture a precision
the literature does not have. A test asserts no `bacterialIndex` field exists on any result.

**Two more disagreements, handled the same way.** Nerve involvement in TT: one source says none, three
describe a thickened nerve near the lesion — the tile uses wording all four support ("limited and localized
to the vicinity of the lesion"). The Grenz zone in LL: three say a thin zone is present, one says absent —
the majority is used and the minority noted in the histology text.

### The WHO classification is a different system, and its current rule is the thing to get right

Ridley-Jopling is a research and histopathologic classification; WHO's paucibacillary/multibacillary split is
**operational**, for choosing treatment duration. Crosswalk: TT and BT → paucibacillary; BB, BL, LL →
multibacillary. Under the **current** WHO definition a case is multibacillary if there are **more than five
skin lesions, OR any nerve involvement, OR bacilli on a slit-skin smear** — alternatives, not requirements.
**Nerve involvement alone makes a case multibacillary** even with few lesions; that is what stale references
most often get wrong, and it changes treatment duration. A test asserts the copy states it.

- `lib/ridley-jopling-v534.js` — pure group → multi-axis description, WHO class, and the BI scale. Exports
  `RJ_GROUPS`, `RJ_INDETERMINATE`, `BACTERIAL_INDEX_SCALE`.
- `views/group-v534.js` (RV534) — one select (dom `rj-group`) under an **h2** heading, offering indeterminate
  alongside the five.
- `lib/meta.js` — Ridley and Jopling 1966 citation + accessed date + bands. No citation-staleness row
  (a named-author article; `WHO` appears only in prose about a different classification, not as this tile's
  issuer).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1384.

**HIGH-STAKES:** this classifies a case **already diagnosed**. It does **not diagnose leprosy**, which rests
on the cardinal signs plus slit-skin smear and histopathology, and it **cannot be assigned from a clinical
description alone** — the lepromin response and the histology are part of the definition. It is not a
treatment regimen: multidrug therapy is chosen from the **WHO operational class**, not the Ridley-Jopling
group, and the tile emits no drugs, doses, or durations ([spec-v11](spec-v11.md) §5.3). It says nothing about
**leprosy reactions** (type 1 reversal, type 2 erythema nodosum leprosum), which cause most nerve damage and
are managed separately and urgently. Leprosy is **curable** and treatment is free through national programs,
so a classification is never a reason to delay referral — the copy says so.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponyms (`ridley`, `jopling`), the disease (`leprosy`,
`hansen`), and the pole/axis words (`lepromatous`, `bacillary`) — each against **both** `corpus.json` and
`app.js` (and `lib/meta.js`), plus a `test/unit/` scan. The only non-zero token is `hansen`, read in context
and orthopedic.

## Sourcing (spec-v97)

- **Citation:** Ridley DS, Jopling WH. Classification of leprosy according to immunity. A five-group system.
  *Int J Lepr Other Mycobact Dis.* 1966;34(3):255-273.
- The 1966 primary text is not openly accessible; each axis reported here was transcribed from independent
  reviews that agree on it. Axes on which sources **disagreed** — the per-group bacterial index, TT nerve
  involvement, the LL Grenz zone — are handled as described above rather than resolved by picking one
  source.

## Verification

Lint (all catalog-truth surfaces at 1384), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not diagnose leprosy, grade a slit-skin smear, classify leprosy reactions or pure neuritic
leprosy, apply the WHO operational class from raw findings, or emit a multidrug-therapy regimen. The MCP
adapter + golden-probe promotion follow in the next wave (359).
