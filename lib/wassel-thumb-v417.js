// spec-v417: Wassel classification of thumb polydactyly (radial / preaxial thumb duplication), by the most
// proximal level of skeletal duplication — types I / II / III / IV / V / VI / VII. Odd numerals are a bifid
// bone (a shared base / epiphysis); even numerals are a complete duplication (distinct epiphyses); ascending
// numbers move proximally; VII is any triphalangeal thumb. It joins the hand cluster. "wassel" / "thumb
// polydactyly" / "thumb duplication" routed to nothing.
//
// HIGH-STAKES: this reports the duplication LEVEL the clinician has determined from imaging, NOT a diagnosis,
// a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The reconstruction
// decision stays with the hand / plastic-surgery team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Wassel HD. The results of surgery for polydactyly of the thumb: a review. Clin Orthop Relat Res.
//     1969;64:175-193 (the seven-level classification by the level of skeletal duplication).
//   - Hand-surgery / radiology references reproducing the same distal-phalanx (I/II) / proximal-phalanx
//     (III/IV) / metacarpal (V/VI) / triphalangeal (VII) grouping, odd = bifid and even = duplicated.
//
// Types (most proximal level of skeletal duplication; odd = bifid, even = complete duplication):
//   I   : bifid distal phalanx (a shared epiphysis).
//   II  : duplicated distal phalanx (separate epiphyses, articulating with a single proximal phalanx).
//   III : bifid proximal phalanx.
//   IV  : duplicated proximal phalanx (the most common type).
//   V   : bifid metacarpal.
//   VI  : duplicated metacarpal.
//   VII : a triphalangeal thumb (any duplication with a triphalangeal component).

const TYPES = {
  I: { type: 'I', text: 'Wassel type I - bifid distal phalanx (a shared epiphysis).' },
  II: { type: 'II', text: 'Wassel type II - duplicated distal phalanx (separate epiphyses, articulating with a single proximal phalanx).' },
  III: { type: 'III', text: 'Wassel type III - bifid proximal phalanx.' },
  IV: { type: 'IV', text: 'Wassel type IV - duplicated proximal phalanx (the most common type).' },
  V: { type: 'V', text: 'Wassel type V - bifid metacarpal.' },
  VI: { type: 'VI', text: 'Wassel type VI - duplicated metacarpal.' },
  VII: { type: 'VII', text: 'Wassel type VII - a triphalangeal thumb (any duplication with a triphalangeal component).' },
};

const NOTE = 'The Wassel classification (Wassel 1969) groups a thumb polydactyly by the most proximal level of skeletal duplication. Odd numerals are a bifid bone (a shared base / epiphysis); even numerals are a complete duplication (distinct epiphyses); the numbers ascend proximally. I/II: distal phalanx. III/IV: proximal phalanx (IV is the most common). V/VI: metacarpal. VII: a triphalangeal thumb. This reports the level the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI', VII: 'VII',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII',
};

// input:
//   type: 'I'..'VII' (case-insensitive; also accepts 1-7).
export function wasselThumb(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Wassel type (I through VII).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Wassel type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
