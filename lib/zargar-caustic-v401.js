// spec-v401: Zargar (modified) endoscopic classification of caustic / corrosive esophagogastric injury,
// by the depth and extent of mucosal burn seen at endoscopy — grades 0 / 1 / 2a / 2b / 3a / 3b / 4. A
// grading of the injury a clinician has seen on endoscopy after a corrosive ingestion. "zargar" / "caustic
// ingestion grade" / "corrosive injury endoscopy grade" routed to nothing.
//
// HIGH-STAKES: this reports the endoscopic GRADE the clinician has determined at endoscopy, NOT a
// diagnosis, a management decision, or a prognosis for an individual patient (spec-v11 §5.3). Higher grades
// (2b and above) are classically associated with a higher risk of stricture and worse outcome, but this
// reports the grade; the management decision stays with the gastroenterology / surgery team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Zargar SA, Kochhar R, Mehta S, Mehta SK. The role of fiberoptic endoscopy in the management of
//     corrosive ingestion and modified endoscopic classification of burns. Gastrointest Endosc.
//     1991;37(2):165-169 (the modified 0 / 1 / 2a / 2b / 3a / 3b grading; grade 4 = perforation).
//   - Gastroenterology / toxicology references reproducing the same edema-hyperemia (1) / superficial (2a)
//     / deep or circumferential (2b) / focal necrosis (3a) / extensive necrosis (3b) / perforation (4)
//     grouping.
//
// Grades (endoscopic appearance of the caustic burn):
//   0  : normal mucosa.
//   1  : mucosal edema and hyperemia (erythema).
//   2a : superficial injury - erosions, friability, blisters, exudate, whitish membranes, superficial
//        ulceration, hemorrhage.
//   2b : grade 2a plus deep discrete or circumferential ulceration.
//   3a : focal necrosis - multiple ulcerations and small scattered areas of necrosis (brownish-black or
//        grayish discoloration).
//   3b : extensive necrosis.
//   4  : perforation.

const GRADES = {
  0: { grade: '0', text: 'Zargar grade 0 - normal mucosa.' },
  1: { grade: '1', text: 'Zargar grade 1 - mucosal edema and hyperemia (erythema).' },
  '2A': { grade: '2a', text: 'Zargar grade 2a - superficial injury: erosions, friability, blisters, exudate, whitish membranes, superficial ulceration, hemorrhage.' },
  '2B': { grade: '2b', text: 'Zargar grade 2b - grade 2a plus deep discrete or circumferential ulceration.' },
  '3A': { grade: '3a', text: 'Zargar grade 3a - focal necrosis: multiple ulcerations and small scattered areas of necrosis (brownish-black or grayish discoloration).' },
  '3B': { grade: '3b', text: 'Zargar grade 3b - extensive necrosis.' },
  4: { grade: '4', text: 'Zargar grade 4 - perforation.' },
};

const NOTE = 'The modified Zargar classification (Zargar 1991) grades a caustic / corrosive esophagogastric injury by the endoscopic depth and extent of the burn. 0: normal. 1: edema / hyperemia. 2a: superficial (erosions, exudate, superficial ulcers). 2b: deep discrete or circumferential ulceration. 3a: focal necrosis. 3b: extensive necrosis. 4: perforation. Higher grades (2b and above) are classically associated with a higher stricture risk and worse outcome, but this reports the grade the clinician has determined, not a diagnosis, a management decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 4: '4',
  '2A': '2A', '2B': '2B', '3A': '3A', '3B': '3B',
  I: '1', IIA: '2A', IIB: '2B', IIIA: '3A', IIIB: '3B',
};

// input:
//   grade: '0' / '1' / '2a' / '2b' / '3a' / '3b' / '4' (case-insensitive). Bare '2' or '3' is ambiguous
//   and returns invalid — the clinician must specify the a / b sub-grade.
export function zargarCaustic(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Zargar grade (0, 1, 2a, 2b, 3a, 3b, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Zargar grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
