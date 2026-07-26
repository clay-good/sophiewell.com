// spec-v487: the Rockwood classification of acromioclavicular (AC) joint injuries, by the integrity of the AC
// and coracoclavicular (CC) ligaments and the direction/degree of clavicular displacement — types I / II / III
// / IV / V / VI. It is the standard AC-injury classification and joins the shoulder tiles. "rockwood ac" /
// "acromioclavicular injury" routed to nothing. (Distinct from the Rockwood Clinical Frailty Scale.)
//
// HIGH-STAKES: this reports the injury TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Rockwood CA. Injuries to the acromioclavicular joint. In: Rockwood CA, Green DP, eds. Fractures in
//     Adults. Philadelphia: JB Lippincott; 1984.
//   - Orthopedic references reproducing the same AC-sprain (I) / AC-torn-CC-intact (II) / both-torn-25-100%
//     (III) / posterior (IV) / gross-superior-100-300% (V) / inferior (VI) grouping.
//
// Types (ligament injury + displacement):
//   I   : sprain of the AC ligaments; AC and CC ligaments intact; radiographs normal.
//   II  : AC ligaments torn, CC ligaments sprained but intact; slight widening / vertical separation of the AC
//         joint.
//   III : both AC and CC ligaments torn; the coracoclavicular distance is increased 25% to 100% versus the
//         normal side.
//   IV  : AC and CC ligaments torn, with the distal clavicle displaced posteriorly into or through the
//         trapezius.
//   V   : AC and CC ligaments torn, with gross superior displacement (coracoclavicular distance 100% to 300%
//         of normal) and disruption of the deltotrapezial fascia.
//   VI  : AC and CC ligaments torn, with the clavicle displaced inferiorly (subacromial or subcoracoid).

const TYPES = {
  I: { type: 'I', text: 'Rockwood type I - sprain of the AC ligaments; AC and CC ligaments intact; radiographs normal.' },
  II: { type: 'II', text: 'Rockwood type II - AC ligaments torn, CC ligaments sprained but intact; slight widening or vertical separation of the AC joint.' },
  III: { type: 'III', text: 'Rockwood type III - both AC and CC ligaments torn; the coracoclavicular distance is increased 25% to 100% versus the normal side.' },
  IV: { type: 'IV', text: 'Rockwood type IV - AC and CC ligaments torn, with the distal clavicle displaced posteriorly into or through the trapezius.' },
  V: { type: 'V', text: 'Rockwood type V - AC and CC ligaments torn, with gross superior displacement (coracoclavicular distance 100% to 300% of normal) and disruption of the deltotrapezial fascia.' },
  VI: { type: 'VI', text: 'Rockwood type VI - AC and CC ligaments torn, with the clavicle displaced inferiorly (subacromial or subcoracoid).' },
};

const NOTE = 'The Rockwood classification of acromioclavicular joint injuries grades by AC and coracoclavicular (CC) ligament integrity and displacement. I: AC sprain, ligaments intact. II: AC torn, CC intact, slight widening. III: both torn, CC distance 25-100% increased. IV: posterior clavicle displacement. V: gross superior displacement (CC 100-300%). VI: inferior clavicle displacement. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
};

// input:
//   type: 'I'..'VI' (case-insensitive; also accepts 1-6).
export function rockwoodAc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Rockwood type (I, II, III, IV, V, or VI).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Rockwood type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
