// spec-v474: the Rastelli classification of the complete atrioventricular septal defect (complete AV canal),
// by the morphology and chordal attachments of the superior (anterior) bridging leaflet — types A / B / C. It
// is the standard morphologic classification guiding surgical repair and joins the congenital-cardiac tiles.
// "rastelli" / "atrioventricular septal defect type" routed to nothing.
//
// HIGH-STAKES: this reports the anatomic TYPE the clinician has determined from imaging / operative findings,
// NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// management decision stays with the congenital cardiac-surgery team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Rastelli GC, Kirklin JW, Titus JL. Anatomic observations on complete form of persistent common
//     atrioventricular canal with special reference to atrioventricular valves. Mayo Clin Proc.
//     1966;41(5):296-308.
//   - Congenital-cardiac references reproducing the same septal-crest-attached (A) / RV-papillary-muscle (B) /
//     free-floating (C) morphology of the superior bridging leaflet.
//
// Types (superior bridging leaflet morphology):
//   A : the superior bridging leaflet is minimally bridging and attached by chordae to the crest of the
//       interventricular septum (the most common).
//   B : the superior bridging leaflet has anomalous chordal attachments to a papillary muscle in the right
//       ventricle (the rarest).
//   C : the superior bridging leaflet is free-floating, with no chordal attachment to the septum; often
//       associated with tetralogy of Fallot and other complex lesions.

const TYPES = {
  A: { type: 'A', text: 'Rastelli type A - the superior bridging leaflet is minimally bridging and attached by chordae to the crest of the interventricular septum (the most common).' },
  B: { type: 'B', text: 'Rastelli type B - the superior bridging leaflet has anomalous chordal attachments to a papillary muscle in the right ventricle (the rarest).' },
  C: { type: 'C', text: 'Rastelli type C - the superior bridging leaflet is free-floating, with no chordal attachment to the septum; often associated with tetralogy of Fallot and other complex lesions.' },
};

const NOTE = 'The Rastelli classification (Rastelli 1966) groups the complete atrioventricular septal defect by the morphology of the superior (anterior) bridging leaflet. A: attached by chordae to the crest of the ventricular septum (most common). B: anomalous chordal attachments to a right-ventricular papillary muscle (rarest). C: free-floating, unattached to the septum (often with tetralogy of Fallot). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  A: 'A', B: 'B', C: 'C',
  1: 'A', 2: 'B', 3: 'C',
};

// input:
//   type: 'A' / 'B' / 'C' (case-insensitive; also accepts 1-3).
export function rastelliAvsd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Rastelli type (A, B, or C).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Rastelli type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
