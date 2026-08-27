// spec-v824: Graus 2016 criteria for possible autoimmune encephalitis and for definite
// autoimmune limbic encephalitis.
//
// Source:
//   Graus F, Titulaer MJ, Balu R, et al. A clinical approach to diagnosis of autoimmune
//   encephalitis. Lancet Neurol. 2016;15(4):391-404. Both panels are encoded here verbatim
//   from the paper.
//
// POSSIBLE AUTOIMMUNE ENCEPHALITIS - all three:
//   1  subacute onset, rapid progression of less than 3 months, of working memory deficits
//      (short-term memory loss), altered mental status, or psychiatric symptoms
//   2  at least one of: new focal CNS findings; seizures not explained by a previously known
//      seizure disorder; CSF pleocytosis, more than five white cells per mm3; MRI features
//      suggestive of encephalitis
//   3  reasonable exclusion of alternative causes
//
// DEFINITE AUTOIMMUNE LIMBIC ENCEPHALITIS - all four:
//   1  subacute onset of working memory deficits, seizures or psychiatric symptoms
//      suggesting involvement of the limbic system
//   2  bilateral T2-FLAIR abnormalities HIGHLY RESTRICTED to the medial temporal lobes
//   3  at least one of: CSF pleocytosis; EEG with epileptic or slow-wave activity involving
//      the temporal lobes
//   4  reasonable exclusion of alternative causes
//
// THE THING THIS TILE EXISTS TO PRESERVE: NEITHER SET MENTIONS AN ANTIBODY. That is the
// central design decision of the paper, not an oversight. Antibody results take weeks,
// antibody-negative autoimmune encephalitis is real, and a diagnostic approach that waits for
// serology delays immunotherapy in a disease where delay costs outcome. A tool that asked for
// antibody status and withheld a result without one would defeat the purpose the criteria
// were written to serve, so this tile does not ask.
//
// THE MRI ASYMMETRY: in possible AE, "MRI features suggestive of encephalitis" is one of FOUR
// alternatives in criterion 2 - a normal MRI is entirely compatible with the diagnosis. In
// definite limbic encephalitis, bilateral medial temporal T2-FLAIR change is a MANDATORY
// criterion in its own right. The same normal scan leaves one diagnosis open and rules the
// other out.
//
// Pure: no DOM, no clock, no network.

export const AE_NOTE = 'The Graus criteria (Graus F, Titulaer MJ, Balu R, et al, Lancet Neurol 2016;15(4):391-404) define possible autoimmune encephalitis by three requirements: subacute onset over less than three months of working memory deficits, altered mental status or psychiatric symptoms; at least one of new focal central nervous system findings, seizures not explained by a known seizure disorder, more than five white cells per cubic millimetre in the cerebrospinal fluid, or MRI features suggestive of encephalitis; and reasonable exclusion of alternative causes. Definite autoimmune limbic encephalitis needs four: subacute onset of working memory deficits, seizures or psychiatric symptoms suggesting limbic involvement; bilateral abnormalities on T2-weighted FLAIR imaging highly restricted to the medial temporal lobes; at least one of cerebrospinal fluid pleocytosis or an electroencephalogram with epileptic or slow-wave activity over the temporal lobes; and again reasonable exclusion. Neither set mentions an antibody, and that is deliberate rather than an omission: antibody results take weeks, antibody-negative disease is real, and an approach that waits for serology delays immunotherapy in a condition where delay costs outcome. The imaging requirement also differs between the two, since a suggestive MRI is only one of four alternatives for possible encephalitis while bilateral medial temporal change is mandatory for the definite limbic form, so a normal scan leaves the first open and rules the second out. The most frequent mimic is herpes simplex encephalitis, and cerebrospinal fluid PCR for it can be falsely negative within the first day. It applies published criteria to findings already gathered and it does not start immunotherapy or aciclovir.';

export const PLEOCYTOSIS_THRESHOLD = 5; // white cells per mm3, strictly more than
export const MAX_CSF_WBC = 100000;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function autoimmuneEncephalitis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const csfWbc = num(o.csfWhiteCells);
  if (csfWbc !== null && (csfWbc < 0 || csfWbc > MAX_CSF_WBC)) {
    return { valid: false, message: `CSF white cell count must be between 0 and ${MAX_CSF_WBC} per mm3.` };
  }
  const pleocytosis = csfWbc !== null && csfWbc > PLEOCYTOSIS_THRESHOLD;

  const subacute = truthy(o.subacuteOnset);
  const limbicPresentation = truthy(o.limbicPresentation);
  const excluded = truthy(o.alternativesExcluded);

  // Possible AE, criterion 2.
  const supporting = [];
  if (truthy(o.focalCnsFindings)) supporting.push('new focal CNS findings');
  if (truthy(o.newSeizures)) supporting.push('seizures not explained by a previously known seizure disorder');
  if (pleocytosis) supporting.push(`CSF pleocytosis, ${csfWbc} white cells per mm3`);
  if (truthy(o.mriSuggestive)) supporting.push('MRI features suggestive of encephalitis');

  const possible = {
    one: subacute,
    two: supporting.length >= 1,
    three: excluded,
  };
  const possibleMet = possible.one && possible.two && possible.three;

  // Definite autoimmune limbic encephalitis.
  const bilateralMtl = truthy(o.bilateralMedialTemporal);
  const temporalEeg = truthy(o.temporalEeg);
  const limbicThird = pleocytosis || temporalEeg;
  const limbic = {
    one: subacute && limbicPresentation,
    two: bilateralMtl,
    three: limbicThird,
    four: excluded,
  };
  const limbicMet = limbic.one && limbic.two && limbic.three && limbic.four;

  const diagnoses = [];
  if (limbicMet) diagnoses.push('definite autoimmune limbic encephalitis');
  if (possibleMet) diagnoses.push('possible autoimmune encephalitis');

  // The imaging asymmetry, said out loud when a scan is the thing separating the two.
  const mriNote = !bilateralMtl && possibleMet
    ? 'Definite autoimmune limbic encephalitis additionally requires bilateral T2-FLAIR change highly restricted to the medial temporal lobes, which is not recorded. A normal or non-specific scan is compatible with possible autoimmune encephalitis and rules out the definite limbic form: the imaging requirement is one of four alternatives in the first and mandatory in the second.'
    : null;

  // The reason there is no antibody field.
  const antibodyNote = possibleMet || limbicMet
    ? 'Neither criteria set includes an antibody result, by design. Serology takes weeks and antibody-negative disease is real, so the paper defines these entirely on clinical, CSF, MRI and EEG grounds. A negative or pending antibody does not undo a diagnosis reached here.'
    : null;

  const missing = [];
  if (!possibleMet) {
    const m = [];
    if (!possible.one) m.push('subacute onset over less than 3 months of memory deficits, altered mental status or psychiatric symptoms');
    if (!possible.two) m.push('at least one of focal CNS findings, new seizures, CSF pleocytosis or a suggestive MRI');
    if (!possible.three) m.push('reasonable exclusion of alternative causes');
    missing.push(`for possible autoimmune encephalitis: ${m.join('; ')}`);
  }

  const met = diagnoses.length > 0;
  return {
    valid: true,
    criteriaMet: met,
    diagnoses,
    possible,
    limbic,
    possibleMet,
    limbicMet,
    pleocytosis,
    supportingFeatures: supporting,
    mriNote,
    antibodyNote,
    missing,
    abnormal: met,
    bandLabel: met ? diagnoses[0] : 'Neither criteria set met',
    band: met
      ? `Criteria met for ${diagnoses.join(', and for ')}.`
      : `Neither Graus criteria set is met — ${missing.join('; ')}.`,
    detail: `Possible autoimmune encephalitis needs all three requirements; definite autoimmune limbic encephalitis needs all four, including bilateral medial temporal T2-FLAIR change. CSF pleocytosis means MORE than ${PLEOCYTOSIS_THRESHOLD} white cells per mm3. The most frequent mimic is herpes simplex encephalitis, whose CSF PCR can be falsely negative within the first 24 hours.`,
    note: AE_NOTE,
  };
}
