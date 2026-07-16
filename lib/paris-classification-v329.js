// spec-v329: Paris endoscopic classification of superficial neoplastic lesions (esophagus,
// stomach, colon). The endoscopist selects the morphologic type; the tile reports the type
// and its description, and flags the depressed/excavated types (higher risk of submucosal
// invasion). The catalog had no Paris classification tile ("paris classification" had zero
// corpus hits); it is the standard morphology classification for superficial GI lesions and
// guides the resection approach. "paris classification" / "polyp morphology" routed to nothing.
//
// HIGH-STAKES: this reports the MORPHOLOGIC TYPE the endoscopist has determined, NOT a
// diagnosis or a treatment order (spec-v11 §5.3). The resection decision stays with the
// endoscopist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - The Paris endoscopic classification of superficial neoplastic lesions: esophagus,
//     stomach, and colon: November 30 to December 1, 2002. Gastrointest Endosc.
//     2003;58(6 Suppl):S3-S43 (update: Endoscopy 2005;37(6):570-578).
//   - Multiple reproductions (endoscopy-campus, textbooks) of the same 0-I / 0-II / 0-III
//     types and Ip / Is / IIa / IIb / IIc subtypes.
//
// Types:
//   0-Ip  : protruded, pedunculated.
//   0-Is  : protruded, sessile.
//   0-IIa : non-protruding, slightly elevated.
//   0-IIb : non-protruding, completely flat.
//   0-IIc : non-protruding, slightly depressed.
//   0-III : excavated (ulcerated).
// Depressed (IIc) and excavated (III) lesions carry a higher risk of submucosal invasion.

const TYPES = {
  IP: { code: '0-Ip', text: 'Paris type 0-Ip — protruded, pedunculated (a polypoid lesion on a stalk).', highRisk: false },
  IS: { code: '0-Is', text: 'Paris type 0-Is — protruded, sessile (a polypoid lesion with a broad base, no stalk).', highRisk: false },
  IIA: { code: '0-IIa', text: 'Paris type 0-IIa — non-protruding, slightly elevated (flat elevation of the mucosa).', highRisk: false },
  IIB: { code: '0-IIb', text: 'Paris type 0-IIb — non-protruding, completely flat.', highRisk: false },
  IIC: { code: '0-IIc', text: 'Paris type 0-IIc — non-protruding, slightly depressed. Depressed lesions carry a higher risk of submucosal invasion.', highRisk: true },
  III: { code: '0-III', text: 'Paris type 0-III — excavated (ulcerated). Excavated lesions carry a higher risk of submucosal invasion.', highRisk: true },
};

const NOTE = 'Paris endoscopic classification of superficial neoplastic lesions (2002/2005). Type 0-I protruded: 0-Ip pedunculated, 0-Is sessile. Type 0-II non-protruding, non-excavated: 0-IIa slightly elevated, 0-IIb completely flat, 0-IIc slightly depressed. Type 0-III excavated. Mixed patterns (for example 0-IIa+IIc or 0-Is+IIc) are described by combining the components. The endoscopic morphology predicts the depth of invasion: depressed (0-IIc) and excavated (0-III) lesions carry a higher risk of submucosal invasion and nodal metastasis. This reports the morphologic type, not a diagnosis or a treatment order; the resection approach stays with the endoscopist.';

// input:
//   type: '0-Ip' | '0-Is' | '0-IIa' | '0-IIb' | '0-IIc' | '0-III'
//     (case-insensitive; the leading "0-" is optional)
export function parisClassification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.type == null ? '' : o.type).trim().toUpperCase().replace(/^0-/, '');
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Paris type (0-Ip, 0-Is, 0-IIa, 0-IIb, 0-IIc, or 0-III).' };
  }
  return {
    valid: true,
    type: t.code,
    highRisk: t.highRisk,
    abnormal: t.highRisk,
    bandLabel: `Paris ${t.code}`,
    band: t.text,
    note: NOTE,
  };
}
