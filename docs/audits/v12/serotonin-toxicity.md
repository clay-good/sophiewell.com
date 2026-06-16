# v12 audit - serotonin-toxicity

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Dunkley EJC, Isbister GK, Sibbritt D, Dawson AH, Whyte IM. The Hunter Serotonin Toxicity Criteria. QJM. 2003;96(9):635-642.

`lib/tox-v86.js serotoninToxicity()` is pure boolean branch logic. It gates on the serotonergic-agent precondition (returns a surfaced "not applicable", never a silent negative) and then tests the five Hunter decision branches in order, naming the first that fires. Sensitivity 84% / specificity 97% are quoted in the result note. No arithmetic; no treatment order authored in Sophie's voice (spec-v11 §5.3).

## Boundary examples added
- Serotonergic agent + spontaneous clonus -> meets (branch 1).
- Agent + tremor + hyperreflexia -> meets (branch 4).
- Agent + inducible clonus alone -> does not meet; + agitation -> meets (branch 2).
- Agent + hypertonia + temp >38 C + ocular clonus -> meets (branch 5).
- Agent + single agitation finding -> does not meet.
- No serotonergic agent -> not applicable.

## Cross-implementation differential
- Reference: the five published Hunter branches (Dunkley 2003, decision tree).
- Test cases: as above; Sophie matches the published rule for each fired branch and the precondition gate. PASS.

## Edge-input handling notes
- Every field is coerced with a loose boolean (B()); NaN/Infinity/''/undefined/null all coerce to false. No throw path, no NaN/undefined in any returned string (spec-v59 fuzz harness covers lib/tox-v86.js).

## A11y / keyboard notes
- Ten labeled checkboxes, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
