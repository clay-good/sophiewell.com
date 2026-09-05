# spec-v1079 — every slider, and what it says before anyone touches it

[spec-v1078](spec-v1078.md) fixed two tiles and left an obvious question: `views/`
calls `rangeField` at 68 sites. How many of the others say something reassuring
about a patient nobody has assessed?

`test/integration/slider-default-probe.spec.js` asks it the only way that
answers: load every tile, leave each slider exactly where it rendered, and read
the result. **Sixteen tiles** came back. This page is the triage, because a
count is not a defect list.

## Three that are not defects

`flacc`, `painad` and `nips` render their worked example, and that example
describes a patient **in pain** — "FLACC 6: moderate pain", "NIPS 6 of 7: severe
pain". They matched only because the probe's reassuring-word list contains
"mild" and "moderate", which are severity bands here rather than reassurance.
Nothing to fix; the probe is doing what a probe does.

## Thirteen where the default *is* the reassuring end

Each renders every slider at its best value, so the untouched form reads as the
healthiest possible patient.

| Tile | Untouched form says | Why it matters |
|---|---|---|
| `guss` | GUSS 20 of 20 — **"Normal diet, normal liquids; no further investigation"** | a swallow screen clearing a stroke patient before a spoonful of water |
| `braden` | Braden 23 — **"not at risk"** | pressure-injury risk, on a patient nobody turned |
| `norton-push` | Norton 20 of 20 low risk; **PUSH 0 of 17** | as Braden, plus a wound scored as closed |
| `katz-adl` | Katz ADL 6 of 6 — **"full independence"** | a discharge-planning input |
| `lawton-iadl` | Lawton IADL 8 of 8 — **"full independence"** | as Katz |
| `white-song` | 14 of 14 — **"fast-track eligible"** | a post-anaesthesia discharge decision |
| `apgar` | **APGAR: 10 (Normal)** | a newborn nobody looked at |
| `npass` | pain 0, sedation 0 — **"no significant pain"** | a neonate who cannot report it |
| `vip-extravasation` | **"VIP 0: No signs of phlebitis"** | an unexamined cannula site |
| `peds-gcs` | Pediatric GCS **15 of 15** | |
| `hunt-hess-wfns` | Hunt-Hess **1 — asymptomatic** | driven by a GCS slider at 15 |
| `meows` | **"no trigger … continue routine monitoring"** | a maternal early-warning score |
| `epworth` | Epworth 6 — **"normal daytime sleepiness"** | |

The pattern is spec-v1047's, unchanged: a slider cannot be blank, so the control
answers on the reader's behalf, and every one of these answers in the reassuring
direction.

## Why this is a queue and not a wave

The stroke scales were cheap because the library already told absent from zero —
only the control was wrong. Most of these need both halves, and one of them needs
a decision first.

**`guss` is the hardest and the highest-stakes.** It is a *staged* protocol:
semisolid is only attempted if stage 1 scores 5, liquid only if semisolid does,
solid only if liquid does. So "not assessed" and "not advanced to" are different
states that both look like an absent item, and `gussCheckBinary` currently
requires every field. Getting that wrong would mean a tile that refuses a
correctly-conducted partial screen — which is most of them, since the protocol
stops early by design.

**The GCS family needs a decision, not a fix.** `peds-gcs` and `hunt-hess-wfns`
default to 15 because 15 is the top of a scale everyone reads as a number, not a
questionnaire. Whether an untouched GCS should refuse is a judgment about the
most familiar instrument in medicine, and it should be made deliberately rather
than folded into a sweep.

**The rest are the WAT-1 shape** — an item somebody has to rate, on a control
that cannot say "not yet". `braden`, `norton-push`, `katz-adl`, `lawton-iadl`,
`white-song`, `apgar`, `npass` and `vip-extravasation` take the spec-v1047 fix
directly: a number input with a placeholder, a null-aware read, and a library
that says how many items it scored.

## Run it

```bash
RUN_PROBES=1 npx playwright test test/integration/slider-default-probe.spec.js --project=chromium
```

It writes `test-results/slider-defaults.json` alongside the console report,
because the console is interleaved by the reporter and the defaults are what a
fix has to be read from.
