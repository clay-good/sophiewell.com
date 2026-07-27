# spec-v529.md — Thwaites index (tuberculous vs bacterial meningitis) tile

> Status: **SHIPPED (2026-07-27).** Builds the `thwaites` tile — the five-feature signed-weight
> discriminator between tuberculous and bacterial meningitis in adults. Catalog **1378 → 1379**, group G.

## Why

`thwaites`, `tuberculous`, and `bandim` were all zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`.

**A different question from the existing `nigrovic` tile** (Bacterial Meningitis Score), which asks whether a
**child** with meningitis can safely be presumed *not* to have bacterial meningitis. Thwaites assumes
meningitis is present in an **adult** and asks *which of two organisms* is causing it. One is a rule-out in
pediatrics; the other is a discriminator between two diagnoses in adults. Neither answers the other's
question, and each tile now names the other.

## What it does

| Feature | Points |
| --- | --- |
| Age 36 years or older | **+2** |
| Blood white cell count ≥15,000 cells/µL | **+4** |
| Duration of illness ≥6 days | **−5** |
| CSF total white cell count ≥900 cells/µL | **+3** |
| CSF neutrophils ≥75% | **+4** |

Range **−5 to +13**, derived from the weight table rather than asserted.

### The score runs in the opposite direction to every other score in this catalog

**A total of 4 or less favors TUBERCULOUS meningitis; above 4 favors BACTERIAL.** Low is the TB end. Almost
every other instrument here reads "higher means more of the thing being measured," and a reader who assumes
that inverts the diagnosis. The tile therefore never emits a bare number — every result states the direction
in words, and the copy says outright that it reads backwards relative to most scores.

**The negative weight is the instrument's engine**, not a rounding detail. A longer history is the single
strongest pull toward TB, encoding the clinical pattern that bacterial meningitis presents over hours to a
couple of days while tuberculous meningitis presents over a week or more. An implementation that dropped the
sign would turn the most TB-suggestive feature into the most bacterial-suggestive one. A test asserts
duration is the only negative *and* the largest in magnitude, and another shows a long history alone flipping
a bacterial-looking picture to tuberculous.

**Units.** Reproductions of this table carry internally inconsistent unit labels — one renders both counts as
"10³/ml" while giving thresholds of 15,000 and 900, which cannot both be true. The numbers are reliable
across sources; only the labels are not. The tile uses and displays the unambiguous reading: **cells/µL** for
both.

- `lib/thwaites-v529.js` — pure features → total, direction, and per-feature contributions. Exports
  `THWAITES_FEATURES` and the derived `THWAITES_RANGE`. Accepts yes/no as words, booleans, or 0/1.
- `views/group-v529.js` (RV529) — five yes/no selects (dom `thw-*`) under an **h2** heading, each option
  labeled with its signed points.
- `lib/meta.js` — Thwaites and colleagues 2002 citation + accessed date + bands, related to `nigrovic`. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1379.

**HIGH-STAKES, and the failure modes are specific and known:**

- **Specificity collapses in partially treated bacterial meningitis** (around 24% in one validation) — which
  is precisely the patient who has already had antibiotics and whose CSF now looks lymphocytic. That is a
  common presentation, and it is the one the rule handles worst.
- **It performs poorly in HIV-positive adults** (reported AUCs around 0.6); it was derived in HIV-negative
  Vietnamese adults.
- It discriminates between **two** diagnoses, so it says nothing about the other causes of a lymphocytic
  CSF — viral, fungal including cryptococcal, autoimmune, malignant.

It does not diagnose either disease, does not replace CSF microscopy, culture, or nucleic-acid testing, and
is not an indication to start or withhold antituberculous therapy or antibiotics
([spec-v11](spec-v11.md) §5.3) — treating empirically for both while testing is pending is often correct. A
test asserts the copy names all three limits.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`thwaites`), the disease word (`tuberculous`),
the competing rule (`bandim`), the condition (`meningitis`), and the neighboring eponym (`nigrovic`) — each
against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. The two non-zero
hits are the Nigrovic pediatric tile, addressed above.

## Sourcing (spec-v97)

- **Citation:** Thwaites GE, Chau TTH, Stepniewska K, et al. Diagnosis of adult tuberculous meningitis by use
  of clinical and laboratory features. *Lancet.* 2002;360(9342):1287-1292.
- Transcribed from **two independent reproductions agreeing on every row and on the direction of the cut**,
  including the −5. One secondary source renders the duration weight without its minus sign; that is a
  text-extraction artifact, since the same article states the maximum as 13, which is only reachable if the
  −5 is excluded from the maximum. Another secondary source has a typo in its cut-point sentence (writing
  "TBM" for both directions); the direction shipped is the one both validation studies state.

## Verification

Lint (all catalog-truth surfaces at 1379), unit suite (+10 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not apply the Lancet consensus case definition for tuberculous meningitis, score the Bandim
TBscore, interpret CSF adenosine deaminase or Xpert results, diagnose either disease, or recommend therapy.
The MCP adapter + golden-probe promotion follow in the next wave (354).
