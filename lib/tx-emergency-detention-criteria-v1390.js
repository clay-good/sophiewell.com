// spec-v1390: Texas emergency detention criteria, as rewritten by SB 1164 (effective September 1, 2025).
//
// Sources (official mirror tcss.legis.texas.gov, Health & Safety Code ch. 573, read 2026-09-18):
//   573.001(a) A peace officer, without a warrant, may take a person into custody if the officer has
//     reason to believe and does believe that: (1) the person has mental illness and because of it
//     (A) there is a substantial risk of serious harm to the person or others, (B) the person
//     evidences severe emotional distress and deterioration in mental condition, or (C) the person
//     evidences an inability to recognize symptoms or appreciate the risks and benefits of treatment;
//     (2) the person is likely without immediate detention to suffer serious risk of harm or to
//     inflict serious harm on another person; and (3) there is not sufficient time to obtain a
//     warrant. (c) The belief may rest on a credible person's representation, or on the person's
//     conduct or the circumstances found.
//   573.012(b) A magistrate denies the application unless there is reasonable cause to believe: (1) the
//     same mental illness element with (A)-(C); (2) the same likelihood element; (3) the risk of harm
//     is imminent unless the person is immediately restrained; and (4) the necessary restraint cannot
//     be accomplished without emergency detention.
//   573.022(a) Admission requires the examining physician's written statement that (1) is acceptable
//     to the facility; (2) states the opinion that (A) the person has mental illness and because of it
//     (i)-(iii) as above, (B) the risk of harm is imminent unless the person is immediately
//     restrained, and (C) emergency detention is the least restrictive means; and (3) includes (A) a
//     description of the mental illness, (B) a specific description of the risk of harm, and (C) the
//     specific detailed information behind the opinion.
//
// SB 1164 added (B) and (C) of the mental illness element. A form written before September 1, 2025
// has no place for them, and the tile keeps them as separate items so that gap shows.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const TXC_VERIFIED = '2026-09-18';
export const PATHS = [
  { value: 'officer', text: 'Peace officer, without a warrant (573.001)' },
  { value: 'magistrate', text: "Magistrate's warrant on application (573.012)" },
  { value: 'physician', text: "Physician's statement for admission (573.022)" },
];
export const CRITERION = [
  { value: 'met', text: 'Met' },
  { value: 'not-met', text: 'Not met' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
const s3 = (v) => (v === 'met' || v === 'not-met' ? v : null);

const LIKELY = 'likely without immediate detention to suffer serious risk of harm or to inflict serious harm on another person';
const IMMINENT = 'the risk of harm is imminent unless the person is immediately restrained';

const ELEMENTS = {
  officer: [
    ['likelyHarm', `(a)(2) ${LIKELY}`],
    ['noTime', '(a)(3) not sufficient time to obtain a warrant'],
  ],
  magistrate: [
    ['likelyHarm', `(b)(2) ${LIKELY}`],
    ['imminent', `(b)(3) ${IMMINENT}`],
    ['restraintNeeded', '(b)(4) the necessary restraint cannot be accomplished without emergency detention'],
  ],
  physician: [
    ['acceptable', '(a)(1) the statement is acceptable to the facility'],
    ['imminent', `(a)(2)(B) ${IMMINENT}`],
    ['leastRestrictive', '(a)(2)(C) emergency detention is the least restrictive means'],
    ['describesIllness', '(a)(3)(A) describes the nature of the mental illness'],
    ['describesRisk', '(a)(3)(B) specifically describes the risk of harm'],
    ['detailedInfo', '(a)(3)(C) gives the specific detailed information behind the opinion'],
  ],
};
const MI_REF = { officer: '(a)(1)', magistrate: '(b)(1)', physician: '(a)(2)(A)' };
const SUB = { officer: ['(A)', '(B)', '(C)'], magistrate: ['(A)', '(B)', '(C)'], physician: ['(i)', '(ii)', '(iii)'] };

export function txEmergencyDetentionCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const path = PATHS.find((p) => p.value === o.path);
  if (isBlank(o.path) || !path) return { valid: false, message: 'Choose the path: peace officer, magistrate, or physician. Each has its own elements.' };
  const sec = { officer: '573.001', magistrate: '573.012', physician: '573.022' }[path.value];
  const [sa, sb, sc] = SUB[path.value];

  const mi = s3(o.mentalIllness);
  const harm = s3(o.harmRisk);
  const distress = s3(o.distress);
  const insight = s3(o.insight);
  let because = null;
  if (harm === 'met' || distress === 'met' || insight === 'met') because = 'met';
  else if (harm === 'not-met' && distress === 'not-met' && insight === 'not-met') because = 'not-met';

  const rows = [
    { label: `${MI_REF[path.value]} mental illness`, state: mi },
    {
      label: `${MI_REF[path.value]} because of it, at least one of ${sa} substantial risk of serious harm, ${sb} severe emotional distress and deterioration, ${sc} inability to recognize symptoms or appreciate the risks and benefits of treatment`,
      state: because,
    },
    ...ELEMENTS[path.value].map(([k, label]) => ({ label, state: s3(o[k]) })),
  ];
  const WORD = { met: 'met', 'not-met': 'not met' };
  const elements = rows.map((r) => `${r.label}: ${r.state ? WORD[r.state] : 'not assessed'}`);
  const subItems = [
    `${sa} substantial risk of serious harm: ${harm ? WORD[harm] : 'not assessed'}`,
    `${sb} severe emotional distress and deterioration (added by SB 1164): ${distress ? WORD[distress] : 'not assessed'}`,
    `${sc} inability to recognize symptoms or appreciate treatment risks and benefits (added by SB 1164): ${insight ? WORD[insight] : 'not assessed'}`,
  ];
  const unassessed = rows.filter((r) => !r.state).map((r) => r.label);
  const failed = rows.filter((r) => r.state === 'not-met').map((r) => r.label);

  let verdict;
  let bandLabel;
  let band;
  if (unassessed.length) {
    verdict = null;
    bandLabel = 'Incomplete';
    band = `Not decided for ${sec}. Still needed: ${unassessed.join('; ')}.${failed.length ? ` Recorded as not met: ${failed.join('; ')}.` : ''}`;
  } else if (failed.length) {
    verdict = 'not-documented';
    bandLabel = `${sec}: an element is not met`;
    band = `The ${sec} elements are not all met. Not met: ${failed.join('; ')}.`;
  } else {
    verdict = 'documented';
    bandLabel = `${sec}: every element documented`;
    band = `Every ${sec} element is documented as met.`;
  }
  return {
    valid: true,
    path: path.value,
    verdict,
    abnormal: verdict === 'documented',
    bandLabel,
    band,
    elements,
    subItems,
    sb1164Note: 'SB 1164 (effective September 1, 2025) added severe emotional distress with deterioration, and inability to recognize symptoms or appreciate the risks and benefits of treatment. A form written before then has no place for either.',
    basisNote: path.value === 'officer' ? "The officer's belief may rest on a credible person's account, or on the person's conduct or the circumstances found (573.001(c))." : null,
    postureNote: scopeSentence(TXC_VERIFIED),
  };
}
