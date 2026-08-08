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

  return {
    valid: true,
    grade,
    code: CODE[grade],
    ngtGrade: gNgt,
    reinsertionGrade: gReinsert,
    solidsGrade: gSolids,
    abnormal: grade >= 2,
    gradeLabel: LABEL[grade],
    bandLabel: CODE[grade],
    detail: grade === 0
      ? 'No criterion reaches grade A — no delayed gastric emptying.'
      : `Most severe criterion sets ${CODE[grade]} (NGT ${gNgt || '-'}, reinsertion ${gReinsert || '-'}, solids ${gSolids || '-'} on the A/B/C scale).`,
    note: ISGPS_DGE_NOTE,
  };
}
