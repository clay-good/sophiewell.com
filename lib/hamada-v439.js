// spec-v439: the Hamada classification of rotator cuff tear arthropathy on shoulder radiographs, by the
// acromiohumeral interval and the glenohumeral / acromial changes — grades 1 / 2 / 3 / 4 / 5. It joins the
// shoulder imaging tiles (Goutallier). "hamada" / "cuff tear arthropathy grade" routed to nothing.
//
// This tile reports the ORIGINAL Hamada (1990) five-grade scheme. A later modification (Hamada 2011)
// subdivides grade 4 into 4A (glenohumeral arthritis without acetabularization) and 4B (with
// acetabularization); that subdivision is not reported here.
//
// HIGH-STAKES: this reports the radiographic GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic / shoulder team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Hamada K, Fukuda H, Mikasa M, Kobayashi Y. Roentgenographic findings in massive rotator cuff tears. A
//     long-term observation. Clin Orthop Relat Res. 1990;(254):92-96.
//   - Radiology / orthopedic references reproducing the same AHI>=6 (1) / AHI<=5 (2) / acetabularization (3)
//     / glenohumeral-arthritis (4) / humeral-head-collapse (5) grading.
//
// Grades (shoulder radiograph):
//   1 : acromiohumeral interval (AHI) 6 mm or more.
//   2 : AHI 5 mm or less.
//   3 : AHI 5 mm or less with acetabularization of the acromion undersurface.
//   4 : glenohumeral joint narrowing (arthritis).
//   5 : humeral head collapse (osteonecrosis of the humeral head).

const GRADES = {
  1: { grade: '1', text: 'Hamada grade 1 - acromiohumeral interval (AHI) 6 mm or more.' },
  2: { grade: '2', text: 'Hamada grade 2 - acromiohumeral interval 5 mm or less.' },
  3: { grade: '3', text: 'Hamada grade 3 - AHI 5 mm or less with acetabularization of the acromion undersurface.' },
  4: { grade: '4', text: 'Hamada grade 4 - glenohumeral joint narrowing (arthritis).' },
  5: { grade: '5', text: 'Hamada grade 5 - humeral head collapse (osteonecrosis of the humeral head).' },
};

const NOTE = 'The Hamada classification (Hamada 1990) grades rotator cuff tear arthropathy on shoulder radiographs. 1: acromiohumeral interval (AHI) >= 6 mm. 2: AHI <= 5 mm. 3: AHI <= 5 mm with acetabularization of the acromion. 4: glenohumeral arthritis. 5: humeral head collapse. A later modification subdivides grade 4 into 4A/4B. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
};

// input:
//   grade: '1' / '2' / '3' / '4' / '5'.
export function hamada(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Hamada grade (1, 2, 3, 4, or 5).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Hamada grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
