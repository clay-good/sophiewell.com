// spec-v482: the Russell-Taylor classification of subtrochanteric femur fractures, by involvement of the
// piriformis fossa and the lesser trochanter — types IA / IB / IIA / IIB. It was devised to guide intramedullary
// nail selection and companions the Seinsheimer subtrochanteric tile. "russell-taylor" / "subtrochanteric
// fracture piriformis" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic-trauma team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Russell TA, Taylor JC. Subtrochanteric fractures of the femur. In: Browner BD, ed. Skeletal Trauma.
//     Philadelphia: WB Saunders; 1992.
//   - Orthopedic-trauma references reproducing the same piriformis-fossa (I intact / II involved) and
//     lesser-trochanter (A attached / B detached) axes.
//
// Types (piriformis fossa x lesser trochanter):
//   IA  : piriformis fossa intact; the lesser trochanter is attached to the proximal fragment.
//   IB  : piriformis fossa intact; the lesser trochanter is detached (posteromedial / lesser-trochanter
//         comminution).
//   IIA : the fracture extends into the piriformis fossa / greater trochanter; the lesser trochanter is
//         attached.
//   IIB : the fracture extends into the piriformis fossa; the lesser trochanter is detached (greater- and
//         lesser-trochanter comminution).

const TYPES = {
  IA: { type: 'IA', text: 'Russell-Taylor type IA - the piriformis fossa is intact and the lesser trochanter is attached to the proximal fragment.' },
  IB: { type: 'IB', text: 'Russell-Taylor type IB - the piriformis fossa is intact but the lesser trochanter is detached (posteromedial / lesser-trochanter comminution).' },
  IIA: { type: 'IIA', text: 'Russell-Taylor type IIA - the fracture extends into the piriformis fossa / greater trochanter; the lesser trochanter is attached.' },
  IIB: { type: 'IIB', text: 'Russell-Taylor type IIB - the fracture extends into the piriformis fossa and the lesser trochanter is detached (greater- and lesser-trochanter comminution).' },
};

const NOTE = 'The Russell-Taylor classification (Russell & Taylor) groups subtrochanteric femur fractures by whether the fracture involves the piriformis fossa (type I intact, type II involved) and whether the lesser trochanter is attached (A) or detached (B). It was devised to guide intramedullary nail selection. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  IA: 'IA', IB: 'IB', IIA: 'IIA', IIB: 'IIB',
  '1A': 'IA', '1B': 'IB', '2A': 'IIA', '2B': 'IIB',
};

// input:
//   type: 'IA' / 'IB' / 'IIA' / 'IIB' (case-insensitive; also accepts 1A/1B/2A/2B).
export function russellTaylorSubtroch(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Russell-Taylor type (IA, IB, IIA, or IIB).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Russell-Taylor type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
