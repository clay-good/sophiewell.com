// spec-v780: Copenhagen Burnout Inventory (CBI).
//
// Source:
//   Kristensen TS, Borritz M, Villadsen E, Christensen KB. The Copenhagen Burnout
//   Inventory: a new tool for the assessment of burnout. Work & Stress.
//   2005;19(3):192-207. Scale definitions and scoring rules as published by the
//   Danish National Research Centre for the Working Environment (PUMA study form).
//
// Three INDEPENDENT scales, never summed into one number:
//   Personal burnout        6 items   (frequency wording throughout)
//   Work-related burnout    7 items   (3 degree, then 4 frequency; item 7 REVERSED)
//   Client-related burnout  6 items   (4 degree, then 2 frequency)
//
// Every item scores 100 / 75 / 50 / 25 / 0 from the most to the least burnt-out
// answer, and each scale is the AVERAGE of the items that were answered.
//
// The published non-responder rules are enforced rather than quietly averaged over:
//   personal        fewer than 3 answered -> non-responder
//   work-related    fewer than 4 answered -> non-responder
//   client-related  fewer than 3 answered -> non-responder
// A clinician with no client contact can legitimately leave the client scale blank,
// so an unanswered scale is reported as not answered rather than as an error.
//
// Higher is more burnt out. Only neutral item-topic labels are used.
//
// Pure: no DOM, no clock, no network.

export const CBI_NOTE = 'The Copenhagen Burnout Inventory (Kristensen TS, Borritz M, Villadsen E, Christensen KB, Work and Stress 2005;19(3):192-207) measures burnout on three separate scales: personal burnout over 6 items, work-related burnout over 7, and client-related burnout over 6. Every item is scored 100, 75, 50, 25 or 0 from the most to the least burnt-out answer, and each scale is the average of the items answered, so each runs 0 to 100 and higher means more burnt out. One item, the last of the work-related scale, asks about having energy left for family and friends and is reverse scored. The three scales are reported separately and are never added into a single number, and the published rules treat a scale as unanswered if fewer than three items were completed, or fewer than four on the work-related scale. It is a self-report measure of how work is affecting you, not a clinical diagnosis and not an occupational-health determination.';

const SCALES = [
  { key: 'personal', label: 'Personal burnout', prefix: 'p', count: 6, minAnswered: 3, reverse: [] },
  { key: 'work', label: 'Work-related burnout', prefix: 'w', count: 7, minAnswered: 4, reverse: ['w7'] },
  { key: 'client', label: 'Client-related burnout', prefix: 'c', count: 6, minAnswered: 3, reverse: [] },
];

const ALLOWED = new Set([0, 25, 50, 75, 100]);

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!ALLOWED.has(n)) return undefined;
  return n;
}

export function cbi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scores = {};
  const answered = {};
  let anyAnswered = false;

  for (const sc of SCALES) {
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= sc.count; i += 1) {
      const arg = `${sc.prefix}${i}`;
      const v = optIn(o[arg]);
      if (v === undefined) {
        return { valid: false, code: 'INVALID_INPUT', field: arg, message: `${sc.label} item ${i} must be 0, 25, 50, 75 or 100.`, note: CBI_NOTE };
      }
      if (v === null) continue;
      sum += sc.reverse.includes(arg) ? 100 - v : v;
      count += 1;
    }
    answered[sc.key] = count;
    anyAnswered = anyAnswered || count > 0;
    scores[sc.key] = count >= sc.minAnswered ? Math.round((sum / count) * 100) / 100 : null;
  }

  if (!anyAnswered) {
    return { valid: false, code: 'MISSING_INPUT', field: 'p1', message: 'Answer at least one item.', note: CBI_NOTE };
  }

  const show = (k) => {
    if (scores[k] !== null) return `${scores[k].toFixed(1)} of 100`;
    return answered[k] === 0 ? 'not answered' : 'too few items answered';
  };
  const reported = SCALES.filter((s) => scores[s.key] !== null);
  const high = reported.filter((s) => scores[s.key] >= 50).map((s) => s.label.toLowerCase());

  return {
    valid: true,
    personal: scores.personal,
    work: scores.work,
    client: scores.client,
    answered,
    // 50 or more on a scale is the widely used working threshold, not a cutoff the
    // 2005 source itself publishes.
    abnormal: high.length > 0,
    bandLabel: `CBI personal ${show('personal')}, work ${show('work')}, client ${show('client')}`,
    band: `CBI — personal burnout ${show('personal')}, work-related ${show('work')}, client-related ${show('client')}.`,
    detail: 'Each scale is the average of the items answered, on a 0 to 100 item scale, so each runs 0 to 100 and higher is more burnt out. The three scales are reported separately and are never added together. The last work-related item is reverse scored. A scale needs at least three answered items, or four on the work-related scale, before it is reported at all. Scores of 50 or more are widely treated as the working threshold for burnout, which is common practice rather than a cutoff the 2005 source publishes.',
    note: CBI_NOTE,
  };
}
