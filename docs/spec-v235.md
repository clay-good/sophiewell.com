# spec-v235.md — Pain / disability screening instruments: DN4, LANSS, the Roland-Morris Disability Questionnaire, and the Neck Disability Index (+4 tiles → 1021)

> Status: **SHIPPED (2026-07-04).** A pain-medicine / rehabilitation slice. Adds
> **4** well-established deterministic screening instruments. **Each id was verified
> absent by a fixed-string scan of the extracted `app.js` id/name lists AND the MCP
> adapter set** (spec-v85 §6.2).
>
> Catalog effect: **live `UTILITIES.length` + 4** (1017 → 1021) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v235 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order** — these
> screen and grade). **Every point value is re-fetched and cross-verified against
> ≥2 independent open sources** ([spec-v97](spec-v97.md)). All are Class A with no
> staleness rows.

## 2. What v235 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `dn4-neuropathic-pain` | DN4 neuropathic-pain screen | 7 interview + 3 exam items × 1 → 0-10; ≥ 4 likely | Bouhassira. Pain. 2005 |
| `lanss-pain-scale` | LANSS pain scale | 5 weighted symptoms + 2 exam → 0-24; ≥ 12 likely | Bennett. Pain. 2001 |
| `roland-morris-disability` | Roland-Morris Disability Questionnaire | applicable statements → 0-24 | Roland & Morris. Spine. 1983 |
| `neck-disability-index` | Neck Disability Index | 10 sections × 0-5 → 0-50 raw, % = raw×2 | Vernon & Mior. J Manip Physiol Ther. 1991 |

## 3. Source cross-verification (spec-v97)

- **DN4:** 7 interview items (burning, painful cold, electric shocks; tingling,
  pins-and-needles, numbness, itching) + 3 exam items (hypoesthesia to touch /
  pinprick, brush allodynia), each 1 point; ≥ 4 of 10 suggests neuropathic pain.
  Reproduced from Bouhassira 2005 and physio-pedia / PMC2217518.
- **LANSS:** dysesthesia 5, autonomic skin-color 5, evoked allodynia 3, paroxysmal
  bursts 2, thermal/burning 1, brush allodynia 5, altered pin-prick 3; ≥ 12 of 24
  suggests neuropathic origin. Reproduced from Bennett 2001 and NIHR S-LANSS.
- **Roland-Morris:** 24 statements, each applicable one scores 1 (0-24); MDC ~5.
  Public domain. Reproduced from Roland & Morris 1983 and Shirley Ryan AbilityLab.
- **Neck Disability Index:** 10 sections each 0-5, raw 0-50, percentage = raw × 2;
  0-8% none, 10-28% mild, 30-48% moderate, 50-68% severe, 70-100% complete.
  Reproduced from Vernon & Mior 1991 and physio-pedia.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Checkbox /
  select / count inputs coerce to bounded integers; a blank form yields a 0 score,
  not a `NaN`.
- **Each tile reports its score, the band / determination, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All screen or grade, none diagnose or order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v235.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v235 RV235 into RENDERERS)
lib/painscore-v235.js                    (new: dn4, lanss, rolandMorris, neckDisabilityIndex)
lib/meta.js                              (+4 META entries)
views/group-v235.js                      (new renderer module: 4 renderers)
test/unit/painscore-v235.test.js         (new: worked examples)
test/unit/fuzz-tools.test.js             (register painscore-v235.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1017 → 1021)
```
