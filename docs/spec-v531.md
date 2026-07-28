# spec-v531.md — EHIT class (endothermal heat-induced thrombosis) tile

> Status: **SHIPPED (2026-07-27).** Builds the `ehit` tile — the AVF/SVS classification of thrombus after
> endovenous thermal ablation. Catalog **1380 → 1381**, group G.

## Why

`ehit`, `kabnick`, `endovenous`, and `saphenofemoral` were all zero-hit across `corpus.json`, `app.js`, and
`lib/meta.js`.

**A different axis from the existing `ceap-venous` and `vcss` tiles**, which grade **chronic** venous
disease — how bad is this patient's long-standing insufficiency. EHIT grades an **acute complication of a
specific procedure**, found on a surveillance ultrasound in the weeks after ablation, and the decision it
informs is binary and immediate: anticoagulate or not. A patient's CEAP class does not move when they develop
an EHIT, and their EHIT class says nothing about their chronic disease.

## What it does

**What counts as EHIT:** thrombus on ultrasound within **four weeks** of endovenous thermal ablation that
**originates from the treated vein** and protrudes into a deep vein. Two things it is not, both formally
distinguished by the consensus and both named in the copy: a DVT in a segment *not contiguous* with the
ablated vein is a **non-EHIT DVT**, and thrombus in a *different superficial vein* is **post-ablation
superficial venous thrombosis**. Calling a non-contiguous DVT an "EHIT I" would understate it.

| Class | Extent | Published recommendation (with its stated strength) |
| --- | --- | --- |
| Ia | No propagation into the deep vein, peripheral to the superficial epigastric vein | No treatment or surveillance (weak, low-quality) |
| Ib | No propagation, central to that vein, up to and including the junction | No treatment or surveillance (weak, low-quality) |
| II | Propagation into the deep vein, **<50%** of lumen | No treatment, weekly surveillance (weak, low-quality) |
| III | **>50%** of lumen, not occlusive | Therapeutic anticoagulation + weekly surveillance (strong, moderate-quality) |
| IV | Occlusive deep vein thrombus contiguous with the treated vein | **Individualize**, per provoked-DVT guidance (strong, high-quality) |

The same percentages apply to the popliteal vein after a small-saphenous ablation; there is no separate
saphenopopliteal threshold.

### The 2021 consensus renumbered nothing — which matters for reading older records

Classes II, III, and IV are **word for word** the original 2006 Kabnick classification. The **only** change
was subdividing class I, so **class Ib is exactly the old class I**, and Ia is newly carved out. A note
written before 2021 saying "EHIT 1" means what Ib means now. Management is identical for Ia and Ib; the split
exists for reporting granularity. Each result carries its own continuity note, and tests assert it.

**A bare "class I" is deliberately rejected as ambiguous.** The two subclasses carry the same management, but
a record should not silently lose which was meant — the error message names which is which and which one the
old class I maps to.

### Do not conflate with the Lawrence levels

A separate 2010 system grades the same complication in **six** levels keyed to the epigastric vein rather
than percent lumen. **Lawrence levels 1, 2, and 3 all collapse into this class I** — so "level 3" is **not**
"class III", and mistaking one for the other moves a patient who needs no treatment into the anticoagulation
band. The copy says this outright and a test asserts it.

- `lib/ehit-v531.js` — pure class → definition, recommendation, and continuity note. Exports `EHIT_CLASSES`.
- `views/group-v531.js` (RV531) — one select (dom `ehit-class`) under an **h2** heading, offering Ia and Ib
  separately and no bare class I.
- `lib/meta.js` — AVF/SVS 2021 citation + accessed date + bands, related to `ceap-venous`. No
  citation-staleness row (`SVS` and `AVF` are not in `ISSUER_PATTERN`).
- 12 worked-example unit tests + fuzz registration; synonym entry; corpus → 1381.

**HIGH-STAKES:** the class is an **anatomic description**, and the recommendations attached to it are
**suggestions at differing strengths of evidence, not orders**. They are reported because the whole point of
classifying an EHIT is to decide about anticoagulation — but the decision belongs to the clinician and turns
on bleeding risk, thrombophilia, symptoms, and other anticoagulant indications as much as on the class. Class
IV is explicitly *individualized* rather than protocolized. The tile does not choose an agent, a dose, or a
duration, does not schedule the surveillance scan, and does not diagnose an EHIT — that is an ultrasound
finding ([spec-v11](spec-v11.md) §5.3). A test asserts every class states the recommendation is not an order.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`ehit`), the eponym (`kabnick`), the procedure
(`endovenous`, `ablation`), the anatomy (`saphenofemoral`), and the neighboring instruments (`ceap`, `vcss`) —
each against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan
(`ceap-venous.test.js` exists and grades the chronic axis). The three non-zero hits are those neighbors and
unrelated uses of "ablation".

## Sourcing (spec-v97)

- **Citation:** Kabnick LS, Sadek M, Bjarnason H, et al. Classification and treatment of endothermal
  heat-induced thrombosis: recommendations from the American Venous Forum and the Society for Vascular
  Surgery. *J Vasc Surg Venous Lymphat Disord.* 2021;9(1):6-22.
- Classes, definitions, and per-class recommendations corroborated across independent reproductions of both
  the 2021 consensus and the 2006 original it revises. Where a later review rendered class Ia against the
  *inferior* epigastric vein, the consensus's own wording (*superficial* epigastric vein — the
  saphenofemoral tributary) was shipped; the inferior epigastric vein drains into the external iliac and is
  the wrong landmark.

## Verification

Lint (all catalog-truth surfaces at 1381), unit suite (+12 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not apply the Lawrence levels or the small-saphenous A-D system, choose an anticoagulant, dose,
or duration, schedule surveillance imaging, classify a non-contiguous DVT or a post-ablation superficial
thrombosis, or grade chronic venous disease. The MCP adapter + golden-probe promotion follow in the next wave
(356).
