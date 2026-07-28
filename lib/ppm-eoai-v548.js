// spec-v548: patient-prosthesis mismatch, graded by the indexed effective orifice area (EOAi). Zero-hit
// before this tile: "eoai", "pibarot", and "effective orifice" across corpus.json, app.js, and lib/meta.js.
// The `prosthesis` and `mismatch` hits are unrelated prose (a periprosthetic fracture type, a delirium item,
// an A-a gradient note), and `gorlin` is the native-valve area tile discussed below.
//
// A DIFFERENT QUESTION FROM THE EXISTING gorlin TILE. Gorlin estimates the area of a NATIVE valve from
// hemodynamics. This grades a valve that has already been REPLACED, against the size of the person it was
// put into. A prosthesis can be functioning exactly as designed and still be too small for the patient, and
// that is the entire concept: mismatch is not prosthesis failure.
//
// EOAi = EOA divided by BSA. The prosthesis's effective orifice area is INDEXED to the patient's body
// surface area, which is why a valve that is adequate in a small person can be severely mismatched in a
// large one. The tile takes the two measurements and does the division, because the indexing is the step
// that gets skipped.
//
// **THE THRESHOLDS DIFFER BY POSITION, AND THEY ARE NOT INTERCHANGEABLE:**
//   AORTIC   none or not clinically significant  above 0.85
//            moderate                            0.65 to 0.85
//            severe                              below 0.65
//   MITRAL   not clinically significant          above 1.2
//            moderate                            above 0.9 up to and including 1.2
//            severe                              0.9 or below
// An EOAi of 1.0 is entirely normal in the aortic position and MODERATE mismatch in the mitral position.
// Applying the aortic cut points to a mitral prosthesis would call that valve normal, which is why the tile
// requires the position and never assumes one.
//
// **A CITATION CORRECTION THAT MATTERS.** The paper almost always cited for patient-prosthesis mismatch --
// Pibarot and Dumesnil, Heart 2006 -- contains the AORTIC grading and NO mitral moderate/severe grading at
// all. It says only that mitral indexed EOA should ideally not fall below about 1.2 to 1.3. The three-tier
// mitral grading used here comes from Magne and colleagues, Circulation 2007, from the same group. A tile
// that cited Heart 2006 for both would misattribute the mitral cut points, so each position carries its own
// citation.
//
// **THE AORTIC SEVERE BOUNDARY IS DISCLOSED RATHER THAN SILENTLY PICKED.** Heart 2006 defines severe as
// BELOW 0.65, so an EOAi of exactly 0.65 is moderate. Later guideline-aligned tables define severe as 0.65
// OR BELOW and cap moderate at 0.66. This tile follows its own cited source -- below 0.65 -- and says so at
// the boundary, because a patient sitting exactly on 0.65 is graded differently by the two conventions.
//
// OBESITY-SPECIFIC AORTIC THRESHOLDS, proposed for a body mass index of 30 or above, are deliberately NOT
// implemented: they appear in a single source and could not be double-confirmed, and a lower threshold
// applied on one source's authority would downgrade real mismatch in exactly the patients where indexing is
// most contested.
//
// HIGH-STAKES: this grades a hemodynamic relationship, not a clinical outcome. Mismatch is ASSOCIATED with
// worse outcomes at a population level, and moderate mismatch in particular is common and often
// well-tolerated, so a grade is not a prediction for the patient and severe mismatch is not by itself an
// indication for reoperation. It does not diagnose prosthetic dysfunction: a stenotic, thrombosed, or
// degenerated valve is a DIFFERENT problem that also produces high gradients, and distinguishing the two is
// the point of the measurement rather than something this tile does. The EOA must come from the prosthesis's
// measured or reference effective orifice area rather than its labelled size, which is a manufacturing
// dimension and systematically overstates the opening (spec-v11 section 5.3). The management decision stays
// with the clinician.
//
// THRESHOLDS AND THE FORMULA RE-FETCHED, NEVER RECALLED (spec-v97), each position double-confirmed against
// its own source pair:
//   - Pibarot P, Dumesnil JG. Prosthesis-patient mismatch: definition, clinical impact, and prevention.
//     Heart. 2006;92(8):1022-1029.  [AORTIC]
//   - Magne J, Mathieu P, Dumesnil JG, et al. Impact of prosthesis-patient mismatch on survival after mitral
//     valve replacement. Circulation. 2007;115(11):1417-1425.  [MITRAL]

export const PPM_POSITIONS = [
  {
    value: 'aortic',
    label: 'Aortic',
    citation: 'Pibarot and Dumesnil, Heart 2006',
    // Ordered worst-first; the first matching band wins.
    bands: [
      { severity: 'severe', test: (v) => v < 0.65, text: 'below 0.65' },
      { severity: 'moderate', test: (v) => v <= 0.85, text: '0.65 to 0.85' },
      { severity: 'none', test: () => true, text: 'above 0.85' },
    ],
    boundaryNote: 'The cited source defines severe as BELOW 0.65, so an EOAi of exactly 0.65 is moderate. Later guideline-aligned tables instead define severe as 0.65 or below; a patient sitting exactly on 0.65 is graded differently by the two conventions.',
  },
  {
    value: 'mitral',
    label: 'Mitral',
    citation: 'Magne and colleagues, Circulation 2007',
    bands: [
      { severity: 'severe', test: (v) => v <= 0.9, text: '0.9 or below' },
      { severity: 'moderate', test: (v) => v <= 1.2, text: 'above 0.9 up to and including 1.2' },
      { severity: 'none', test: () => true, text: 'above 1.2' },
    ],
    boundaryNote: 'The mitral grading comes from Circulation 2007, not from the Heart 2006 paper usually cited for patient-prosthesis mismatch, which contains no mitral moderate or severe grading.',
  },
];

const NOTE = 'Patient-prosthesis mismatch is graded by the indexed effective orifice area, the prosthesis effective orifice area divided by the patient body surface area. The indexing is the point: a valve that is adequate in a small person can be severely mismatched in a large one, and a prosthesis can be functioning exactly as designed and still be too small for the patient, so mismatch is not prosthesis failure. The thresholds differ by position and are not interchangeable. In the aortic position, above 0.85 is not clinically significant, 0.65 to 0.85 is moderate, and below 0.65 is severe. In the mitral position, above 1.2 is not clinically significant, above 0.9 up to and including 1.2 is moderate, and 0.9 or below is severe. An indexed area of 1.0 is entirely normal in the aortic position and moderate mismatch in the mitral position, which is why the position is required and never assumed. The aortic grading comes from Pibarot and Dumesnil 2006 and the mitral grading from Magne and colleagues 2007: the 2006 paper almost always cited for mismatch contains no mitral moderate or severe grading, saying only that mitral indexed area should ideally not fall below about 1.2 to 1.3, so citing it for both would misattribute the mitral cut points. The aortic severe boundary is disclosed rather than silently chosen: the cited source defines severe as below 0.65, while later guideline-aligned tables define it as 0.65 or below. Obesity-specific aortic thresholds proposed for a body mass index of 30 or above are deliberately not implemented, because they appear in a single source and a lower threshold applied on one source authority would downgrade real mismatch. This grades a hemodynamic relationship, not a clinical outcome. Mismatch is associated with worse outcomes at a population level, and moderate mismatch in particular is common and often well tolerated, so a grade is not a prediction for the patient and severe mismatch is not by itself an indication for reoperation. It does not diagnose prosthetic dysfunction: a stenotic, thrombosed or degenerated valve is a different problem that also produces high gradients, and distinguishing the two is the point of the measurement rather than something this does. The effective orifice area must come from the prosthesis measured or reference effective orifice area rather than its labelled size, which is a manufacturing dimension and systematically overstates the opening.';

function readPositive(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n <= 0) return NaN;
  return n;
}

// input: position ('aortic' | 'mitral'), eoa (cm^2), bsa (m^2).
export function ppmEoai(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rawPos = o.position;
  if (rawPos === '' || rawPos === null || rawPos === undefined) {
    return { valid: false, message: 'Choose the valve position. The thresholds differ between aortic and mitral and are not interchangeable: an indexed area of 1.0 is normal in the aortic position and moderate mismatch in the mitral position.' };
  }
  const position = PPM_POSITIONS.find((p) => p.value === String(rawPos).trim().toLowerCase());
  if (!position) {
    return { valid: false, message: 'Position must be aortic or mitral.' };
  }

  const eoa = readPositive(o.eoa);
  const bsa = readPositive(o.bsa);
  if (eoa === null || bsa === null) {
    return { valid: false, message: 'Enter both the prosthesis effective orifice area in cm2 and the patient body surface area in m2.' };
  }
  if (Number.isNaN(eoa) || Number.isNaN(bsa)) {
    return { valid: false, message: 'The effective orifice area and body surface area must both be positive numbers.' };
  }

  const eoai = eoa / bsa;
  const rounded = Math.round(eoai * 100) / 100;
  const band = position.bands.find((b) => b.test(rounded));

  const atAorticBoundary = position.value === 'aortic' && rounded === 0.65;

  return {
    valid: true,
    position: position.value,
    eoai: rounded,
    severity: band.severity,
    bandText: band.text,
    citation: position.citation,
    bandLabel: `EOAi ${rounded.toFixed(2)} cm2/m2 — ${band.severity === 'none' ? 'no clinically significant mismatch' : `${band.severity} mismatch`} (${position.label.toLowerCase()})`,
    band: `Indexed effective orifice area ${rounded.toFixed(2)} cm2/m2 (${eoa} divided by ${bsa}). In the ${position.label.toLowerCase()} position that is ${band.severity === 'none' ? 'not clinically significant mismatch' : `${band.severity} mismatch`}, from the ${band.text} band, per ${position.citation}.${atAorticBoundary ? ` ${position.boundaryNote}` : ''} A prosthesis can be functioning exactly as designed and still be too small for the patient: this grades a hemodynamic relationship, not prosthesis failure, and it is not an indication for reoperation.`,
    note: NOTE,
  };
}
