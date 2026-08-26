// spec-v774: Boston Carpal Tunnel Questionnaire (BCTQ).
//
// A two-scale patient-reported outcome measure for carpal tunnel syndrome.
// Source:
//   Levine DW, Simmons BP, Koris MJ, et al. A self-administered questionnaire for the
//   assessment of severity of symptoms and functional status in carpal tunnel syndrome.
//   J Bone Joint Surg Am. 1993;75(11):1585-1592. (PMID 8245050.)
//
// Symptom Severity Scale (SSS): 11 items, each rated 1 to 5. Score = mean of the 11 items.
// Functional Status Scale (FSS): 8 activities, each rated 1 to 5. Score = mean of the 8 items.
// Both scales run 1 to 5; higher is more severe. Only neutral item-topic labels are used;
// the questionnaire wording is copyrighted.
//
// Pure: no DOM, no clock, no network.

export const BCTQ_NOTE = 'The Boston Carpal Tunnel Questionnaire (Levine DW, Simmons BP, Koris MJ, et al, J Bone Joint Surg Am 1993;75(11):1585-1592) is a patient-reported measure of carpal tunnel syndrome with two independent scales. The Symptom Severity Scale rates 11 symptom items from 1 to 5 and the Functional Status Scale rates 8 everyday hand activities from 1 to 5; each scale scores as the mean of its own items, so both run from 1 to 5 with higher meaning more severe. The two scales are reported separately and are not added together. It is a severity and function measure used to follow change over time, not a diagnostic test, not a substitute for nerve conduction studies, and not an order for splinting, injection or surgery.';

const SSS_ITEMS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11'];
const FSS_ITEMS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

export function bctq(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let sssSum = 0;
  for (const k of SSS_ITEMS) {
    const v = optIn(o[k]);
    if (v === null) return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate symptom item ${k.slice(1)} from 1 to 5.`, note: BCTQ_NOTE };
    sssSum += v;
  }
  let fssSum = 0;
  for (const k of FSS_ITEMS) {
    const v = optIn(o[k]);
    if (v === null) return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate function item ${k.slice(1)} from 1 to 5.`, note: BCTQ_NOTE };
    fssSum += v;
  }

  const sssMean = sssSum / SSS_ITEMS.length;
  const fssMean = fssSum / FSS_ITEMS.length;
  const sssText = sssMean.toFixed(2);
  const fssText = fssMean.toFixed(2);
  const aboveMidpoint = sssMean >= 3 || fssMean >= 3;

  return {
    valid: true,
    sssSum,
    fssSum,
    sssMean,
    fssMean,
    sssText,
    fssText,
    abnormal: aboveMidpoint,
    bandLabel: `BCTQ symptom ${sssText} of 5, function ${fssText} of 5`,
    band: `BCTQ symptom severity ${sssText} of 5, functional status ${fssText} of 5 — ${aboveMidpoint ? 'at or above the midpoint of the 1 to 5 range on at least one scale' : 'below the midpoint of the 1 to 5 range on both scales'}.`,
    detail: 'Symptom Severity is the mean of its 11 items and Functional Status the mean of its 8 items, so each scale runs 1 to 5 and higher is more severe. The two are reported separately and are never added together. The scales are most useful compared against the same patient before and after treatment.',
    note: BCTQ_NOTE,
  };
}
