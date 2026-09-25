# spec-v1476 — ASAS criteria for inflammatory back pain

The ASAS classification criteria for axial spondyloarthritis (the `asas-axspa` tool) ask whether the
patient has "inflammatory back pain" as a single yes/no, leaving the reader to judge it. ASAS defines
that feature with its own five-item criteria, which the catalog did not have.

## What it does

For back pain of 3 months or more, it counts five items and needs 4:

1. Age at onset under 40
2. Insidious onset
3. Improvement with exercise
4. No improvement with rest
5. Pain at night, improving on getting up

The answer says whether the criteria are met and which items are absent, and states that this is the
"inflammatory back pain" feature of the axSpA classification. Back pain of less than 3 months is asked
about rather than scored, because the criteria are defined for chronic back pain only. An unticked
item is an item not present, as elsewhere in the catalog's criteria lists.

Every answer also says:

- **Inflammatory back pain is weak evidence on its own.** Among patients referred with chronic back
  pain (the DIVERS study, RMD Open 2018), the ASAS criteria detected axial spondyloarthritis with a
  sensitivity of 74% to 84% but a specificity of only 31% to 39%.
- **The age item is restated two ways** ("under 40" and "40 or under"). The difference matters only
  at exactly 40.

## Sources

- Sieper J et al. Ann Rheum Dis 2009;68(6):784-788 (the original).
- The items as restated in open sources, which agree: BMC Musculoskelet Disord 2022 (PMC8917757) and
  Dig Dis Sci 2025 (PMC12367853).
- Accuracy: RMD Open 2018 (PMC6336095), Table 3.

The Calin (1977) and Berlin (2006) criteria sets were considered and left out, because their item
definitions were not found in an open source.

## Tests

`test/unit/asas-ibp.test.js`: 4 of 5 meets and 3 does not, naming the absent items; the chronic-pain
prerequisite asks; the notes appear on every answer.
