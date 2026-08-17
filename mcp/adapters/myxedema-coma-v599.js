// spec-v599 MCP wave: adapter for the myxedema coma diagnostic score in lib/myxedema-coma-v599.js. The dom
// keys mirror the browser renderer (views/group-v599.js) and META['myxedema-coma'].example.
//
// **TWO CATEGORIES ARE ADDITIVE SUB-CHECKLISTS AND THE REST ARE SINGLE GRADED PICKS.** Temperature, CNS
// effects and gastrointestinal findings are LADDERS where exactly ONE option counts. But the cardiovascular
// category adds a graded bradycardia pick TO five INDEPENDENT items, and every metabolic item adds
// independently. The cardiovascular category alone can contribute 100 points - more than the whole
// diagnostic threshold - so treating either block as a single pick UNDER-SCORES massively.
//
// **THE DIAGNOSTIC THRESHOLD IS AGREED AT 60 BUT THE MIDDLE BAND'S LOWER EDGE IS NOT.** The widely
// reproduced adapted table gives 25 to 59 as "supportive" and under 25 as "unlikely"; the primary's own
// abstract gives 45 to 59 as "at risk". A SCORE OF 30 IS "SUPPORTIVE" UNDER ONE RENDERING AND "UNLIKELY"
// UNDER THE OTHER. `bandsDisagree` fires for every score in the 25-to-44 interval - report that flag.
//
// **THE THRESHOLD OF 60 IS ONLY ABOUT A QUARTER OF THE MAXIMUM OF 230.** It sounds like a high bar and is
// not one.
//
// **A PATIENT CAN CROSS THE THRESHOLD ON NON-SPECIFIC DERANGEMENT ALONE.** The five metabolic items total
// 50 and NONE is specific to hypothyroidism - hyponatremia, hypoglycemia, hypoxemia, hypercarbia and a
// reduced GFR occur in most critically ill patients. Those five plus a precipitating event total EXACTLY 60.
// `nonSpecificSharePercent` reports how much of the total came from that block.
//
// **IT WAS DERIVED IN TWENTY-ONE PATIENTS** (14 with myxedema coma, 7 controls). The quoted 100 percent
// sensitivity and 85.7 percent specificity come from that cohort and are fragile.

import * as M from '../../lib/myxedema-coma-v599.js';

const ladder = (list) => list.map((i) => `${i.value} = ${i.text} (${i.points})`).join('; ');

export default [
  {
    id: 'myxedema-coma',
    summary: `The myxedema coma diagnostic score (Popoveniuc and colleagues 2014), the hypothyroid counterpart to the two thyroid-storm tiles in this catalog. A score of ${M.DIAGNOSTIC_THRESHOLD} or more is highly suggestive of myxedema coma. SINGLE-PICK LADDERS - exactly one option counts in each: thermoregulatory dysfunction [${ladder(M.TEMPERATURE_OPTIONS)}]; central nervous system effects [${ladder(M.CNS_OPTIONS)}]; gastrointestinal findings [${ladder(M.GI_OPTIONS)}]; bradycardia [${ladder(M.BRADYCARDIA_OPTIONS)}]. A precipitating event adds ${M.PRECIPITATING_EVENT_POINTS}. **TWO BLOCKS ARE ADDITIVE SUB-CHECKLISTS, NOT LADDERS**: the cardiovascular block adds the graded bradycardia pick TO five INDEPENDENT items - ${M.CARDIOVASCULAR_ITEMS.map((i) => `${i.text} (${i.points})`).join('; ')} - and the metabolic block adds all five independently - ${M.METABOLIC_ITEMS.map((i) => `${i.text} (${i.points})`).join('; ')}. The cardiovascular category ALONE can contribute ${M.CARDIOVASCULAR_BLOCK_MAX} points, more than the whole diagnostic threshold, so treating either block as a single pick UNDER-SCORES massively. **THE DIAGNOSTIC THRESHOLD IS AGREED AT ${M.DIAGNOSTIC_THRESHOLD} BUT THE MIDDLE BAND'S LOWER EDGE IS NOT**: the widely reproduced adapted table gives ${M.MIDDLE_BAND_LOW_ADAPTED} to 59 as "supportive" and under ${M.MIDDLE_BAND_LOW_ADAPTED} as "unlikely", while the primary's own abstract gives ${M.MIDDLE_BAND_LOW_PRIMARY} to 59 as "at risk", so a score of 30 is SUPPORTIVE under one rendering and UNLIKELY under the other. \`bandsDisagree\` fires for every score in that interval and must be reported. **THE THRESHOLD IS ONLY ABOUT A QUARTER OF THE MAXIMUM OF ${M.MAX_SCORE}** - it sounds like a high bar and is not one. **A PATIENT CAN CROSS IT ON NON-SPECIFIC DERANGEMENT ALONE**: the five metabolic items total ${M.METABOLIC_BLOCK_MAX} and none is specific to hypothyroidism, so those five plus a precipitating event total EXACTLY ${M.DIAGNOSTIC_THRESHOLD}; \`nonSpecificSharePercent\` reports how much of the total came from that block. **IT WAS DERIVED IN TWENTY-ONE PATIENTS** (14 with myxedema coma, 7 controls), so the quoted 100 percent sensitivity and 85.7 percent specificity are fragile. Myxedema coma is a LIFE-THREATENING EMERGENCY and this is a DIAGNOSTIC AID for a diagnosis that is ultimately CLINICAL. It does NOT treat: it does not select or dose thyroid hormone, does not decide the intravenous route, and does not decide on corticosteroids - which the source gives TOGETHER with thyroid hormone, because unrecognized adrenal insufficiency is precipitated by giving thyroid hormone alone. **FAILING TO REACH THE THRESHOLD DOES NOT EXCLUDE MYXEDEMA COMA**, and treatment should not wait on a score or on thyroid function tests.`,
    compute: M.myxedemaComa,
    fields: [
      { dom: 'myx-temperature', arg: 'temperature', kind: 'enum', values: M.TEMPERATURE_OPTIONS.map((i) => i.value), required: true, label: `Thermoregulatory dysfunction. A LADDER - one option only [${ladder(M.TEMPERATURE_OPTIONS)}]` },
      { dom: 'myx-cns', arg: 'cns', kind: 'enum', values: M.CNS_OPTIONS.map((i) => i.value), required: true, label: `Central nervous system effects. A LADDER - one option only [${ladder(M.CNS_OPTIONS)}]` },
      { dom: 'myx-gi', arg: 'gi', kind: 'enum', values: M.GI_OPTIONS.map((i) => i.value), required: true, label: `Gastrointestinal findings. A LADDER - one option only [${ladder(M.GI_OPTIONS)}]` },
      { dom: 'myx-precipitatingEvent', arg: 'precipitatingEvent', kind: 'enum', values: ['no', 'yes'], required: true, label: `Precipitating event. Adds ${M.PRECIPITATING_EVENT_POINTS}.` },
      { dom: 'myx-bradycardia', arg: 'bradycardia', kind: 'enum', values: M.BRADYCARDIA_OPTIONS.map((i) => i.value), required: true, label: `Bradycardia. A LADDER - one option only - but it ADDS TO the five independent cardiovascular items [${ladder(M.BRADYCARDIA_OPTIONS)}]` },
      ...M.CARDIOVASCULAR_ITEMS.map((i) => ({
        dom: `myx-${i.key}`, arg: i.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${i.text}. ADDS ${i.points} INDEPENDENTLY - this is not a ladder option.`,
      })),
      ...M.METABOLIC_ITEMS.map((i) => ({
        dom: `myx-${i.key}`, arg: i.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${i.text}. ADDS ${i.points} INDEPENDENTLY. NOT specific to hypothyroidism - all five together total ${M.METABOLIC_BLOCK_MAX}.`,
      })),
    ],
  },
];
