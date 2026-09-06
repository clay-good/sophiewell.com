// spec-v659: ISGPS definition and grading of delayed gastric emptying (DGE) after
// pancreatic surgery. Completes the International Study Group surgical-complication
// cluster (isgps-popf, isgls-phlf, isgls-bile-leak). Source:
//   Wente MN, Bassi C, Dervenis C, et al. Delayed gastric emptying (DGE) after
//   pancreatic surgery: a suggested definition by the International Study Group of
//   Pancreatic Surgery (ISGPS). Surgery. 2007;142(5):761-768. PMID 17981197.
//
// DGE is the inability to return to a standard diet by the end of the first postoperative
// week together with a prolonged need for a nasogastric tube. The grade is the MOST
// SEVERE grade satisfied by any of three time criteria:
//   nasogastric tube (NGT) required for: A 4-7 days, B 8-14 days, C > 14 days;
//   OR NGT reinsertion after: A POD 3, B POD 7, C POD 14;
//   OR unable to tolerate solid oral intake by: A POD 7, B POD 14, C POD 21.
// Vomiting/gastric distension and prokinetic use are associated features in the table
// (+/- in A, + in B/C), not grade-determining, so they are described but not scored.
//
// Pure: no DOM, no clock, no network.

import { fieldEntered } from './region-footing-v1093.js';

function num(raw) {
  if (raw === '' || raw === null || raw === undefined) return 0;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  return n;
}

function ngtGrade(days) { if (days > 14) return 3; if (days >= 8) return 2; if (days >= 4) return 1; return 0; }
function reinsertGrade(pod) { if (pod > 14) return 3; if (pod > 7) return 2; if (pod > 3) return 1; return 0; }
function solidsGrade(pod) { if (pod >= 21) return 3; if (pod >= 14) return 2; if (pod >= 7) return 1; return 0; }

const CODE = { 0: 'No DGE', 1: 'Grade A', 2: 'Grade B', 3: 'Grade C' };
const LABEL = {
  0: 'No delayed gastric emptying',
  1: 'Grade A (NGT 4-7 days, or reinsertion after POD 3, or no solids by POD 7)',
  2: 'Grade B (NGT 8-14 days, or reinsertion after POD 7, or no solids by POD 14)',
  3: 'Grade C (NGT > 14 days, or reinsertion after POD 14, or no solids by POD 21)',
};

export const ISGPS_DGE_NOTE = 'ISGPS definition and grading of delayed gastric emptying after pancreatic surgery (Wente MN, et al., Surgery 2007;142(5):761-768). DGE is the inability to return to a standard diet by the end of the first postoperative week together with a prolonged need for a nasogastric tube. The grade is the most severe grade satisfied by any of three time criteria: the nasogastric tube is required for 4 to 7 days (A), 8 to 14 days (B), or more than 14 days (C); or the tube is reinserted after postoperative day 3 (A), day 7 (B), or day 14 (C); or the patient is unable to tolerate solid oral intake by postoperative day 7 (A), day 14 (B), or day 21 (C). Vomiting or gastric distension and the use of prokinetics are associated features in the original table but are not grade-determining. This grades a documented postoperative course, read with the surgical team.';

export function isgpsDge(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ngtDays = num(o.ngtDays);
  const reinsertionPod = num(o.reinsertionPod);
  const unableSolidsPod = num(o.unableSolidsPod);

  const bad = [];
  if (!Number.isFinite(ngtDays) || ngtDays < 0) bad.push(`ngtDays = "${o.ngtDays}"`);
  if (!Number.isFinite(reinsertionPod) || reinsertionPod < 0) bad.push(`reinsertionPod = "${o.reinsertionPod}"`);
  if (!Number.isFinite(unableSolidsPod) || unableSolidsPod < 0) bad.push(`unableSolidsPod = "${o.unableSolidsPod}"`);
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Each entry is a whole number of days (0 or more). Check: ${bad.join('; ')}.` };
  }

  const gNgt = ngtGrade(ngtDays);
  const gReinsert = reinsertGrade(reinsertionPod);
  const gSolids = solidsGrade(unableSolidsPod);
  const grade = Math.max(gNgt, gReinsert, gSolids);

  // spec-v1095: `num` returns 0 for a blank, and the grade is the MOST SEVERE of
  // three time criteria, so a criterion nobody recorded reads as a criterion the
  // patient passed. With all three blank the tile answered "No DGE - no delayed
  // gastric emptying": a postoperative course graded as uneventful because
  // nothing about it had been entered yet.
  //
  // Only the "no DGE" reading needs this. A grade of A or above already rests on
  // a criterion that WAS recorded, and the criteria still blank can only raise it.
  const unrecorded = [
    !fieldEntered(o.ngtDays) && 'the days a nasogastric tube was required',
    !fieldEntered(o.reinsertionPod) && 'the day of any tube reinsertion',
    !fieldEntered(o.unableSolidsPod) && 'the day solid intake was first tolerated',
  ].filter(Boolean);
  const partial = unrecorded.length
    ? `${unrecorded.length === 3 ? 'None of the three time criteria were entered' : `Not entered: ${unrecorded.join('; ')}`}. `
      + 'The grade is the most severe criterion met, so an unrecorded one can only raise it.'
    : '';

  return {
    valid: true,
    grade,
    code: CODE[grade],
    ngtGrade: gNgt,
    reinsertionGrade: gReinsert,
    solidsGrade: gSolids,
    abnormal: grade >= 2,
    gradeLabel: grade === 0 && partial ? 'Delayed gastric emptying not ruled out' : LABEL[grade],
    // spec-v1095: the view prints bandLabel as the headline and detail beneath
    // it. Leaving the headline at "No DGE" while the detail says the course was
    // never recorded puts two disagreeing statements on one page, and the
    // headline is the one that gets read.
    bandLabel: grade === 0 && partial ? 'DGE not ruled out' : CODE[grade],
    unrecordedCriteria: unrecorded.length,
    detail: grade === 0
      ? (partial
        ? `No criterion reaches grade A on what was entered, so delayed gastric emptying is not ruled out. ${partial}`
        : 'No criterion reaches grade A — no delayed gastric emptying.')
      : `Most severe criterion sets ${CODE[grade]} (NGT ${gNgt || '-'}, reinsertion ${gReinsert || '-'}, solids ${gSolids || '-'} on the A/B/C scale).${partial ? ` ${partial}` : ''}`,
    note: ISGPS_DGE_NOTE,
  };
}
