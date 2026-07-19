// spec-v473: the Todani classification of choledochal (congenital bile duct) cysts, by the location and shape
// of the cystic dilatation — types I / II / III / IV / V. It is the standard biliary-cyst classification and
// companions the bile-duct classification tiles (Strasberg, Bismuth-Corlette). "todani" / "choledochal cyst
// type" routed to nothing.
//
// HIGH-STAKES: this reports the anatomic TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the hepatobiliary / surgical team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Todani T, Watanabe Y, Narusue M, Tabuchi K, Okajima K. Congenital bile duct cysts: classification,
//     operative procedures, and review of thirty-seven cases. Am J Surg. 1977;134(2):263-269.
//   - Hepatobiliary references reproducing the same extrahepatic-fusiform/cystic (I) / diverticulum (II) /
//     choledochocele (III) / multiple-cysts (IV) / intrahepatic-only-Caroli (V) grouping.
//
// Types (location / shape of the cyst):
//   I   : cystic or fusiform dilatation of the extrahepatic bile duct (the most common). Subtypes: Ia cystic,
//         Ib focal segmental, Ic fusiform.
//   II  : a true diverticulum of the extrahepatic bile duct.
//   III : choledochocele - dilatation of the intraduodenal (intramural) portion of the common bile duct.
//   IV  : multiple cysts. IVa: intrahepatic and extrahepatic ducts; IVb: multiple extrahepatic cysts only.
//   V   : Caroli disease - one or more cystic dilatations of the intrahepatic bile ducts only.

const TYPES = {
  I: { type: 'I', text: 'Todani type I - cystic or fusiform dilatation of the extrahepatic bile duct (the most common); subtypes Ia cystic, Ib focal segmental, Ic fusiform.' },
  II: { type: 'II', text: 'Todani type II - a true diverticulum of the extrahepatic bile duct.' },
  III: { type: 'III', text: 'Todani type III - choledochocele: dilatation of the intraduodenal (intramural) portion of the common bile duct.' },
  IV: { type: 'IV', text: 'Todani type IV - multiple cysts; IVa involves both the intrahepatic and extrahepatic ducts, IVb the extrahepatic ducts only.' },
  V: { type: 'V', text: 'Todani type V - Caroli disease: one or more cystic dilatations of the intrahepatic bile ducts only.' },
};

const NOTE = 'The Todani classification (Todani 1977) groups choledochal (congenital bile duct) cysts by location and shape. I: extrahepatic fusiform/cystic dilatation (most common). II: a true extrahepatic diverticulum. III: choledochocele (intraduodenal segment). IV: multiple cysts (IVa intra- and extrahepatic; IVb extrahepatic only). V: Caroli disease (intrahepatic only). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   type: 'I'..'V' (case-insensitive; also accepts 1-5).
export function todaniCholedochal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Todani type (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Todani type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
