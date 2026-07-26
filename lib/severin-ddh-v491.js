// spec-v491: the Severin classification of the radiographic OUTCOME of the hip after treatment for
// developmental dysplasia (DDH), by joint congruency and the center-edge (CE) angle at maturity - groups I / II
// / III / IV / V / VI. It companions the DDH tiles (Crowe, Hartofilakidis). "severin" / "ddh outcome group"
// routed to nothing.
//
// HIGH-STAKES: this reports the radiographic GROUP the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 section 5.3). The management decision stays with
// the pediatric-orthopedic team.
//
// GROUPS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Severin E. Contribution to the knowledge of congenital dislocation of the hip joint. Acta Chir Scand.
//     1941;84(Suppl 63):1-142.
//   - Pediatric-orthopedic references reproducing the same normal (I) / concentric-mild-deformity (II) /
//     dysplastic-no-subluxation (III) / subluxated (IV) / false-acetabulum (V) / redislocation (VI) grouping.
//
// Groups (hip congruency at maturity):
//   I   : normal or nearly normal hip; CE angle within the normal range for age.
//   II  : a concentric hip with moderate deformity of the femoral head, neck, or acetabulum; slightly reduced
//         CE angle.
//   III : a dysplastic hip without subluxation; a low CE angle.
//   IV  : a subluxated hip (the femoral head is not concentric with the acetabulum).
//   V   : the femoral head articulates with a secondary (false) acetabulum in the superior part of the original
//         acetabulum.
//   VI  : redislocation (complete dislocation of the hip).

const GROUPS = {
  I: { group: 'I', text: 'Severin group I - a normal or nearly normal hip; CE angle within the normal range for age.' },
  II: { group: 'II', text: 'Severin group II - a concentric hip with moderate deformity of the femoral head, neck, or acetabulum; slightly reduced CE angle.' },
  III: { group: 'III', text: 'Severin group III - a dysplastic hip without subluxation; a low CE angle.' },
  IV: { group: 'IV', text: 'Severin group IV - a subluxated hip (the femoral head is not concentric with the acetabulum).' },
  V: { group: 'V', text: 'Severin group V - the femoral head articulates with a secondary (false) acetabulum in the superior part of the original acetabulum.' },
  VI: { group: 'VI', text: 'Severin group VI - redislocation (complete dislocation of the hip).' },
};

const NOTE = 'The Severin classification (Severin 1941) grades the radiographic outcome of the hip after treatment for developmental dysplasia by congruency and the center-edge (CE) angle at maturity. I: normal. II: concentric with moderate deformity. III: dysplastic without subluxation. IV: subluxated. V: false (secondary) acetabulum. VI: redislocation. This reports the group the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
};

// input:
//   group: 'I'..'VI' (case-insensitive; also accepts 1-6).
export function severinDdh(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.group == null ? '' : o.group).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GROUPS[key];
  if (!g) {
    return { valid: false, message: 'Select the Severin group (I, II, III, IV, V, or VI).' };
  }
  return {
    valid: true,
    group: g.group,
    bandLabel: `Severin group ${g.group}`,
    band: g.text,
    note: NOTE,
  };
}
