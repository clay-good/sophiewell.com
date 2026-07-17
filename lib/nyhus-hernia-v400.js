// spec-v400: Nyhus classification of groin (inguinal / femoral) hernias, by the anatomy of the defect —
// types I / II / IIIa / IIIb / IIIc / IVa / IVb / IVc / IVd. A preoperative / operative anatomic
// classification used to describe a groin hernia and inform the repair. It complements the general-surgery
// classification tiles. "nyhus" / "groin hernia classification" routed to nothing.
//
// HIGH-STAKES: this reports the anatomic TYPE the clinician has determined at examination / operation, NOT
// a diagnosis, a repair recommendation, or a prognosis for an individual patient (spec-v11 §5.3). The type
// describes the defect; the repair decision stays with the operating surgeon.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Nyhus LM. Individualization of hernia repair: a new era. Surgery. 1991;110(1):1-2, and Nyhus LM.
//     Classification of groin hernia: milestones. Hernia. 2004;8(2):87-88 (the type I-IV classification).
//   - General-surgery / hernia references reproducing the same intact-ring (I) / dilated-ring (II) /
//     posterior-wall-defect (III: a direct, b indirect, c femoral) / recurrent (IV: a direct, b indirect,
//     c femoral, d combined) grouping.
//
// Types (anatomy of the groin-hernia defect):
//   I    : indirect inguinal hernia with a normal internal ring (typically infants / children / young
//          adults); posterior wall intact.
//   II   : indirect inguinal hernia with a dilated / enlarged internal ring; posterior wall intact,
//          inferior epigastric vessels not displaced.
//   IIIa : direct inguinal hernia (a defect in the posterior wall / transversalis fascia).
//   IIIb : indirect inguinal hernia with a large defect encroaching on the posterior wall (large indirect,
//          sliding, or pantaloon hernia).
//   IIIc : femoral hernia.
//   IVa  : recurrent direct inguinal hernia.
//   IVb  : recurrent indirect inguinal hernia.
//   IVc  : recurrent femoral hernia.
//   IVd  : recurrent combined (any combination of the above).

const TYPES = {
  I: { type: 'I', text: 'Nyhus type I - indirect inguinal hernia with a normal internal ring; posterior wall intact (typically infants / children / young adults).' },
  II: { type: 'II', text: 'Nyhus type II - indirect inguinal hernia with a dilated / enlarged internal ring; posterior wall intact, inferior epigastric vessels not displaced.' },
  IIIA: { type: 'IIIa', text: 'Nyhus type IIIa - direct inguinal hernia (a defect in the posterior wall / transversalis fascia).' },
  IIIB: { type: 'IIIb', text: 'Nyhus type IIIb - indirect inguinal hernia with a large defect encroaching on the posterior wall (large indirect, sliding, or pantaloon hernia).' },
  IIIC: { type: 'IIIc', text: 'Nyhus type IIIc - femoral hernia.' },
  IVA: { type: 'IVa', text: 'Nyhus type IVa - recurrent direct inguinal hernia.' },
  IVB: { type: 'IVb', text: 'Nyhus type IVb - recurrent indirect inguinal hernia.' },
  IVC: { type: 'IVc', text: 'Nyhus type IVc - recurrent femoral hernia.' },
  IVD: { type: 'IVd', text: 'Nyhus type IVd - recurrent combined hernia (any combination of the above).' },
};

const NOTE = 'The Nyhus classification (Nyhus 1991/2004) groups a groin hernia by the anatomy of the defect. I: indirect, normal internal ring. II: indirect, dilated ring, posterior wall intact. IIIa: direct. IIIb: large indirect encroaching on the posterior wall (incl. sliding / pantaloon). IIIc: femoral. IV: recurrent (a direct, b indirect, c femoral, d combined). The type describes the defect and informs the repair, but this reports the type the clinician has determined, not a diagnosis, a repair recommendation, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II',
  IIIA: 'IIIA', IIIB: 'IIIB', IIIC: 'IIIC',
  IVA: 'IVA', IVB: 'IVB', IVC: 'IVC', IVD: 'IVD',
  1: 'I', 2: 'II',
  '3A': 'IIIA', '3B': 'IIIB', '3C': 'IIIC',
  '4A': 'IVA', '4B': 'IVB', '4C': 'IVC', '4D': 'IVD',
};

// input:
//   type: 'I' / 'II' / 'IIIa' / 'IIIb' / 'IIIc' / 'IVa' / 'IVb' / 'IVc' / 'IVd' (case-insensitive; also
//   accepts 1, 2, and 3a-3c / 4a-4d). Bare 'III' or 'IV' is ambiguous and returns invalid — the clinician
//   must specify the subtype.
export function nyhusHernia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Nyhus type (I, II, IIIa, IIIb, IIIc, IVa, IVb, IVc, or IVd).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Nyhus type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
