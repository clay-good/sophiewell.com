# spec-v510.md — Banff grade (acute T cell-mediated rejection) tile

> Status: **SHIPPED (2026-07-27).** Builds the `banff-tcmr` tile — the Banff category of acute T cell-mediated
> rejection in a kidney allograft biopsy, read from the i, t, and v lesion scores.
> Catalog **1359 → 1360**, group G.

## Why

Transplant pathology was a **whole-concept gap**: `banff`, `tcmr`, `tubulitis`, `glomerulitis`, `allograft`,
and `kidney transplant` were all zero-hit across `corpus.json` and `app.js`. The Banff category is what the
biopsy report says and what the transplant team acts on, and getting from three lesion scores to the category
is exactly the kind of small, error-prone lookup this catalog exists for — the v score in particular
overrides an i/t pair that would otherwise read as a grade I.

## What it does

Three selects, one per Banff lesion score, resolve to one category:

| Input | Category |
| --- | --- |
| v3 | Grade III |
| v2 | Grade IIB |
| v1 | Grade IIA |
| v0, t0 | Not graded (inflammation without tubulitis) |
| v0, i0-i1, any t1-t3 | Borderline changes |
| v0, i2-i3, t1 | Borderline changes |
| v0, i2-i3, t2 | Grade IA |
| v0, i2-i3, t3 | Grade IB |

- `lib/banff-tcmr-v510.js` — pure scores → category. Exports `LESIONS` (each score with its four option
  texts) so the renderer and the tests share one source of wording. Rejects a missing score, a non-integer,
  and anything outside 0-3.
- `views/group-v510.js` (RV510) — three selects (dom `bf-i`, `bf-t`, `bf-v`), each with a real `<label for>`;
  surfaces the lib's validation message rather than a half-result.
- `lib/meta.js` — Banff 2019 Kidney Meeting Report citation + accessed date + grouped bands. No
  citation-staleness row (`Banff` is a meeting name, not one of the `ISSUER_PATTERN` society acronyms).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1360.

**HIGH-STAKES:** it applies the published rule to lesion scores a pathologist has **already** assigned. It does
not read a biopsy, does not score i, t, or v, and is not an indication for steroids, thymoglobulin,
plasmapheresis, or any change in immunosuppression ([spec-v11](spec-v11.md) §5.3). Three scope limits are
stated in the tile copy rather than left implicit, because each one is a way the number could mislead:
antibody-mediated rejection is a **separate** diagnosis (microvascular inflammation, C4d, donor-specific
antibody); chronic active T cell-mediated rejection is scored on **different** lesions (ti, i-IFTA); and
intimal arteritis is **not specific** to rejection. A result of "not graded" does not exclude rejection on an
inadequately sampled biopsy.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`banff`), the abbreviation (`tcmr`), the lesion
words (`tubulitis`, `glomerulitis`, `capillaritis`, `intimal`), and the setting (`kidney transplant`,
`renal transplant`, `allograft`) — each against **both** `corpus.json` and `app.js`; plus a `test/unit/` and
`lib/` scan. All clean. The three `arteritis` hits are giant-cell arteritis, a different concept.

## Sourcing (spec-v97)

- **Citation:** Loupy A, Haas M, Roufosse C, et al. The Banff 2019 Kidney Meeting Report (I): Updates on and
  clarification of criteria for T cell- and antibody-mediated rejection. *Am J Transplant.*
  2020;20(9):2318-2331.
- Cross-verified against transplant pathology references reproducing the same borderline definition and the
  same IA / IB / IIA / IIB / III thresholds.

## Verification

Lint (all catalog-truth surfaces at 1360), unit suite (+9 + fuzz), a11y, build — all green.

## Out of scope

The tile does not grade antibody-mediated rejection, chronic active T cell-mediated rejection, the chronicity
scores (ci, ct, cv, cg), polyomavirus nephropathy, or recurrent disease, and it does not assess biopsy
adequacy. The MCP adapter + golden-probe promotion follow in the next wave (335).
