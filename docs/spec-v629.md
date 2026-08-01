# spec-v629 — Expose the non-clinical calculators (44 tiles behind the fence)

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v627 program. **The biggest single
coverage jump.**

## The gap

`mcp/catalog.js:1111` refuses any tile that is not `clinical: true`. That one line hides **44 deterministic
calculators** that users rely on every day: the CMS payment engines, claim-edit and modifier logic, E&M and
time-based coding, drug/infusion billing, identifier validators, regulatory-deadline math, and the interactive
prior-auth / EMS / specialty-visit lookups. Every one has a pure `lib/` function and a worked `META.example`
— they are ready today. The fence is **policy, not engineering** (a deliberate "first wave is clinical only"
scoping call), and it is now the single largest thing standing between agents and full coverage.

## What gets exposed

| Domain | Tiles | Backing lib |
|---|---|---|
| MPFS payment | `rvu-payment`, `mppr`, `bilateral-pay`, `multi-surgeon-pay`, `sequestration-adjust` | `lib/billing-v78.js` |
| Claim edits / modifiers | `ncci-ptp`, `mue-check`, `modifier-x-selector`, `global-period`, `modifier-order` | `lib/billing-v79.js` |
| E&M + time-unit coding | `em-mdm-2023`, `critical-care-time`, `split-shared`, `prolonged-services`, `therapy-units`, `anesthesia-units`, `em-time`, `em-mdm` | `lib/billing-v80.js`, `lib/coding-v5.js`, `lib/ops-v63.js` |
| Drug / infusion billing | `ndc-hcpcs-units`, `drug-wastage`, `infusion-hierarchy`, `ndc-convert` | `lib/billing-v81.js`, `lib/coding-v5.js` |
| Identifiers + facility pricing | `npi-validate`, `mbi-validate`, `icd10-validate`, `era-balance`, `drg-payment`, `apc-payment` | `lib/billing-v83.js` |
| Patient responsibility / COB | `medicare-cost-share`, `cob-calc`, `allowed-amount`, `nsa-cost-share` | `lib/billing-v82.js` |
| Regulatory deadlines | `appeal-deadline`, `timely-filing`, `pa-turnaround`, `overpayment-60day`, `breach-clock` | `lib/deadline.js`, `lib/regulatory.js` |
| Unit conversion | `unit-converter-v4`, `peds-weight-conv`, `time-to-dose` | `lib/unit-convert.js` |
| Interactive lookups | `prior-auth`, `ems-doc`, `specialty-visit` | `lib/workflow-v4.js` |

**`prep`** (visit-type + free-text → matched intake questions) is exposable too but **lacks a `META` entry**;
add its citation + example first, then expose. It is the one tile in this set that is work rather than a pure
adapter.

Kept off (handled in v632): the seven template generators and `pa-lint`.

## The one real change: the fence and the disclaimer

**1. Replace the clinical-only fence with an explicit MCP-eligibility signal.** Rather than flipping the
`clinical` bit (which would corrupt the catalog's own semantics) or dropping the fence entirely (which would
sweep in the document generators), gate exposure on an explicit per-tile eligibility marker — the presence of
an adapter *is* the opt-in, with the registry no longer rejecting a tile solely for being non-clinical. The
v632 accountability gate then ensures nothing eligible is left unexposed and nothing ineligible sneaks in.

**2. Add a second disclaimer.** The single `DISCLAIMER` in `mcp/catalog.js:1097` is clinical-specific ("the
decision stays with the clinician and local protocol"). Attaching that to `rvu-payment` is wrong-domain.
Introduce `ADMIN_DISCLAIMER` for administrative/coding math (payment estimates and coding/deadline outputs
are decision-support against payer rules and published fee schedules, not a guarantee of payment or
compliance), and select per tile by its `clinical` flag. **Carry the `clinical` flag (or a `domain`:
clinical | administrative) into every `describe`/`compute` payload** so an agent can tell decision-support
from administrative math.

Everything else is unchanged: these tiles round-trip through the existing example gate exactly like clinical
ones, so no new validation machinery is needed.

## Guards

- **Determinism holds.** These are pure functions over user-supplied inputs. Note (per the audit) that the
  claim-edit engines (`ncci-ptp`, `mue-check`, `global-period`, `modifier-x-selector`) take the published
  edit indicator *as an input* — no CMS tables ship, so there is nothing time-varying or licensed embedded.
- **Right disclaimer on the right tile.** A gate check: every exposed non-clinical tile carries
  `ADMIN_DISCLAIMER`, every clinical tile carries the clinical one. A mismatch fails lint.
- **Coverage math.** Exposed count rises by 43 immediately (44 minus `prep`, which waits for its META). The
  count is reported live, never hardcoded.

## What not to do

- Do **not** expose the template generators or `pa-lint` here — they are deliberately waived (v632).
- Do **not** launder the clinical disclaimer onto administrative tiles, and do **not** water down the
  clinical disclaimer to cover both. Two disclaimers, selected by domain.

## Files (when built)

`mcp/catalog.js` (eligibility fence, `ADMIN_DISCLAIMER`, carry `domain`), `mcp/tools.js` (select disclaimer;
emit `domain`), ~44 `mcp/adapters/*.js`, `lib/meta.js` (`prep` META), `scripts/check-mcp-catalog.mjs`
(disclaimer-domain check), `test/mcp/*`, `docs/mcp-coverage.md`.
