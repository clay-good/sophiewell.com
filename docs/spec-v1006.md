# spec-v1006 — An incomplete score may rule in. It must never rule out.

## The finding

spec-v930 established that a blank field and an absent field must reach the same outcome, and its
own comment said plainly what it was leaving open: *"It says nothing about WHICH outcome is right."*

This is that question, and for seven calculators built on measurements the answer was bad. Each
one, given nothing at all, answered reassuringly:

| Tile | Inputs | With no inputs |
| --- | --- | --- |
| `lrinec` | six labs | *"LRINEC 0: low risk of necrotizing fasciitis"* |
| `mods` | six organ systems | *"MODS 0 of 24: ICU mortality 0%"* |
| `carpenter-coustan` | a 4-draw OGTT | *"0 of 4 values exceed cutoffs → not diagnostic of GDM"* |
| `iadpsg` | a 3-draw OGTT | *"0 of 3 values exceed cutoffs → not diagnostic of GDM"* |
| `nutric` / `mnutric` | age, APACHE II, SOFA, comorbidities, days | *"low nutritional risk"* |
| `rome-ecopd` | five bedside variables | *"mild COPD exacerbation"* |

And the likelier case is worse than the empty one, because it looks like an answer. A **single**
value produced a complete reading: `lrinec` with a CRP of 200 said *"LRINEC 4: low risk"* while
five labs worth nine points sat unentered, and `mods` with a creatinine of 5 said *"MODS 3 of 24:
ICU mortality ~1-2%"* while five organ systems went unmeasured. A missing measurement is not a
normal one.

## The rule

Every one of these scores is **monotone**: a component adds points or leaves them alone, never
subtracts. So a partial total is a **lower bound** — which makes an incomplete score safe to rule
**in** and never safe to rule **out**. Each of these was ruling out.

So each now withholds the reassuring reading until its inputs are there, and keeps the alarming
one as soon as the evidence supports it:

- `lrinec` at 6 or more still reports intermediate or high risk, and says it was scored from *n* of
  6 components.
- `mods` past the first mortality step still reports it, and says how many organ systems it had.
- Two Carpenter-Coustan values over cutoff still diagnose GDM; one IADPSG value still does. Neither
  can say "not diagnostic" without the full test.
- `rome-ecopd` still grades moderate on three variables and severe on the blood gas.

Every refusal names the inputs it is waiting for, and says why the missing ones matter.

## The half that was still broken after the libraries were fixed

The library guards worked for the MCP surface, which passes `''`, and did nothing for the browser,
which is the audience that matters more. Four of the five renderers read their inputs with
`nv(id)` — `Number(input.value)` — and **`Number('')` is `0`**. A cleared form therefore reached
the library as a form full of zeros: every value "present", nothing missing, guard never fires.
This is the same trap spec-v930 named, still live in the view layer; `mods` had been moved to
`nvOrNull` then, and the other four had not. They are now.

That is only visible from the browser. The library test passed, the MCP test passed, and the tile
still answered "not diagnostic of GDM" to an empty form until an end-to-end check cleared the
fields the way a reader does.

## Proof

- `test/mcp/incomplete-does-not-rule-out.test.js` — four assertions: no reassuring band from an
  empty call, none from a single value, the rule-in cases still rule in, and every refusal names
  what is missing.
- `test/integration/incomplete-scores.spec.js` — opens each of the seven in a browser, clears every
  field, and asserts the reader sees the prompt and never `null` or `NaN`.
- `test/unit/carpenter-coustan.test.js` had a test asserting `exceeded: 0, gdm: false` on an empty
  form — **the defect written down as an expectation**. It now asserts the refusal.
- The full example-correctness sweep passes: every worked example still produces its documented
  output.

## Left open

`nv(id)` — `Number(document.getElementById(id).value)` — is defined in seven view modules and used
about two hundred times in `views/group-g.js` alone. Most of those uses are fine, because for a
checklist-style input zero is a real answer a clinician can give. Auditing which are not is its own
piece of work and wants the same measurement-versus-criterion judgment applied tile by tile; it is
not a blanket rename.
