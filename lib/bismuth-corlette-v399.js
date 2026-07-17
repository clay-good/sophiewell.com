// spec-v399: Bismuth-Corlette classification of perihilar cholangiocarcinoma (a Klatskin tumor), by the
// extent of biliary-ductal involvement along the hepatic-duct confluence — types I / II / IIIa / IIIb / IV.
// It complements the biliary cluster (Strasberg bile-duct injury, the Tokyo Guidelines cholangitis /
// cholecystitis tiles) but describes tumor location, not iatrogenic injury. "bismuth" / "bismuth corlette"
// / "klatskin tumor type" routed to nothing.
//
// HIGH-STAKES: this reports the anatomic TYPE the clinician has determined from the cholangiography /
// cross-sectional imaging, NOT a diagnosis, a resectability determination, a treatment decision, or a
// prognosis for an individual patient (spec-v11 §5.3). The type informs the surgical plan (the side and
// extent of hepatectomy), but that decision stays with the hepatobiliary surgery / MDT team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Bismuth H, Corlette MB. Intrahepatic cholangioenteric anastomosis in carcinoma of the hilus of the
//     liver. Surg Gynecol Obstet. 1975;140(2):170-178 (the original I / II / III / IV classification).
//   - Bismuth H, Nakache R, Diamond T. Management strategies in resection for hilar cholangiocarcinoma.
//     Ann Surg. 1992;215(1):31-38 (the type III split into IIIa / IIIb).
//   - Hepatobiliary-surgery / radiology references reproducing the same confluence-sparing (I) /
//     confluence-reaching (II) / unilateral-second-order (IIIa right, IIIb left) / bilateral-second-order
//     or multifocal (IV) grouping.
//
// Types (extent of ductal involvement):
//   I    : tumor confined to the common hepatic duct, below (sparing) the confluence of the right and left
//          hepatic ducts.
//   II   : tumor reaching the confluence of the right and left hepatic ducts, without involving the
//          secondary (segmental / sectoral) ducts.
//   IIIa : tumor occluding the common hepatic duct and the confluence and extending to the RIGHT
//          secondary (sectoral) hepatic ducts.
//   IIIb : tumor occluding the common hepatic duct and the confluence and extending to the LEFT
//          secondary (sectoral) hepatic ducts.
//   IV   : tumor extending to the secondary (sectoral) ducts on BOTH the right and left sides, or
//          multifocal / multicentric involvement.

const TYPES = {
  I: { type: 'I', text: 'Bismuth-Corlette type I - tumor confined to the common hepatic duct, below (sparing) the confluence of the right and left hepatic ducts.' },
  II: { type: 'II', text: 'Bismuth-Corlette type II - tumor reaching the confluence of the right and left hepatic ducts, without involving the secondary (segmental) ducts.' },
  IIIA: { type: 'IIIa', text: 'Bismuth-Corlette type IIIa - tumor involving the confluence and extending to the RIGHT secondary (sectoral) hepatic ducts.' },
  IIIB: { type: 'IIIb', text: 'Bismuth-Corlette type IIIb - tumor involving the confluence and extending to the LEFT secondary (sectoral) hepatic ducts.' },
  IV: { type: 'IV', text: 'Bismuth-Corlette type IV - tumor extending to the secondary (sectoral) ducts on BOTH sides, or multifocal / multicentric involvement.' },
};

const NOTE = 'The Bismuth-Corlette classification (Bismuth-Corlette 1975; IIIa/IIIb split Bismuth 1992) groups a perihilar cholangiocarcinoma (Klatskin tumor) by how far it extends along the hepatic-duct confluence. I: below the confluence. II: reaching the confluence. IIIa: extending to the right secondary ducts. IIIb: extending to the left secondary ducts. IV: bilateral secondary ducts or multifocal. The type informs the surgical plan (the side and extent of hepatectomy), but this reports the type the clinician has determined, not a diagnosis, a resectability determination, a treatment decision, or a prognosis. Companion: the Strasberg bile-duct-injury classification.';

const ALIAS = {
  I: 'I', II: 'II', IIIA: 'IIIA', IIIB: 'IIIB', IV: 'IV',
  1: 'I', 2: 'II', 4: 'IV',
  '3A': 'IIIA', '3B': 'IIIB',
};

// input:
//   type: 'I' / 'II' / 'IIIa' / 'IIIb' / 'IV' (case-insensitive; also accepts 1, 2, 4, 3a, 3b). Bare 'III'
//   is ambiguous and returns invalid — the clinician must specify IIIa (right) or IIIb (left).
export function bismuthCorlette(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Bismuth-Corlette type (I, II, IIIa, IIIb, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Bismuth-Corlette type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
