// spec-v453: the Schatzker classification of tibial plateau fractures, by fracture pattern and location on
// the plateau — types I / II / III / IV / V / VI. It is the standard grading of tibial plateau fractures and
// joins the lower-limb fracture-classification tiles. "schatzker" / "tibial plateau fracture" routed to
// nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Schatzker J, McBroom R, Bruce D. The tibial plateau fracture. The Toronto experience 1968-1975.
//     Clin Orthop Relat Res. 1979;(138):94-104.
//   - Orthopedic / radiology references reproducing the same lateral-split (I) / lateral-split-depression (II)
//     / lateral-pure-depression (III) / medial (IV) / bicondylar (V) / plateau-with-diaphyseal-dissociation
//     (VI) grouping.
//
// Types (fracture pattern and location):
//   I   : lateral tibial plateau split (wedge) fracture, no depression.
//   II  : lateral tibial plateau split-depression fracture.
//   III : lateral tibial plateau pure (central) depression fracture, no split.
//   IV  : medial tibial plateau fracture (split or depression).
//   V   : bicondylar tibial plateau fracture (both plateaus).
//   VI  : tibial plateau fracture with metaphyseal-diaphyseal dissociation (plateau separated from the shaft).

const TYPES = {
  I: { type: 'I', text: 'Schatzker type I - lateral tibial plateau split (wedge) fracture, no depression.' },
  II: { type: 'II', text: 'Schatzker type II - lateral tibial plateau split-depression fracture.' },
  III: { type: 'III', text: 'Schatzker type III - lateral tibial plateau pure (central) depression fracture, no split.' },
  IV: { type: 'IV', text: 'Schatzker type IV - medial tibial plateau fracture (split or depression).' },
  V: { type: 'V', text: 'Schatzker type V - bicondylar tibial plateau fracture (both plateaus).' },
  VI: { type: 'VI', text: 'Schatzker type VI - tibial plateau fracture with metaphyseal-diaphyseal dissociation (plateau separated from the shaft).' },
};

const NOTE = 'The Schatzker classification (Schatzker 1979) grades tibial plateau fractures by pattern and location. I: lateral split. II: lateral split-depression. III: lateral pure depression. IV: medial plateau. V: bicondylar. VI: plateau fracture with metaphyseal-diaphyseal dissociation. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
};

// input:
//   type: 'I'..'VI' (case-insensitive; also accepts 1-6).
export function schatzker(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Schatzker type (I, II, III, IV, V, or VI).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Schatzker type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
