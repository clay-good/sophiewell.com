# spec-v1713 — Review fixes to the variant interpretation tools

> Status: **SHIPPED (2026-11-07)**: fixes to `max-credible-allele-frequency` and `acmg-variant-classify`
> (spec-v1697); the catalog stays 2,386.

An independent review of the two v1697 tools found these correct:

- every Richards 2015 Table 5 rule, including its boundaries;
- the Tavtigian 2020 points and classes, and the 2018 posterior;
- strength modifiers, duplicate refusal and hostile input;
- the Whiffin dominant and recessive formulas and the Poisson ceiling.

It found two defects:

| Tool | Input | Was | Now |
|---|---|---|---|
| max-credible-allele-frequency | dominant, prevalence 0.5, allelic contribution 1, penetrance 0.1 | "maximum credible allele frequency 2.5". The recessive form gave a ceiling of 248 on an allele number of 100, so no count could ever be called too common. | refused: an allele frequency cannot exceed 1 |
| acmg-variant-classify | `BA1, PVS1, PS1` (or `BA1, PP3`) | the posterior (0.9986, or 0.1877) was printed from the pathogenic codes alone, with no flag, because BA1 turns off the methods-disagree check | a flag says the points and posterior leave BA1 out and are not a classification |

## Not changed: the 2015 class with BA1 beside pathogenic codes

The reviewer suggested that BA1 should give Benign even beside pathogenic codes. Richards 2015 classifies variants
whose benign and pathogenic criteria contradict each other as Uncertain significance. The design's "BA1 is
stand-alone benign" means BA1 alone meets Benign (i); it does not let BA1 override pathogenic evidence. No source
read for this change says otherwise, so the tool still reports the conflict.

## Not changed: one-sided conflict note

The note about a lone opposing code covers only benign codes that meet no rule. The mirror case (a pathogenic code
beside a benign rule) gets no note, as spec-v1697 chose.
