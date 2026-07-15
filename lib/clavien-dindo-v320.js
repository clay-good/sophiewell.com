// spec-v320: Clavien-Dindo classification of surgical complications. The clinician selects
// the grade (I, II, IIIa, IIIb, IVa, IVb, V) from the intervention the complication
// required; the tile reports the grade and its standard definition. The catalog had no
// Clavien-Dindo tile ("clavien" had zero corpus hits); it is one of the most widely used
// surgical-outcome grading systems and the peer of the existing complication/severity
// classifications. "clavien dindo" / "surgical complication grade" routed to nothing.
//
// HIGH-STAKES: this reports the SEVERITY GRADE the clinician has assigned from the therapy
// the complication required, NOT a diagnosis or a management order (spec-v11 §5.3).
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Dindo D, Demartines N, Clavien PA. Classification of surgical complications: a new
//     proposal with evaluation in a cohort of 6336 patients and results of a survey. Ann
//     Surg. 2004;240(2):205-213.
//   - Clavien PA, Barkun J, de Oliveira ML, et al. The Clavien-Dindo classification of
//     surgical complications: five-year experience. Ann Surg. 2009;250(2):187-196.
//
// Grades (based on the therapy needed to treat the complication):
//   I    : any deviation from the normal postoperative course without the need for
//          pharmacological treatment or surgical/endoscopic/radiological intervention;
//          allowed regimens are antiemetics, antipyretics, analgesics, diuretics,
//          electrolytes, and physiotherapy (and bedside wound opening).
//   II   : requiring pharmacological treatment with drugs beyond those allowed for grade I
//          (includes blood transfusions and total parenteral nutrition).
//   IIIa : requiring surgical, endoscopic, or radiological intervention, NOT under
//          general anesthesia.
//   IIIb : the same intervention UNDER general anesthesia.
//   IVa  : life-threatening complication requiring IC/ICU management, single-organ
//          dysfunction (including dialysis).
//   IVb  : life-threatening complication requiring IC/ICU management, multiorgan dysfunction.
//   V    : death of the patient.

const GRADES = {
  I: {
    label: 'Clavien-Dindo grade I',
    text: 'Clavien-Dindo grade I — any deviation from the normal postoperative course without the need for pharmacological treatment or surgical, endoscopic, or radiological intervention. Allowed regimens: antiemetics, antipyretics, analgesics, diuretics, electrolytes, physiotherapy; and wound infections opened at the bedside.',
    severe: false,
  },
  II: {
    label: 'Clavien-Dindo grade II',
    text: 'Clavien-Dindo grade II — requiring pharmacological treatment with drugs beyond those allowed for grade I, including blood transfusions and total parenteral nutrition.',
    severe: false,
  },
  IIIa: {
    label: 'Clavien-Dindo grade IIIa',
    text: 'Clavien-Dindo grade IIIa — requiring surgical, endoscopic, or radiological intervention, not under general anesthesia.',
    severe: false,
  },
  IIIb: {
    label: 'Clavien-Dindo grade IIIb',
    text: 'Clavien-Dindo grade IIIb — requiring surgical, endoscopic, or radiological intervention under general anesthesia.',
    severe: true,
  },
  IVa: {
    label: 'Clavien-Dindo grade IVa',
    text: 'Clavien-Dindo grade IVa — life-threatening complication requiring intermediate-care or ICU management, with single-organ dysfunction (including dialysis).',
    severe: true,
  },
  IVb: {
    label: 'Clavien-Dindo grade IVb',
    text: 'Clavien-Dindo grade IVb — life-threatening complication requiring intermediate-care or ICU management, with multiorgan dysfunction.',
    severe: true,
  },
  V: {
    label: 'Clavien-Dindo grade V',
    text: 'Clavien-Dindo grade V — death of the patient.',
    severe: true,
  },
};

const NOTE = 'Clavien-Dindo classification of surgical complications (Dindo 2004, Ann Surg), graded by the therapy the complication required. I: no treatment beyond antiemetics/antipyretics/analgesics/diuretics/electrolytes/physiotherapy (or bedside wound opening). II: pharmacological treatment beyond grade I (includes transfusion and TPN). IIIa: surgical/endoscopic/radiological intervention not under general anesthesia; IIIb: under general anesthesia. IVa: life-threatening, single-organ dysfunction (including dialysis); IVb: multiorgan dysfunction. V: death. A "d" suffix (disability) marks a complication still present at discharge. This reports the grade the clinician has assigned, not a diagnosis or a management order.';

// input:
//   grade: 'I' | 'II' | 'IIIa' | 'IIIb' | 'IVa' | 'IVb' | 'V' (case-insensitive; the
//     sub-grade letter may be upper or lower case, e.g. 'IIIA')
export function clavienDindo(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  // Normalize the sub-grade suffix (IIIA -> IIIa) to match the table keys.
  raw = raw.replace(/(III|IV)([AB])$/, (_, base, sub) => base + sub.toLowerCase());
  const g = GRADES[raw];
  if (!g) {
    return { valid: false, message: 'Select the Clavien-Dindo grade (I, II, IIIa, IIIb, IVa, IVb, or V).' };
  }
  return {
    valid: true,
    grade: raw,
    severe: g.severe,
    abnormal: g.severe,
    bandLabel: g.label,
    band: g.text,
    note: NOTE,
  };
}
