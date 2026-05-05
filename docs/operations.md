# Operations and Maintenance

The site is intentionally low-maintenance. The recurring work is the
weekly data refresh PR; the rest is quarterly review and a yearly
licensing re-read. This document is the maintainer's runbook.

## Weekly: data refresh

`.github/workflows/data-refresh.yml` runs every Sunday at 06:00 UTC
and on manual `workflow_dispatch`. It snapshots the previous `data/`,
runs `node scripts/build-data.mjs` against the network, verifies
shard integrity, runs the unit and accessibility tests, and opens a
pull request titled `data: weekly refresh`.

The PR body is auto-populated by `scripts/analyze-data-changes.mjs`
with a Markdown summary covering MPFS conversion-factor change, top
RVU shifts, ICD-10 / HCPCS code adds and removes, NADAC top price
changes (>5% delta), and OIG / Medicare opt-out adds and removes.

Maintainer review: read the summary. If a number looks wrong (e.g.,
ICD-10 dropped 1000 codes), inspect the diff. Otherwise merge.

## Quarterly review

Once a quarter the maintainer reviews:

1. **New public datasets**. Spec-v2 7.3 specifies that the build
   script is structured so adding a new dataset is a contained
   change: write a fetcher, write a parser, add a manifest entry,
   add the corresponding utility view. Look for new datasets that
   match the site's deterministic-utility pattern. Recent candidates
   to consider:
   - DOT Emergency Response Guidebook (PHMSA, public-domain HazMat
     reference; spec-v3 lists it as in-scope but no utility yet).
   - NIOSH Pocket Guide to Chemical Hazards.
   - State medical-debt collection rule updates.
2. **Source format changes**. Each `manifest.json` records the
   source URL; visit the source and confirm the structure has not
   shifted. CMS occasionally restructures the MPFS Final Rule
   layout.
3. **CI workflow health**. Read the last quarter of CI runs. Spot
   flaky tests, slow steps, or broken downloads.
4. **Stability commitments**. Confirm no telemetry, no analytics,
   no email capture, no notification permission has crept in. Run
   `node scripts/grep-check.mjs` and the integration test
   `test/integration/smoke.spec.js` `localStorage` check locally.

## Yearly review

1. **ICD-10-CM annual update**. The new fiscal year ICD-10-CM file
   ships in October. Confirm the data-refresh PR for the first
   October weekly run picks it up cleanly.
2. **MPFS annual update**. The Final Rule typically publishes in
   November or December for the next calendar year. Conversion
   factor and RVU components change; the data-change analyzer will
   surface this.
3. **AMA CPT licensing posture re-read**. Re-read AMA CPT licensing
   terms. Confirm no AMA descriptors have crept into
   `data/cpt-summaries/summaries.json` (the
   `test/unit/cpt-no-ama.test.js` check guards this automatically).
4. **AHA guideline edition**. The AHA ECC guidelines are updated on
   a multi-year cadence. When a new edition publishes, update
   `data/aha-reference/aha-reference.json` numeric facts and the
   `edition` field; bump the citation in `lib/meta.js` for the AHA
   Group I utilities; add a CHANGELOG entry per the spec-v2 6.4
   formula version transparency rule.
5. **Wilderness Medical Society guidelines**. Re-read the WMS
   practice guidelines for hypothermia and heat illness; update the
   bands in `data/environmental/environmental.json` if changed.
6. **Mozilla Observatory + securityheaders.com**. Re-run an A+
   verification on the production domain.

## Adding a new utility

The pattern mirrors what already exists. Briefly:

1. If the utility needs new bundled data, add a dataset entry in
   `scripts/build-data.mjs` and run the script. Update
   `docs/data-sources.md` and `scripts/sources.md`.
2. Add a pure function (if the utility computes anything) to one of
   `lib/clinical.js`, `lib/field.js`, `lib/decoder.js`, etc.
3. Add a renderer to the appropriate `views/group-X.js` module.
4. Add the utility id to the `UTILITIES` registry in `app.js` with
   group, audiences, and `clinical` flag.
5. Add the utility to `META` in `lib/meta.js` with citation,
   `source` (if any), and `example` for the Test-with-example
   button.
6. Add a tile to `index.html` with the right `data-group`,
   `data-audiences`, tags, and link.
7. Add unit tests for the pure function. Match the
   Test-with-example payload to a test case.
8. If the utility is a calculator, the live-render helper from
   `lib/live.js` and the Copy-all button from the meta panel work
   automatically.
9. Add a CHANGELOG entry.
10. Run `npm test` and confirm grep, a11y, and integrity all pass.

## Adding a new dataset

1. Add a dataset object to the `datasets` array in
   `scripts/build-data.mjs`. Implement `build()` to write the
   shards and manifest.
2. Add a row to `scripts/sources.md` and an entry to
   `docs/data-sources.md`.
3. If the source is restricted (copyright, licensing), document the
   posture in `docs/legal.md` with the same care as the AMA CPT
   posture.
4. Run `node scripts/build-data.mjs` and `node scripts/verify-integrity.mjs`.
5. If first run, the script writes the source SHA-256 to
   `scripts/expected-hashes.json` with `status: pending-confirmation`
   and halts. Re-run with `--confirm-hashes` to accept.

## Cost

The site costs the domain renewal (approximately ten dollars per
year) and zero compute on the Cloudflare Pages free tier.

## Emergency procedures

- **Data corruption discovered in production**. Cloudflare Pages
  keeps every prior deployment. Promote the previous deployment via
  the Pages dashboard (rollback). Open a hotfix PR against the
  current data folder.
- **A clinician reports a calculator returning a wrong value**.
  Reproduce locally with the values; if confirmed, fix the formula
  in the relevant `lib/*.js` module, update the unit test and the
  Test-with-example payload to match, add a CHANGELOG entry under
  "Fixed" with the previous behavior and the corrected behavior.
  Tag a patch release.
- **An AMA / AGS / ISMP / AHA cease-and-desist**. Take the affected
  content offline immediately by reverting the relevant data file
  (or the entire `data/cpt-summaries/`, `data/aha-reference/`, etc.)
  and deploying. Then read the request carefully and respond.

## v4 dataset cadence (added in spec-v4)

The v4 expansion adds 50+ datasets in `data/`. Cadence-specific refresh
notes for the CI `data-refresh.yml` weekly job:

- **Weekly**: `nadac`, `drug-recalls`. NADAC is the existing v1 cadence;
  drug-recalls snapshots `api.fda.gov/drug/enforcement.json` filtered to
  drugs.
- **Monthly**: `npi`, `enforcement`, `rxnorm`. RxNorm follows the NLM
  monthly release cadence.
- **Quarterly**: `hcpcs`, `ncci`, `mue`, `apc`, `dmepos`, `clfs`, `asp`,
  `asc`, `therapeutic-drug-levels`, `abx-renal`. CMS quarterly fee
  schedules and FDA-label refreshes.
- **Annual**: `icd10cm`, `mpfs`, `gpci`, `wage-index`, `drg`, `icd10-pcs`,
  `cms-deductibles`, `irmaa`, `aca-thresholds`, `hsa-fsa-limits`, `fpl`,
  `irs-mileage`, `acip-routine-adult`, `acip-routine-child`,
  `acip-catchup`, `yellow-book`, `tetanus`, `rabies-pep`, `bbp-exposure`,
  `tb-tst-igra`, `sti-screening`, `lab-ranges-adult`, `lab-ranges-peds`,
  `tox-levels`, `cms-1500-fields`, `ub04-fields`, `va-eligibility`,
  `tricare-plans`, `ihs-eligibility`, `tccc`, `vasopressor-doses`,
  `tpn-rules`, `iv-to-po`.
- **Semi-annual**: `nucc-taxonomy`, `medicaid-state`.
- **Per-edition**: `dot-erg`, `niosh-pg`, `cpr-aha-numeric`.
- **As-needed / static**: `pos-codes`, `tob-codes`, `revenue-codes`,
  `nubc-special-codes`, `dea-rules`, `eob-glossary`, `steroid-equiv`,
  `benzo-equiv`, `mme-factors`.

In the development checkout `SOPHIEWELL_OFFLINE=1` is set by default and
each dataset ships with a small hand-curated seed shard. CI runs
`scripts/build-data.mjs` with full network access, refreshes the data
folder, and re-runs `scripts/verify-integrity.mjs` against the resulting
manifests. Total manifest count after v4 lands: 78 (22 v3 + 56 v4).
