// spec-v338: ICRS (International Cartilage Repair Society) cartilage lesion classification, grades
// 0-4. The modern arthroscopic grading of a chondral defect by DEPTH — the standard used in
// cartilage-repair practice and research. It complements the Outerbridge classification (spec-v337):
// Outerbridge's original grades split II/III by lesion DIAMETER, whereas ICRS grades by the
// PERCENTAGE of cartilage depth involved and subdivides grade 3. The catalog now carries Outerbridge
// (and the Kellgren-Lawrence radiographic grade) but had no ICRS; "icrs" / "cartilage lesion grade"
// routed to nothing.
//
// HIGH-STAKES: this reports the cartilage GRADE the surgeon has determined at arthroscopy, NOT a
// diagnosis, a surgical recommendation, or an outcome prediction for an individual patient
// (spec-v11 §5.3). The cartilage-repair / management decision stays with the surgeon and the patient.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Brittberg M, Winalski CS. Evaluation of cartilage injuries and repair. J Bone Joint Surg Am.
//     2003;85-A(Suppl 2):58-69 (the ICRS cartilage lesion classification).
//   - ICRS grading reproductions (musculoskeletal-imaging references; ICRS Cartilage Injury
//     Evaluation Package) giving the same depth-based grade definitions and the grade-3 subdivisions
//     (3a >50% depth / 3b to the calcified layer / 3c to but not through subchondral bone / 3d
//     blisters), with grade 4 penetrating the subchondral bone.
//
// Grades (by depth of the chondral defect):
//   0: normal cartilage (smooth surface, normal consistency).
//   1: nearly normal — surface intact; softening/fibrillation, superficial indentation (1a) or
//      fissures/lacerations (1b).
//   2: abnormal — lesions extending down LESS than 50% of the cartilage depth; no exposed bone.
//   3: severely abnormal — defects MORE than 50% of cartilage depth (3a), down to the calcified
//      layer (3b), or down to but NOT through the subchondral bone (3c); subchondral plate intact.
//   4: severely abnormal — complete cartilage loss with the defect penetrating THROUGH the
//      subchondral bone plate (osteochondral).

const GRADES = {
  0: { grade: '0', full: false, text: 'ICRS grade 0 — normal cartilage (smooth surface, normal consistency).' },
  1: { grade: '1', full: false, text: 'ICRS grade 1 (nearly normal) — surface intact; softening/fibrillation with superficial indentation (1a) or fissures/lacerations (1b).' },
  2: { grade: '2', full: false, text: 'ICRS grade 2 (abnormal) — lesions extending down less than 50% of the cartilage depth; no exposed bone.' },
  3: { grade: '3', full: false, text: 'ICRS grade 3 (severely abnormal) — defects more than 50% of the cartilage depth (3a), down to the calcified layer (3b), or down to but not through the subchondral bone (3c); subchondral plate intact.' },
  4: { grade: '4', full: true, text: 'ICRS grade 4 (severely abnormal) — complete cartilage loss with the defect penetrating through the subchondral bone plate (osteochondral).' },
};

const NOTE = 'ICRS classification (International Cartilage Repair Society; Brittberg 2003) grades a chondral defect at arthroscopy by DEPTH. 0: normal. 1: nearly normal (surface intact, softening/superficial fissures). 2: abnormal (<50% of cartilage depth, no exposed bone). 3: severely abnormal (>50% depth, to the calcified layer, or to but not through subchondral bone; subdivided 3a-3d). 4: severely abnormal (complete loss, through the subchondral bone plate / osteochondral). ICRS grades by percentage of cartilage depth and subdivides grade 3, complementing the Outerbridge classification (whose original grades split by lesion diameter). This reports the grade the surgeon has determined, not a diagnosis, a surgical recommendation, or an outcome prediction.';

// input:
//   grade: 0-4 (numeric or string)
export function icrs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = /^[0-4]$/.test(raw) ? Number(raw) : null;
  const g = key == null ? null : GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the ICRS grade (0, 1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    fullThickness: g.full,
    abnormal: g.full,
    bandLabel: `ICRS grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
