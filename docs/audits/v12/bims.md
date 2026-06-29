# v12 audit - bims

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Saliba D, Buchanan J, Edelen MO, et al. MDS 3.0: brief interview for mental status. J Am Med Dir Assoc. 2012;13(7):611-617. Item-level scoring cross-verified against the verbatim CMS MDS 3.0 Section C form (C0200-C0500) and independent clinical summaries (>= 2 sources, spec-v97).

`lib/ltcga-v173.js bims()` sums the MDS 3.0 Section C items to 0-15. Group G, Class A.

## Source-governance notes
- C0200 repetition 0-3; C0300A year 0-3 (3 correct, 2 off by 1 yr, 1 off 2-5 yr, 0 off > 5 yr / no answer); C0300B month 0-2 (2 within 5 days, 1 off 6 days-1 mo, 0 off > 1 mo / no answer); C0300C day 0-1; C0400A/B/C recall 0-2 each (2 spontaneous, 1 after category cue, 0 not recalled).
- Bands: 13-15 cognitively intact, 8-12 moderately impaired, 0-7 severely impaired.
- CMS / MDS is public-domain method and does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 15 (all max) intact; the tile example 13 (partial recall) intact; 12 moderate (13/12 boundary); 8 moderate and 7 severe (moderate/severe flip); out-of-range year/month and blanks -> valid:false.

## Edge-input handling notes
- Each item validated to its published range; any null/blank/out-of-range -> valid:false complete-the-fields fallback; never NaN (spec-v59 fuzz pass).
