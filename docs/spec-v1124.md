# spec-v1124 — the third author to notice a default and reason past it

Two tiles. One is a gap in [spec-v1122](spec-v1122.md), four days old. The other
is a comment explaining why the fix was not made.

## `startback`: one point, two boundaries, and I guarded one

spec-v1122 was careful about scope. It found that the STarT Back tool's one
graded item — how bothersome the back pain has been, worth 1 point — could only
cross a boundary in one place, and guarded exactly that:

> a total of exactly 3 is low risk and 4 is not

True, and incomplete. **The point counts toward the psychosocial subscore as
well as the total**, and there are two boundaries:

| | |
|---|---|
| total 3 → 4 | low becomes medium — **spec-v1122 guarded this** |
| subscore 3 → 4 | medium becomes **high** — it did not |

The second is the one the stratified-care pathway actually keys on: high risk is
what sends a patient to psychologically-informed physiotherapy rather than to
advice and exercise.

This is rule 15 — *a fix scoped by one worked case is scoped to that case* — on
the wave that had just quoted rule 12 about not over-refusing. **Getting the
scope right in one direction is not getting it right.** I checked which totals
the point could cross and never asked the same question of the subscore, because
the first answer felt like the whole answer.

## `scorad`: the comment said why it had not been done

[spec-v1093](spec-v1093.md) footed SCORAD's two subjective VAS scores and
excluded its six intensity items, and wrote down the reason:

> Unlike the intensity items above — **selects, which open on 0 and are never
> blank** — the two VAS fields are number inputs, so the gap is expressible on
> both surfaces.

Every clause is accurate. The conclusion is backwards: *a select that opens on 0
and can never be blank* is rule 8, not an exemption from it, and B is worth
**7B/2 — up to 63 of the 103 points**.

That is the third time this programme has found an author notice a default and
reason past it, and the three are worth reading together:

| | the comment |
|---|---|
| `lvh-criteria` ([spec-v1116](spec-v1116.md)) | *"without a silent default beyond the labeled male default"* |
| `essdai` ([spec-v1109](spec-v1109.md)) | *"an unselected / unknown value contributes 0 (never NaN)"* |
| `scorad` (here) | *"selects, which open on 0 and are never blank"* |

None is careless. Each is an author who looked directly at the default, described
it correctly, and treated the description as the justification. **The sentence
that names a default is the one to distrust**, because writing it down is what
makes it feel handled.

The six items now carry a blank option and go through the same `regionFooting`
helper the subjective half already used — the helper was there, and the fix is
four lines.

### A shared list, and a decision not to touch it

`SEV4` is shared with PASI and EASI. [spec-v1110](spec-v1110.md) argued that **a
shared control is a shared decision** and fixed all three tiles that rendered
from one list. That cuts both ways: adding a blank option to a list whose other
consumers read `''` as `0` would hand *their* readers a way to reach a defect the
browser had been hiding.

SCORAD gets its own copy, and PASI and EASI are recorded as the open question
rather than changed unverified.
