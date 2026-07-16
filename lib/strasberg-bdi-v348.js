// spec-v348: Strasberg classification of a bile duct injury (types A-E) — the standard classification
// of an iatrogenic bile duct injury (most often during laparoscopic cholecystectomy), a modification
// of the Bismuth classification that separates the minor leaks (A-C) from the major extrahepatic /
// main-duct injuries (D-E). The catalog had no bile duct injury classification. "strasberg
// classification" / "bile duct injury type" routed to nothing.
//
// HIGH-STAKES: this reports the Strasberg TYPE the clinician has determined from the imaging /
// operative findings, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient
// (spec-v11 §5.3). The minor (A-C, often ERCP-managed) vs major (D-E, often surgical) split is the
// classically taught association, not an order; the management decision stays with the hepatobiliary
// surgeon.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Strasberg SM, Hertl M, Soper NJ. An analysis of the problem of biliary injury during
//     laparoscopic cholecystectomy. J Am Coll Surg. 1995;180(1):101-125 (types A-E; E1-E5 by level,
//     the Bismuth analogue).
//   - Hepatobiliary references (Radiopaedia / surgical reviews) reproducing the same A-E definitions.
//
// Types:
//   A : bile leak from a small duct still in continuity with the biliary system (cystic-duct stump
//       or a duct of Luschka). A minor injury.
//   B : occlusion (ligation) of an aberrant / sectoral right hepatic duct — part of the biliary
//       system is obstructed.
//   C : bile leak from an aberrant / sectoral right hepatic duct that is NOT in continuity with the
//       biliary system (transected and not ligated).
//   D : lateral injury to the extrahepatic bile duct (partial, without loss of continuity). Flagged.
//   E : circumferential injury / transection of the main bile duct (the Bismuth-analogue class,
//       subtypes E1-E5 by level). A major injury. Flagged.

const TYPES = {
  A: { type: 'A', major: false, text: 'Strasberg type A - bile leak from a small duct still in continuity with the biliary system (cystic-duct stump or a duct of Luschka). A minor injury.' },
  B: { type: 'B', major: false, text: 'Strasberg type B - occlusion (ligation) of an aberrant / sectoral right hepatic duct; part of the biliary system is obstructed.' },
  C: { type: 'C', major: false, text: 'Strasberg type C - bile leak from an aberrant / sectoral right hepatic duct that is not in continuity with the biliary system (transected, not ligated).' },
  D: { type: 'D', major: true, text: 'Strasberg type D - lateral injury to the extrahepatic bile duct (partial, without loss of continuity). A major injury.' },
  E: { type: 'E', major: true, text: 'Strasberg type E - circumferential injury / transection of the main bile duct (the Bismuth-analogue class, subtypes E1-E5 by level). A major injury.' },
};

const NOTE = 'The Strasberg classification (Strasberg 1995) grades an iatrogenic bile duct injury, most often during laparoscopic cholecystectomy. A: leak from a small duct still in continuity (cystic stump / duct of Luschka). B: occlusion of an aberrant sectoral duct. C: leak from an aberrant sectoral duct not in continuity. D: lateral injury to the extrahepatic duct. E: transection of the main bile duct (E1-E5 by level, the Bismuth analogue). The minor (A-C, often ERCP-managed) vs major (D-E, often surgical) split is the classically taught association, not an order; the management decision stays with the hepatobiliary surgeon. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' };

// input:
//   type: 'A' .. 'E' (case-insensitive)
export function strasbergBdi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Strasberg type (A, B, C, D, or E).' };
  }
  return {
    valid: true,
    type: t.type,
    major: t.major,
    abnormal: t.major,
    bandLabel: `Strasberg type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
