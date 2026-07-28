# spec-v573.md — Modified Asthma Predictive Index tile

> Status: **SHIPPED (2026-07-28).** Builds the `mapi-asthma` tile. Catalog **1422 → 1423**, group G.

## Why

An axis the catalog lacked entirely. `asthma-control-test`, `childhood-act`, `pram-asthma` and `pass-asthma`
all measure **current control or severity**; none **predicts** anything, and neither the original API nor the
mAPI was present.

## What it does

**Positive = ≥4 wheezing episodes in a year AND (≥1 major OR ≥2 minor).**

| Major criteria | Minor criteria |
| --- | --- |
| Parental physician-diagnosed asthma | Wheezing unrelated to colds |
| Physician-diagnosed atopic dermatitis | Blood eosinophils **≥4%** |
| Allergic sensitization to ≥1 aeroallergen | Sensitization to milk, egg, or peanut |

## The four rules a plausible implementation breaks

**1. It is not a score — it is a two-gate boolean.** No total, no band table. **Criteria can never
substitute for the frequency gate**: a test sets every criterion to yes with 3 episodes and asserts the
result is still negative.

**2. The change from the original API is a move, not an addition.** Allergic rhinitis was **removed** from
the minors and replaced by food sensitization; aeroallergen sensitization was **added** as a third major.
Both lists end at three items, but neither is a superset of its predecessor — a criterion *left* the
instrument. Calling the mAPI "the API plus food allergy" is wrong and would score rhinitis, which the mAPI
does not contain. A test asserts rhinitis appears nowhere.

**3. The two indices use different wheeze denominators.** The API gates on a 1-to-5 frequency **rating
scale** (stringent ≥3); the mAPI gates on a literal **count** of ≥4 episodes/year. A rating of 3 is not four
episodes. The original also has *loose* and *stringent* variants — which is why a quoted "API positive" is
ambiguous — while the mAPI has one form.

**4. The horizon is years, not months.** The index is applied at ages **1-3** and was validated against an
asthma diagnosis at ages **6, 8 and 11**, in a **high-risk** cohort. Positive predictive value is strongly
population-dependent and will be lower in unselected children.

**Eosinophil boundary:** the criterion is **≥4%**, so exactly 4.0% meets it. One secondary source renders it
as ">4%", a loose paraphrase; the original's "or more" is followed, and the boundary is disclosed *at* that
value.

## Scope (spec-v11 §5.3)

It does **not** diagnose asthma at any age, and it does **not** exclude it — a negative index in a wheezing
child does not mean the wheeze is benign, and the causes that matter most (foreign body, structural airway
disease, cystic fibrosis, immunodeficiency, aspiration) are not asthma and are not what this index is about.
It is **not** an indication to start inhaled corticosteroids or any other controller, and treating a positive
index as a prescription is the misuse it most invites.

## Files

- `lib/mapi-asthma-v573.js` — `mapiAsthma()`, `MAPI_MAJOR_CRITERIA`, `MAPI_MINOR_CRITERIA`,
  `WHEEZE_EPISODE_THRESHOLD`, `EOSINOPHIL_THRESHOLD`, `REMOVED_FROM_API`.
- `views/group-v573.js` (RV573) — the frequency gate and the two criteria lists under separate **h2**
  headings, so the layout does not read as one pooled checklist.
- `mcp/adapters/mapi-asthma-v573.js` — wave 398.
- `test/unit/mapi-asthma.test.js` — 18 tests.
- `docs/spec-v573.md` (this file).

## Sourcing (spec-v97)

Two independent sources agree on the structure, the item wording and the positivity rule.

- Chang TS, Lemanske RF Jr, Guilbert TW, et al. Evaluation of the Modified Asthma Predictive Index in
  High-Risk Preschool Children. *J Allergy Clin Immunol Pract.* 2013;1(2):152-156.
