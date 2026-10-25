# spec-v1687 — Energy equations and the transfusion threshold assumed a blank demographic

> Status: **SHIPPED (2026-10-24)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1686](spec-v1686.md).

An independent second-pass review of the pre-v300 libs found three defects provable from each file's own text —
two of the same blank-demographic-default family as [spec-v1684](spec-v1684.md)/[spec-v1685](spec-v1685.md).

| Tool | Input | Was | Now |
|---|---|---|---|
| `mifflin-st-jeor`, `harris-benedict`, `penn-state-ree` | an omitted sex (e.g. an agent call with weight/height/age) | a blank sex silently resolved to **male** (`o.sex !== 'female'`), so Mifflin added +5 kcal/day instead of −161 — a 166 kcal/day upward bias — and the others used the male equation | the sex is asked for, exactly as `iretonJones` in the same file already requires ("Each form's indicator is asked, not assumed") |
| `transfusion-threshold` | a hemoglobin with the population not chosen | a blank population silently resolved to **stable-adult** (7 g/dL, the lowest threshold), so a cardiac-surgery (7.5) or orthopedic/CVD (8) patient at, say, 7.2 read "at or above the threshold — do not transfuse on the number alone" | the population is asked for (its guard message already said to select it); the browser select gained a "Choose the patient population" first option |
| `forrest` (suites, the gbs/rockall rebleed anchor) | Forrest class Ib | the detail printed "rebleeding risk ~50%" while the file's own NOTE and header state "Ia/Ib ~55%" | ~55%, matching the cited source |

The energy equations match `iretonJones`'s existing lib-level refusal (the browser sex select is unchanged, as there).
The structured verdicts for `forrest` were already correct (tier/abnormal); only the printed figure was wrong.

## Proof

`test/unit/{mifflin-st-jeor,harris-benedict,penn-state-ree,transfusion-threshold,forrest}.test.js` — each adds a
regression test; the transfusion test that had asserted the default-to-stable-adult behavior (which encoded the bug)
now asserts the refusal. Verified live in the browser for the transfusion select.
