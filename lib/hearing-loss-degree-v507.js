// spec-v507: the degree-of-hearing-loss classification from a pure-tone average (PTA), in dB HL. Second tile
// of the audiology modality gap opened by spec-v506 (jerger-tympanogram): "audiogram" and "hearing loss" were
// zero-hit across the whole corpus.
//
// Unlike the recent enum tiles this one COMPUTES: it takes the PTA the audiologist has already averaged and
// returns the degree band it falls in.
//
// HIGH-STAKES: this bands a number the clinician supplies. It is NOT a diagnosis, NOT an audiogram
// interpretation (it says nothing about conductive versus sensorineural, asymmetry, or configuration), and NOT
// a recommendation for amplification or a cochlear implant (spec-v11 section 5.3). The management decision
// stays with the audiology and ENT team.
//
// BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Clark JG. Uses and abuses of hearing loss classification. ASHA. 1981;23(7):493-500.
//   - Audiology references reproducing the same normal / mild / moderate / moderately severe / severe /
//     profound cut points in dB HL.
//
// Degree bands (PTA in dB HL, Clark 1981):
//   -10 to 15 : normal hearing.
//    16 to 25 : slight loss.
//    26 to 40 : mild loss.
//    41 to 55 : moderate loss.
//    56 to 70 : moderately severe loss.
//    71 to 90 : severe loss.
//    over 90  : profound loss.

const BANDS = [
  { max: 15, degree: 'Normal hearing', text: 'Normal hearing: a pure-tone average of -10 to 15 dB HL.' },
  { max: 25, degree: 'Slight loss', text: 'Slight hearing loss: a pure-tone average of 16 to 25 dB HL.' },
  { max: 40, degree: 'Mild loss', text: 'Mild hearing loss: a pure-tone average of 26 to 40 dB HL.' },
  { max: 55, degree: 'Moderate loss', text: 'Moderate hearing loss: a pure-tone average of 41 to 55 dB HL.' },
  { max: 70, degree: 'Moderately severe loss', text: 'Moderately severe hearing loss: a pure-tone average of 56 to 70 dB HL.' },
  { max: 90, degree: 'Severe loss', text: 'Severe hearing loss: a pure-tone average of 71 to 90 dB HL.' },
  { max: Infinity, degree: 'Profound loss', text: 'Profound hearing loss: a pure-tone average above 90 dB HL.' },
];

const NOTE = 'The degree-of-hearing-loss classification (Clark 1981) bands a pure-tone average in dB HL: -10 to 15 normal, 16 to 25 slight, 26 to 40 mild, 41 to 55 moderate, 56 to 70 moderately severe, 71 to 90 severe, above 90 profound. It bands the number you enter and nothing more: it does not interpret the audiogram (it says nothing about conductive versus sensorineural loss, asymmetry, or configuration), and it is not a recommendation for amplification or a cochlear implant.';

// input:
//   pta: the pure-tone average in dB HL (accepts -10 upward; values below -10 or above 130 are rejected as
//        outside the range a clinical audiogram reports).
export function hearingLossDegree(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pta = Number(o.pta);
  if (o.pta === '' || o.pta === null || o.pta === undefined || !Number.isFinite(pta)) {
    return { valid: false, message: 'Enter the pure-tone average in dB HL.' };
  }
  if (pta < -10 || pta > 130) {
    return { valid: false, message: 'Enter a pure-tone average between -10 and 130 dB HL.' };
  }
  const b = BANDS.find((x) => pta <= x.max);
  return {
    valid: true,
    pta,
    degree: b.degree,
    bandLabel: `PTA ${pta} dB HL - ${b.degree}`,
    band: b.text,
    note: NOTE,
  };
}
