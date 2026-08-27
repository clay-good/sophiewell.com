// spec-v831: Quintero staging of twin-twin transfusion syndrome.
//
// Source:
//   Quintero RA, Morales WJ, Allen MH, Bornick PW, Johnson PK, Kruger M. Staging of
//   twin-twin transfusion syndrome. J Perinatol. 1999;19(8 Pt 1):550-555. (PMID 10645517.)
//
// THE FIVE STAGES:
//   I    the oligohydramnios-polyhydramnios sequence, donor bladder VISIBLE, Dopplers normal
//   II   the sequence, donor bladder NOT visible over 60 minutes of observation, Dopplers
//        still normal
//   III  critically abnormal Dopplers in either twin - absent or reversed end-diastolic flow
//        in the umbilical artery, a reversed ductus venosus a-wave, or pulsatile umbilical
//        venous flow
//   IV   hydrops
//   V    demise of one or both twins
//
// THE ENTRY CONDITION IS THE FLUID SEQUENCE, NOT A SIZE DIFFERENCE. Twin-twin transfusion
// syndrome requires a maximum vertical pocket below 2 cm in the donor AND above 8 cm in the
// recipient, in a monochorionic diamniotic pregnancy. Discordant growth on its own is NOT
// this diagnosis - selective fetal growth restriction looks similar and is a different
// condition with different management. A tool that staged on growth discordance would name
// the wrong disease.
//
// AND THE STAGES ARE NOT A LADDER. Quintero staging orders findings, not the course of the
// disease: it does not progress obligately from I to V, a pregnancy can present at stage IV,
// and a higher number is not a guarantee of faster deterioration. It describes what is
// present now.
//
// Pure: no DOM, no clock, no network.

export const TTTS_NOTE = 'Quintero staging of twin-twin transfusion syndrome (Quintero RA, Morales WJ, Allen MH, et al, J Perinatol 1999;19(8 Pt 1):550-555) applies to a monochorionic diamniotic pregnancy showing the oligohydramnios-polyhydramnios sequence, meaning a maximum vertical pocket below 2 centimetres in the donor and above 8 centimetres in the recipient. Stage one is that sequence with the donor bladder still visible and normal Dopplers. Stage two is the same with the donor bladder not visible over sixty minutes of observation. Stage three is critically abnormal Dopplers in either twin, meaning absent or reversed end-diastolic flow in the umbilical artery, a reversed ductus venosus a-wave, or pulsatile umbilical venous flow. Stage four is hydrops and stage five is the death of one or both twins. Two points are easy to get wrong. The entry condition is the fluid sequence and not a size difference: discordant growth alone is selective fetal growth restriction, a different condition with different management, and staging on growth would name the wrong disease. And the stages order findings rather than the course, so the condition does not progress obligately from one to five, a pregnancy can present at stage four, and a higher number is not a guarantee of faster deterioration. It describes findings already made on ultrasound and it does not decide about laser therapy, amnioreduction or delivery.';

export const DONOR_MVP_MAX = 2;      // cm, below this
export const RECIPIENT_MVP_MIN = 8;  // cm, above this

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function quinteroTtts(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const donor = num(o.donorMvp);
  const recipient = num(o.recipientMvp);
  for (const [label, v] of [['Donor maximum vertical pocket', donor], ['Recipient maximum vertical pocket', recipient]]) {
    if (v !== null && (v < 0 || v > 40)) return { valid: false, message: `${label} must be between 0 and 40 cm.` };
  }

  const monochorionic = truthy(o.monochorionicDiamniotic);
  const oligo = donor !== null && donor < DONOR_MVP_MAX;
  const poly = recipient !== null && recipient > RECIPIENT_MVP_MIN;
  const sequence = oligo && poly;

  const bladderVisible = truthy(o.donorBladderVisible);
  const abnormalDoppler = truthy(o.criticallyAbnormalDoppler);
  const hydrops = truthy(o.hydrops);
  const demise = truthy(o.demise);

  // Most advanced finding wins.
  let stage = null;
  let basis = null;
  if (monochorionic && sequence) {
    if (demise) { stage = 'V'; basis = 'demise of one or both twins'; }
    else if (hydrops) { stage = 'IV'; basis = 'hydrops'; }
    else if (abnormalDoppler) { stage = 'III'; basis = 'critically abnormal Dopplers in either twin'; }
    else if (!bladderVisible) { stage = 'II'; basis = 'the donor bladder not visible over 60 minutes of observation'; }
    else { stage = 'I'; basis = 'the fluid sequence with a visible donor bladder and normal Dopplers'; }
  }

  // The wrong-disease error.
  const discordanceNote = monochorionic && !sequence && (oligo || poly)
    ? `Only ${oligo ? 'the donor oligohydramnios' : 'the recipient polyhydramnios'} is present. Twin-twin transfusion syndrome needs BOTH halves of the sequence: a donor pocket below ${DONOR_MVP_MAX} cm and a recipient pocket above ${RECIPIENT_MVP_MIN} cm. One without the other is not this diagnosis.`
    : (monochorionic && !sequence && donor !== null && recipient !== null
      ? 'Neither half of the oligohydramnios-polyhydramnios sequence is present. Discordant growth without the fluid sequence is selective fetal growth restriction, a different condition with different management, not twin-twin transfusion syndrome.'
      : null);

  const chorionicityNote = !monochorionic && sequence
    ? 'The fluid sequence is present, but twin-twin transfusion syndrome is a complication of a MONOCHORIONIC diamniotic pregnancy. Chorionicity has not been confirmed here, and without it this staging does not apply.'
    : null;

  // The ladder misreading.
  const ladderNote = stage
    ? 'Quintero staging orders findings, not the course of the disease. It does not progress obligately from I to V, a pregnancy can present at stage IV, and a higher stage is not a guarantee of faster deterioration.'
    : null;

  const missing = [];
  if (!monochorionic) missing.push('a confirmed monochorionic diamniotic pregnancy');
  if (!oligo) missing.push(`a donor maximum vertical pocket below ${DONOR_MVP_MAX} cm`);
  if (!poly) missing.push(`a recipient maximum vertical pocket above ${RECIPIENT_MVP_MIN} cm`);

  return {
    valid: true,
    stage,
    sequencePresent: sequence,
    basis,
    discordanceNote,
    chorionicityNote,
    ladderNote,
    missing,
    abnormal: !!stage,
    bandLabel: stage ? `Quintero stage ${stage}` : 'Not stageable',
    band: stage
      ? `Quintero stage ${stage} — ${basis}.`
      : `Not stageable as twin-twin transfusion syndrome — outstanding: ${missing.join('; ')}.`,
    detail: `Stage I is the fluid sequence with a visible donor bladder and normal Dopplers; II the bladder not visible over 60 minutes; III critically abnormal Dopplers, meaning absent or reversed umbilical artery end-diastolic flow, a reversed ductus venosus a-wave, or pulsatile umbilical venous flow; IV hydrops; V demise of one or both twins.`,
    note: TTTS_NOTE,
  };
}
