// spec-v427: the Vaughan Williams classification of antiarrhythmic drug actions, the classic grouping of
// antiarrhythmics by primary electrophysiologic mechanism — classes Ia / Ib / Ic / II / III / IV. It is the
// standard teaching and prescribing framework for antiarrhythmics. "vaughan williams" /
// "antiarrhythmic class" routed to nothing.
//
// This tile reports the CLASSIC four-class Vaughan Williams scheme (Class I subdivided into Ia/Ib/Ic). The
// modernized (Lei 2018) extension that adds classes 0 and V-VII is not part of this scheme and is not
// reported.
//
// HIGH-STAKES: this reports the drug CLASS the user has selected and its mechanism, NOT a prescribing
// decision, a dose, a diagnosis, or a prognosis (spec-v11 §5.3). Many antiarrhythmics have actions in more
// than one class (e.g., amiodarone); the prescribing decision stays with the treating team.
//
// CLASSES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Vaughan Williams EM. A classification of antiarrhythmic actions reassessed after a decade of new drugs.
//     J Clin Pharmacol. 1984;24(4):129-147 (the classic four-class scheme with the Ia/Ib/Ic subclasses).
//   - Cardiology / pharmacology references reproducing the same Na-channel (I) / beta-blocker (II) /
//     K-channel (III) / Ca-channel (IV) grouping.
//
// Classes (by primary mechanism, with representative agents):
//   Ia  : sodium-channel blockers, moderate block, prolong repolarization - quinidine, procainamide,
//         disopyramide.
//   Ib  : sodium-channel blockers, weak block, shorten repolarization - lidocaine, mexiletine.
//   Ic  : sodium-channel blockers, marked block, little effect on repolarization - flecainide, propafenone.
//   II  : beta-adrenergic blockers - metoprolol, propranolol, esmolol.
//   III : potassium-channel blockers, prolong repolarization - amiodarone, sotalol, dofetilide, ibutilide.
//   IV  : non-dihydropyridine calcium-channel blockers - verapamil, diltiazem.

const CLASSES = {
  IA: { cls: 'Ia', text: 'Vaughan Williams class Ia - sodium-channel blockers (moderate block, prolong repolarization): quinidine, procainamide, disopyramide.' },
  IB: { cls: 'Ib', text: 'Vaughan Williams class Ib - sodium-channel blockers (weak block, shorten repolarization): lidocaine, mexiletine.' },
  IC: { cls: 'Ic', text: 'Vaughan Williams class Ic - sodium-channel blockers (marked block, little effect on repolarization): flecainide, propafenone.' },
  II: { cls: 'II', text: 'Vaughan Williams class II - beta-adrenergic blockers: metoprolol, propranolol, esmolol.' },
  III: { cls: 'III', text: 'Vaughan Williams class III - potassium-channel blockers (prolong repolarization): amiodarone, sotalol, dofetilide, ibutilide.' },
  IV: { cls: 'IV', text: 'Vaughan Williams class IV - non-dihydropyridine calcium-channel blockers: verapamil, diltiazem.' },
};

const NOTE = 'The Vaughan Williams classification (Vaughan Williams 1984) groups antiarrhythmic drugs by primary electrophysiologic mechanism. Ia/Ib/Ic: sodium-channel blockers (moderate/weak/marked block). II: beta-blockers. III: potassium-channel blockers. IV: non-dihydropyridine calcium-channel blockers. Many agents act in more than one class (e.g., amiodarone). This reports the class the user has selected and its mechanism, not a prescribing decision, a dose, a diagnosis, or a prognosis.';

const ALIAS = {
  IA: 'IA', '1A': 'IA',
  IB: 'IB', '1B': 'IB',
  IC: 'IC', '1C': 'IC',
  II: 'II', 2: 'II',
  III: 'III', 3: 'III',
  IV: 'IV', 4: 'IV',
};

// input:
//   cls: 'Ia' / 'Ib' / 'Ic' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1a/1b/1c and 2-4).
export function vaughanWilliams(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.cls == null ? '' : o.cls).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the Vaughan Williams class (Ia, Ib, Ic, II, III, or IV).' };
  }
  return {
    valid: true,
    cls: c.cls,
    bandLabel: `Vaughan Williams class ${c.cls}`,
    band: c.text,
    note: NOTE,
  };
}
