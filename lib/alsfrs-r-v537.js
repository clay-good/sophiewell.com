// spec-v537: the ALS Functional Rating Scale - Revised (ALSFRS-R). WHOLE-DISEASE GAP: "alsfrs",
// "amyotrophic", and "cedarbaum" were all zero-hit across corpus.json, app.js, and lib/meta.js. The catalog
// had no ALS instrument at all, and its nearest neuro function scales measure other diseases entirely --
// ONLS for neuropathy, EDSS for multiple sclerosis, modified Rankin for stroke, Schwab and England for
// Parkinson disease.
//
// TWELVE ITEMS, EACH 0-4, TOTAL 0-48. Higher is BETTER: 48 is normal function and 0 is complete loss. That
// direction is worth stating because most scored instruments in this catalog run the other way, and a reader
// who assumes "higher is worse" will read a declining patient as improving.
//
// WHAT THE REVISION CHANGED, AND WHY IT MATTERS FOR READING OLDER RECORDS: the original ALSFRS gave three
// questions each to upper-limb, lower-limb, and bulbar function but only ONE to respiration, which
// underweighted the domain that actually determines survival. The revision replaced that single breathing
// item with THREE -- dyspnea, orthopnea, and respiratory insufficiency -- taking the scale from 10 items and
// a maximum of 40 to 12 items and a maximum of 48. A score of 40 therefore means the top of the scale on the
// original instrument and a substantial deficit on the revised one, so a total copied from an older note
// without its denominator is uninterpretable. This tile always reports the total AS a fraction of 48.
//
// **ITEM 5 IS TWO ALTERNATIVE SCALES, NOT TWO ITEMS.** Cutting food and handling utensils is scored on one
// of two mutually exclusive versions depending on whether the patient HAS A GASTROSTOMY: 5a for patients
// without one, describing food handling, and 5b for patients with one, describing manipulating closures and
// fasteners. Exactly ONE is scored and it contributes a single 0-4 to the total. Scoring both would produce a
// maximum of 52 and silently inflate every gastrostomy patient. This tile asks about the gastrostomy first,
// shows only the applicable scale, and reports which one it used.
//
// HIGH-STAKES: it measures FUNCTION, not disease severity, not prognosis for an individual, and not the
// diagnosis. It does not diagnose ALS, which rests on clinical and electrophysiologic criteria and on
// excluding mimics. It does not measure respiratory function -- the three respiratory items ask what the
// patient reports and what support they use, which is not a vital capacity, and a patient can score well on
// them with a significantly reduced forced vital capacity, so it is not a substitute for respiratory testing
// or a trigger for ventilation decisions. It also weights nothing for cognition or behavior, so
// frontotemporal involvement is invisible to it. The rate of change over time is what trials use, and a
// single total says little on its own; this tile scores one time point and does not compute a slope
// (spec-v11 section 5.3). Care decisions stay with the clinician and the patient.
//
// ITEMS AND ALL OPTION WORDINGS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// sources agreeing on every one of the sixty options, including a reproduction by the scale's own first
// author:
//   - Cedarbaum JM, Stambler N, Malta E, et al. The ALSFRS-R: a revised ALS functional rating scale that
//     incorporates assessments of respiratory function. BDNF ALS Study Group (Phase III). J Neurol Sci.
//     1999;169(1-2):13-21.
//   - A reproduction of the full instrument by Cedarbaum, and an independent journal table of the original
//     ALSFRS-R alongside a translation.

const opts = (...texts) => texts.map((text, i) => ({ value: String(4 - i), text: `${4 - i} - ${text}` }));

export const ALSFRS_ITEMS = [
  {
    key: 'speech', text: 'Speech',
    options: opts('Normal speech processes', 'Detectable speech disturbance', 'Intelligible with repeating',
      'Speech combined with nonvocal communication', 'Loss of useful speech'),
  },
  {
    key: 'salivation', text: 'Salivation',
    options: opts('Normal', 'Slight but definite excess of saliva in mouth; may have nighttime drooling',
      'Moderately excessive saliva; may have minimal drooling', 'Marked excess of saliva with some drooling',
      'Marked drooling; requires constant tissue or handkerchief'),
  },
  {
    key: 'swallowing', text: 'Swallowing',
    options: opts('Normal eating habits', 'Early eating problems, occasional choking',
      'Dietary consistency changes', 'Needs supplemental tube feeding',
      'Nothing by mouth, exclusively parenteral or enteral feeding'),
  },
  {
    key: 'handwriting', text: 'Handwriting',
    options: opts('Normal', 'Slow or sloppy; all words are legible', 'Not all words are legible',
      'Able to grip pen but unable to write', 'Unable to grip pen'),
  },
  {
    key: 'cuttingNoGastrostomy', text: 'Cutting food and handling utensils (patients WITHOUT a gastrostomy)',
    scale: 'no-gastrostomy',
    options: opts('Normal', 'Somewhat slow and clumsy, but no help needed',
      'Can cut most foods, although clumsy and slow; some help needed',
      'Food must be cut by someone, but can still feed slowly', 'Needs to be fed'),
  },
  {
    key: 'cuttingWithGastrostomy', text: 'Cutting food and handling utensils (alternate scale, patients WITH a gastrostomy)',
    scale: 'gastrostomy',
    options: opts('Normal', 'Clumsy but able to perform all manipulations independently',
      'Some help needed with closures and fasteners', 'Provides minimal assistance to caregiver',
      'Unable to perform any aspect of task'),
  },
  {
    key: 'dressing', text: 'Dressing and hygiene',
    options: opts('Normal function', 'Independent and complete self-care with effort or decreased efficiency',
      'Intermittent assistance or substitute methods', 'Needs attendant for self-care', 'Total dependence'),
  },
  {
    key: 'turningInBed', text: 'Turning in bed and adjusting bed clothes',
    options: opts('Normal', 'Somewhat slow and clumsy, but no help needed',
      'Can turn alone or adjust sheets, but with great difficulty',
      'Can initiate, but not turn or adjust sheets alone', 'Helpless'),
  },
  {
    key: 'walking', text: 'Walking',
    options: opts('Normal', 'Early ambulation difficulties', 'Walks with assistance',
      'Nonambulatory functional movement only', 'No purposeful leg movement'),
  },
  {
    key: 'stairs', text: 'Climbing stairs',
    options: opts('Normal', 'Slow', 'Mild unsteadiness or fatigue', 'Needs assistance', 'Cannot do'),
  },
  {
    key: 'dyspnea', text: 'Dyspnea', respiratory: true,
    options: opts('None', 'Occurs when walking',
      'Occurs with one or more of the following: eating, bathing, dressing',
      'Occurs at rest, difficulty breathing when either sitting or lying',
      'Significant difficulty, considering using mechanical respiratory support'),
  },
  {
    key: 'orthopnea', text: 'Orthopnea', respiratory: true,
    options: opts('None',
      'Some difficulty sleeping at night due to shortness of breath. Does not routinely use more than two pillows',
      'Needs extra pillows in order to sleep (more than two)', 'Can only sleep sitting up', 'Unable to sleep'),
  },
  {
    key: 'respiratoryInsufficiency', text: 'Respiratory insufficiency', respiratory: true,
    options: opts('None', 'Intermittent use of BiPAP', 'Continuous use of BiPAP during the night',
      'Continuous use of BiPAP during the night and day',
      'Invasive mechanical ventilation by intubation or tracheostomy'),
  },
];

const MAX_TOTAL = 48;

// The item that is scored on one of two alternative scales, never both.
const CUTTING_KEYS = { 'no-gastrostomy': 'cuttingNoGastrostomy', gastrostomy: 'cuttingWithGastrostomy' };

// The 12 scored items are all items except whichever cutting scale does not apply.
export function itemsFor(hasGastrostomy) {
  const drop = hasGastrostomy ? 'cuttingNoGastrostomy' : 'cuttingWithGastrostomy';
  return ALSFRS_ITEMS.filter((i) => i.key !== drop);
}

const NOTE = 'The ALSFRS-R (Cedarbaum and colleagues 1999) rates twelve functions from 0 to 4 for a total of 0 to 48, and HIGHER IS BETTER: 48 is normal function and 0 is complete loss, which is the opposite direction from most scored instruments. The revision replaced the original scale’s single breathing question with three, dyspnea, orthopnea, and respiratory insufficiency, because the original gave three questions each to upper limb, lower limb, and bulbar function but only one to respiration. That took the scale from ten items with a maximum of 40 to twelve items with a maximum of 48, so a total of 40 means the top of the original scale and a substantial deficit on the revised one, and a total copied from an older note without its denominator cannot be interpreted. Cutting food and handling utensils is scored on one of two alternative scales depending on whether the patient has a gastrostomy, and exactly one of them is scored: counting both would give a maximum of 52 and inflate every gastrostomy patient. This measures function. It does not diagnose ALS, which rests on clinical and electrophysiologic criteria and on excluding mimics, and it does not measure respiratory function: the three respiratory items ask what the patient reports and what support they use rather than a vital capacity, so a patient can score well on them with a significantly reduced forced vital capacity, and the scale is not a substitute for respiratory testing or a trigger for ventilation decisions. It weights nothing for cognition or behavior, so frontotemporal involvement is invisible to it. Trials use the rate of change over time, and a single total says little on its own; this scores one time point and does not compute a slope.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

function readItem(item, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}

// input:
//   hasGastrostomy: yes/no -- selects WHICH cutting scale is scored. Required.
//   one key per item in itemsFor(hasGastrostomy), each 0-4.
export function alsfrsR(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const gastro = readBool(o.hasGastrostomy);
  if (gastro === null) {
    return { valid: false, message: 'Say whether the patient has a gastrostomy: it selects which of the two alternative scales is used for cutting food, and exactly one of them is scored.' };
  }
  if (Number.isNaN(gastro)) {
    return { valid: false, message: 'The gastrostomy answer must be yes or no.' };
  }

  const items = itemsFor(gastro);
  const scored = items.map((item) => ({ item, points: readItem(item, o[item.key]) }));

  const missing = scored.filter((s) => s.points === null);
  if (missing.length) {
    return { valid: false, message: `Score all twelve items. Still needed: ${missing.map((s) => s.item.key).join(', ')}.` };
  }
  const bad = scored.filter((s) => Number.isNaN(s.points));
  if (bad.length) {
    return { valid: false, message: `Each item must be a whole number from 0 to 4. Unrecognized: ${bad.map((s) => s.item.key).join(', ')}.` };
  }

  const total = scored.reduce((a, s) => a + s.points, 0);
  const respiratory = scored.filter((s) => s.item.respiratory).reduce((a, s) => a + s.points, 0);
  const cuttingScale = gastro ? 'gastrostomy' : 'no-gastrostomy';

  return {
    valid: true,
    total,
    max: MAX_TOTAL,
    respiratorySubscore: respiratory,
    cuttingScale,
    cuttingItem: CUTTING_KEYS[cuttingScale],
    bandLabel: `ALSFRS-R ${total} of ${MAX_TOTAL}`,
    band: `ALSFRS-R ${total} of ${MAX_TOTAL}, where 48 is normal function and 0 is complete loss. Respiratory subscore ${respiratory} of 12. Scored using the ${gastro ? 'gastrostomy' : 'no-gastrostomy'} version of the cutting-food item, which is the one that applies. Always report this total out of 48: the original ALSFRS ran to 40, so a bare number from an older record is not comparable. It measures function, not diagnosis, prognosis, or respiratory capacity.`,
    note: NOTE,
  };
}
