# spec-v598 — JTA criteria (thyroid storm, TS1 and TS2)

## What this gives you

The Japan Thyroid Association grade for a patient with suspected thyroid storm, with the one asymmetry that
drives the whole rule made explicit.

## Why it exists

A **companion with a different construction** to `burch-wartofsky`. That is a *weighted point scale* read
against a threshold; these are *categorical combination rules*. The two are the pair used worldwide and are
known to disagree — and a Burch-Wartofsky total cannot be converted into a JTA grade. Every slug spelling and
filename search returned 0.

## The rules

**Prerequisite:** thyrotoxicosis (elevated free T3 or free T4) — not a scored item.

| Grade | Rule |
|---|---|
| **TS1** (definite) | thyrotoxicosis + **CNS manifestation** + ≥ **1** other feature<br>**or** thyrotoxicosis + ≥ **3** other features |
| **TS2** (suspected) | thyrotoxicosis + ≥ **2** other features<br>**or** the TS1 pattern with thyroid function tests **unavailable** |

The four non-CNS features: fever ≥ 38 °C; heart rate ≥ 130; congestive heart failure (severe level only);
gastrointestinal or hepatic disturbance (nausea, vomiting, diarrhea, or bilirubin ≥ 3.0 mg/dL).

## The asymmetry that drives everything

**CNS manifestations are privileged and nothing else is.** Fever + tachycardia alone → **TS2**. Delirium +
fever alone → **TS1**. Counting the five features equally is wrong in both directions.

## Three more things

- **TS1/TS2 are definite/suspected, not mild/severe.** They grade *certainty*. A TS2 patient is not less
  sick.
- **The no-laboratory route.** The same clinical picture drops a grade purely on whether a blood test has
  come back — flagged with `viaNoLabsRoute`.
- **Heart failure means severe** — pulmonary edema, rales over more than half the lung fields, or cardiogenic
  shock (NYHA IV / Killip III+). Mild decompensation does not count.

**The exclusion clause is deliberately not mechanical.** The source says an alternative cause warrants
exclusion, then says those same conditions may *themselves trigger* storm. The tile asks and reports; it does
not decide, and the answer never changes the grade.

## Scope (spec-v11 §5.3)

Thyroid storm is a life-threatening emergency with mortality above 10%. These criteria **classify and do not
treat** — they do not select or sequence thionamides, iodine, beta-blockade or corticosteroids, do not
indicate that iodine must follow a thionamide, and do not decide on intensive care. **Failing the criteria
does not exclude thyroid storm**, and treatment of a patient who looks to be in storm should not wait for a
criteria set or for thyroid function tests to return.

## Source

- Akamizu T, Satoh T, Isozaki O, et al. *Thyroid.* 2012;22(7):661-679.

## Files

`lib/jta-thyroid-storm-v598.js`, `views/group-v598.js`, `mcp/adapters/jta-thyroid-storm-v598.js` (wave 423),
`test/unit/jta-thyroid-storm.test.js`. Catalog 1447 → 1448; MCP 1384 → 1385.
