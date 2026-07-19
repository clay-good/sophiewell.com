// spec-v461: the DeBakey classification of aortic dissection, by the site of origin and the extent of the
// dissection flap — types I / II / IIIa / IIIb. It is the anatomic counterpart to the Stanford system and
// companions the Aortic Dissection Detection Risk Score (ADD-RS). "debakey" / "aortic dissection
// classification" routed to nothing.
//
// HIGH-STAKES: this reports the anatomic TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the cardiac-surgery / vascular team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - DeBakey ME, Henly WS, Cooley DA, Morris GC, Crawford ES, Beall AC. Surgical management of dissecting
//     aneurysms of the aorta. J Thorac Cardiovasc Surg. 1965;49:130-149.
//   - Cardiovascular references reproducing the same ascending-plus-descending (I) / ascending-only (II) /
//     descending-above-diaphragm (IIIa) / descending-below-diaphragm (IIIb) grouping.
//
// Types (origin and extent):
//   I    : originates in the ascending aorta and extends through the arch into the descending aorta (often to
//          the abdominal aorta).
//   II   : originates in and is confined to the ascending aorta.
//   IIIa : originates in the descending thoracic aorta and is limited above the diaphragm.
//   IIIb : originates in the descending thoracic aorta and extends below the diaphragm.

const TYPES = {
  I: { type: 'I', text: 'DeBakey type I - originates in the ascending aorta and extends through the arch into the descending aorta (often to the abdominal aorta).' },
  II: { type: 'II', text: 'DeBakey type II - originates in and is confined to the ascending aorta.' },
  IIIA: { type: 'IIIa', text: 'DeBakey type IIIa - originates in the descending thoracic aorta and is limited above the diaphragm.' },
  IIIB: { type: 'IIIb', text: 'DeBakey type IIIb - originates in the descending thoracic aorta and extends below the diaphragm.' },
};

const NOTE = 'The DeBakey classification (DeBakey 1965) groups aortic dissection by origin and extent. I: ascending aorta, extending through the arch into the descending (and often abdominal) aorta. II: confined to the ascending aorta. IIIa: descending thoracic aorta, limited above the diaphragm. IIIb: descending thoracic aorta, extending below the diaphragm. Types I and II involve the ascending aorta (Stanford A); type III does not (Stanford B). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', IIIA: 'IIIA', IIIB: 'IIIB',
  1: 'I', 2: 'II', '3A': 'IIIA', '3B': 'IIIB',
};

// input:
//   type: 'I' / 'II' / 'IIIa' / 'IIIb' (case-insensitive; also accepts 1, 2, 3a, 3b).
export function debakey(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the DeBakey type (I, II, IIIa, or IIIb).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `DeBakey type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
