// spec-v738: CAGE-AID (CAGE Adapted to Include Drugs).
//
// A 4-item yes/no screen for alcohol and other drug problems - the CAGE questions
// broadened to cover drug use.
// Source:
//   Brown RL, Rounds LA. Conjoint screening questionnaires for alcohol and other drug
//   abuse: criterion validity in a primary care practice. Wis Med J. 1995;94(3):135-140.
//   (PMID 7778330.) The CAGE-AID is in the public domain.
//
// Four yes/no items (Cut down, Annoyed, Guilty, Eye-opener), each scoring 1 point on a
// "yes", summed to 0-4. A total of 2 or more is a positive screen and warrants further
// assessment; higher = more concern. One or more affirmative answers may still merit inquiry.
//
// Pure: no DOM, no clock, no network.

export const CAGE_AID_NOTE = "CAGE-AID (CAGE Adapted to Include Drugs) (Brown RL, Rounds LA, Wis Med J 1995;94(3):135-140), a four-item yes/no screen for alcohol and other drug problems. The four items (Cut down, Annoyed, Guilty, Eye-opener) each score 1 point on a 'yes', summed to a total of 0 to 4. A total of 2 or more is a positive screen and warrants further assessment, with higher meaning more concern. It is a self-report screen, not a diagnosis, and it supports rather than replaces the clinical evaluation.";

function optYN(v) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (s === 'yes' || s === 'y' || s === 'true' || s === '1') return 'yes';
  if (s === 'no' || s === 'n' || s === 'false' || s === '0') return 'no';
  return null;
}

const ITEMS = ['q1', 'q2', 'q3', 'q4'];

export function cageAid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const k of ITEMS) {
    const v = optYN(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Answer ${k} yes or no.`, note: CAGE_AID_NOTE };
    }
    if (v === 'yes') total += 1;
  }

  // A total of 2 or more is the actionable, positive-screen state.
  const abnormal = total >= 2;
  const tier = abnormal ? 'positive' : 'negative';
  const range = abnormal ? '2-4' : '0-1';
  const label = abnormal ? 'positive screen' : 'negative screen';
  return {
    valid: true,
    score: total,
    tier,
    abnormal,
    bandLabel: `CAGE-AID ${total} of 4`,
    band: `CAGE-AID ${total} of 4 — ${label} (${range}).`,
    detail: abnormal
      ? 'Total 2 or more: positive screen - consider further assessment for an alcohol or drug problem.'
      : total === 1
        ? 'Total 1: below the positive-screen threshold, but a single affirmative answer may still warrant inquiry.'
        : 'Total 0: negative screen; reassess if concern arises.',
    note: CAGE_AID_NOTE,
  };
}
