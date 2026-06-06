# spec-v54.md — Citation integrity: inline, current, well-wrapped

> Status: proposed (2026-06-05). v54 is a zero-tile citation
> spec. It adds **no** new tile. It defines and enforces three
> invariants on every clinical tile's source citation —
> **inline**, **current (or justified-stale)**, and **well-
> formed / wrapping** — fixes the concrete citation defects found
> in the v52-close audit, and adds one automated gate
> (`scripts/check-citations.mjs`) plus a staleness ledger so the
> defects cannot silently reaccumulate. The catalog count is
> unchanged.
>
> Catalog effect at v54 close: **255 + 0 = 255 tiles.**
>
> Every prior spec (v4 through v53) remains in force. v54 changes
> no clinical formula and no tile result; it changes only the
> **provenance metadata** attached to each tile and how it is
> rendered. No URL changes to the tiles themselves, no runtime
> network call, no AI. Sophie's eight commitments
> ([spec-v50](spec-v50.md) §3) are preserved.

## 1. Thesis

Sophie's credibility is its citations. A free, login-less,
AI-free calculator earns trust only if the nurse can see, on the
tile, exactly which published source produced the number — the
author, the year, the journal or guideline edition — and can
tell whether that source is the *current* one. Three things
undermine that today, all confirmed in the v52-close audit:

1. **Off-tile citations.** Some sources live only in
   `docs/clinical-citations.md` / `docs/field-medicine-citations.md`
   and are not present inline in `META[id].citation`, so a user on
   the tile cannot see them without leaving the page.
2. **Undated / un-pinned guidelines.** Several guideline-derived
   tiles cite "current edition" or a bare year with no *accessed*
   date and no statement of whether a newer edition exists —
   e.g. CDC Field Triage "Current edition", Wells PE (2000) with
   no note about subsequent guidance, KDIGO AKI (2012) with no
   note about the 2024 CKD update, Beers (AGS 2023) with a
   `docs/data-sources.md` line that says the dataset was retired
   while `beersCheck` still ships embedded data.
3. **Formatting that can overflow.** Long DOIs/URLs embedded as
   bare text in a citation string can render as an unbroken token
   that overflows the tile column on narrow viewports, which the
   `essay`-style house rule (no horizontal scrolling) forbids.

v54's one-line invariant:

> **Every `clinical: true` tile carries a non-empty inline
> citation in `META[id].citation`; every guideline-derived tile
> additionally carries an `accessed` date and an entry in the
> staleness ledger naming the shipped edition and the latest
> known edition; and every citation string wraps within the tile
> column on a 320 px viewport with no horizontal scroll.**

v54 ships no tile (it passes v29 §3 vacuously) and is the
provenance counterpart to the input/output hardening in
[spec-v53](spec-v53.md). The two are independent.

## 2. The three invariants

### 2.1 Inline

For every tile with `clinical: true`, `META[id].citation` is a
non-empty string containing at minimum the primary source's
author(s) (or issuing body), title or instrument name, year, and
publication venue. The separate reference docs
(`docs/clinical-citations.md`, `docs/field-medicine-citations.md`)
remain as *aggregated* references but are no longer the *only*
home of any tile's primary citation. A citation that exists only
in a doc and not in `META` is a v54 violation.

Where a stable identifier exists, `META[id].citationUrl` holds a
DOI (`https://doi.org/...`) or the canonical publisher / agency
URL. The URL is **never** embedded as bare text inside
`citation`; it lives in `citationUrl` so the renderer
(`app.js` `appendLinkified` / `renderMetaBlock`) controls its
wrapping. (This is also what keeps invariant 2.3 enforceable.)

### 2.2 Current — or justified-stale

A clinical instrument is often *correctly* cited to a decades-old
foundational paper (GCS 1974, NIHSS 1989, Mallampati 1985); age
alone is not staleness. What v54 forbids is an *un-acknowledged*
gap between the shipped edition and a newer governing edition of
the **same** guideline.

Every guideline-derived tile (CDC, KDIGO, AGS Beers, ACC/AHA,
ATS/IDSA, ESC, WHO, Joint Commission, AAP, ACOG, and equivalents)
gets:

- an `accessed: 'YYYY-MM-DD'` field on its `META` source stamp,
  recording when the shipped text was last verified against the
  source;
- a row in `docs/citation-staleness.md` (§4.2) with: tile id,
  instrument, **edition shipped**, **latest known edition**, and a
  one-line **justification** when the two differ (e.g. "original
  derivation retained deliberately; later guidance is downstream
  risk-stratification, not a revised score").

A tile whose shipped edition is behind the latest known edition
**and** has no justification row fails the gate.

### 2.3 Well-formed / wrapping

- `citationUrl`, if present, is a syntactically valid
  `https://` URL.
- `citation` contains no raw `http(s)://` substring (URLs belong
  in `citationUrl`); the gate rejects bare URLs in citation text.
- The references block renders with `overflow-wrap: anywhere` /
  `word-break: break-word` on the citation and link elements so no
  single token forces horizontal scroll at 320 px. (`styles.css`
  already wraps most content; v54 makes the rule explicit on the
  citation/link selectors and pins it with an e2e check.)

## 3. The fixes (audit findings → resolutions)

Each row is a confirmed v52-close finding and its v54 resolution.
None changes a clinical result.

| # | Tile / file | Finding | Resolution |
|---|---|---|---|
| 1 | `shock-index` shock-index lines, and the V4 suite | shock-index, FENa etc. fully inline already | verify inline; no change beyond §2.1 audit |
| 2 | `opioid-mme` `lib/meta.js` | CDC 2022 — already inline & dated | add `accessed`; ledger row (current) |
| 3 | `egfr` / `egfr-suite` | CKD-EPI 2021 inline w/ DOI | add `accessed`; ledger row (current) |
| 4 | `kdigo-aki` (`lib/clinical-v5.js`) | KDIGO 2012 staging, undated, no note re: 2024 CKD update | add `accessed`; ledger row: edition 2012, latest 2024 CKD guideline, justification "2024 update governs CKD evaluation; AKI staging unchanged from KDIGO AKI 2012" |
| 5 | `wells-pe` / `wells-pe-geneva` | Wells 2000, no note re: later PE pathways | ledger row: edition Wells 2000, latest "2019 ESC PE guideline / YEARS", justification "original dichotomized/three-tier Wells score retained; later work is alternative pathways, see new `years-pe` tile in spec-v57" |
| 6 | Field-triage tile(s) (`docs/field-medicine-citations.md`) | "Current edition" — unpinned | pin to the 2021 National Guideline for the Field Triage of Injured Patients (ACS-COT/CDC) edition with `accessed`; ledger row |
| 7 | `beers` deprescribing (`lib/medication-v4.js`) | AGS 2023 inline, but `docs/data-sources.md` says `data/clinical/beers.json` retired while `beersCheck` ships embedded data | reconcile `docs/data-sources.md`: state the Beers content is embedded in `lib/medication-v4.js` (not a JSON shard); add `accessed`; ledger row (AGS 2023 = latest) |
| 8 | `nihss` / `mini-cog` / GCS / Mallampati-in-LEMON | old foundational papers, no current-version link | confirm inline; ledger rows mark "foundational instrument, no superseding edition" (not stale) |
| 9 | FIB-4 / APRI (`lib/clinical-v4.js`) | complete citation, no DOI/URL | add `citationUrl` (DOI) where one exists; APRI WHO-2014 endorsement link in `citationUrl` of a secondary note |
| 10 | ROX / VIS (`lib/clinical-v4.js`) | hardcoded cutoffs, citation in comment only, conflated Gaies/Wernovsky attribution | move the primary citation inline into `META`; split the VIS (Gaies 2010) vs IS (Wernovsky 1995) attribution into two labeled lines |

Any additional `clinical: true` tile discovered by the gate (§4.1)
to be missing an inline citation is fixed in the same wave; the
table above is the known set at authoring time, not a closed set.

## 4. What v54 adds

### 4.1 `scripts/check-citations.mjs` (lint gate)

Wired into `npm run lint`. For the full `UTILITIES` registry and
the `META` map it asserts:

1. Every `clinical: true` tile has a non-empty
   `META[id].citation`.
2. `citation` contains no raw `http://` or `https://` substring
   (URLs must be in `citationUrl`).
3. `citationUrl`, when present, parses as a valid `https://` URL.
4. Every tile whose citation matches the guideline-issuer
   pattern (CDC | KDIGO | AGS | ACC | AHA | ATS | IDSA | ESC |
   WHO | AAP | ACOG | "Joint Commission" | SAMHSA | NICE) has an
   `accessed` date **and** a matching row in
   `docs/citation-staleness.md`.
5. No `citation` contains the unpinned phrases "current edition",
   "latest version", or "most recent" (forces an explicit year /
   edition).

A negative-test fixture proves each rule bites.

### 4.2 `docs/citation-staleness.md` (ledger)

A single table, one row per guideline-derived tile:

```
| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
```

This is the auditable answer to "is Sophie current?" — a
maintainer scans one file per quarterly source pull. The
`check-citations.mjs` gate (§4.1 rule 4) keeps it in sync with
`META`: add a guideline tile without a ledger row and CI fails.

### 4.3 `accessed` field convention

`META[id].source` (the existing dataset stamp) gains an optional
`accessed: 'YYYY-MM-DD'`. For tiles with no dataset shard, the
date lives on a lightweight `META[id].citationAccessed` string.
The field records the last date a human verified the shipped
citation text against the live source — distinct from the
dataset `fetchDate` already in `data/*/manifest.json`.

### 4.4 Wrapping CSS + e2e pin

Make the references-block wrapping explicit in `styles.css`
(`overflow-wrap: anywhere` on the citation and link selectors)
and add a Playwright assertion in an existing e2e spec that, for
a tile with a long-DOI citation, the rendered references block
has no horizontal overflow at a 320 px viewport
(`scrollWidth <= clientWidth`).

## 5. Files touched

```
docs/spec-v54.md                         (this file)
docs/citation-staleness.md               (new: staleness ledger)
lib/meta.js                              (add accessed dates; split VIS/IS attribution; move ROX citation inline)
lib/clinical-v4.js                       (FIB-4/APRI/ROX/VIS citation comments -> point at META)
lib/clinical-v5.js                       (KDIGO accessed/ledger reference comment)
lib/medication-v4.js                     (Beers accessed; comment pointing at reconciled data-sources)
docs/data-sources.md                     (reconcile Beers: embedded in lib, not a JSON shard)
docs/clinical-citations.md               (de-duplicate: mark entries now mirrored inline)
docs/field-medicine-citations.md         (pin CDC Field Triage to 2021 edition + accessed)
styles.css                               (explicit overflow-wrap on citation/link selectors)
scripts/check-citations.mjs              (new lint gate)
package.json                             (lint runs check-citations; no count change)
test/integration/citations.spec.js       (e2e: no-overflow at 320px; inline-citation present)
docs/audits/v11/_citations-v54.md        (audit log: per-tile inline/accessed/wrap verification)
CHANGELOG.md                             (Unreleased: v54 entry)
```

No change to `app.js` UTILITIES or any catalog-count surface —
the catalog is unchanged at 255.

## 6. Acceptance criteria

v54 is fully shipped when:

- This file exists, and `docs/citation-staleness.md` exists with
  one row per guideline-derived tile.
- `scripts/check-citations.mjs` passes; a negative fixture proves
  each of its five rules fails CI when violated.
- Every `clinical: true` tile has a non-empty inline
  `META[id].citation` with no bare URL in the text; the gate
  confirms zero violations across all 255 tiles.
- Every guideline-derived tile has an `accessed` date and a
  ledger row; the 10 fixes in §3 are each present.
- `docs/data-sources.md` no longer claims the Beers data is
  retired; it states the data is embedded in `lib/medication-v4.js`.
- The e2e check confirms no horizontal overflow of the references
  block at 320 px for a long-DOI tile.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- `UTILITIES.length` is still 255.
- The CHANGELOG records v54 as a zero-tile citation-integrity
  release.

## 7. Out of scope for v54

- Re-deriving or changing any clinical threshold to match a newer
  guideline. v54 *documents* staleness and pins editions; an
  actual formula update to a newer edition is its own per-tile
  spec with its own [spec-v11](spec-v11.md) audit. (Where the
  audit found the newer edition does **not** change the score —
  KDIGO AKI, Wells PE — the ledger justification says so and no
  formula moves.)
- A live link-checker that fetches every `citationUrl` at build
  time. That would be a build-time network call; the
  dependency/network budget ([spec-v10](spec-v10.md),
  [spec-v50](spec-v50.md) §3) forbids it. URL *syntax* is checked
  statically; URL *liveness* is verified by a human at the
  quarterly source pull and stamped via `accessed`.
- Bibliographic styling (BibTeX, CSL, numbered references). The
  house format — author, title, venue, year, inline — is
  retained.
- Translating citations. English-only, as today.
- Input/output robustness — that is [spec-v53](spec-v53.md).
