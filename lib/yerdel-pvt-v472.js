// spec-v472: the Yerdel classification of portal vein thrombosis (PVT), by the extent of thrombus in the
// portal vein and superior mesenteric vein (SMV) — grades 1 / 2 / 3 / 4. It is the standard grading used in
// liver-transplant assessment and companions the portal-hypertension tiles. "yerdel" / "portal vein
// thrombosis grade" routed to nothing.
//
// HIGH-STAKES: this reports the imaging GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// hepatology / transplant team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Yerdel MA, Gunson B, Mirza D, et al. Portal vein thrombosis in adults undergoing liver transplantation:
//     risk factors, screening, management, and outcome. Transplantation. 2000;69(9):1873-1881.
//   - Hepatology / transplant references reproducing the same partial-<=50% (1) / >50%-or-total (2) /
//     PV-plus-proximal-SMV (3) / PV-plus-entire-SMV (4) grading.
//
// Grades (extent of thrombus):
//   1 : partial thrombosis of the portal vein involving 50% or less of the lumen, with or without minimal
//       extension into the superior mesenteric vein (SMV).
//   2 : more than 50% occlusion of the portal vein, including total occlusion, with or without minimal
//       extension into the SMV.
//   3 : complete thrombosis of both the portal vein and the proximal SMV, with a patent distal SMV.
//   4 : complete thrombosis of the portal vein and the entire SMV (both proximal and distal).

const GRADES = {
  1: { grade: '1', text: 'Yerdel grade 1 - partial thrombosis of the portal vein involving 50% or less of the lumen, with or without minimal extension into the superior mesenteric vein (SMV).' },
  2: { grade: '2', text: 'Yerdel grade 2 - more than 50% occlusion of the portal vein, including total occlusion, with or without minimal extension into the SMV.' },
  3: { grade: '3', text: 'Yerdel grade 3 - complete thrombosis of both the portal vein and the proximal SMV, with a patent distal SMV.' },
  4: { grade: '4', text: 'Yerdel grade 4 - complete thrombosis of the portal vein and the entire SMV (both proximal and distal).' },
};

const NOTE = 'The Yerdel classification (Yerdel 2000) grades portal vein thrombosis by the extent of thrombus in the portal vein and superior mesenteric vein (SMV). 1: partial PVT, 50% or less of the lumen. 2: more than 50% occlusion, including total, of the portal vein. 3: complete portal vein and proximal SMV thrombosis, distal SMV patent. 4: complete portal vein and entire SMV thrombosis. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: '1', 2: '2', 3: '3', 4: '4',
  I: '1', II: '2', III: '3', IV: '4',
};

// input:
//   grade: 1-4 (also accepts I-IV).
export function yerdelPvt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Yerdel grade (1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Yerdel grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
