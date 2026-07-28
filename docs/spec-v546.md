# spec-v546.md — Revised ASRM stage (endometriosis, from a total) tile

> Status: **SHIPPED (2026-07-28).** Builds the `rasrm-stage` tile — converts a revised ASRM point total into
> a stage. Catalog **1395 → 1396**, group G.

## Why

Whole-concept gap: `rasrm`, `endometriosis`, `enzian`, and `cul-de-sac` were all zero-hit. (The `asrm` hits
belong to the Rotterdam PCOS criteria, which ESHRE and ASRM co-sponsored — an unrelated instrument.) The
catalog had no endometriosis content of any kind.

## What it does — and deliberately does not

**This tile does not compute the score. It interprets one.** The revised ASRM point grid — the per-site,
per-size, per-depth weights for peritoneal and ovarian implants and the filmy-versus-dense adhesion weights —
**could not be double-confirmed**. The scoring form is a single copyrighted figure, and every reachable
reproduction is an image or a single translated transcription. A calculator built on one unverified
transcription would produce numbers that look authoritative and cannot be checked. So the tile takes the
total the clinician has already computed from the form in front of them and does the part that **is** fully
confirmed.

| Stage | Name | Total |
| --- | --- | --- |
| I | minimal | 1-5 |
| II | mild | 6-15 |
| III | moderate | 16-40 |
| IV | severe | above 40 |

Maximum 150.

### The III/IV boundary sits at exactly 40, and the tile says so

A total of **40 is stage III**; **41** is the first stage IV. This matters because the boundary is the *only*
thing this tile computes — and one secondary account, paraphrasing a well-known criticism of the system,
loosely calls a lone finding of complete cul-de-sac obliteration (which scores 40) "severe disease". Under
the published ranges that finding is at the **top of stage III**. The four-source ranges are used and both
sides of the boundary are pinned by a test.

**A total of 0 returns no stage**, not stage I — stage I begins at 1, and rounding a zero up would be wrong.

**Do not confuse these with the 1979 AFS stages**, which used different cut points (III 16-30, IV 31-54). A
stage copied from an older record without knowing its edition is not interpretable; the tile states which
edition it implements.

**Confirmed anchor values are offered as sanity checks, not as a calculator:** complete posterior cul-de-sac
obliteration 40; deep ovarian endometriosis >3 cm 20; a dense ovarian or tubal adhesion tops out at 16; and
if the fimbriated end is completely enclosed, the point assignment is **changed to** 16. These help a user
notice a mis-keyed total.

- `lib/rasrm-stage-v546.js` — pure total → stage. Exports `RASRM_STAGES`, `RASRM_MAX`, `RASRM_ANCHORS`.
- `views/group-v546.js` (RV546) — one number input (dom `rasrm-total`) under an **h2** heading, with the
  anchors shown beneath.
- `lib/meta.js` — revised ASRM 1997 citation + accessed date + bands. No citation-staleness row (`ASRM` is
  not in `ISSUER_PATTERN`).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1396.

**HIGH-STAKES — and the instrument's own weakness is the headline:** the revised ASRM stage **correlates
poorly with pain and with fertility outcome**. A woman with stage I disease can have severe pain and a woman
with stage IV can have none, and the stage does not predict whether she will conceive. Every staged result
says so, and a test asserts it. It is a surgical description of what was *seen* at laparoscopy, so it cannot
be assigned without one, it depends on the completeness of the surgical survey, and it says nothing about
disease not visualised — **deep infiltrating disease of the bowel, ureter or bladder is poorly captured**,
which is why the separate ENZIAN classification exists. It does not diagnose endometriosis, does not measure
pain, does not predict fertility, and is not an indication for surgery, hormonal therapy, or assisted
reproduction ([spec-v11](spec-v11.md) §5.3).

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`rasrm`, `asrm`), the disease
(`endometriosis`), the competing system (`enzian`), and an anatomic term (`cul-de-sac`) — each against
**both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. The one `asrm` hit is the
Rotterdam PCOS tile, addressed above.

## Sourcing (spec-v97)

- **Citation:** Revised American Society for Reproductive Medicine classification of endometriosis: 1996.
  *Fertil Steril.* 1997;67(5):817-821.
- The stage ranges, the four stage names, the 150 maximum, and each anchor value were confirmed across
  multiple independent sources. **The full point grid was not**, and is therefore not implemented — this is a
  scoping decision recorded so a future session does not "complete" the tile from a single transcription. If
  the printed ASRM form is obtained, the grid can be added in one pass.

## Verification

Lint (all catalog-truth surfaces at 1396), unit suite (+10 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not score a laparoscopy, apply the 1979 AFS ranges, compute the ENZIAN classification or the
Endometriosis Fertility Index, diagnose endometriosis, or predict pain or fertility. The MCP adapter +
golden-probe promotion ship in the same wave (371).
