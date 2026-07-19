# spec-v492.md — Hattrup-Johnson grade (hallux rigidus) tile

> Status: **SHIPPED (2026-07-19).** Builds the `hattrup-johnson` tile — the Hattrup-Johnson classification of
> hallux rigidus, grades I/II/III. Catalog **1342 → 1343**, group G.

## Why

The foot tiles had no hallux-rigidus (first-MTP osteoarthritis) grade. `hattrup johnson` / `hallux rigidus
grade` routed to nothing. This fills that foot gap.

## What it does

The clinician picks the grade; the tile reports the grade and its osteophyte / joint-space description.

- `lib/hattrup-johnson-v492.js` — pure grade → description, the three Hattrup-Johnson grades. **I:** mild
  (dorsal osteophyte, preserved joint space). **II:** moderate (dorsal/medial/lateral osteophytes with
  narrowing and sclerosis). **III:** severe (marked osteophytes with joint-space loss and subchondral cysts).
  Accepts I-III and 1-3.
- `views/group-v492.js` (RV492) — one select (dom `hattrup-grade`), real `<label for>`.
- `lib/meta.js` — Hattrup & Johnson 1988 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v212 → v213); corpus → 1343.

**HIGH-STAKES:** it reports the radiographic grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic /
foot-and-ankle team.

## Sourcing (spec-v97)

- **Citation:** Hattrup SJ, Johnson KA. Subjective results of hallux rigidus following treatment with
  cheilectomy. *Clin Orthop Relat Res.* 1988;(226):182-191. The citation URL is a PubMed term search.
- Cross-verified against foot-and-ankle references reproducing the same mild-osteophyte-preserved-space (I) /
  moderate-osteophytes-narrowing (II) / severe-osteophytes-space-loss (III) grouping. (The Coughlin-Shurnas
  0-4 grade is a separate scheme, out of scope.)

## Verification

Lint (all catalog-truth surfaces at 1343), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: grade II renders "dorsal, medial, and lateral osteophytes with joint-space narrowing," the other
grades flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph or recommend management
(cheilectomy vs fusion). The MCP adapter + golden-probe promotion follow in the next wave (317).
