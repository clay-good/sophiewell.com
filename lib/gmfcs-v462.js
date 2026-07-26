// spec-v462: the Gross Motor Function Classification System (GMFCS) for cerebral palsy, by self-initiated
// movement with emphasis on sitting and walking — levels I / II / III / IV / V. It is the standard functional
// classification of gross motor ability in cerebral palsy and companions the neonatal-encephalopathy tile
// (Sarnat). "gmfcs" / "gross motor function" routed to nothing.
//
// HIGH-STAKES: this reports the functional LEVEL the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// pediatric-neurology / rehabilitation team.
//
// LEVELS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Palisano R, Rosenbaum P, Walter S, Russell D, Wood E, Galuppi B. Development and reliability of a
//     system to classify gross motor function in children with cerebral palsy. Dev Med Child Neurol.
//     1997;39(4):214-223.
//   - GMFCS-E&R references reproducing the same walks-without-limitation (I) / walks-with-limitation (II) /
//     hand-held-device (III) / self-mobility-with-limitation / powered (IV) / transported (V) grouping.
//
// Levels (self-initiated mobility; general descriptors, not age-band specific):
//   I   : walks without limitations.
//   II  : walks with limitations (e.g., long distances, uneven terrain, stairs).
//   III : walks using a hand-held mobility device (walker, crutches).
//   IV  : self-mobility with limitations; may use powered mobility.
//   V   : transported in a manual wheelchair; severely limited self-mobility.

const LEVELS = {
  I: { level: 'I', text: 'GMFCS level I - walks without limitations.' },
  II: { level: 'II', text: 'GMFCS level II - walks with limitations (e.g., long distances, uneven terrain, or stairs).' },
  III: { level: 'III', text: 'GMFCS level III - walks using a hand-held mobility device (walker or crutches).' },
  IV: { level: 'IV', text: 'GMFCS level IV - self-mobility with limitations; may use powered mobility.' },
  V: { level: 'V', text: 'GMFCS level V - transported in a manual wheelchair; severely limited self-mobility.' },
};

const NOTE = 'The Gross Motor Function Classification System (GMFCS; Palisano 1997) grades gross motor function in cerebral palsy by self-initiated movement, emphasizing sitting and walking. I: walks without limitations. II: walks with limitations. III: walks using a hand-held mobility device. IV: self-mobility with limitations, may use powered mobility. V: transported in a manual wheelchair. This reports the level the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   level: 'I'..'V' (case-insensitive; also accepts 1-5).
export function gmfcs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.level == null ? '' : o.level).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const l = LEVELS[key];
  if (!l) {
    return { valid: false, message: 'Select the GMFCS level (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    level: l.level,
    bandLabel: `GMFCS level ${l.level}`,
    band: l.text,
    note: NOTE,
  };
}
