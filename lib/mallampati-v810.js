// spec-v810: modified Mallampati classification of the oropharyngeal view.
//
// Sources:
//   Mallampati SR, Gatt SP, Gugino LD, et al. A clinical sign to predict difficult tracheal
//     intubation: a prospective study. Can Anaesth Soc J. 1985;32(4):429-434. (The ORIGINAL,
//     which had THREE classes.)
//   Samsoon GL, Young JR. Difficult tracheal intubation: a retrospective study.
//     Anaesthesia. 1987;42(5):487-490. (Added class IV. This four-class version is what
//     "Mallampati" now means in practice.)
//   Lundstrom LH, Vester-Andersen M, Moller AM, Charuluxananan S, L'Hermite J, Wetterslev J.
//     Poor prognostic value of the modified Mallampati score: a meta-analysis involving
//     177088 patients. Br J Anaesth. 2011;107(5):659-667. (PMID 21948956.)
//
// THE POINT OF THIS TILE IS THE SECOND HALF OF THE ANSWER. Pooled across 55 studies and
// 177,088 patients the modified Mallampati score has a sensitivity of 0.35 and a specificity
// of 0.91 for difficult tracheal intubation. Two thirds of difficult airways look reassuring
// on this test. The meta-analysis concluded it is inadequate as a STAND-ALONE test and
// belongs inside a multivariable assessment.
//
// So this tile returns the class and, in the same breath, what the class is and is not
// worth. A class I that is read as "this airway is fine" is the failure mode; the numbers
// are attached to every result, not filed under a citation.
//
// Pure: no DOM, no clock, no network.

export const MALLAMPATI_NOTE = 'The modified Mallampati classification (Mallampati SR, Gatt SP, Gugino LD, et al, Can Anaesth Soc J 1985;32(4):429-434, as modified by Samsoon GL and Young JR, Anaesthesia 1987;42(5):487-490) grades how much of the oropharynx is visible with the patient sitting, head neutral, mouth open as wide as possible and tongue out, without phonating. Class I shows the soft palate, fauces, uvula and pillars; class II the soft palate, fauces and uvula; class III the soft palate and only the base of the uvula; class IV the hard palate alone. Classes III and IV are the ones associated with a difficult direct laryngoscopy. What matters as much as the class is how little it settles: pooled across 55 studies and 177088 patients the score has a sensitivity of 0.35 and a specificity of 0.91 for difficult tracheal intubation, so roughly two thirds of difficult airways look reassuring on this test, and the meta-analysis concluded it is inadequate as a stand-alone test and belongs inside a multivariable assessment. A reassuring class is not clearance. It records a bedside observation and it does not plan an airway or choose a technique.';

const CLASSES = {
  1: {
    roman: 'I',
    view: 'soft palate, fauces, uvula and pillars visible',
    predicts: 'usually an easy direct laryngoscopy',
    difficult: false,
  },
  2: {
    roman: 'II',
    view: 'soft palate, fauces and uvula visible; the pillars are hidden by the tongue',
    predicts: 'usually an easy direct laryngoscopy',
    difficult: false,
  },
  3: {
    roman: 'III',
    view: 'soft palate and only the base of the uvula visible',
    predicts: 'associated with a difficult direct laryngoscopy',
    difficult: true,
  },
  4: {
    roman: 'IV',
    view: 'hard palate only; the soft palate is not visible',
    predicts: 'associated with the greatest difficulty at direct laryngoscopy',
    difficult: true,
  },
};

const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4 };

// Pooled figures from Lundstrom 2011. Reported alongside every class on purpose.
export const MALLAMPATI_SENSITIVITY = 0.35;
export const MALLAMPATI_SPECIFICITY = 0.91;

export function mallampati(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.mallampatiClass == null ? '' : o.mallampatiClass).trim().toLowerCase();
  if (!raw) return { valid: false, message: 'Choose the class that matches the view.' };

  const n = Object.prototype.hasOwnProperty.call(ROMAN, raw) ? ROMAN[raw] : Number(raw);
  const c = CLASSES[n];
  if (!c) return { valid: false, message: 'The modified Mallampati classification has four classes, I to IV.' };

  return {
    valid: true,
    classNumber: n,
    code: `Modified Mallampati class ${c.roman}`,
    view: c.view,
    predictsDifficulty: c.difficult,
    sensitivity: MALLAMPATI_SENSITIVITY,
    specificity: MALLAMPATI_SPECIFICITY,
    abnormal: c.difficult,
    bandLabel: `Class ${c.roman}`,
    band: `Modified Mallampati class ${c.roman} — ${c.view}. This class is ${c.predicts}.`,
    // The same caveat rides on EVERY class, including the reassuring ones, because a
    // reassuring class being read as clearance is the failure this tile exists to prevent.
    detail: `This does not settle the airway either way. Pooled across 55 studies and 177,088 patients the modified Mallampati score has a sensitivity of ${MALLAMPATI_SENSITIVITY.toFixed(2)} and a specificity of ${MALLAMPATI_SPECIFICITY.toFixed(2)} for difficult tracheal intubation, so about two thirds of difficult airways look reassuring on it. The meta-analysis concluded it is inadequate as a stand-alone test and belongs inside a multivariable assessment.${c.difficult ? '' : ' A reassuring class is not clearance.'}`,
    note: MALLAMPATI_NOTE,
  };
}
