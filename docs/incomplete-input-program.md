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

27. **Optional one at a time, required as a SET** (spec-v1142). `allowed-amount` and
    `nsa-cost-share` each take three benefit terms — remaining deductible, coinsurance, copay —
    and each defaults to zero for a good reason: a copay-only plan has no coinsurance, a met
    deductible has nothing remaining. All three at zero is not a benefit design, it is an empty
    form, and what it printed was *"Patient owes $0.00"*. When several optional fields are
    alternatives for the same question, ask whether ANY of them was answered — a per-field
    `required` flag cannot express that, and a rule 25 reading-level guard is exactly what can.

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

29. **A shape test is not a validity test** (spec-v1170). `new Date(2026, 12, 45)`
    is 2027-02-14 and `Date.UTC(2026, 1, 30)` is 2026-03-02 — neither fails, both roll
    over. Four parsers here tested a date's SHAPE and handed the components to one of
    those constructors; one round-tripped the result and three did not, so an impossible
    date was answered from a different one. `rosendaal-ttr` read a mistyped `2026-02-30`
    as sixty days of record instead of twenty (TTR 80% → 88.3%) and DROPPED a line
    written `2026-1-11` altogether (TTR 80% → 65%, the good-control threshold), saying
    nothing either time. This is rule 5 in a string field: the impossible value is
    given, and the tile owes the reader its name. The calendar rule now lives once in
    `lib/num.js`.

28. **A check that examines only the fields carrying an optional property is silent
    about every field that does not** (spec-v1169). This is rule 17 one level up, at
    the gate's SUBJECT SELECTION rather than at its filter.
    `field-values-match-dom` compares a declared value list against the rendered
    options, so a field declaring no list was never a subject — and 23 of them were
    `<select>` elements published to an agent as `{"type":"string","maxLength":2048}`,
    with the option set living only in the label's prose. Six of those labels named
    values the tile rejects. **Ask the prior question too: not "do the two lists
    agree?" but "is there a list at all?"** And widening a subject list can break the
    machinery built around the old one — adding `rucam`'s number inputs put its
    cholestatic options back out of reach of the perturbation this gate exists for.

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
| `field-values-match-dom.spec.js` | is every answer the schema offers an agent an option a reader can choose, and the reverse — and since [spec-v1169](spec-v1169.md), does any field render as a `<select>` while publishing no value list at all? | 2.6 min |

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

## What `probe-omitted-field-decides` prints today, and why each row is left

Re-read at [spec-v1164](spec-v1164.md). Its first section is **12 rows**, and every
one has been read. Recorded so the next reader starts here rather than re-deriving
it:

| Row | Why it stands |
| --- | --- |
| `homa-ir`, `calcium-phosphate-product`, `vitamin-d-level` (units) | the reading names the unit it used, which is the [spec-v1133](spec-v1133.md) model: the assumption is visible where the verdict is |
| `rmi-ovarian` | names the variant in the answer — *"RMI 1 = U(3) x M(3) x CA-125(20)"* |
| `rosendaal-ttr` (target INR low, high) | the target range is a **prescription, not an observation** — and the reading names the range it used every time, *"16 of 20 days in range 2–3"*. Changing it asks a different question rather than filling a gap. New since spec-v1155 made the two bounds optional |
| `boston-caa`, `pertussis-case-def`, `hiv-pep-occupational`, `vod-sos` | each says what was **not marked / not recorded / not entered** rather than concluding from it |
| `sea-guideline` | already refuses or asks, in as many words |
| `loe-silness-gingival-index` | a **mean**, not a sum — rule 10, and there is no direction to disclose |

Four rows left the section between spec-v1141 and spec-v1164 without anyone touching
them: `kings-college` and the three ICHD-3 headache tiles. The catalog moved, which is
the point — *the rows change with it.* And `elapss` and `glim-malnutrition` left it
because spec-v1164 taught the vocabulary the phrase they disclose with.

### The second section, re-read at spec-v1164: 34 rows, all of them correct

[spec-v1103](spec-v1103.md) read it at 13 rows. It is 34 now, and every one is a
tile behaving correctly — recorded here so the next reader does not re-derive it:

| Rows | Why they stand |
| --- | --- |
| `oswestry-odi` (10) | every label says *"omit if not applicable"*, and the ODI is scored as a percentage **of the sections completed** |
| `truelove-witts` (4) | the four systemic criteria are alternatives (see [that wave](spec-v1151.md)), and the tile discloses what was not measured |
| `tls-cairo-bishop` (4) | the clinical criteria and the creatinine pair; the tile now reports an unmeasured one as *"not entered"* ([spec-v1163](spec-v1163.md)) |
| `pk-suite` (4) | it **drops** the derived quantities that need the missing input rather than computing them from zero — no Vd, no half-life or loading dose, and the maintenance dose still shown |
| `smart-cop` (3) | turn on a candidate value of 0, and a PaO2 of 0 is not a patient ([spec-v1099](spec-v1099.md)) |
| `iol-power` | names the assumption in the verdict: *"**Emmetropic** IOL power 20.05 D"* |
| `calvert-carboplatin` | a checkbox; an unticked box is a real "no" (rule 4) |
| `mayo-uc`, `palm-coein`, `spetzler-martin` | each is labelled optional or supplementary on the page |
| `mascc`, `duke-treadmill`, `kings-college`, `salicylate-toxicity` | the fixed tiles showing their new disclosures — *"between -6 and 2 … whatever the angina index turns out to be"*, *"MASCC at least 21"* — which is what a working probe looks like after a wave |

### The third section, first read since spec-v1104

[spec-v1104](spec-v1104.md) read it at 32 rows. It is **58** now across 39 tiles, and
it is the weakest of the four by construction — the band moves but `abnormal` does
not — which is exactly why spec-v1104 found `phoenix-sepsis` in it.

[spec-v1165](spec-v1165.md) took the first pass. One defect: the Kaiser
`eos-calculator` has **three** maternal GBS levels and the code read them as two —
`gbsPos` and `gbsUnk` both zero is the NEGATIVE coefficient, so a status nobody had
reported was scored as a **negative culture**, the most favourable of the three, when
the model carries its own Unknown level for exactly that state. The browser had it
from the other side, opening the select on *"Negative"*. Both fixed; *"Unknown / not
reported"* leads now.

Its antibiotics field got the other treatment, and the difference is the point:
**where the source provides a category for "not known", use it; where it does not,
say what the reference level is.** `abx` has no unknown level — its reference level
IS "none" — so an absent value is named rather than re-mapped.

The other 55 rows read as correct: `elapss` and `phases` showing their new ranges,
`hear` and `niss` disclosing *"at least"*, `iol-power` naming *"Emmetropic"*,
`adrenal-ct-washout` naming which washout formula it used, and the two respiratory
compensation tiles saying the measured value *"reads the same either way"*.
[spec-v1166](spec-v1166.md) read `findrisc`, the last one owed. Its waist bands are
sex-specific — 94/102 cm for men, 80/88 for women — and `o.sex === 'male' ? 'male' :
'female'` made an unstated sex a female one, so a 90 cm waist scored 0 points as a man
and 4 as a woman: FINDRISC 9 (*"slightly elevated, ≈ 4%"*) against 13 (*"moderate, ≈
17%"*). A silent default of a known fact, in the alarming direction, and the same
shape [spec-v1116](spec-v1116.md) fixed on `lvh-criteria`'s Cornell threshold. It
gives the range now, and where both bands score the same the reading is decided
whatever the sex turns out to be (rule 25).

**And that wave walked into both of this session's own rendering lessons.** The band
said *"FINDRISC 9 to 13 of 26"* while the rows beneath said *"FINDRISC: 9"* — the
floor as the total, which is [spec-v1159](spec-v1159.md) — and *"10-year risk: null"*,
the literal token, which is rule 26 and [spec-v1158](spec-v1158.md). Both found
earlier the same day. They share one cause: **a library that learns to withhold a
field breaks every renderer that interpolates it, and the renderer is a different file
from the one being fixed.** Reading the page rather than the return value is what
catches it.

**A probe whose every row has been read is not a probe with nothing left to
say** — the catalog moves, and the rows change with it. It is a probe whose
current output is spent.

<!-- catalog-truth:historical -->
## The 155 tiles where the number IS the verdict

[spec-v1142](spec-v1142.md). `probe-omitted-field-decides` grades a dropped field
by a boolean `abnormal` flipping or a band string moving. The probe prints its own
<!-- catalog-truth:historical -->
reach; at this wave **984 tiles set the flag, 543 more carry a band, and 155 carry neither** — the converters, the dosing
tools and the whole billing family — so none of its three sections could ever
print a row about one of them.

A fourth section asks the same question of them: drop one field, and does a
finite output move without the tile saying so? It skips `kind === 'bool'` by rule
4, stated in the probe rather than inherited from the number/enum filter written
for the other sections. **44 fields across 20 calculators; three were defects,
all in the patient-bill family:**

| Tile | It said |
| --- | --- |
| `allowed-amount` | *Patient owes **$0.00***, payer pays the whole allowed — from a form with no deductible, no coinsurance and no copay |
| `nsa-cost-share` | *Patient owes **$0.00***, plan pays the whole QPA — the same three blanks |
| `cob-calc` | *Secondary pays **$0.00**; patient owes $120.00* — under three methods **defined by** the would-pay nobody entered |

The shape is rule 1 in money: **each of the three cost-share terms is legitimately
zero on its own, and all three at once is not a benefit design but an empty
form.** The terms stay optional and the SET is now required; a typed 0% still
answers zero. The numbers that do not depend on the benefit terms — the
contractual write-off, the NSA prohibited balance bill — are still reported.

Six of the browser's fields were rendered with a `value` of `0` rather than a
placeholder, which is rule 8 in a number input: the reassuring answer was
pre-typed into the form.

[spec-v1143](spec-v1143.md) read the rest of that first run. Two more defaults
were the **top of their table**: `anesthesia-units` defaulted the medical-direction
modifier to `aa` — personally performed, 100%, twice what a medically-directed
case pays — while its own notice already listed the modifier among what to enter
(rule 23, fourth time); and `split-shared` defaulted both times to 0 and required
only the TOTAL to be positive, so one blank had it asserting that the other
provider performed all of the visit (rule 11). The browser guard there was
`rawEmpty(phys) && rawEmpty(npp)`, which goes quiet as soon as one is filled.

Two more were **silent rather than wrong** and are named in the reading now
(rule 21): `drg-payment`'s capital standardized amount, and
`sequestration-adjust`'s beneficiary cost-share.

And verifying that disclosure found a defect nothing in this programme was
looking for: `derivation()` guarded a null VALUE and not a null ROW, so the four
call sites that write `cond ? [label, value] : null` threw *"null is not
iterable"* — and `safe()` printed the engine's own message where the table
belongs. On `drg-payment` that is **every case that is not a transfer**, the
ordinary one, and its derivation table had therefore never rendered.

Six rows of the fourth section remain and each is read in that spec.

That last fix came out of verification rather than a finder, and
[spec-v1144](spec-v1144.md) is the finder's half of it: `js-error-probe` clears
every input before it looks, so it can only find the defects that need a cleared
form, and `drg-payment`'s was in the reading its own example shows. A second pass
now asks the same question of **the tile as it opens** — negative-tested against
the reverted fix, then run across all 1,706 tiles: zero.

**A probe is a question plus a starting state, and the starting state is half the
reach.** Twice in three waves the question was right and the starting place was
the whole of the blind spot.

[spec-v1144](spec-v1144.md) turned the lesson on the OTHER probe.
`js-error-probe.spec.js` asks whether any tile prints a JavaScript runtime error
where its answer belongs — and it has always cleared the form first, so it could
never have found the `derivation()` crash above, which is in the reading
`drg-payment` OPENS on. A second pass now runs the same question against the tile
exactly as a reader first meets it. Negative-tested against the reverted fix, and
then run across all 1,706 tiles: **zero**.

**A probe is a question plus a starting state, and the starting state is half the
reach.** Twice in three waves now:

| Probe | Started from | Could not see |
| --- | --- | --- |
| `probe-omitted-field-decides` ([spec-v1142](spec-v1142.md)) | a boolean flag or a band string | every tile that carries neither |
| `js-error-probe` | the cleared form | every defect in the reading a tile opens on |

[spec-v1145](spec-v1145.md) added the third starting state — **one field blank**,
the half-filled form between the other two — and then measured what each can
reach. With the `derivation()` fix reverted, the untouched form finds both
offenders, the one-blank form finds one of them (on two fields), and the cleared
form finds neither: **no pass subsumes another.** The third prints its own reach
<!-- catalog-truth:historical -->
with its result — 2,613 (tile, field) pairs cleared, and 845 tiles with no filled
text or number input for it to drop at all.

## The gate that tested one field per tile

[spec-v1146](spec-v1146.md). `required-field-agreement.spec.js` is the best-oracled
gate in this repo — `mcp/fields.js` already says which inputs are required, so
there is no heuristic about which fields matter. It clears the first required
field a tile renders as a text or number input, and then stops.

<!-- catalog-truth:historical -->
The catalog declares **4,226 required fields across 1,089 tiles, 900 of which
declare more than one.** At most a quarter of them have ever been cleared, and the
gate has been green throughout.

What the rest hid was not exotic. In three tiles the FIRST required field had a
lower bound that rejects zero and the SECOND did not, so the sweep tested the
guarded half every time:

| Tile | It said |
| --- | --- |
| `aa-pf-suite` | *"P/F ratio: **0** - Severe ARDS (Berlin)"* — **the example in spec-v1037's own header**, still live on the second of its two required fields |
| `burn-fluid` | *"Parkland total 24h: **0 mL**"* — a resuscitation order for a burn nobody had sized |
| `big` | *"BIG **0.0**: below the high-mortality threshold"* — [spec-v1041](spec-v1041.md) guarded the base deficit and left the INR and the GCS |

`big` is the one to remember: **a half-fix survives when the sweep tests the half
that was fixed.** Its library already had an `isBlank` check on the INR and GCS,
and the renderer's `num()` had turned the blank into a zero before the library
could see it — rule 7, three hundred waves after rule 7 was written down.

The widened question has a backlog of 59 more rows, so it ships as a probe
(`required-field-every-probe.spec.js`, retired at
[spec-v1156](spec-v1156.md)) rather than a widened gate: mass-ledgering
59 rows to keep a gate green is the opposite of what a gate is for. Both use one
copy of the rule. Its reach prints with its result — 2,075 of the 4,226 declared
fields actually cleared, the rest being selects, checkboxes and sliders, where
clearing sets a different value rather than removing one.

[spec-v1147](spec-v1147.md) took the first batch out of that backlog — the rows
where a tile prints a number that is not a measurement. `prevent` is the one to
remember: **five different ten-year cardiovascular risks for the same patient,
decided by which lab had not come back.** Its library guards
`[age, totalChol, hdl, sbp, bmi, egfr].every(Number.isFinite)` and its renderer
read them with `nv()`, so a blank arrived as 0 and the guard has never fired. A
total cholesterol nobody drew moved the reading from 4.0% to **2.8% — Low
(<5%)**, which is a statin conversation that does not happen. `tpn-macro` and
`peds-fluid-deficit` were the same shape in grams and millilitres.

Two things this wave got wrong first and corrected:

- **A library-level reproduction is not a reading.** `ascvdPce` returns `NaN` from
  a zeroed cholesterol and the renderer calls `.toFixed(1)` on it, so I wrote that
  the tile showed *"NaN% — High (>=20%)"*. On the page it does not: the spec-v53
  output-safety layer catches it, and the reader gets a range complaint instead of
  the library's own "Enter …" sentence. Still worth fixing, but a badly-shaped
  message rather than a fabricated risk — and that is the whole distance between
  it and `prevent`.
- **A pattern that moves nothing is a claim the next reader has to re-check.** On
  the strength of that misreading the shared "did it answer?" test nearly grew a
  `NaN|Infinity` alternative. Measured before adding, as the rule requires: zero
  rows move, because no tile can render one. Not added.

Backlog 59 → 50.

[spec-v1148](spec-v1148.md) took the second batch. `crrt-dose` judged a dialysis
prescription nobody had written (*"0 mL/kg/h — Below the KDIGO target"*),
`pca-pump` printed *"Maximum demand delivery: 0 mg/h"* for an opioid PCA whose
bolus had not been typed, and `qbl-pph` ran the OTHER way — a blank dry-pad tare
counted the pad and the irrigation as blood, overstating the loss by 100 mL.
Rule 6 again: an alarm from nothing is not the safe direction either.

And the first row in this programme where **the declaration was the wrong half**.
`insulin-correction` was flagged on its carbohydrate fields, and the tile's own
label reads *"Carbs to be eaten (g; leave blank for correction only)"* — a
correction-only dose is the ordinary inpatient case, so the browser was right and
the agent surface had been refusing calls it could answer. The gate's message has
always offered both readings; this is the first time the second one won.

Backlog 50 → 45.

[spec-v1149](spec-v1149.md) took the third batch — the rows where the pattern does
not tell you the answer.

- `saps-ii` scored a ventilated patient's missing blood gas as **0 points**, and
  `pfPts` is `v < 100 ? 11 : v < 200 ? 9 : 6` — **it cannot return 0.** "Not
  measured" was scored at a level the instrument does not contain, and the total
  came out 55 instead of 64, with predicted hospital mortality 57.5% instead of
  75.3%.
- `lvh-criteria` ruled OUT from one precordial lead. Sokolow-Lyon is SV1 + the
  LARGER of RV5 and RV6, so one lead gives a floor — and **an existing unit test
  asserted the defect**, checking `sokolowMet === false` on a sum formed without
  RV6.
- `vanc-auc` read a blank draw time as "at the end of the infusion" and moved the
  whole AUC with it: a vancomycin dose built on a timestamp nobody took.

And the sweeps themselves were reading **half the vocabulary**. Both filtered on
`ASKING` alone, so `saps-ii`'s new footing — *"the PaO2/FiO2 is not entered"* —
still counted as an offender. asking-language.js's own rule says which side they
are on: *"only the one-blank-field gate, which starts from a complete example,
accepts a disclosure as sufficient"*, and both of these start from a complete
example and clear ONE field. Measured before changing: accepting `DISCLOSING` moves
exactly two rows, both that pair. One copy of the filter now, in
`test/lib/required-fields.js`.

Backlog 45 → 40, and the "number that is not a measurement" group is drained.

[spec-v1150](spec-v1150.md) took the *declared required, documented optional*
group. Four of the five were exactly that — `osmolal-gap`'s ethanol,
`winters`' measured PaCO2, and the albumin on `anion-gap` and `anion-gap-dd`,
each labelled *optional* on the page and each an ADDITION to a formula that stands
without it. The agent surface had been refusing all four; `winters` would not give
the expected PaCO2 range unless you already had the measured one.

The fifth was not a declaration. `corrected-anion-gap`'s bicarbonate is a TERM of
the gap (AG = Na − (Cl + HCO3)), so a blank one **inflated** the reading rather
than softening it: 34 mEq/L where the entered value gives 10, both landing on
*"Elevated (>12): consider HAGMA workup"* so the band hid it.

Backlog 40 → 35.

[spec-v1151](spec-v1151.md) took the *criteria that are present or absent* group,
which looked like a vocabulary problem and was not.

`niss` was flagged and `niss` is right: it reads *"NISS: **at least 75**"* from two
of three AIS severities. `DISCLOSING` knows *"can only add"* and *"can only raise"*
and not **`at least`** — which is the phrasing three tiles fixed in this same
session use. That is the duplicated-rule drift shape exactly, so it was measured
before anything was added. A bare `at least` appears **553 times across 176 library
files**, mostly criterion text. The narrow form — the score stated as a floor —
moves **3 rows catalog-wide, and all three are wrong**: two are `migraine-ichd3`
printing *"for 1.1: at least 2 of the 4 headache characteristics"*. **Not added.**
`at least` is how this house writes a floor and also how the sources write a
threshold, and no pattern separates them. `niss` was then going to be ledgered with
that reason — until the declaration fix below made the ledger line dead, because the
probe no longer clears those fields at all. Removed again: **a tile exempted for
nothing is a tile the gate is not protecting.**

Four more declarations were the wrong half: `truelove-witts`'s four systemic
criteria (severe colitis needs ≥ 6 bloody stools plus **at least one** of them, so
they are alternatives — and it refused agent calls that already rule severe colitis
IN), `niss`'s second and third AIS, `nutric`'s IL-6, and `vent-sbt-peep`'s
PEEP-table lookup FiO2.

And relaxing one of them uncovered a rule-out. `nutricMissing` leaves IL-6 out on
purpose, so nothing waited on it — and the IL-6 term adds a point at ≥ 400 pg/mL,
so *"NUTRIC 5 of 10: low nutritional risk"* was **one point short of the cutoff**,
with an IL-6 of 500 making it 6 and high risk. The mNUTRIC cut-off is ≥ 5 in any
case, so the same patient is already high risk on the form that omits IL-6 by
design. **Relaxing a declaration means reading what the tile does without the
field; it is not a paperwork change.**

Backlog 35 → 27.

[spec-v1152](spec-v1152.md) took the *suites of independent readings* group. One
defect: `abg` bounds the pH at 6 to 8 (so a blank one already threw) and the PaCO2
and HCO3 at zero, so a blank bicarbonate gave *"Primary disorder: Metabolic
acidosis. **Winter formula: expected PaCO2 6 to 10 mmHg**"* — Winter's rule applied
to a bicarbonate of nothing. The first required field guarded and the others not,
for the seventh time.

Four were genuinely two calculators sharing a page, and each page said so in its own
label: `infusion-time-remaining` (*"**Or:** make this volume last (hours)"*),
`o2-cylinder-duration` (*"**Or:** target transport time"*), `digoxin` and
`heparin-nomogram`. **The last two had `required: true` beside a label that reads
"(optional)"**, and `o2-cylinder-duration`'s residual pressure said *"default
200"* — a field that cannot be required by definition.

That contradiction is mechanical, so it looked like a cheap gate. Measured: **three
hits, one true.** `heaven-criteria` has the word inside a clinical description and
`mbi-validate`'s *"hyphens optional"* describes the format. **Not built** — 33%
precision, and it found nothing the probe had not. It is a thing to read for by hand
when touching an adapter.

Backlog 27 → 18.

[spec-v1153](spec-v1153.md) took `ecmo-titration`'s five rows. It titrates two
things independently — the sweep from the PaCO2 pair, the pump flow from the DO2i
pair — and correctly skips each half when its inputs are absent. **What was wrong is
that the headline then printed the un-titrated value as the recommendation:** *"Sweep
5 L/min / Flow 4 L/min"*, where the 4 is the number the reader typed into "Current
pump flow" a moment earlier.

**A recommendation that is the reader's own input, presented as a recommendation, is
the worst form of silent default** (rule 21) — nothing on screen separates it from a
computed one, and the output here is a setting on a running ECMO circuit. Each half
says what it did not do now, in those words: *"4 L/min is the setting you gave, not a
suggestion."*

And a blank sweep passed as 0, because the library rejects a flow at or below zero
and a sweep only BELOW zero — giving *"Sweep 0 L/min"*, which on a running circuit is
no gas at all. A typed 0 is a real trial-off state and still answers.

Backlog 18 → 13.

[spec-v1154](spec-v1154.md) took four singles. `gap` and `mgap` are trauma scores
where **higher is better**, and both bound the systolic BP at `s < 0` — so a blank
read as 0 and scored the HYPOTENSIVE band. Because the scale runs the other way from
most, that did not soften the reading, it **invented an alarm**: GAP 24 → 18 and
*"low risk"* → *"moderate risk"*, on a blood pressure nobody had taken. Rule 6 from
the other side.

Both now name the worst case as one, and both apply rule 25 — when every value the
missing field could take lands in the same band, the reading stands rather than
hedging, which is what `mgap` does on its own worked example.

`tsat` and `rox` were already right and wrongly declared. `rox` is the sharper:
[spec-v1131](spec-v1131.md) taught it to ask for the timepoint **only in the range
where the timepoint decides**, and declaring the hour required refused even the calls
the hour cannot change — the opposite of what that wave built.

Backlog 13 → 9.

[spec-v1155](spec-v1155.md) drained the last nine, and the first is rule 7 in its
purest form. `capraScore` carries exactly the guard this programme asks for —
`cores === null` → refuse — and its `nonNeg` helper was
`Number.isFinite(n) && n >= 0 ? n : null`. **`Number(null)` is 0**, which is finite
and ≥ 0, so the guard could never fire and a blank positive-core percentage scored
the FAVOURABLE level. The proof is next door: **the identical helper in
`lib/ob-v138.js` was fixed at [spec-v930](spec-v930.md) with the exact guard this
copy lacked.** One rule written twice, and only one copy learned.

`acetaminophen-nomogram` bounds the hours at 4 (so a blank time already threw) and
the level at 0 (so a blank level passed): *"Below the treatment line: **NAC not
indicated**"* from a paracetamol level nobody had drawn. **The first required field
guarded and the second not, for the ninth time — and the ninth decides an
antidote.**

`anticoag-reversal` is rule 23 once more: the message said *"Enter weight (and INR
for warfarin)"* and checked only the weight. The INR is read only on the warfarin
path, so it is required there and not read elsewhere, enforced in the LIBRARY so
both surfaces agree in both directions. Its adapter also carried
`to: (v) => v || 0`, a coercion that turned the blank into a zero before the library
saw it.

And the last two rows were the vocabulary, not a tile. `posas-patient-scar` refuses
in as many words — *"Rate pliability (stiffness) from 1 to 10"* — and the rating
pattern's character class had **no parentheses**, so an item that names itself and
then explains itself in a bracket did not match. A generalisation of the pattern
already there, measured first: two rows move, both that tile, and nothing changes in
either empty-form sweep or the one-blank-field gate.

<!-- catalog-truth:historical -->
**Backlog 9 → 0.** Of the 62 rows: **35 were tiles that should have asked** and 27
were **declarations that should not have required** — nine of them on fields whose
own label already said *optional*, *default* or *leave blank*. Both halves were
fixes, and the gate's message said so from the beginning. The gate still tests one
field per tile and the probe tests all of them; widening the gate is now possible
without ledgering anything.

[spec-v1156](spec-v1156.md) did exactly that: **the gate asks the wide question
itself now**, clearing every required text or number field one at a time and putting
each back, and the probe that carried the question while the backlog drained is
deleted rather than left as a second copy of the same rule. Because it is a gate, it
**prints and asserts its own reach** — 2,041 of 4,192 declared fields cleared — so a
change that narrows what it can see fails there rather than going quiet, which is
the failure of [spec-v1099](spec-v1099.md) and [spec-v1106](spec-v1106.md) made
impossible in this one place. Negative-tested against spec-v1155's
`acetaminophen-nomogram` fix reverted: it fails and names the pair.

## The probe nobody had re-run

[spec-v1158](spec-v1158.md). `prefilled-default-probe.spec.js` had not been run since
this session started fixing pre-filled zeros. Four numeric inputs open with a value
their worked example did not supply; three are statutory settings and correct by the
probe's own rule. The fourth was `kdigo-aki`'s anuria duration, and reading it found
two defects — the pre-filled zero being the smaller one.

**Anuria for ≥ 12 h is KDIGO Stage 3 on its own**, and the anuria test sat INSIDE a
gate requiring the mL/kg/h figure and its duration. So fourteen hours of documented
anuria with a normal creatinine read *"Does not meet KDIGO AKI criteria."* That is
worse than a blank-field defect: **the reader entered the finding and the tile
discarded it.**

And with neither urine-output field given, the sub-stage was `0` — indistinguishable
from a normal output — and the tile ruled AKI out entirely. It is `null` now and the
reading says which half it saw. `anuriaHours = 0` was a default parameter, so "no
anuria" and "nobody asked" were one value (rule 21).

The first version of that fix then put the literal token **`null`** on screen, because
the view interpolated the withheld sub-stage straight into the reading — rule 26,
caught by looking at the page rather than the library.

<!-- catalog-truth:historical -->
The probe prints its reach now: **2,828 number inputs across 857 of 1,706 tiles.**
The rest are selects, checkboxes and sliders, which it cannot see.

[spec-v1159](spec-v1159.md) ran `scoring-select-probe.spec.js`, unrun since the last
session fixed `elapss`. Two of its nine rows are **`phases` — the score sitting
directly beside `elapss` in the same file, with the identical defect**: population and
site both falling back to their zero-point level, and a refusal message that already
listed them (rule 23, fifth time, second on this pair). Nine of twenty-two points, on
a scale whose 5-year rupture risk runs 0.4% to 17.8%. Fixed the way spec-v1141 fixed
its sibling.

And **the fix next door had stopped at the headline.** `elapss`'s band has said
*"ELAPSS 14 to 26 of 40"* since spec-v1141, while the rows underneath still said
*"ELAPSS: 14/40, Growth 3/5-yr ~11.7% / ~19.3%"* — the floor stated as the total,
contradicting the line directly above it. Rule 14 running the other way, and it
survived a wave written about that tile. One nuance: the SCORE spans whenever a
weighted item is unstated, but the RISK only when the ends fall in different bands,
so *"~42.7% to ~42.7%"* collapses.

[spec-v1160](spec-v1160.md) took the second row from that run, and it is a shape
worth naming: **a careful fallback the browser could not reach.**
`predicted-spirometry`'s library already falls back to GLI-2012's own other/mixed
coefficient set for an unrecognised group and says so in a note — a previous wave read
it and deliberately left it. But the select opened on *"Caucasian"*, a specific set
and not the documented fallback, so that path was unreachable. Predicted FEV1 for a
40-year-old 175 cm man is 4.08 L Caucasian, 3.80 L other/mixed and 3.48 L
African-American, and **percent-predicted is what stages COPD**.

A *"Not stated"* option was the whole fix. And the note that branch prints had been
written for an UNRECOGNISED group, not an unstated one — **a disclosure written for
one way of arriving at a branch does not automatically describe the other.**

[spec-v1161](spec-v1161.md) closed the third finding from that run.
`undeclared-picklist-probe` reports fields rendered as a `<select>` while declaring
no `values`, so an agent cannot learn which inputs mean anything and both value-list
gates walk past them. It printed **19 fields on one tile** — `cornell-csdd`, every
item of which offers *"a — Unable to evaluate"* beside 0, 1 and 2.

**`a` is the point, not an edge case.** The library scores it 0 and reports it as
unrated (*"2 of 19 items marked unable to evaluate (scored 0); 17 rated"*), which is
exactly what this programme asks for — and an agent had no way to know the option
existed, so every unassessable item would have arrived as a real 0. Declared now, and
the probe reports **0 across 0** for the first time.

**A value the registry does not declare is invisible twice over**: to the agent that
would use it, and to the checks that would notice it went missing.

[spec-v1162](spec-v1162.md) ran `one-blank-field-probe`, which reports every reading
that MOVES when one field is cleared. **Most of its 43 rows are tiles behaving
correctly** — *"Scored from 6 of 7 items"*, *"not assessed"*, *"albumin not entered"*
— which is worth recording, because a probe that reports movement is not one that
reports defects. Two were not:

- `egfr-suite` printed **"Cockcroft-Gault: 0.0 mL/min"** beside two normal eGFRs. The
  weight belongs only to that equation, and a creatinine clearance of zero is anuric
  renal failure, for a patient nobody had weighed.
- `iv-osmolarity` understated the estimate for each component left out, and the
  verdict is peripheral-versus-central: 600 mOsm/L became 540 with the sodium
  omitted, both reading *"peripheral administration is generally acceptable"*. It now
  names what it counted and marks the estimate *"(at least)"*.

[spec-v1163](spec-v1163.md) read both. `tls-cairo-bishop` had **one screen
contradicting itself**: the band said *"Not entered: potassium, phosphate"* and the
row beneath it said *"Potassium ≥ 6 (or +25%): **not met**"*. A "not met" for a lab
nobody ran is a fabricated observation (rule 11), and the contradiction is worse than
either statement alone — a reader who scans the rows rather than the band gets the
wrong one. The criteria are tri-state now, and *"3 of 4"* is *"3 of the 3 assessed
(of 4)"*.

`mtp-tracker` stands: a blank platelet count becoming *"0 units transfused"* looks
like the same shape, but the tile is a **running tally of products given**, not a
measurement of the patient. Zero given is the state every massive transfusion
protocol starts in. Rule 4 in a different costume.

[spec-v1167](spec-v1167.md) re-ran `probe-message-promises`, which the table below
records as having found **zero**. It printed **four**, and all four were the finder
being wrong again — this time about the rule rather than the matching.

Rule 23's concern is a message that lists what it needs and a tile that then answers
without them **silently**. `mehran-cin` answers *"Scored from 1 of 2 measurements and
2 of 6 clinical factors; the rest can only raise it (hypotension, the balloon pump,
age over 75, anemia not stated)"*, and `rome-ecopd` answers *"Graded with oxygen
saturation unmeasured; it can only raise it"* — both naming what they did not have
and which way it moves, both already ruling in. **That is the promise the programme
actually asks for**: rule 12 prefers a disclosure to a refusal, and rule 3 says an
incomplete score may rule in.

The probe only ever asked `got.valid === true`. It asks whether the partial reading
asks or discloses now, and carries the four in its reach line rather than dropping
them. Negative-tested: delete `rome-ecopd`'s disclosure and it prints that row again,
and only it.

## One kind, two spellings

[spec-v1168](spec-v1168.md), and the sharpest instance of this programme's own
recurring lesson. `mcp/fields.js` recognises the field kind `bool`; adapters also
write `boolean`; every branch in that file is a `=== 'bool'` test. So **698 checkbox
fields were published to agents as free-text strings** —
`{"type":"string","maxLength":2048}` where `chads`'s identical checkbox gets
`{"type":"boolean"}` — never validated as boolean-like, and coerced with
`String(raw)` instead of `toBool`. Scoring survived only because the libraries coerce
with their own `onFlag` allow-lists, which is defence rather than correctness.

[spec-v753](spec-v753.md) found it at **90 fields**, normalised the spelling in one
consumer, and wrote that the index "is not the place to fix it, but it IS the place to
stop it spreading". It did not stop it spreading: **90 → 698**, because normalising a
downstream copy does not reach the author of the next adapter. It is normalised at the
contract now, and an unknown kind is a registry error.

**Five downstream filters were half-blind on it — including one written in this
session.** [spec-v1142](spec-v1142.md) added the numeric arm with a
`kind !== 'boolean'` filter, negative-tested it, found it excluded nothing, switched it
to `'bool'`, and never asked whether BOTH existed. *The negative test proved the filter
now bit; it could not prove it bit everywhere.* `probe-missing-list-reach` shows the
cost: its four rows were one `bool` field and three `boolean` ones, so a
single-spelling skip would have caught one and missed three.

**A filter is only as good as the vocabulary of the thing it filters. Count the values
before trusting the test.**

## Probes measured and rejected

Three questions asked of the whole catalog after spec-v1048, each of which sounded like it should
find something and did not. Recorded so they are not re-run.

| Question | Result |
| --- | --- |
| Does any tile print a **percentage its own interpretation table contradicts**? | 23 suspects, **zero defects**. The rule cannot tell a computed value from a threshold — `navy-body-fat` states 11.1% body fat against a table of category cut-offs. What made `ranson-bisap` findable was that its answer quoted a band *label*, which `example-correctness` now catches. |
| Does any tile's documented `expected` assert the **opposite verdict** to what it renders — "low risk" against "high risk", "not indicated" against "indicated"? | **Zero clashes** across all 1,699 examples. |
| Does any tile's refusal message **name an input its guard does not require** (rule 23)? <!-- catalog-truth:historical --> | **Zero**, and zero again at [spec-v1167](spec-v1167.md) after it printed four and all four were the finder being wrong a second time — see below. Originally, across every tile that refuses with a message (1,385 of them at the time). The five known instances were found and fixed as they arose. `scripts/probe-message-promises.mjs` is kept because the rule is about what an author writes next. Its first run said 28, and all 28 were the finder being wrong: booleans (an unticked box is a real "no"), disjunctive messages ("at least one", "and/or" — naming a field inside a choice is the opposite of requiring it), and scaffolding words like "input" that identify no field ([spec-v1121](spec-v1121.md)). |
| Does the **clipboard** carry a number the tile is not showing? | **Zero**. Every calculator that offers a copy button was checked — about eight in ten of them. |

The third is worth keeping in mind rather than repeating: what a tile puts on the clipboard is what
gets pasted into a chart, and it currently matches the screen everywhere it offers one.
