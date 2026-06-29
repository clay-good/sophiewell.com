# spec-v168.md — Data-Sourced Reference-Table program: the last high-value frontier — pediatric BP percentiles, transplant allocation, and preterm/fetal growth (program-of-record)

> Status: **PARTIALLY SHIPPED (2026-06-29) — +2 of 7; remaining 5 deferred on
> sourcing grounds.** v169 shipped its two CDC growth-percentile tiles
> (`cdc-stature-for-age`, `cdc-weight-for-age`); `pediatric-bp-percentile`,
> `kdpi`, `epts`, `fenton-preterm-growth`, and `intergrowth-efw-percentile` are
> deferred per the spec-v97 sourcing gate (the OPTN/Springer/Wiley sources
> returned HTTP 403 and the BP regression coefficients are PDF-locked; none could
> be fetched verbatim and cross-verified in the build environment). This is the
> §5-sanctioned outcome, not an oversight. See `docs/scope-data-sourced.md` for
> the per-tile ledger. Original status below.
>
> Status: **PROPOSED (2026-06-23).** Program-of-record for the **Data-Sourced
> Reference-Table** initiative — the *fourth pass* after
> [spec-v150](spec-v150.md) (specialties), [spec-v157](spec-v157.md)
> (subspecialty quantification), and [spec-v162](spec-v162.md) (cross-discipline).
> This pass makes an explicit claim a world-class clinician should be willing to
> stand behind: **the bedside *formula* universe is now exhausted.** The
> genuinely-useful instruments that remain are not more closed-form scores — they
> are the **big-reference-table** tools that earlier passes *deferred on purpose*
> because they require verbatim coefficient/percentile tables, not a formula from
> memory. It reserves the band **v169–v171**.
>
> Catalog effect of the whole program: **+7** across three feature specs (nominal
> 741 after v167 → 748). v168 itself ships **no tile**.
>
> Every prior spec (v4 through v167) remains in force. No tile adds a runtime
> network call or AI. Each obeys the [spec-v100](spec-v100.md) §2/§6 doctrine,
> [spec-v59](spec-v59.md) output safety, [spec-v50](spec-v50.md) §3 posture, and
> [spec-v11](spec-v11.md) §5.3. Each ships its primary citation inline
> ([spec-v54](spec-v54.md)) and passes the [spec-v29](spec-v29.md) §3 one-line
> test.

## 1. The fourth-pass audit — and an honest claim

After three passes (+62 tiles, 679 → 741) the deterministic, free, **formula-shaped**
calculator surface is saturated. A fourth honest read finds that the remaining
useful instruments share one property the first three passes treated as a blocker:
they are defined by a **published reference table**, not an equation — pediatric
blood-pressure percentiles (age × sex × height), the transplant allocation indices
(donor/recipient factor tables mapped to a population percentile), and the
preterm/fetal growth standards (LMS by gestational age).

These were **deferred, not missed.** The project already proved the safe way to do
them: [spec-v141](spec-v141.md)'s growth-LMS work established the **verbatim-fetch
data-sourcing pattern** — `WebFetch` saves the source's raw bytes to disk, the build
copies and parses them programmatically, and **nothing is transcribed by hand**, so
the table is cross-verifiable and zero-transcription-risk. This program applies that
proven pattern to the three highest-value table-driven gaps.

| Spec | Theme | Tiles | Source (verbatim-fetched) |
|---|---|---|---|
| v169 | Pediatric percentile completion | pediatric BP percentile, CDC stature-for-age, CDC weight-for-age (3) | NHLBI Fourth Report / AAP 2017 BP regression tables; CDC 2000 statage/wtage LMS |
| v170 | Transplant allocation | KDPI (via KDRI), EPTS (2) | OPTN KDRI coefficient + annual mapping table; OPTN EPTS points + mapping |
| v171 | Preterm & fetal growth | Fenton 2013 preterm growth, INTERGROWTH-21st EFW percentile (2) | Fenton 2013 LMS; INTERGROWTH-21st standards |

**Total: 7 tiles.** Each is daily-used, deterministic, and free — and none was
shippable until the data-sourcing pattern existed.

## 2. What remains after this program (the genuine floor)

This is the honest end-state. After v169–v171, what is left is **not** clinically
useful-but-missing — it is one of:

- **Permanently sourcing-blocked** (cannot meet the [spec-v97](spec-v97.md)
  ≥2-independent-source rule): **`crib-ii`** (Parry 2003 matrix reproduced in only
  one place, primary + that source both HTTP-403) and **`gail-bcrat`** (NCI λ1/λ2
  tables published only as a binary `.rda`). These stay parked until a verbatim,
  cross-verifiable source appears — re-checked, not re-specced.
- **Copyright / licensed item text:** MoCA, MMSE, ACT, CAT, FIM, SNOT-22, SCAT5,
  HIT-6, SGRQ, MDS-UPDRS — excluded by policy.
- **Proprietary closed coefficients:** FRAX, STS, Tyrer-Cuzick, Lung Allocation
  Score / Composite Allocation Score (the LAS/CAS coefficient set is large,
  frequently re-weighted, and not cleanly published for verbatim fetch — parked with
  the transplant table family pending a sourceable release).
- **Genuinely niche micro-backlog** (named in [spec-v162](spec-v162.md) §3 and
  [spec-v157](spec-v157.md) §3): `g8`, `crash`, `dlco-correction`,
  `bronchodilator-response`, `esas-r`, `uas7`, `poisoning-severity-score`,
  anthropometric body-fat estimates, Karvonen target-HR — shippable on request, but
  below the frequency bar this program sets.

**Plainly: with v169–v171 the catalog reaches practical completeness for free,
deterministic, healthcare-worker calculators.** Further growth means accepting
copyright, proprietary coefficients, or niche frequency — each a deliberate policy
choice, not an oversight.

## 3. Program doctrine (binds v169–v171)

1. **Verbatim data sourcing is mandatory** ([spec-v141](spec-v141.md) pattern): every
   table/coefficient set is fetched to disk and parsed programmatically; a generator
   script (uncommitted, under `scratchpad/`) produces the committed
   `lib/*-data.js`; **no value is hand-transcribed.** The existing
   `lib/growth-lms-data.js` infra and `interpLMS`/`normalCdf` helpers are reused
   where the math is LMS.
2. **Cross-verification** ([spec-v97](spec-v97.md)): each table is reconciled against
   ≥2 independent reproductions before commit; a table that cannot be is **deferred**
   (the `crib-ii` precedent), not approximated.
3. **Maintenance class:** instruments whose tables are **periodically re-issued by an
   agency** (OPTN annual KDPI/EPTS mapping; AAP/NHLBI; CDC; WHO/INTERGROWTH) are
   **Class B** and carry `docs/citation-staleness.md` rows — these agencies trip
   `ISSUER_PATTERN` and the rows are partly gate-forced, partly real (OPTN updates
   annually). Fixed historical standards (CDC 2000, Fenton 2013) get
   documentation-only rows.
4. **Standard program plumbing** (as [spec-v150](spec-v150.md) §3): per-spec
   `lib/<theme>-vNNN.js` + `views/group-vNNN.js` with `RVNNN`; catalog-truth delta on
   all **13 surfaces** using live `UTILITIES.length` + delta; [spec-v85
   §6.2](spec-v85.md) collision check first. The `transplant`, `neonatology`,
   `maternal-fetal-medicine`, `pediatrics`, `nephrology` tags already exist in the
   closed vocabulary — **no vocabulary edit required.**
5. **Housekeeping trap** ([spec-v141](spec-v141.md) lesson): a baseline
   `SOPHIEWELL_OFFLINE=1 build-data` restamps `data/*/manifest.json` fetch dates —
   `git checkout -- data/` before commit to keep the diff surgical.

## 4. Feature specs

- [spec-v169](spec-v169.md) — Pediatric percentile completion.
- [spec-v170](spec-v170.md) — Transplant allocation (KDPI, EPTS).
- [spec-v171](spec-v171.md) — Preterm & fetal growth percentiles.

## 5. Acceptance criteria (program level)

- All three feature specs ship, each meeting its own §6, **or** a tile is deferred
  with the [spec-v97](spec-v97.md) sourcing rationale recorded (the `crib-ii`
  precedent applies if a source fails cross-verification).
- Every shipped table is **verbatim-fetched and programmatically parsed** — the audit
  log records the source URL, fetch date, and the cross-verification source; no value
  is hand-entered.
- `UTILITIES.length` advances by the sum of shipped deltas (≤7); all 13 catalog-truth
  surfaces agree; `docs/scope-data-sourced.md` records the running count.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build` pass at each
  feature-spec close; the CHANGELOG records each spec with its delta; the `data/`
  diff is surgical (no manifest restamp).

## 6. Out of scope for the program

- **No hand-transcribed tables** — the entire point is verbatim fetch; a tile whose
  source resists programmatic fetch is deferred, not typed in.
- **No LAS/CAS, no FRAX/STS/Tyrer-Cuzick** (§2) — proprietary/un-sourceable.
- **No new clinical doctrine, no new group, no new specialty tag.**
