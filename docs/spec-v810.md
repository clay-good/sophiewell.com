# spec-v810 — Modified Mallampati Classification

## What this gives you

Pick what you can see in the open mouth; get the modified Mallampati class — and, attached
to it, what that class is actually worth.

The airway cluster here was half-built. `cormack-lehane` grades what the laryngoscopist
*sees once the blade is in*; `lemon`, `wilson-airway` and `heaven-criteria` are
multivariable difficulty predictors. The single most-performed bedside airway observation
in the world was missing.

## §1 The classes

Patient sitting, head neutral, mouth open as wide as possible, tongue out, not phonating.

| Class | Visible | Association |
|---|---|---|
| I | Soft palate, fauces, uvula, pillars | Usually easy direct laryngoscopy |
| II | Soft palate, fauces, uvula | Usually easy direct laryngoscopy |
| III | Soft palate, base of uvula only | Difficult direct laryngoscopy |
| IV | Hard palate only | Greatest difficulty |

Mallampati's 1985 original had **three** classes. Class IV was added by Samsoon and Young in
1987, and that four-class version is what "Mallampati" means today. The tile says so, the
way `fisher-grade` distinguishes itself from `modified-fisher`.

## §2 Why the tile returns two things, not one

Pooled across 55 studies and 177,088 patients, the modified Mallampati score has a
**sensitivity of 0.35 and a specificity of 0.91** for difficult tracheal intubation. About
two thirds of difficult airways look reassuring on this test. The meta-analysis concluded it
is **inadequate as a stand-alone test** and belongs inside a multivariable assessment.

So the result carries the performance figures on **every** class, including I and II, and
adds "a reassuring class is not clearance" to the two reassuring ones. A class I read as
"this airway is fine" is the failure mode this tile exists to prevent, and burying that in a
citation would reproduce it. A unit test pins the caveat to the reassuring classes
specifically, so it cannot be quietly dropped from the half of the scale that most needs it.

## §3 Shape

One `select`, four literal options (looped options would leave the pre-rendered pages
printing raw values). `lib/mallampati-v810.js` is pure. Roman numerals and digits both
resolve; there is no class V and the tile says so rather than guessing.

## §4 Sourcing (spec-v97 gate)

- Mallampati SR, Gatt SP, Gugino LD, et al. *Can Anaesth Soc J.* 1985;32(4):429-434.
- Samsoon GL, Young JR. *Anaesthesia.* 1987;42(5):487-490. — adds class IV.
- Lundstrom LH, Vester-Andersen M, Moller AM, et al. Poor prognostic value of the modified
  Mallampati score: a meta-analysis involving 177088 patients. *Br J Anaesth.*
  2011;107(5):659-667. (PMID 21948956.) — the pooled sensitivity and specificity.

Two independent sources agree on the four class definitions and on classes III–IV being the
ones associated with difficulty.

## §5 Posture

Decision support, not a verdict. It records a bedside observation. It does not plan an
airway, choose a technique, or clear anyone for one.

Catalog 1601 → 1602.
