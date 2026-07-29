// spec-v609 MCP wave: adapter for the Hijdra sum score in lib/hijdra-v609.js. The dom keys mirror the
// browser renderer (views/group-v609.js) and META.hijdra.example.
//
// **IT IS A SUM ACROSS 14 SITES, NOT A GRADE.** Ten cisterns and fissures (0 to 30) plus four ventricles
// (0 to 12), total 0 to 42. Do NOT report it as an ordinal grade the way Fisher and modified Fisher are.
//
// **THE TWO HALVES USE THE SAME 0-TO-3 RANGE WITH DIFFERENT ANCHOR DEFINITIONS.** In a cistern 1 is "a small
// amount of blood"; in a ventricle 1 is "sedimentation of blood in the posterior part". NEVER apply the
// cisternal wording to a ventricle - the two field label sets differ for exactly this reason.
//
// **EIGHT OF THE TEN CISTERNAL SITES ARE PAIRED.** Only the interhemispheric fissure and the quadrigeminal
// cistern are scored once. Scoring "the sylvian fissure" once instead of left and right silently halves four
// of the ten sites.
//
// **NO SEVERITY BAND IS RETURNED.** `band` is always null - the instrument has no official bands. Reported
// study thresholds (19 or below = limited clot burden; 23 or above predicted vasospasm) are stated but NOT
// applied, and must NOT be turned into bands.
//
// **WHICH SCALE WINS DEPENDS ON THE OUTCOME**: modified Fisher led for vasospasm (AUC 0.78 against 0.68 and
// 0.62), but only this score correlated significantly with radiological delayed cerebral ischemia.

import * as H from '../../lib/hijdra-v609.js';

export default [
  {
    id: 'hijdra',
    summary: `The HIJDRA SUM SCORE (Hijdra and colleagues 1990) quantifies blood on the INITIAL CT after subarachnoid hemorrhage. **IT IS A SUM ACROSS ${H.CISTERNS.length + H.VENTRICLES.length} SITES, NOT A GRADE**: ${H.CISTERNS.length} cisterns and fissures scored 0 to 3 each (0 to ${H.CISTERNAL_MAX}) plus ${H.VENTRICLES.length} ventricles scored 0 to 3 each (0 to ${H.VENTRICULAR_MAX}), total 0 to ${H.TOTAL_MAX}. Fisher and the modified Fisher scale assign ONE ordinal category to the whole scan; this counts blood site by site, so do NOT report it as a grade. **THE TWO HALVES USE THE SAME 0-TO-3 RANGE WITH DIFFERENT ANCHOR DEFINITIONS**: in a cistern the levels are [${H.CISTERN_LEVELS.map((l) => `${l.value} = ${l.text}`).join('; ')}], but in a ventricle they are [${H.VENTRICLE_LEVELS.map((l) => `${l.value} = ${l.text}`).join('; ')}] - level 1 in particular is "a small amount" in a cistern and "sedimentation of blood in the posterior part" in a ventricle. A point in one half does not mean what a point in the other means, and they are still summed into one total; NEVER apply the cisternal wording to a ventricle. **EIGHT OF THE TEN CISTERNAL SITES ARE PAIRED**, so there are only SIX named structures: the interhemispheric fissure and the quadrigeminal cistern are scored ONCE, while the lateral and basal parts of the sylvian fissure, the suprasellar cistern and the ambient cistern are each scored TWICE, left and right - scoring "the sylvian fissure" once silently halves four of the ten sites. The frontal horns are likewise left and right, with the third and fourth ventricles once each. **NO SEVERITY BAND IS RETURNED**: \`band\` is ALWAYS null because the instrument has no official bands. Individual studies report that ${H.REPORTED_THRESHOLDS.map((t) => t.text).join(' ')} Those come from single studies rather than the instrument, so they are REPORTED and must NOT be turned into bands. **WHICH SCALE IS BEST DEPENDS ON WHICH OUTCOME**: in a direct comparison the modified Fisher (Claassen) scale had the largest area under the curve for VASOSPASM at 0.78, ahead of this score at 0.68 and the original Fisher scale at 0.62, but only this score correlated significantly with radiological DELAYED CEREBRAL ISCHEMIA - the ranking flips between the two endpoints. This quantifies blood. It does NOT diagnose subarachnoid hemorrhage, does NOT locate or grade an aneurysm, does NOT measure clinical severity - the Hunt and Hess and WFNS grades do that - and does NOT decide whether or when to treat vasospasm.`,
    compute: H.hijdraScore,
    fields: [
      ...H.CISTERNS.map((s) => ({
        dom: `hij-${s.key}`, arg: s.key, kind: 'enum', values: ['0', '1', '2', '3'], required: true,
        label: `CISTERN: ${s.text}. [${H.CISTERN_LEVELS.map((l) => `${l.value} = ${l.text}`).join('; ')}]${s.paired ? ' PAIRED - score left and right separately.' : ' Midline - scored once.'}`,
      })),
      ...H.VENTRICLES.map((s) => ({
        dom: `hij-${s.key}`, arg: s.key, kind: 'enum', values: ['0', '1', '2', '3'], required: true,
        label: `VENTRICLE - DIFFERENT WORDING: ${s.text}. [${H.VENTRICLE_LEVELS.map((l) => `${l.value} = ${l.text}`).join('; ')}]${s.paired ? ' PAIRED - score left and right separately.' : ' Scored once.'}`,
      })),
    ],
  },
];
