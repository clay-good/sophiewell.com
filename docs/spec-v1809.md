# spec-v1809 — Place it by the sentence

> Status: **SHIPPED (2026-11-26)**: 14 more fields stop answering a value the reader entered with "Enter
> it", taking the strong category from **49 to 35**, and the placement rule that misfired three times is
> replaced by one that cannot. No tool's arithmetic changed; the catalog stays 2,390.

Three waves placed each new range check "before the first `=== null` in the named function". It went wrong
three times, each caught by a different gate: twice into the **wrong function** (spec-v1806, spec-v1807),
and once before a **later** branch, where `nafld-fibrosis` kept answering *"Enter age (years), BMI, AST,
ALT, platelets and albumin"* with a check sitting uselessly below it.

The rule was wrong in kind, not in detail. **The probe prints the exact sentence the tool answers with, and
that sentence is a literal in the library** — so the branch to insert before is the one that **returns it**.
Find the sentence, walk back to its enclosing `if (`, insert there. It cannot land in the wrong function,
because the sentence is only in one; it cannot land before the wrong branch, because the branch is the one
that says the words. 27 of 28 tools placed on the first pass, and the one miss is honest: `rapid3` builds
its refusal from a template, so the sentence is not in the source to find.

## Two libraries answered back

`acr-eular-boolean` and `vexus` both failed their own tests, and both were right to.

**`acr-eular-boolean` already validated every field.** Its four branches state the range *and* set `code`
and `field`, which the agent surface reads — and open with *"Enter the 28-joint tender joint count (whole
number 0-28)"*, the same sentence an empty box gets. A generic block pre-empting them lost `field`
entirely, which its test caught in one line (`undefined !== 'crp'`). So the guard is per field there,
keeping `code: 'OUT_OF_RANGE'` and the `field` that names it. Declaring the three ranges those branches
enforce then satisfied `probe-undeclared-cap` — the loop closing for the fourth time this session.

**`vexus` was lumping a negative in with a blank.** Its test loops `['', null, undefined, 'abc', 0, -1]` and
expects one sentence for all six. Five of those are right: a blank, a non-number and **zero** all deserve
"enter a diameter", because the tool divides by it. A typed -1 does not, and now gets its floor. The test
asserts the two separately, and says why zero stays with the blanks.

That refusal also showed what `readable()` does to an acronym: the generated label `maximal ivc diameter`
came out as *"Maximal ivc diameter must be at least 0"*. The label is the control's words now — *"the IVC
diameter in centimeters"* — which is the rule [spec-v1804](spec-v1804.md) set for exactly this reason.

## What is left

35 rows of the strong form, and the remainder is no longer one shape. `rapid3`'s templated refusal needs
the template, not the sentence; the rest are tools whose asking branch is reached for some fields and not
others. The codemod has taken what a codemod can.
