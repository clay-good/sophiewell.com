// spec-v422: SUN (Standardization of Uveitis Nomenclature) anterior chamber flare grade, the grading of
// aqueous flare (the scatter of the slit-lamp beam by protein in the anterior chamber) — grades
// 0 / 1+ / 2+ / 3+ / 4+. It is the standard way anterior-chamber flare is recorded in uveitis, the companion
// scale to the SUN anterior chamber CELL grade (sun-ac-cell). "SUN anterior chamber flare" /
// "aqueous flare grade" routed to nothing.
//
// HIGH-STAKES: this reports the GRADE from the flare the clinician has observed at the slit lamp, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// uveitis-management decision stays with the ophthalmology team. It grades FLARE (protein leak), a separate
// scale from anterior chamber cells (inflammatory activity).
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Jabs DA, Nussenblatt RB, Rosenbaum JT; Standardization of Uveitis Nomenclature (SUN) Working Group.
//     Standardization of uveitis nomenclature for reporting clinical data. Results of the First International
//     Workshop. Am J Ophthalmol. 2005;140(3):509-516.
//   - Ophthalmology / uveitis references reproducing the same none (0) / faint (1+) / moderate (2+) /
//     marked (3+) / intense (4+) flare grouping.
//
// Grades (aqueous flare at the slit lamp):
//   0  : none.
//   1+ : faint.
//   2+ : moderate (iris and lens details clear).
//   3+ : marked (iris and lens details hazy).
//   4+ : intense (fibrin or plasmoid aqueous).

const GRADES = {
  '0': { grade: '0', text: 'SUN anterior chamber flare grade 0 - no flare.' },
  '1+': { grade: '1+', text: 'SUN anterior chamber flare grade 1+ - faint flare.' },
  '2+': { grade: '2+', text: 'SUN anterior chamber flare grade 2+ - moderate flare (iris and lens details clear).' },
  '3+': { grade: '3+', text: 'SUN anterior chamber flare grade 3+ - marked flare (iris and lens details hazy).' },
  '4+': { grade: '4+', text: 'SUN anterior chamber flare grade 4+ - intense flare (fibrin or plasmoid aqueous).' },
};

const NOTE = 'The SUN (Standardization of Uveitis Nomenclature, 2005) anterior chamber flare grade grades aqueous flare, the scatter of the slit-lamp beam by anterior-chamber protein. 0: none. 1+: faint. 2+: moderate (iris and lens details clear). 3+: marked (iris and lens details hazy). 4+: intense (fibrin or plasmoid aqueous). This grades flare (protein leak), a separate scale from anterior chamber cells, and reports the grade the clinician has observed, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  '0': '0', 'NONE': '0',
  '1': '1+', '1+': '1+',
  '2': '2+', '2+': '2+',
  '3': '3+', '3+': '3+',
  '4': '4+', '4+': '4+',
};

// input:
//   grade: '0' / '1+' / '2+' / '3+' / '4+' (also accepts the bare numbers and 'none' for 0).
export function sunAcFlare(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the SUN anterior chamber flare grade (0, 1+, 2+, 3+, or 4+).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `SUN anterior chamber flare grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
