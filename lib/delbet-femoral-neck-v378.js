// spec-v378: Delbet (Delbet-Colonna) classification of a PEDIATRIC femoral neck / proximal femur
// fracture (types I-IV), by the anatomic level of the fracture line — the standard classification that
// stratifies the risk of avascular necrosis (AVN) of the femoral head, which falls from type I (most
// proximal) to type IV (most distal). It sits beside the other fracture-eponym tiles in the catalog.
// "delbet" / "pediatric femoral neck fracture classification" routed to nothing.
//
// HIGH-STAKES: this reports the Delbet TYPE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// falling-AVN-risk association (I -> IV) is the classically taught pattern, not an order; the management
// decision stays with the orthopedic / trauma team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Colonna PC. Fracture of the neck of the femur in children. Am J Surg. 1929;6:793-797 (the classic
//     English description of the Delbet types).
//   - Spence D, et al. Management of pediatric femoral neck fractures. J Am Acad Orthop Surg. 2018 (the
//     four levels and the descending AVN gradient, ~type I 38-100% / II 28-50% / III 18-27% / IV 5-14%).
//
// Types (anatomic level of the fracture line; the AVN gradient falls I -> IV):
//   I   : transepiphyseal — separation of the proximal femoral epiphysis; the HIGHEST AVN risk; worst
//         long-term outcomes. Flagged (high AVN risk).
//   II  : transcervical — through the mid femoral neck; the most common type; HIGH AVN risk. Flagged.
//   III : cervicotrochanteric (basicervical) — at the base of the neck; lower AVN risk.
//   IV  : intertrochanteric — between the trochanters; the LOWEST AVN risk.

const TYPES = {
  I: { type: 'I', highAvn: true, text: 'Delbet type I - transepiphyseal (separation of the proximal femoral epiphysis); the highest risk of avascular necrosis and the worst long-term outcomes.' },
  II: { type: 'II', highAvn: true, text: 'Delbet type II - transcervical (through the mid femoral neck); the most common type, with a high risk of avascular necrosis.' },
  III: { type: 'III', highAvn: false, text: 'Delbet type III - cervicotrochanteric (at the base of the neck); a lower risk of avascular necrosis than the more proximal types.' },
  IV: { type: 'IV', highAvn: false, text: 'Delbet type IV - intertrochanteric (between the trochanters); the lowest risk of avascular necrosis.' },
};

const NOTE = 'The Delbet (Delbet-Colonna) classification grades a pediatric femoral neck / proximal femur fracture by the anatomic level of the fracture line. I: transepiphyseal (highest AVN risk). II: transcervical (most common, high AVN risk). III: cervicotrochanteric / basicervical (lower). IV: intertrochanteric (lowest). The risk of avascular necrosis of the femoral head falls I to IV, which is the classically taught pattern, not an order. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4)
export function delbetFemoralNeck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Delbet type (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    type: t.type,
    highAvnRisk: t.highAvn,
    abnormal: t.highAvn,
    bandLabel: `Delbet type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
