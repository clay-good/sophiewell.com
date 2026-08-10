// spec-v679: GerdQ (Gastroesophageal Reflux Disease Questionnaire).
//
// A six-item, patient-reported screen for gastroesophageal reflux disease, scored over
// the past 7 days. Source:
//   Jones R, Junghard O, Dent J, et al. Development of the GerdQ, a tool for the
//   diagnosis and management of gastro-oesophageal reflux disease in primary care.
//   Aliment Pharmacol Ther. 2009;30(10):1030-1038. (PMID 19737151.)
//
// Each item records how many of the last 7 days the symptom occurred, on four bands:
//   0 days = band 0, 1 day = band 1, 2-3 days = band 2, 4-7 days = band 3.
//
// FOUR POSITIVE predictors score with the band directly (0/1/2/3): heartburn,
// regurgitation, reflux-related sleep disturbance, and extra over-the-counter reflux
// medication. TWO NEGATIVE predictors are REVERSE-scored (3/2/1/0) because they point
// away from reflux: epigastric pain and nausea. Total 0-18.
//   >= 8 marks a high likelihood of GERD. Approximate probability of GERD by band
//   (Jones 2009): 0-2 ~0%, 3-7 ~50%, 8-10 ~79%, 11-18 ~89%.
// An IMPACT subscore (sleep disturbance + OTC medication, 0-6) gauges how much the
// reflux affects daily life.
//
// This tile implements the published SCORING METHOD only; it uses neutral field labels
// and does not reproduce the copyrighted questionnaire wording. Pure: no DOM, no clock,
// no network.

export const GERDQ_NOTE = 'GerdQ, the six-item Gastroesophageal Reflux Disease Questionnaire (Jones R, Junghard O, Dent J, et al, Aliment Pharmacol Ther 2009;30(10):1030-1038). Each item records on how many of the past 7 days a symptom occurred (0 days, 1 day, 2 to 3 days, or 4 to 7 days). Four positive predictors score 0 to 3 with frequency (heartburn, regurgitation, reflux-related sleep disturbance, and extra over-the-counter reflux medication), and two negative predictors are reverse-scored 3 to 0 because they point away from reflux (epigastric pain and nausea), for a total of 0 to 18. A score of 8 or more marks a high likelihood of GERD; the approximate probability of GERD by score band in the derivation is about 0 percent for 0 to 2, 50 percent for 3 to 7, 79 percent for 8 to 10, and 89 percent for 11 to 18. An impact subscore (sleep disturbance plus over-the-counter medication, 0 to 6) gauges how much the reflux affects daily life and can support escalating therapy. It is a primary-care screening aid for typical reflux symptoms, not a substitute for endoscopy or pH testing, and alarm features still warrant investigation; it supports rather than replaces clinical judgment.';

function band(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return null;
  return n;
}

const FIELDS = ['heartburn', 'regurgitation', 'epigastric', 'nausea', 'sleep', 'medication'];

function likelihood(total) {
  if (total <= 2) return 'about 0%';
  if (total <= 7) return 'about 50%';
  if (total <= 10) return 'about 79%';
  return 'about 89%';
}

export function gerdq(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const b = {};
  for (const f of FIELDS) {
    const v = band(o[f]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: f, message: `Select how many days in the past week: ${f} (0, 1, 2-3, or 4-7 days).`, note: GERDQ_NOTE };
    }
    b[f] = v;
  }

  // Positive predictors use the band directly; negative predictors are reverse-scored.
  const positive = b.heartburn + b.regurgitation + b.sleep + b.medication;
  const negative = (3 - b.epigastric) + (3 - b.nausea);
  const total = positive + negative;
  const impact = b.sleep + b.medication;
  const likely = total >= 8;

  return {
    valid: true,
    score: total,
    impact,
    abnormal: likely,
    likelihood: likelihood(total),
    bandLabel: `GerdQ ${total}`,
    band: `GerdQ ${total}/18 — ${likely ? 'high likelihood of GERD' : 'lower likelihood of GERD'} (approx. probability ${likelihood(total)}).`,
    detail: `${likely ? 'Score 8 or more: a high likelihood of GERD; consider a trial of therapy and review.' : 'Score under 8: reflux is a less likely explanation; reassess if symptoms persist.'} Impact subscore ${impact}/6 (sleep disturbance + over-the-counter medication)${impact >= 3 ? ' — meaningful effect on daily life.' : '.'}`,
    note: GERDQ_NOTE,
  };
}
