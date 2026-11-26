# spec-v1813 — The exclusion below the early return

> Status: **SHIPPED (2026-11-26)**: one tile stops calling a person eligible without saying that an
> exclusion was never answered; the shared vocabulary learns the participles the house uses for a tick box;
> and `probe-omitted-field-decides`'s first section — the one that can hurt — gets a JUDGED ledger and a
> gate across both of its strong sections, as the 23rd gated finder. 1 library file, 1 test. The
> catalog stays 2,390.

## A note that four early returns sat above

`lf-mda-regimen` decides whether a person may take a lymphatic-filariasis MDA regimen. Severe illness
excludes them from every regimen but albendazole alone, and when nobody answered that question the tool
said so:

> Severe illness: not entered. The severely ill are excluded.

That line was the **last statement before the final return**, and four branches return before it. The
reading that most needs it is one of them: a person **under 90 cm in an IDA area** is not refused, they are
moved to DA — *"This person gets DA instead (under 90 cm): DEC 6 mg/kg with albendazole 400 mg"* — and that
reading carried no word that an exclusion was unanswered. A field worker following it would dose someone the
guideline excludes, and nothing on screen would say a question had been skipped.

The note moves above every branch that can return a verdict, and it takes with it the `area !== 'ALB'` guard
the exclusion itself carries one line higher — where albendazole is given alone, illness is not an
exclusion, and the note was being printed for nothing. The test asserts the rule rather than the line: on
**six** configurations that still say yes, the unanswered exclusion is named; on the albendazole-alone
reading it is absent; and a person who answers yes is refused.

This is the configuration lesson of [spec-v1777](spec-v1777.md) in a different place. A guard proven at the
worked example is proven in **one** configuration: this note was present at the example's own values and
absent once the height was halved, which is how the finder reached it and how a reader never would.

## A tick box is not entered, it is marked

`test/lib/asking-language.js` matched `no X is|was|were entered|recorded`. The negative-existential sentence
is about a **control** as often as a typed number, and the house writes the verb that fits the control:

> No strictly lobar hemorrhagic lesion and no white-matter feature were **marked**.
> No absolute contraindication was **ticked**. … no locality was **chosen**. … no medication list is **supplied**.

28 such uses across `lib/`. `given` is deliberately **not** added, though it is the commonest at 181 uses:
*"No dose is given"* is a tool declining to state an **output**, not a reader leaving an input blank, and
matching it would exempt a tile for withholding a number it was never going to print. Measured before
adding, as the file's own rule requires: exactly **one** row moves, `boston-caa`, which names both gaps and
declines both tiers. `probe-static-exemption` still reports zero, which is the check that this bought no
exemption on text that was already there.

## A count is disclosed with a participle, not a noun

`oswestry-odi` was the other ten rows, and it was right all along. The Oswestry index's denominator **is
the sections answered** — that is Fairbank's published rule, not a shortcut — and the tool prints the count
it divided by: *"Raw 30 of 45 across 9 answered sections"*, labeling the reading partial from two missed
sections, where the published adjustment stops covering it.

The vocabulary's count pattern knows `N of 20 items` and the four nouns the house writes there, and
`sections` is not one of them — nor should the bare noun be added, because *"4 of 5 regions is absent"* and
*"3 of 10 regions with early ischemic change"* are **criteria restated**, and matching them would exempt the
tiles that quote them. The **participle** is the discriminator: a count of what was *answered* is a
statement about this reading, and no instrument's definition is written that way. `\d+ answered [a-z]+`
moves exactly the ten Oswestry sections and nothing else.

## Thirty-four read rows, and a gate on the two sections that can hurt

Section 1 of `probe-omitted-field-decides` is the [spec-v1091](spec-v1091.md) shape: with a field omitted
the reading is `abnormal: false`, and some value of that field would have made it true. Section 2 is the
same question asked of a tile that carries no flag at all, so the verdict moving is the only signal there
is. Both are small enough to hold at zero, so their remaining rows — fifteen and nineteen — are judged with
their reasons, and `--only-ruled-out` prints just those two sections for the gate to read. Sections 3 and 4
are a prioritized reading list of 120-odd rows and stay that way.

Section 2's reasons fall into two groups. Most are **a reading that lost a clause**, which fabricates
nothing ([spec-v1196](spec-v1196.md)): all four `pk-suite` rows print the one line they can still compute
rather than a wrong one. The rest **name what they stood on** — `truelove-witts` enumerates the systemic
criteria met and any one of them is enough for severe; `mayo-uc` says *"Partial Mayo score 6 (0-9)"* without
the endoscopy subscore and *"Full Mayo score 6 (0-12)"* with it, each with its own range and its own band;
`calvert-carboplatin` applies the FDA's GFR cap by default and says so, which is the safe direction.
`smart-cop` is the one worth checking twice: its oxygenation term takes PaO2, SpO2 **or** the P/F ratio, any
one of which serves, and [spec-v1020](spec-v1020.md) already refuses the low-risk reading when none of the
three is entered.

Four of the fifteen are a **unit select**, and they share one reason: each names in its answer the unit it
read the value as — *"HOMA-IR 0.74 (insulin 6 uU/mL, glucose 50 mg/dL)"*, *"50 ng/mL (124.8 nmol/L)"*. That
is the whole of what a tile owes there. An agent that omits the key gets the house default; the reading says
which one it used, so the figure can be checked against it. `calcium-phosphate-product` goes furthest and
names the **factor** between the two readings, and it is in the ledger rather than exempt because it owns
the gap with the one word the disclosing list refuses to learn.
