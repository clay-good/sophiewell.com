// spec-v584 MCP wave: adapter for the EBMT (Gratwohl) risk score in lib/ebmt-score-v584.js. The dom keys
// mirror the browser renderer (views/group-v584.js) and META['ebmt-score'].example.
//
// **ONE FACTOR SILENTLY DISAPPEARS.** The time-from-diagnosis item "does not apply for patients transplanted
// in first complete remission (score 0)". A first-CR patient scores 0 for timing NO MATTER how long the
// interval was - three years from diagnosis to transplant in first CR still scores 0. Reading the interval
// and scoring it unconditionally over-scores exactly the group with the best prognosis, and the maximum
// reachable score in first CR is 6, not 7.
//
// **THE SEX ITEM IS ONE-DIRECTIONAL.** Only a FEMALE DONOR into a MALE RECIPIENT scores. Male donor into
// female recipient scores 0, as do both matched combinations. It is one asymmetric direction, not a "sex
// mismatch" item, and treating it as mismatch double-counts half the mismatched pairs.
//
// **THE DONOR ITEM HAS ONLY TWO PUBLISHED CATEGORIES**: HLA-identical sibling 0, unrelated donor 1.
// HAPLOIDENTICAL AND CORD-BLOOD DONORS HAVE NO DEFINED VALUE in this score, which predates both as routine
// options. Validation studies have applied it in those settings; the score itself assigns them no category,
// and none is invented here.
//
// **A WIDELY REPRODUCED RENDERING OF THE TIMING THRESHOLD WOULD LEAVE A HOLE**: "<12 months = 0, >12 months
// = 1" leaves exactly 12 months unclassified. The consistent partition, used here, is 12 months or less = 0.
//
// **SEVERE APLASTIC ANEMIA ALWAYS SCORES 0 FOR DISEASE STAGE**, by definition, because the stage ladder is
// built from remission states it does not have.
//
// NOT THE HCT-CI. `hct-ci` in this catalog scores ORGAN COMORBIDITY; this scores the DISEASE AND THE
// TRANSPLANT. They are complementary axes and are routinely reported together, not alternatives.

import * as E from '../../lib/ebmt-score-v584.js';

export default [
  {
    id: 'ebmt-score',
    summary: `The EBMT (GRATWOHL) RISK SCORE for allogeneic hematopoietic stem cell transplantation, 0 to ${E.EBMT_MAX}, from five pre-transplant factors. AGE: ${E.AGE_BANDS.map((a) => `${a.text} = ${a.points}`).join('; ')}. DISEASE STAGE: ${E.STAGE_BANDS.map((s) => `${s.text} = ${s.points}`).join('; ')} - early is acute leukemia in first CR, MDS untreated or in first CR, CML in first chronic phase, lymphoproliferative disease or myeloma in first CR, and SEVERE APLASTIC ANEMIA IS ALWAYS EARLY by definition because the ladder is built from remission states it does not have; intermediate is acute leukemia in second CR, CML in intermediate stages, MDS in second CR or partial remission, lymphoproliferative disease or myeloma in second CR or stable disease; late is acute leukemia in advanced stages, CML in blast crisis, and any other stage. TIME FROM DIAGNOSIS: ${E.TIME_THRESHOLD_MONTHS} months or less = 0, more than ${E.TIME_THRESHOLD_MONTHS} = 1. DONOR: ${E.DONOR_TYPES.map((d) => `${d.text} = ${d.points}`).join('; ')}. SEX COMBINATION: female donor into male recipient = ${E.SEX_MATCH_POINT}, every other combination = 0. BANDS: 0-2 low risk, 3-4 intermediate, 5-${E.EBMT_MAX} poor. **ONE FACTOR SILENTLY DISAPPEARS**: the time item DOES NOT APPLY to a patient transplanted in first complete remission and scores 0 however long the interval was, so three years from diagnosis in first CR still scores 0 and the **MAXIMUM REACHABLE SCORE IN FIRST CR IS ${E.EBMT_MAX_FIRST_CR}, NOT ${E.EBMT_MAX}**. Scoring the interval unconditionally over-scores exactly the group with the best prognosis. **THE SEX ITEM IS ONE-DIRECTIONAL**: only female donor into male recipient scores, so treating it as a generic "sex mismatch" item double-counts half the mismatched pairs. **THE DONOR ITEM HAS ONLY TWO PUBLISHED CATEGORIES** and **HAPLOIDENTICAL AND CORD-BLOOD DONORS HAVE NO DEFINED VALUE** in this score, which predates both as routine options; validation studies have applied it in those settings but the score assigns them no category and none is invented here. Some reproductions print the timing threshold as "under 12 versus over 12", which would leave exactly 12 months unclassified; the consistent partition is used. **NOT THE HCT-CI**: \`hct-ci\` in this catalog scores ORGAN COMORBIDITY while this scores the DISEASE AND THE TRANSPLANT - complementary axes, routinely reported together, not alternatives. This estimates survival and transplant-related mortality at a GROUP level BEFORE transplant. It does NOT decide whether to transplant, does NOT select a donor, a conditioning regimen or a graft source, and a HIGH SCORE IS NOT A REASON TO WITHHOLD TRANSPLANTATION: for many of these diseases transplant is the only curative option, and the comparator is the untransplanted course, about which this score says nothing.`,
    compute: E.ebmtScore,
    fields: [
      { dom: 'ebmt-age', arg: 'ageBand', kind: 'enum', values: E.AGE_BANDS.map((a) => a.value), required: true, label: `Patient age band [${E.AGE_BANDS.map((a) => `${a.value} = ${a.points}`).join('; ')}]` },
      { dom: 'ebmt-stage', arg: 'diseaseStage', kind: 'enum', values: E.STAGE_BANDS.map((s) => s.value), required: true, label: `Disease stage [${E.STAGE_BANDS.map((s) => `${s.value} = ${s.points}`).join('; ')}]. Severe aplastic anemia is always early.` },
      { dom: 'ebmt-first-cr', arg: 'firstCompleteRemission', kind: 'enum', values: ['yes', 'no'], required: true, label: `Transplanted in first complete remission. YES SUPPRESSES THE TIMING ITEM ENTIRELY: it scores 0 regardless of the interval, and the maximum reachable score becomes ${E.EBMT_MAX_FIRST_CR}.` },
      { dom: 'ebmt-months', arg: 'monthsFromDiagnosis', kind: 'number', unit: 'months', required: false, label: `Months from diagnosis to transplant. Required ONLY outside first complete remission. More than ${E.TIME_THRESHOLD_MONTHS} scores 1.` },
      { dom: 'ebmt-donor', arg: 'donorType', kind: 'enum', values: E.DONOR_TYPES.map((d) => d.value), required: true, label: `Donor type [${E.DONOR_TYPES.map((d) => `${d.value} = ${d.points}`).join('; ')}]. THESE ARE THE ONLY TWO PUBLISHED CATEGORIES - haploidentical and cord-blood donors have no defined value in this score.` },
      { dom: 'ebmt-sex', arg: 'femaleDonorMaleRecipient', kind: 'enum', values: ['yes', 'no'], required: true, label: `Female donor into a male recipient. ONE DIRECTION ONLY: this exact combination scores ${E.SEX_MATCH_POINT}; male donor into female recipient and both matched combinations score 0.` },
    ],
  },
];
