// spec-v414: Mayfield classification of progressive perilunar (perilunate) instability, staging a carpal
// ligamentous injury by how far the disruption has progressed around the lunate — stages I / II / III / IV.
// It joins the wrist/carpal cluster. "mayfield" / "perilunate instability" / "perilunate dislocation"
// routed to nothing.
//
// HIGH-STAKES: this reports the STAGE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The reduction / fixation
// decision stays with the hand / orthopedic team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Mayfield JK, Johnson RP, Kilcoyne RK. Carpal dislocations: pathomechanics and progressive perilunar
//     instability. J Hand Surg Am. 1980;5(3):226-241 (the four-stage progression of perilunar instability).
//   - Radiopaedia and hand-surgery references reproducing the same scapholunate (I) / capitolunate (II) /
//     lunotriquetral (III) / lunate-dislocation (IV) progression around the lunate.
//
// Stages (the disruption progresses ulnarly around the lunate; each stage adds the prior ones):
//   I   : scapholunate dissociation - disruption of the scapholunate ligament, the scaphoid subluxing
//         (a widened scapholunate interval, the Terry-Thomas sign).
//   II  : perilunate dislocation - added disruption at the capitolunate joint; the lunate stays aligned
//         with the distal radius while the capitate and the rest of the carpus dislocate (usually dorsally).
//   III : midcarpal dislocation - added disruption of the lunotriquetral ligament; the triquetrum separates
//         from the lunate, and both the lunate and capitate are malpositioned relative to the distal radius.
//   IV  : lunate dislocation - added disruption of the dorsal radiocarpal ligament; the lunate is extruded
//         and dislocates volarly out of the lunate fossa while the capitate realigns with the radius.

const STAGES = {
  I: { stage: 'I', text: 'Mayfield stage I - scapholunate dissociation: disruption of the scapholunate ligament, the scaphoid subluxing (a widened scapholunate interval, the Terry-Thomas sign).' },
  II: { stage: 'II', text: 'Mayfield stage II - perilunate dislocation: added disruption at the capitolunate joint; the lunate stays aligned with the distal radius while the capitate and the rest of the carpus dislocate (usually dorsally).' },
  III: { stage: 'III', text: 'Mayfield stage III - midcarpal dislocation: added disruption of the lunotriquetral ligament; the triquetrum separates from the lunate, and both the lunate and capitate are malpositioned relative to the distal radius.' },
  IV: { stage: 'IV', text: 'Mayfield stage IV - lunate dislocation: added disruption of the dorsal radiocarpal ligament; the lunate is extruded and dislocates volarly out of the lunate fossa while the capitate realigns with the radius.' },
};

const NOTE = 'The Mayfield classification (Mayfield 1980) stages progressive perilunar instability by how far the ligamentous disruption has traveled around the lunate. I: scapholunate dissociation. II: perilunate dislocation (capitolunate). III: midcarpal dislocation (lunotriquetral). IV: lunate dislocation (dorsal radiocarpal - the lunate is extruded volarly). Each stage adds the disruptions of the prior ones. This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   stage: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function mayfieldPerilunate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Mayfield stage (I, II, III, or IV).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Mayfield stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
