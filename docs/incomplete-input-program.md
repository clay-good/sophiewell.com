# What a tool does with a value it was not given

One defect class, opened at [spec-v1006](spec-v1006.md) and worked ever since — the first thirty
waves drained the blank-field form of it, and everything after has been the same question asked
of something other than a blank: an ungraded select, an unstated timepoint, an assumed unit.
This page is the map; each spec is the detail.

## The defect

`Number('')` is `0`. Every renderer that reads a field with `Number(input.value)` therefore hands a
formula a *measurement of zero* where the reader left a gap — and a calculator that treats a gap as
a zero answers questions nobody asked it. Thirty-five tools did, and the answers were not harmless:

> "LRINEC 0: low risk of necrotizing fasciitis" — with no labs entered
> "IBW (Devine): 50.0 kg" — the formula's constant, from a blank height
> "RhIG dose: 1 standard 300 µg vial(s)" — from a Kleihauer-Betke nobody ran
> "MELD-3.0: 20 — High; Child-Pugh: 8 — Class B" — from five cleared labs
> "Remaining to ceiling: 4000 mg" — acetaminophen headroom nobody had measured
> "PSI 20 — Class II (outpatient)" — a decision to send someone home

## The rules that came out of it

Stated in full in [product-decisions.md](product-decisions.md); in one line each:

1. **A blank field is a gap, not a zero.** A typed `0` still means zero.
2. **A calculation with no inputs is not a result of zero.** Ask for what is missing, by the names
   on the labels.
3. **An incomplete score may rule in; it must never rule out.** These scores are monotone, so a
   partial total is a bound — and *which* reading is the reassuring one depends on which direction
   the scale runs (SLUMS and NIHSS refuse opposite readings for the same reason).
4. **A checkbox is an answer; a blank measurement is a gap.** Only the measurements withhold, and
   only the reading they could change.
5. **A value that IS given, but impossible, is named above the answer** — the range its field
   declares, or the billion no quantity here reaches.
6. **An alarm from nothing is not the safe direction** (spec-v1036). "May rule in, never rule out"
   says which direction is *safer*, not that the alarming answer may be invented.
7. **A guard against a missing value is a guard against one SHAPE of missing value** (spec-v1040).
   `Number('')` and `Number(null)` are both 0; when a renderer changes which one it sends, every
   guard downstream is guarding against the old shape until someone checks.
8. **A control that cannot express "not answered" will be read as an answer** — a slider, or a
   number input rendered with a `value` rather than a `placeholder` (spec-v1087). (spec-v1047, and
   again in spec-v1078, where it had made the library's own seventy-spec-old guard unreachable on
   the NIH Stroke Scale). A slider
   sits at its minimum and looks like a rating somebody made. Where the value matters, being empty
   has to be possible — a constraint on the input, not only on the reader.
9. **A surface that cannot show a control still has to ask the question it represents**
   (spec-v1073). A graded select always carries a value, so the renderer never meets an unanswered
   item; an API caller omits keys by default. Where the browser makes an answer unavoidable, the
   adapter has to declare it required.
10. **A sum and a mean fail differently — check monotonicity, never assume it** (spec-v1098), and
    check it by reading WHICH VALUE THE FALLBACK SELECTS, not by grepping for a negative
    (spec-v1127). `impede-vte` holds negatives and is genuinely not monotone: its two graded
    selects pull in opposite directions, so a partial form gives a RANGE. `leipzig-wilson` holds a
    negative and IS monotone, because an omission lands on a different, zero-point default and can
    never reach it. A grep would have got the second wrong; an assumption would have got the first
    wrong. Every
    rule above rests on the score being monotone in the number of inputs. `loe-silness-gingival-index`
    looks exactly like the body-surface family fixed in spec-v1093 and is not one: it is a *mean*, so
    omitting the surfaces that scored 2 lowers the index while omitting those that scored 0 raises it.
    There is no direction to disclose, and "can only rise" would be false.
11. **Asserting the measurement is worse than assuming it** (spec-v1095). `icans-grade` printed
    "No ICANS (**ICE 10** and …)" and `gold-abe` printed "**0 moderate exacerbations, none
    hospitalized in the past year**" — about patients nobody asked. A silent zero is a bug in the
    arithmetic; a *stated* value is a fabricated observation in the record, and the reader cannot
    tell it from one that was taken. Fix these first.
12. **Disclose or refuse, and the test is whether the missing value is expected to be there**
    (spec-v1091). An aortic valve area at a low gradient decides moderate against severe, and its
    absence is a gap in the workup — refuse. Three unquantified regurgitation criteria are what a
    normal echo report looks like — disclose. Refusing the second breaks the ordinary case rather
    than the defective one.
13. **A reading that already rules IN needs no footing — the VERDICT, not the number under it**
    (spec-v1114). Three fixes in this programme exempted a whole reading at its top band and went
    on quoting a figure the missing inputs could raise: a predicted mortality percentage, a
    severity total, and a band (`ses-cd`'s "moderate") that was not the ceiling at all. Check which
    reading is genuinely unreachable from above, and floor every number that is not.

    **A reading that already rules IN needs no footing.** It is the floor, and the missing value
    cannot lower it. The disclosure belongs to the reassuring reading, which is the one that can be
    wrong.
14. **Fix the headline, not only the detail** (spec-v1095). `isgps-dge` puts its message in `detail`
    and its verdict in `bandLabel`; fixing one leaves "No DGE" in large type above a paragraph
    saying the course was never recorded. Two disagreeing statements on one page, and the headline
    is what gets read.
15. **A fix scoped by one worked case is scoped to that case** (spec-v1098). spec-v1090 guarded only
    the moderate-gradient reading it was found on, and spec-v1098 had to extend it to the milder
    ones. Three occurrences in this programme.
16. **When a tile and the shared vocabulary disagree, count where the phrasing is used**
    (spec-v1094, spec-v1097). `can only add points` (10 files) and `is needed` (20 files) are the
    house's, so `test/lib/asking-language.js` was incomplete; `No threshold was entered` (1 file) is
    that tile's idiom, so the tile changed. Widening a list a real gate depends on is the one move
    that can silently un-protect other tiles — measure first, and record the measurement in the file.
17. **A finder's reach is part of its result** (spec-v1099) — and a GATE's too (spec-v1106).
    `field-values-match-dom.spec.js` was green while `cauchy-frostbite` was wrong, because it
    filtered on `kind === 'number'` and 2,341 of the catalog's declared lists sit on enums; because
    its perturbation skipped the number inputs the one case it names in its own header depends on;
    and because it stripped the empty option from one side of the comparison only. Widening it took
    the run from 0 disagreements to 29 to 1. **A gate reporting clean is a claim about its reach,
    not about the catalog**, so a check that filters its subjects should assert how many it kept.
    The finder's own version of the same thing: its first section keys on `abnormal`,
    <!-- catalog-truth:historical -->
    which 698 of 1,682 tiles never set, so "the section is empty" meant nothing about two fifths of
    the catalog. Any check keying on an *optional* field must print how many subjects carry it.

18. **A guard in a renderer is a guard for one surface** (spec-v1103), and in an ADAPTER too
    (spec-v1105): `snakebite-severity` has required all six body systems of an agent since
    spec-v1073, with "an unexamined system is not a system scored 0" written in the adapter's own
    summary, while the library read a blank as a zero and the page printed five examinations nobody
    performed. `toxic-alcohol` had refused
    a missing glucose and BUN in `views/group-v12.js` since spec-v1065, with the reasoning written
    out — and answered every API caller anyway, because the guard was in the renderer and not in
    the function both surfaces call. This is spec-v1073's split from the other direction: that wave
    found questions the browser makes unavoidable and the adapter never declared; this is a question
    the browser *does* insist on, living in the one place only the browser reads.

19. **A disclosure that asserts a property of the model is a claim the suite has to hold**
    (spec-v1107). Every footing in this programme rests on the score being monotone, and until
    `euroscore2` that was assumed. Its footing says *"every coefficient in this model is zero or
    positive, so each can only raise it"* — a sentence that becomes false the day a negative
    coefficient is added, with nothing else in the suite to notice. The coefficient table is now
    exported and a test walks it. Rule 10 says check monotonicity rather than assume it; this is
    the other half — keep checking it.

23. **When a guard's message lists what it needs, the list is a CLAIM** (spec-v1120). In six waves,
    five separate tiles refused with a message naming an input the code beside it did not require —
    `ipss-r-mds` ("Enter the cytogenetic risk group"), `ckd-epi-cystatin` and `gap-ipf` ("Enter …
    sex"), `cpis-vap` ("then select the remaining CPIS components"), `truelove-witts` ("and whether
    rectal bleeding is present"). The message is the author's own account of what the instrument
    needs; the guard is usually a subset of it. Reading the two against each other is the cheapest
    audit in this programme.

22. **A fix to a library is a fix to the surfaces that can REACH it** (spec-v1118). Rule 18 puts
    the guard in the pure function; that is necessary and not sufficient. The controls decide which
    states the function is ever called in, and a control with no empty option makes a
    blank-checking guard dead code on that surface. `nichd-fhr` was fixed in spec-v1102, every one
    of its tests passed, and the page went on answering "Category I" for a tracing nobody had
    described — because every test calls the library directly, where the guard works.

26. **A disclosure is OUTPUT, and output built from an unvalidated input is a leak**
    (spec-v1133). Adding a sentence that names a parameter turns that parameter into something the
    reader sees, which it was not before — so `uacr-upcr`'s new "reading the albumin as mg/dL"
    printed `albuminUnit: NaN` straight back at the reader, and the spec-v53 fuzz harness failed the
    same run that added it. Echo only values the tile knows; treat the rest as the absent value they
    are. **The whitelist belongs in the same change as the sentence**, and the whole suite is worth
    running on a one-line prose change for exactly this reason.

25. **The unit of a guard is a READING, not a field** (spec-v1126). `startback` needed guarding at
    two totals and nowhere else; `glim-malnutrition` at one combination of criteria; `pi-rads` at
    four of its twenty zone-by-category states. *"Is this field required?"* is the wrong question to
    build a guard on and *"which readings can this field move?"* is the right one — and the narrow
    version is not merely politer. A tile that refuses whenever anything is absent trains its reader
    to fill fields in to make the refusal go away, and the fields they reach for are the ones they
    can guess.

24. **The sentence that names a default is the one to distrust** (spec-v1124). In three separate
    libraries a comment described the tile's own silent default accurately and treated the
    description as the justification: `lvh-criteria`'s "beyond the labeled male default", `essdai`'s "contributes 0
    (never NaN)", `scorad`'s "selects, which open on 0 and are never blank". None is careless.
    Writing a default down is what makes it feel handled.

21. **A default is not a defect; a SILENT default is** (spec-v1116). `sex = 'male'` in four
    signatures chose an EQUATION rather than a band — the male CKD-EPI, the +1 GAP gender point,
    the 28 mm Cornell cut-off, the male GLI-2012 set. Against that, `ethnicity = 'caucasian'` in
    the same file is correct: GLI-2012 publishes an other/mixed set, the tile falls back to it and
    prints a note saying it did. Requiring that one broke a passing test, and rightly.

20. **Disclosing in DATA is not disclosing** (spec-v1113). Four mean-scored questionnaires
    computed the number of items each subscale averaged, stored it in an `answered` field, and
    rendered a static explanation of the scoring method instead — so a mean of two items and a mean
    of seven printed identically. A count in the returned object is available to an agent that
    thinks to look and to nobody reading the page. Every rule in this list is about the sentence,
    not the payload.

## The specs

| Spec | What it fixed |
| --- | --- |
| [v1006](spec-v1006.md) | The rule, and the first seven scores that ruled out |
| [v1007](spec-v1007.md) | Eight more, where measurements mix with checklist criteria |
| [v1008](spec-v1008.md) | A form holding your number and four of ours, saying nothing |
| [v1009](spec-v1009.md) | A transposed digit got a confident answer |
| [v1010](spec-v1010.md) | 195 bounds the site already knew, applied where missing |
| [v1011](spec-v1011.md) | A percentage is bounded by what it is a percentage of |
| [v1012](spec-v1012.md) | A gate that passed while 87 calculators stated an impossible number |
| [v1013](spec-v1013.md) | Fourteen arithmetic tiles answering an empty form |
| [v1014](spec-v1014.md) | Eight more, where the empty form reached a decision |
| [v1015](spec-v1015.md) | Refusals written in the words of a stack trace |
| [v1016](spec-v1016.md) | The score-shaped remainder, and the rule inverted |
| [v1017](spec-v1017.md) | Five more, and the other half of the stack-trace fix |
| [v1018](spec-v1018.md) | A reading measured from "now", and a comparison made on the wrong day |
| [v1019](spec-v1019.md) | **Gate**: no new calculator answers an empty form |
| [v1020](spec-v1020.md) | One value, not none — the likelier case |
| [v1021](spec-v1021.md) | Two refusals that reached agents as answers |
| [v1022](spec-v1022.md) | The warning broke this project's own accessibility rule |
| [v1023](spec-v1023.md) | An exemption granted for one number covered a whole sentence |
| [v1024](spec-v1024.md) | **Gate**: no calculator silently answers from the clock |
| [v1025](spec-v1025.md) | The browser had no idea which fields were required |
| [v1026](spec-v1026.md) | The sweep read each answer before it had finished rendering |
| [v1027](spec-v1027.md) | The warning's permanence broke three suites about its neighbours |
| [v1028](spec-v1028.md) | Two withdrawal scales opened already scored |
| [v1029](spec-v1029.md) | What the empty-form ledger was hiding: five scores with a measurement inside |
| [v1032](spec-v1032.md) | The impossible-number guard was reading the wrong live region |
| [v1036](spec-v1036.md) | An alarm from nothing is not the safe direction |
| [v1037](spec-v1037.md) | **Gate**: the browser answers nothing the agent surface refuses |
| [v1038](spec-v1038.md) | Thirteen more: doses of zero, age bands chosen by a blank, not-met vs not-measured |
| [v1039](spec-v1039.md) | The sweep almost learned to ignore its own defect |
| [v1040](spec-v1040.md) | `Number(null)` is 0, and five guards had stopped firing because of it |
| [v1041](spec-v1041.md) | Five more, and a gate that caught the trap inside the fix for the trap |
| [v1042](spec-v1042.md) | The instrument that is one number |
| [v1043](spec-v1043.md) | Two more, and a ledger that says why |
| [v1044](spec-v1044.md) | Nine rating scales that did not say how many items they scored |
| [v1045](spec-v1045.md) | The panel that refused what it could answer |
| [v1046](spec-v1046.md) | Money from a blank field, and a note that fooled the gate |
| [v1047](spec-v1047.md) | The sibling that needed a different control |
| [v1063](spec-v1063.md) | The field a reader leaves blank, on a form that otherwise looks complete |
| [v1064](spec-v1064.md) | Seven more, and the unit-field reader every earlier wave walked past |
| [v1065](spec-v1065.md) | Eight more, a third half-fix, and the calculators that were right all along |
| [v1066](spec-v1066.md) | Not met, or not measured: the third state a criteria count was missing |
| [v1067](spec-v1067.md) | The gate, keyed by field, and the ledger that was quiet because I guessed at it |
| [v1071](spec-v1071.md) | The answer refused; the "show your work" panel below it did not |
| [v1072](spec-v1072.md) | A trend widget that invented a 12 g/dL haemorrhage from a blank field |
| [v1073](spec-v1073.md) | The agent surface scored an unanswered questionnaire item as zero |
| [v1074](spec-v1074.md) | An `if (!any)` guard that hid a tile from the sweep keyed on the empty call |
| [v1075](spec-v1075.md) | The gate excused a tile because its static note contained the word "missing" |
| [v1076](spec-v1076.md) | Three ICHD-3 headache tiles ruled a diagnosis out on counts nobody entered |
| [v1077](spec-v1077.md) | A CDAI diary item nobody filled in read as a symptom-free week |
| [v1078](spec-v1078.md) | Both stroke scales said "no stroke symptoms" for a patient nobody examined |
| [v1079](spec-v1079.md) | **Survey**: every slider in the catalog, and what it says untouched |
| [v1080](spec-v1080.md) | The Braden runs the other way, so both readings of a partial were unsupportable |
| [v1081](spec-v1081.md) | Katz and Lawton counted independence nobody had assessed, and threw instead of refusing |
| [v1082](spec-v1082.md) | A discharge decision, a newborn, and a scale whose default sits in the middle |
| [v1083](spec-v1083.md) | Two instruments on one tile: answer with the halves you have |
| [v1084](spec-v1084.md) | A staged swallow screen: stopped on purpose is not the same as interrupted |
| [v1085](spec-v1085.md) | The GCS pair: an example defect, and one control decision across three tiles |
| [v1086](spec-v1086.md) | Reading the labels: a stripped key, two "fixes" that never landed, and the last two sliders |
| [v1087](spec-v1087.md) | The fix's clothes: a number input pre-filled with 0 is a form already answered |
| [v1088](spec-v1088.md) | The footing belonged to the library, and the backlog as shapes rather than a number |
| [v1089](spec-v1089.md) | Which zero? A documented convention the tile applied and did not name |
| [v1090](spec-v1090.md) | The stage the valve area decides, and a guard whose scope is clinical |
| [v1091](spec-v1091.md) | A grade is only as complete as the study behind it: the two sibling valve tiles |
| [v1092](spec-v1092.md) | A finder that is not bounded by the worked example, and the first thing it found |
| [v1093](spec-v1093.md) | The rest of the body-surface family, and the sentence written once |
| [v1094](spec-v1094.md) | A tally that can only rise, and a rule the house wrote twice |
| [v1095](spec-v1095.md) | An unmeasured input read as its most benign value, across five tiles |
| [v1096](spec-v1096.md) | Three gradings where the missing parameter was the deciding one |
| [v1097](spec-v1097.md) | The same rule, phrased three ways: which belong to the list and which to the tile |
| [v1098](spec-v1098.md) | The last two, and why the finder's remaining rows are correct |
| [v1099](spec-v1099.md) | The finder could not see two fifths of the catalog |
| [v1100](spec-v1100.md) | The other half of the same divisor, and the weakest section read |
| [v1101](spec-v1101.md) | A finder for "one tile, two gaps, one guarded" |
| [v1102](spec-v1102.md) | The finder was only looking at numbers |
| [v1103](spec-v1103.md) | The guard that only one surface had |
| [v1104](spec-v1104.md) | A diagnosis of exclusion, without the exclusions |
| [v1105](spec-v1105.md) | The guard was in the adapter, so the page never got it |
| [v1106](spec-v1106.md) | **Gate**: the one that was already there, asking a third of the question |
| [v1107](spec-v1107.md) | The reference level is not "not stated" |
| [v1108](spec-v1108.md) | The same filter, a fourth and fifth time |
| [v1109](spec-v1109.md) | The miss-value was the best finding there is |
| [v1110](spec-v1110.md) | Three scales that opened on an examination nobody performed |
| [v1111](spec-v1111.md) | Four more, and a correction |
| [v1112](spec-v1112.md) | The last two, and a prediction that was half wrong |
| [v1113](spec-v1113.md) | The denominator was computed and never shown |
| [v1114](spec-v1114.md) | Reading my own eleven waves back through the finder |
| [v1115](spec-v1115.md) | The seven that turned an alarm into a reassurance |
| [v1116](spec-v1116.md) | A default parameter that chose the equation |
| [v1117](spec-v1117.md) | A mortality figure read off a row nobody had earned |
| [v1118](spec-v1118.md) | **Finder**: a scoring select neither surface can leave unanswered |
| [v1119](spec-v1119.md) | The first three off the new probe's list |
| [v1120](spec-v1120.md) | Two columns nobody looked at, stated as two normal findings |
| [v1121](spec-v1121.md) | The check rule 23 recommended, and what it found |
| [v1122](spec-v1122.md) | Six organ systems, and one point that mattered in one place |
| [v1123](spec-v1123.md) | Two grades, on the criterion that takes reading vision |
| [v1124](spec-v1124.md) | The third author to notice a default and reason past it |
| [v1125](spec-v1125.md) | The open question from four days ago, answered |
| [v1126](spec-v1126.md) | A sequence that exists only to upgrade |
| [v1127](spec-v1127.md) | Checking monotonicity instead of assuming it |
| [v1128](spec-v1128.md) | The three spec-v1127 deferred |
| [v1129](spec-v1129.md) | A subtype letter that decides whether the airway is involved |
| [v1130](spec-v1130.md) | The probe was matching its subjects' own footnotes |
| [v1131](spec-v1131.md) | Two fallbacks that chose the best case |
| [v1132](spec-v1132.md) | The finder that could not see the defect it was written from |
| [v1133](spec-v1133.md) | A unit is a default too |
| [v1134](spec-v1134.md) | The troponin-free band, from a date of birth |
| [v1135](spec-v1135.md) | "All items at 0" was printed for a form nobody had filled in |
| [v1136](spec-v1136.md) | The fifth check narrowed to `kind === 'number'` |
| [v1137](spec-v1137.md) | The note said the choice was not inferred |
| [v1138](spec-v1138.md) | The shortest interval in an aspiration-risk table |
| [v1139](spec-v1139.md) | The same narrowing, one level down, inside a tile |
| [v1140](spec-v1140.md) | A risk category for a nodule nobody had described |
| [v1141](spec-v1141.md) | Twelve points against bands five points wide |

### And the same question from the other side

A tile can refuse a blank field correctly and still *display* a rule-out, because its worked example
says nothing. Forty-seven shipped an example of every field at zero, so the tile opened on its most
reassuring band — "Rule out SAH", "CT not recommended", "no pain", "low bleed risk" — before anyone
had described a patient.

| Spec | What it fixed |
| --- | --- |
| [v1031](spec-v1031.md) | The nine highest-stakes rule-outs |
| [v1033](spec-v1033.md) | Nine bedside pain, delirium and withdrawal scales |
| [v1034](spec-v1034.md) | Ten bleeding, clotting and severity scores |
| [v1035](spec-v1035.md) | The last sixteen, and the three left all-zero on purpose |
| [v1080](spec-v1080.md) | The mirror the all-zero sweep could not see: two examples at every field's MAXIMUM |
| [v1081](spec-v1081.md) | Three more, including one only visible after an undeclared picklist was declared |

## The promise on the front page, clause by clause

The README's "Or not" row is the reader-facing statement of everything on this
page. It was written in spec-v1060 — **before the waves below made all of it
true** — which is the same trap the public-promise audit found elsewhere: a
published guarantee with nothing checking it. Each clause now maps to a gate.

| The README says | What holds it |
|---|---|
| "When a value it needs is missing, it says which one instead of answering." | `no-answer-from-nothing-sweep.spec.js` (every field cleared) and `one-blank-field.spec.js` (one field cleared, from the worked example) |
| "A score that only adds points will still flag risk on what you have entered" | the monotone-disclosure fixes, pinned per calculator (`lrinec`, `scorten`, `snappe-ii`, `glasgow-imrie`, `wat-1`) |
| "but it will not call a patient well on measurements nobody took" | spec-v1006's rule, enforced by both sweeps above |
| "and it will not raise an alarm from an empty form either" | **the newest**: `oakland` printed "falling 12 g/dL ... suggests ongoing blood loss" from a blank haemoglobin until [spec-v1072](spec-v1072.md) |
| "When it does answer on a partly filled form, it says how much of the form it used." | the disclosure vocabulary in `test/lib/asking-language.js`, and `derivation-agrees.spec.js` for the panel that used to contradict it |

The fourth row is the one worth remembering. The sentence was published, and the
calculator doing the opposite of it was three clicks away.

## After a control change, re-run the probe

A green `release:check` and a green chromium suite do **not** prove a control
changed. Both passed for four waves while `apgar` and `white-song` still rendered
sliders and their new refusals sat unreachable ([spec-v1086](spec-v1086.md)) --
because every sweep here works by *clearing a field*, and a slider cannot be
cleared. The tile that still has the defect is invisible to the tests for it.

So the last step of any wave that changes a control is the probe, not the suite:

```bash
RUN_PROBES=1 npx playwright test test/integration/slider-default-probe.spec.js --project=chromium
RUN_PROBES=1 npx playwright test test/integration/scoring-select-probe.spec.js --project=chromium
```

About a minute each, and they answer the only question the suites cannot: does
this tile still render a control with no empty state?

**And run them after a wave that changes only what a tile ANSWERS, too**
(spec-v1118). `nichd-fhr` was fixed in spec-v1102 with every test passing, and
the page went on giving the reading that wave existed to prevent, because its
four picklists opened on the normal value and the guard never saw a blank. The
rule above was written for control changes; the failure it missed was a library
change whose guard depended on a control nobody had looked at.

## What holds it now

| Gate | Asks | Cost |
| --- | --- | --- |
| `no-answer-from-nothing-sweep.spec.js` | does any calculator answer a cleared form? | 15 s |
| `clock-dependent.spec.js` | does any calculator answer differently a year later, from the same inputs? | 1.3 min |
| `no-answer-from-nothing.spec.js` | do the 40 fixed calculators still refuse, and still answer when filled? | 49 s |
| `declared-ranges.spec.js` | is an out-of-range value named, above the answer and tied to its field? | 12 s |
| `required-field-agreement.spec.js` | does the browser answer a question the agent surface refuses? | 28 s |
| `no-impossible-number.spec.js` | does any tile state NaN, Infinity or an unexplained exponent? | 1.6 min |
| `one-blank-field.spec.js` | with a calculator filled from its example, does clearing ONE measurement change the answer without asking for it or disclosing it? | 1.6 min |
| `derivation-agrees.spec.js` | when a calculator refuses, does the "show your work" panel below still display the calculation? | 13 s |
| `rated-items-are-required.test.js` | does an instrument built only of rated items answer a call carrying none of them, and does omitting one picklist item silently move an answer? Since spec-v1108 it asks the same of the 263 instruments whose items are declared `enum` rather than `number`. | 7 s |
| `field-values-match-dom.spec.js` | is every answer the schema offers an agent an option a reader can choose, and the reverse? | 1.8 min |

Each has a ledger for the tiles that legitimately do the thing it looks for, and each was verified
by reintroducing the defect and watching it fail.

Two **finders** sit beside them. They assert nothing and are not run in CI, so they cost nothing
until someone asks:

| Finder | Asks |
| --- | --- |
| `scripts/probe-omitted-item.mjs` | fill a calculator from its worked example, drop one number **or graded select**: does the agent's answer move without saying so? Prints its own reach. |
| `scripts/probe-omitted-field-decides.mjs` | drop one number, then try plausible values *in* it: could any of them have changed the verdict? Prints its own reach. |
| `scripts/probe-half-guarded.mjs` | does this tile refuse or disclose for one missing input and stay silent on another that moves the answer? |
| `scoring-select-probe.spec.js` | which scoring selects have no empty option AND are not `required`, so neither the reader nor an agent can leave them unanswered — and which of those change the answer? |
| `scripts/probe-default-in-answer.mjs` | does a function print a **defaulted parameter's value** into its own answer, so the reading names something nobody entered? A row is a suspect: a default is fine where the control says what it means. |
| `scripts/probe-missing-list-reach.mjs` | does a tile's own "what is missing" list cover its own inputs, or only the ones the author was fixing? Prints the fields it never names that change the verdict when dropped. |

The second exists because the first is bounded by the worked example, which is written alarming —
so a dropped field usually leaves an alarming reading standing, and the defect lives on the
reassuring side of the threshold where the example never goes (spec-v1092).

## What is still open

- ~~**A form with one value in it** has no gate.~~ **Closed by spec-v1037**: the oracle turned out to
  be already in the repo. `mcp/fields.js` marks inputs `required`, so the sweep clears exactly one of
  those and leaves the worked example everywhere else — no "does this read reassuringly?" heuristic
  needed.
- **The ledger exempts a tile, and the judgment behind it was per field.** spec-v1029 found five
  scores whose checkbox exemption was covering a measurement too; eleven more ledger entries read a
  number and were judged legitimate one at a time. A tile-level exemption cannot express "these
  seven fields are criteria and that one is a measurement", and nothing checks that it was ever
  asked field by field.
- ~~**Two ledgers make different claims.**~~ **Drained**: seventy-five calculators answered without a
  field the agent surface calls required (spec-v1037); sixty-one are fixed across spec-v1037 to
  spec-v1047, and the fifteen still carried in `required-field-ledger.js` are all category 3 — a tile
  answering about what was actually entered, and saying so.
- ~~**`example-correctness` matches numbers loosely.**~~ **Closed by spec-v1048**: each documented
  number must now have a number of its *own* in the output. It found a tile whose documented "2%
  mortality" was being satisfied by the "2" of its own score, while the tile printed "<1%".

What is left is narrower than when this page was written:

- ~~**A ledger exempts a TILE, and the judgment behind it is per FIELD.**~~ **Closed by spec-v1067.**
  Its gate fills each calculator from its own example and clears ONE field, so the question is asked
  per field by construction, and its ledger is keyed `tileId|fieldId` — exempting one field leaves
  every other field on that calculator guarded. Twenty-eight were fixed by hand over the four waves
  that preceded it; the gate now holds the rest.
- ~~**Only one direction of the two-surface question was ever asked.**~~ **Closed by
  [spec-v1073](spec-v1073.md)**: spec-v1037 asked whether the browser answers what the agent surface
  refuses, and drained it. The mirror — whether the agent surface answers what the browser refuses —
  had never been run, and seventeen rating instruments were scoring an unanswered item as zero. An
  empty `phq9` call returned "Minimal depression".

- **A guard on one field silences the all-fields sweeps for every other field on that tile.** The
  two that an earlier wave half-fixed kept a live defect for weeks afterwards: `carb-insulin-bolus`
  dosed insulin from a blank target glucose, and `bhutani-bilirubin` read a blank bilirubin as low
  risk. Guard every measurement a tile reads, not the one the sweep pointed at.
- **A vocabulary match over a tile's whole output is a match against its boilerplate** (spec-v1075).
  `four-ts-hit`'s static note says "where key information is missing the Society advises erring
  towards a higher score"; the bare word `missing` is in ASKING, so the gate excused a tile that
  was scoring an unanswered domain as zero. Reading only what the tile computed for THESE inputs
  surfaced 13 fields it had been passing.

- **A sweep keyed on the empty form inherits every `if (!any)` guard in the catalog** (spec-v1074).
  `snakebite-severity` refuses a call with nothing in it and, missing one of six systems, prints
  that system as "pulmonary 0". The half of the question that needs no judgment — fields the
  browser renders as a `<select>`, which always carries a value — is now gated per field.

- ~~**Thirteen tiles read as reassuring before anyone touches them**~~ **One**, and it is a design
  decision rather than a defect ([spec-v1130](spec-v1130.md)). Eight were fixed in spec-v1080 to
  spec-v1085; of the five the probe still printed, three were the probe matching `mild` inside each
  tile's own band table while the verdict said *moderate pain* or *severe pain* — spec-v1075's rule,
  in this list, in this probe. Matching the verdict rather than the whole reading leaves
  `hunt-hess-wfns`, on the wording of Hunt-Hess grade III. The original text follows.

  (spec-v1079, measured by
  `slider-default-probe.spec.js`). A slider cannot be blank, so the control answers for the reader:
  `braden` is fixed (spec-v1080),
  `katz-adl` and `lawton-iadl` in spec-v1081, `white-song`, `apgar` and `npass` in spec-v1082. `norton-push` and `vip-extravasation` in spec-v1083, which took spec-v1045's "answer with the
  halves you have" shape because each is two instruments on one tile;
  `guss` is fixed in spec-v1084, which needed the staged gating designed rather than assumed; the GCS pair turned out to differ from the adult `gcs` tile only in their worked EXAMPLES, fixed in
  spec-v1085; whether a GCS component should be able to say "not assessed" is one open decision
  across all three, with the argument each way written down.

- ~~**91 fields still change the AGENT's answer when omitted**~~ **Closed**, across
  [spec-v1090](spec-v1090.md) to [spec-v1099](spec-v1099.md),
  with two dozen calculators fixed. The count that mattered came from the finder built in
  [spec-v1092](spec-v1092.md): it went from **47 flagged fields across nineteen
  calculators to 2 across 2** — and both survivors are correct, documented in
  [spec-v1098](spec-v1098.md) so a later pass recognises them instead of re-investigating.

  Three things in [spec-v1088](spec-v1088.md)'s triage were **wrong**, and each was overturned by
  reading the tile rather than the probe's output: the two sibling valve-stage tiles
  ([spec-v1091](spec-v1091.md)), the six body-surface ones
  ([spec-v1092](spec-v1092.md), [spec-v1093](spec-v1093.md)),
  and `pbac-hmb` ([spec-v1094](spec-v1094.md)). **A finder that starts
  from a worked example can only ask the questions that example reaches**, because examples are
  written alarming and the defect lives on the reassuring side of the threshold.

  And the finder itself was blind to two fifths of the catalog until
  [spec-v1099](spec-v1099.md) — its first section keys on `abnormal`, which most of the catalog
  <!-- catalog-truth:historical -->
  never sets (984 of 1,682 tiles do; the rest do not).
  It now prints its own reach, and unflagged tiles get their own section rather than falling
  into a weaker one that reads as "less serious".

  [spec-v1103](spec-v1103.md) read the finder's **second** section, *no severity flag, and the
  verdict moved*: 13 fields across six of them. One defect — `toxic-alcohol` indicated
  fomepizole from a glucose and a BUN nobody entered, because its guard lived in the renderer and
  not in the library. The other twelve are correct and the reason for each is written down in that
  spec, so a later pass recognises them rather than re-investigating.

  ~~**What is genuinely left** is the finder's third bucket, *verdict could change*.~~ **Read** in
  [spec-v1104](spec-v1104.md): 30 of its 32 remaining rows are correct behaviour and each reason is
  written down there. The two that were not are `masld-criteria`, which gave *cryptogenic SLD* — the
  one category in the 2023 nomenclature defined by ABSENCE — without any of the five criteria having
  been assessed, and `phoenix-sepsis`, which ruled out paediatric sepsis from a single normal
  platelet count. The second is the larger defect this programme has found in eleven waves, and the
  bucket that found it was the one graded weakest. **A prioritiser ranks what to read first; it does
  not rank what is there.**

  With that the finder has no unexplained rows left in any of its three sections.

- ~~**Thirteen instruments built of graded selects answered a call carrying no inputs**~~
  **Closed**, across [spec-v1108](spec-v1108.md) to [spec-v1112](spec-v1112.md). They were
  invisible because `rated-items-are-required.test.js` selected its subjects with
  `kind === 'number'`, while 263 of them declare their graded items as `enum`. Ten of the thirteen were
  one defect — a lookup whose miss-value is the table's most favourable level. The other three
  needed the instrument read rather than the pattern applied, and one of those (`mdq`) was fixed
  wrongly the first time because the library gives no clue whether a field's control is a checkbox
  or a select that opens on an answer. `test/mcp/enum-rated-items-ledger.js` is empty and kept.

- ~~**95 fields still change the AGENT's answer when omitted, without saying so**~~
  (`scripts/probe-omitted-item.mjs`, spec-v1073; the count was read as 93 until spec-v1075 stopped
  the probe accepting a tile's static footnote as a disclosure, and 107 before spec-v1076 drained
  the ICHD-3 headache family and spec-v1077 the CDAI diary). The gate that wave shipped covers instruments
  built entirely of rated items; what is left is the mixed kind, where checklist criteria sit
  beside measurements and a blanket `required` would refuse calls that are legitimately partial.
  ~~`snakebite-severity` prints "pulmonary 0" for a system nobody examined.~~ Fixed in
  [spec-v1105](spec-v1105.md), along with its neighbour `cauchy-frostbite` and a bone-scan picklist
  that offered four of the five values its adapter declares.

- **146 coercion helpers cannot tell a blank from a zero** (`scripts/probe-blank-coercions.mjs`).
  Most are harmless; which ones are not depends on what their renderer sends, so the report is a
  reading aid rather than a gate (spec-v1040). **Sorting it by the fallback VALUE is what made it
  usable** ([spec-v1131](spec-v1131.md)): five of the rows fall back to something other than a plain
  zero, and two of those chose the instrument's most favourable level -- `wilkins-score` answered
  "favorable for balloon valvuloplasty" for a valve nobody had graded, and `rox` had the timepoint as
  a default parameter and printed it. The remaining 141 fall back to zero, which is spec-v1040's
  question.

## Probes measured and rejected

Three questions asked of the whole catalog after spec-v1048, each of which sounded like it should
find something and did not. Recorded so they are not re-run.

| Question | Result |
| --- | --- |
| Does any tile print a **percentage its own interpretation table contradicts**? | 23 suspects, **zero defects**. The rule cannot tell a computed value from a threshold — `navy-body-fat` states 11.1% body fat against a table of category cut-offs. What made `ranson-bisap` findable was that its answer quoted a band *label*, which `example-correctness` now catches. |
| Does any tile's documented `expected` assert the **opposite verdict** to what it renders — "low risk" against "high risk", "not indicated" against "indicated"? | **Zero clashes** across all 1,699 examples. |
| Does any tile's refusal message **name an input its guard does not require** (rule 23)? <!-- catalog-truth:historical --> | **Zero**, across every tile that refuses with a message (1,385 of them at the time). The five known instances were found and fixed as they arose. `scripts/probe-message-promises.mjs` is kept because the rule is about what an author writes next. Its first run said 28, and all 28 were the finder being wrong: booleans (an unticked box is a real "no"), disjunctive messages ("at least one", "and/or" — naming a field inside a choice is the opposite of requiring it), and scaffolding words like "input" that identify no field ([spec-v1121](spec-v1121.md)). |
| Does the **clipboard** carry a number the tile is not showing? | **Zero**. Every calculator that offers a copy button was checked — about eight in ten of them. |

The third is worth keeping in mind rather than repeating: what a tile puts on the clipboard is what
gets pasted into a chart, and it currently matches the screen everywhere it offers one.
