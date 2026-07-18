// spec-v421: SUN (Standardization of Uveitis Nomenclature) anterior chamber cell grade, the grading of
// inflammatory cells in the anterior chamber by the number of cells counted in a 1 mm by 1 mm slit-lamp beam
// field — grades 0 / 0.5+ / 1+ / 2+ / 3+ / 4+. It is the standard way anterior-chamber inflammation is
// recorded in uveitis. It joins the ophthalmology tiles (shaffer-angle). "SUN anterior chamber cells" /
// "anterior chamber cell grade" routed to nothing.
//
// HIGH-STAKES: this reports the GRADE from the cell count the clinician has observed at the slit lamp, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// uveitis-management decision stays with the ophthalmology team. It grades anterior chamber CELLS (the
// activity of inflammation), a separate scale from anterior chamber FLARE.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Jabs DA, Nussenblatt RB, Rosenbaum JT; Standardization of Uveitis Nomenclature (SUN) Working Group.
//     Standardization of uveitis nomenclature for reporting clinical data. Results of the First International
//     Workshop. Am J Ophthalmol. 2005;140(3):509-516.
//   - Ophthalmology / uveitis references reproducing the same <1 (0) / 1-5 (0.5+) / 6-15 (1+) / 16-25 (2+) /
//     26-50 (3+) / >50 (4+) cell-count grouping.
//
// Grades (cells counted in a 1 mm by 1 mm slit-lamp beam field):
//   0    : less than 1 cell.
//   0.5+ : 1 to 5 cells.
//   1+   : 6 to 15 cells.
//   2+   : 16 to 25 cells.
//   3+   : 26 to 50 cells.
//   4+   : more than 50 cells.

const GRADES = {
  '0': { grade: '0', text: 'SUN anterior chamber cell grade 0 - less than 1 cell in the field.' },
  '0.5+': { grade: '0.5+', text: 'SUN anterior chamber cell grade 0.5+ - 1 to 5 cells in the field.' },
  '1+': { grade: '1+', text: 'SUN anterior chamber cell grade 1+ - 6 to 15 cells in the field.' },
  '2+': { grade: '2+', text: 'SUN anterior chamber cell grade 2+ - 16 to 25 cells in the field.' },
  '3+': { grade: '3+', text: 'SUN anterior chamber cell grade 3+ - 26 to 50 cells in the field.' },
  '4+': { grade: '4+', text: 'SUN anterior chamber cell grade 4+ - more than 50 cells in the field.' },
};

const NOTE = 'The SUN (Standardization of Uveitis Nomenclature, 2005) anterior chamber cell grade grades anterior-chamber inflammatory cells by the number counted in a 1 mm by 1 mm slit-lamp beam field. 0: less than 1 cell. 0.5+: 1 to 5. 1+: 6 to 15. 2+: 16 to 25. 3+: 26 to 50. 4+: more than 50. This grades cells (inflammatory activity), a separate scale from anterior chamber flare, and reports the grade from the count the clinician has observed, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  '0': '0',
  '0.5': '0.5+', '0.5+': '0.5+', '.5': '0.5+', '.5+': '0.5+', 'TRACE': '0.5+',
  '1': '1+', '1+': '1+',
  '2': '2+', '2+': '2+',
  '3': '3+', '3+': '3+',
  '4': '4+', '4+': '4+',
};

// input:
//   grade: '0' / '0.5+' / '1+' / '2+' / '3+' / '4+' (also accepts the bare numbers and 'trace' for 0.5+).
export function sunAcCell(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the SUN anterior chamber cell grade (0, 0.5+, 1+, 2+, 3+, or 4+).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `SUN anterior chamber cell grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
