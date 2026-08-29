// spec-v853: the echocardiographic criteria for constrictive pericarditis.
//
// Source:
//   Welch TD, Ling LH, Espinosa RE, et al. Echocardiographic diagnosis of constrictive
//   pericarditis: Mayo Clinic criteria. Circ Cardiovasc Imaging. 2014;7(3):526-534.
//
//   Respiration-related ventricular septal shift            required
//   Medial (septal) mitral annular e'                       >= 9 cm/s
//   Hepatic vein expiratory diastolic reversal ratio        >= 0.79
//
//   septal shift AND either of the other two   sensitivity 87 percent, specificity 91 percent
//   all three                                  sensitivity 64 percent, specificity 97 percent
//
// A NORMAL MEDIAL e' IS THE ABNORMAL FINDING HERE, AND THAT IS THE POINT OF THIS TILE. With a
// stiff pericardium and a normal myocardium, longitudinal relaxation at the SEPTAL annulus is
// preserved or exaggerated while the lateral wall is tethered by the shell. The medial e' is
// therefore preserved or increased and is frequently HIGHER than the lateral e' - the reverse
// of the normal relationship, called ANNULUS REVERSUS. Read the usual way, a medial e' of
// 11 cm/s in a patient with heart failure looks reassuring; it is one of the two criteria.
//
// E/e' DOES NOT ESTIMATE FILLING PRESSURE HERE - ANNULUS PARADOXUS. Because the medial e'
// rises with the severity of constriction, E/e' varies INVERSELY with left atrial pressure in
// this disease, so the usual reading points the wrong way.
//
// SEPTAL SHIFT IS THE ANCHOR. Neither of the other two findings counts without it.
//
// IT DOES NOT SEPARATE CONSTRICTION FROM RESTRICTIVE CARDIOMYOPATHY ON ITS OWN. That is the
// comparison the criteria were derived against, and the figures above are how well they
// separate the two rather than a verdict.
//
// Pure: no DOM, no clock, no network.

export const CP_ECHO_NOTE = 'The echocardiographic criteria for constrictive pericarditis (Welch TD, Ling LH, Espinosa RE, et al, Circulation: Cardiovascular Imaging 2014;7(3):526-534) rest on three findings: a respiration-related shift of the ventricular septum, a medial or septal mitral annular e-prime velocity of 9 cm/s or more, and a hepatic vein expiratory diastolic reversal ratio of 0.79 or more. The septal shift is the anchor and neither of the other two counts without it. The septal shift together with either of the others was 87 percent sensitive and 91 percent specific; requiring all three raised specificity to 97 percent and dropped sensitivity to 64 percent, so the two readings answer different questions. The finding worth knowing is that a normal medial velocity is the abnormal one here. With a stiff sac and a normal muscle, lengthwise relaxation at the septal annulus is preserved or exaggerated while the lateral wall is tethered by the shell, so the medial velocity is preserved or raised and is often higher than the lateral velocity, which is the reverse of the normal relationship. Read the usual way, a medial velocity of 11 cm/s in someone with heart failure looks reassuring, and it is in fact one of the two criteria. The corollary is that the ratio of early filling velocity to the annular velocity does not estimate filling pressure in this disease; because the annular velocity rises as constriction worsens, that ratio varies inversely with left atrial pressure and the usual reading points the wrong way. These criteria were derived against restrictive cardiomyopathy, and the figures quoted are how well they separate the two rather than a verdict. It applies published criteria to measurements already taken and it does not stage the disease or select an operation.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const MEDIAL_E_MIN = 9;
const HV_RATIO_MIN = 0.79;

export function constrictivePericarditisEcho(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const septalShift = truthy(o.septalShift);
  const medialE = num(o.medialE);
  const lateralE = num(o.lateralE);
  const hvRatioDirect = num(o.hepaticVeinRatio);
  const hvReversal = num(o.hepaticVeinReversalVelocity);
  const hvForward = num(o.hepaticVeinForwardVelocity);

  if (medialE !== null && (medialE < 0 || medialE > 30)) {
    return { valid: false, message: 'The medial annular velocity is outside a plausible range of 0 to 30 cm/s.' };
  }
  if (lateralE !== null && (lateralE < 0 || lateralE > 30)) {
    return { valid: false, message: 'The lateral annular velocity is outside a plausible range of 0 to 30 cm/s.' };
  }
  if (hvRatioDirect !== null && (hvRatioDirect < 0 || hvRatioDirect > 5)) {
    return { valid: false, message: 'The hepatic vein reversal ratio is outside a plausible range of 0 to 5.' };
  }
  if (hvReversal !== null && (hvReversal < 0 || hvReversal > 200)) {
    return { valid: false, message: 'The hepatic vein reversal velocity is outside a plausible range of 0 to 200 cm/s.' };
  }
  if (hvForward !== null && (hvForward <= 0 || hvForward > 200)) {
    return { valid: false, message: 'The hepatic vein forward velocity has to be above 0 and no more than 200 cm/s.' };
  }

  // The ratio may be given directly, or as the two velocities it is made of.
  let hvRatio = hvRatioDirect;
  let hvDerived = false;
  if (hvRatio === null && hvReversal !== null && hvForward !== null) {
    hvRatio = Math.round((hvReversal / hvForward) * 100) / 100;
    hvDerived = true;
  }

  if (!septalShift && medialE === null && hvRatio === null) {
    return { valid: false, message: 'Record the septal shift, or enter the medial annular velocity or the hepatic vein reversal ratio.' };
  }

  const medialMet = medialE !== null && medialE >= MEDIAL_E_MIN;
  const hvMet = hvRatio !== null && hvRatio >= HV_RATIO_MIN;
  const supporting = (medialMet ? 1 : 0) + (hvMet ? 1 : 0);

  const eitherMet = septalShift && supporting >= 1;
  const allThree = septalShift && medialMet && hvMet;

  let state;
  let performance;
  if (allThree) {
    state = 'all three criteria are met';
    performance = 'All three together were 64 percent sensitive and 97 percent specific. The septal shift with either one of the others, which is also satisfied here, was 87 percent sensitive and 91 percent specific. The stricter reading buys specificity and gives up sensitivity; both figures come from the same study.';
  } else if (eitherMet) {
    state = 'the criteria are met on the septal shift plus one supporting finding';
    performance = 'That combination was 87 percent sensitive and 91 percent specific. Requiring all three would raise specificity to 97 percent and drop sensitivity to 64 percent.';
  } else if (septalShift) {
    state = 'the septal shift is present but neither supporting criterion is met';
    performance = 'The septal shift is the anchor of these criteria, but on its own it does not satisfy them.';
  } else {
    state = 'the criteria are not met';
    performance = 'The respiration-related septal shift is required. Neither the annular velocity nor the hepatic vein ratio counts without it.';
  }

  // The error this tile exists to prevent: a preserved medial e' read as reassuring.
  const annulusReversusNote = medialMet
    ? `A medial annular velocity of ${medialE} cm/s reads as normal or better in most settings, and here that IS the criterion. With a stiff sac and a normal muscle, lengthwise relaxation at the septal annulus is preserved or exaggerated while the lateral wall is tethered by the shell.`
    : null;

  const reversedPairNote = medialE !== null && lateralE !== null && medialE > lateralE
    ? `The medial velocity of ${medialE} cm/s is higher than the lateral velocity of ${lateralE} cm/s. That is the reverse of the normal relationship, and the reversal is itself the finding.`
    : null;

  const paradoxusNote = eitherMet
    ? 'Where these criteria are met, the ratio of early filling velocity to the annular velocity does not estimate filling pressure. The annular velocity rises as constriction worsens, so that ratio varies inversely with left atrial pressure and the usual reading points the wrong way.'
    : null;

  const derivedNote = hvDerived
    ? `The hepatic vein ratio is ${hvRatio}, taken as an expiratory diastolic reversal velocity of ${hvReversal} divided by a diastolic forward velocity of ${hvForward}.`
    : null;

  const missingNote = septalShift && medialE === null && hvRatio === null
    ? 'Enter the medial annular velocity or the hepatic vein reversal ratio. The septal shift alone does not settle these criteria either way.'
    : null;

  const scopeNote = 'These criteria were derived against restrictive cardiomyopathy, and the sensitivity and specificity quoted are how well they separate the two. They do not stage the disease and they do not select an operation.';

  return {
    valid: true,
    septalShift,
    medialE,
    lateralE,
    hepaticVeinRatio: hvRatio,
    medialMet,
    hepaticVeinMet: hvMet,
    supportingMet: supporting,
    criteriaMet: eitherMet,
    allThreeMet: allThree,
    state,
    performance,
    annulusReversusNote,
    reversedPairNote,
    paradoxusNote,
    derivedNote,
    missingNote,
    scopeNote,
    abnormal: eitherMet,
    bandLabel: eitherMet ? 'Criteria met' : 'Criteria not met',
    band: `Constrictive pericarditis echo criteria — ${state}.`,
    detail: 'The three findings are a respiration-related shift of the ventricular septum, a medial annular velocity of 9 cm/s or more, and a hepatic vein expiratory diastolic reversal ratio of 0.79 or more. The septal shift is required. With the shift and either of the others the criteria were 87 percent sensitive and 91 percent specific; with all three, 64 percent sensitive and 97 percent specific.',
    note: CP_ECHO_NOTE,
  };
}
