# spec-v1813 — The exclusion below the early return

> Status: **SHIPPED (2026-11-26)**: one tile stops calling a person eligible without saying that an
> exclusion was never answered; the shared vocabulary learns the participles the house uses for a tick box;
> and `probe-omitted-field-decides`'s first section — the one that can hurt — gets a JUDGED ledger and a
> gate, as the 23rd gated finder. 1 library file, 1 test. The catalog stays 2,390.

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

## Fifteen read rows, and a gate on the section that can hurt

Section 1 of `probe-omitted-field-decides` is the [spec-v1091](spec-v1091.md) shape: with a field omitted
the reading is `abnormal: false`, and some value of that field would have made it true. It is small enough
to hold at zero, so its fifteen remaining rows are now judged with their reasons and the section is gated.
The other three sections are a prioritized reading list of 150-odd rows and stay that way.

Four of the fifteen are a **unit select**, and they share one reason: each names in its answer the unit it
read the value as — *"HOMA-IR 0.74 (insulin 6 uU/mL, glucose 50 mg/dL)"*, *"50 ng/mL (124.8 nmol/L)"*. That
is the whole of what a tile owes there. An agent that omits the key gets the house default; the reading says
which one it used, so the figure can be checked against it. `calcium-phosphate-product` goes furthest and
names the **factor** between the two readings, and it is in the ledger rather than exempt because it owns
the gap with the one word the disclosing list refuses to learn.
