# spec-v1431 — Watson and Ballet classification of SLAC wrist arthritis

From the classification-gap queue. The hand and wrist tiles stage thumb base arthritis
(`eaton-littler`) and classify the scaphoid fracture (`herbert-scaphoid`), and nothing staged the
commonest pattern of wrist arthritis: the scapholunate advanced collapse (SLAC) wrist.

## Sources

- Watson HK, Ballet FL, *J Hand Surg Am* 1984;9:358-365 (PubMed 6725894; DOI confirmed via
  Crossref): the original, from 4000 films.
- McLean A, Taylor F, *Classifications in Brief: Watson and Ballet Classification of Scapholunate
  Advanced Collapse Wrist Arthritis*, Clin Orthop Relat Res 2019;477:663-666 (open access,
  PMC6382201), read 2026-09-24. Its text is the rule this tool applies:

| stage | radioscaphoid | capitolunate | radiolunate |
|---|---|---|---|
| 1 | radial styloid and distal scaphoid pole only | spared | spared |
| 2 | whole joint | spared | spared |
| 3 | whole joint | arthritis | spared |
| 4 (added later) | whole joint | arthritis | arthritis (pancarpal) |

## Behavior

The stage is **derived** from three joints. No arthritis returns no stage. A combination off the
progression returns "no single stage" with the reason and asks for a joint-by-joint record, as the
review proposes: styloscaphoid plus capitolunate arthritis (the review's named stage 1 versus 3
problem), capitolunate arthritis without radioscaphoid change, and radiolunate arthritis without the
rest of the pancarpal picture. Stage 4 says it comes from later authors. Every staged answer carries
the reliability the review reports (kappa 0.65 between readers, 0.47 for stage 1) and the caution
that the stage has not been validated against surgical findings.

## Tests

`test/unit/watson-slac.test.js`: stages 1-4 derive; the stage 4 note; no arthritis is no stage;
every off-progression pattern is reported; the reliability note; each joint is asked for.
