// spec-v1427: McPherson staging of periprosthetic joint infection.
//
// Sources, read 2026-09-24:
//   McPherson EJ, Tontz W Jr, Patzakis M, et al. Outcome of infected total knee utilizing a staging
//     system for prosthetic joint infection. Am J Orthop 1999;28(3):161-165 (PubMed 10195839) -- the
//     original, 70 infected TKAs.
//   McPherson EJ, Woodson C, Holtom P, et al. Periprosthetic total hip infection: outcomes using a
//     staging system. Clin Orthop Relat Res 2002;403:8-15 -- the same system applied to the hip.
//   Coughlan A, Taylor F. Classifications in Brief: the McPherson classification of periprosthetic
//     infection. Clin Orthop Relat Res 2020;478(4):903-908 (PMC7282566). Its Table 1:
//       Infection type I "Early postoperative infection (less than 4 weeks postoperative)";
//         II "Hematogenous infection (less than 4 weeks duration)"; III "Late chronic infection
//         (more than 4 weeks duration)"
//       Systemic host grade A "Uncompromised (no compromising factors)"; B "Compromised (one to
//         two compromising factors)"; C "Significant compromise (more than two compromising
//         factors) or one of the following: Absolute neutrophil count less than 1000; CD4 T cell
//         count less than 100; Intravenous drug abuse; Chronic active infection, other site;
//         Dysplasia or neoplasm of the immune system"
//       Local extremity grade 1 (no factors), 2 (one to two), 3 (more than two).
//     Its Table 2 lists the 14 systemic and 8 local compromising factors encoded below. Text: the
//     system "has not been validated with intra- and interobserver studies"; "we caution the use of
//     this system until research validating its use exists".
//
// Each factor is a yes/no answer, and a blank means NOT ANSWERED, never "no": an unanswered factor
// could raise the grade, so a grade that depends on one is reported as the range it could be.
// Pure: no DOM, no clock, no network.

export const MPH_TYPE = [
  { value: 'I', text: 'Type I: early postoperative, less than 4 weeks after the operation' },
  { value: 'II', text: 'Type II: hematogenous, less than 4 weeks of symptoms' },
  { value: 'III', text: 'Type III: late chronic, more than 4 weeks of symptoms' },
];
export const MPH_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
// Table 2, systemic host compromising factors.
export const MPH_SYSTEMIC = [
  { key: 'age80', text: 'Age 80 years or older' },
  { key: 'alcoholism', text: 'Alcoholism' },
  { key: 'dermatitis', text: 'Chronic active dermatitis or cellulitis' },
  { key: 'catheter', text: 'Chronic indwelling catheter' },
  { key: 'malnutrition', text: 'Chronic malnutrition (albumin 3.0 g/dL or less)' },
  { key: 'nicotine', text: 'Current nicotine use (inhaled or oral)' },
  { key: 'diabetes', text: 'Diabetes needing an oral agent or insulin' },
  { key: 'hepatic', text: 'Hepatic insufficiency (cirrhosis)' },
  { key: 'immunosuppressive', text: 'Immunosuppressive drugs (such as methotrexate, prednisone, cyclosporine)' },
  { key: 'malignancy', text: 'Malignancy, past or active' },
  { key: 'pulmonary', text: 'Pulmonary insufficiency (room-air arterial blood gas oxygen less than 60%)' },
  { key: 'dialysis', text: 'Renal failure requiring dialysis' },
  { key: 'inflammatory', text: 'Systemic inflammatory disease (such as rheumatoid arthritis or lupus)' },
  { key: 'immune', text: 'Systemic immune compromise from infection or disease (such as HIV or AIDS)' },
];
// Table 1, any one of which makes the host grade C.
export const MPH_CRITICAL = [
  { key: 'anc', text: 'Absolute neutrophil count less than 1000' },
  { key: 'cd4', text: 'CD4 T-cell count less than 100' },
  { key: 'ivdu', text: 'Intravenous drug abuse' },
  { key: 'otherInfection', text: 'Chronic active infection at another site' },
  { key: 'immuneNeoplasm', text: 'Dysplasia or neoplasm of the immune system' },
];
// Table 2, local extremity (wound) compromising factors.
export const MPH_LOCAL = [
  { key: 'longInfection', text: 'Active infection present more than 3 to 4 months' },
  { key: 'incisions', text: 'Multiple incisions (creating skin bridges)' },
  { key: 'softTissueLoss', text: 'Soft-tissue loss from prior trauma' },
  { key: 'abscess', text: 'Subcutaneous abscess greater than 8 square cm' },
  { key: 'fistula', text: 'Synovial cutaneous fistula' },
  { key: 'priorTrauma', text: 'Prior periarticular fracture or trauma about the joint (especially crush injury)' },
  { key: 'irradiation', text: 'Prior local irradiation to the wound area' },
  { key: 'vascular', text: 'Vascular insufficiency to the extremity (absent pulses, chronic venous stasis disease, significant calcific arterial disease)' },
];

const HOST_WORDS = { A: 'uncompromised', B: 'compromised', C: 'significantly compromised' };
const LIMB_WORDS = { 1: 'uncompromised', 2: 'compromised', 3: 'significantly compromised' };
const TYPE_WORDS = { I: 'early postoperative', II: 'acute hematogenous', III: 'late chronic' };

const answer = (v) => (v === 'yes' || v === 'no' ? v : null);
function tally(list, o) {
  let yes = 0; let open = 0; const named = [];
  for (const f of list) {
    const a = answer(o[f.key]);
    if (a === 'yes') { yes += 1; named.push(f.text); } else if (a === null) open += 1;
  }
  return { yes, open, named };
}
const byCount = (n, grades) => (n === 0 ? grades[0] : n <= 2 ? grades[1] : grades[2]);
const span = (lo, hi) => (lo === hi ? lo : `${lo} to ${hi}`);

export function mcphersonPji(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = MPH_TYPE.some((x) => x.value === o.type) ? o.type : null;
  if (!type) return { valid: false, message: 'Choose the infection type: early postoperative, hematogenous, or late chronic.' };

  const sys = tally(MPH_SYSTEMIC, o);
  const crit = tally(MPH_CRITICAL, o);
  const loc = tally(MPH_LOCAL, o);

  const HOST = ['A', 'B', 'C'];
  const hostLo = crit.yes > 0 ? 'C' : byCount(sys.yes, HOST);
  const hostHi = crit.yes > 0 || crit.open > 0 ? 'C' : byCount(sys.yes + sys.open, HOST);
  const LIMB = ['1', '2', '3'];
  const limbLo = byCount(loc.yes, LIMB);
  const limbHi = byCount(loc.yes + loc.open, LIMB);

  const host = span(hostLo, hostHi);
  const limb = span(limbLo, limbHi);
  const complete = hostLo === hostHi && limbLo === limbHi;
  const stage = `${type}, ${host}, ${limb}`;

  const notes = [];
  if (crit.yes > 0) notes.push(`Host grade C on its own: ${crit.named.join('; ')}.`);
  else if (sys.yes > 0) notes.push(`${sys.yes} systemic compromising factor${sys.yes === 1 ? '' : 's'}: ${sys.named.join('; ')}.`);
  if (loc.yes > 0) notes.push(`${loc.yes} local compromising factor${loc.yes === 1 ? '' : 's'}: ${loc.named.join('; ')}.`);
  if (hostLo !== hostHi) {
    const open = sys.open + crit.open;
    notes.push(`Host grade is ${hostLo} to ${hostHi}: ${open} host factor${open === 1 ? ' is' : 's are'} not answered, and an unanswered factor is not counted as absent.`);
  }
  if (limbLo !== limbHi) {
    notes.push(`Limb grade is ${limbLo} to ${limbHi}: ${loc.open} local factor${loc.open === 1 ? ' is' : 's are'} not answered, and an unanswered factor is not counted as absent.`);
  }
  notes.push('The system has not been validated with intraobserver or interobserver studies, and it does not account for the infecting organism or its resistance.');

  let band;
  if (complete) {
    band = `McPherson stage ${type}/${hostLo}/${limbLo}: ${TYPE_WORDS[type]} infection in a${hostLo === 'A' ? 'n' : ''} ${HOST_WORDS[hostLo]} host with a${limbLo === '1' ? 'n' : ''} ${LIMB_WORDS[limbLo]} limb.`;
  } else {
    band = `McPherson stage ${type}, host ${host}, limb ${limb}: a ${TYPE_WORDS[type]} infection; answer the remaining factors to fix the grades.`;
  }

  return {
    valid: true,
    abnormal: true,
    type,
    host,
    limb,
    complete,
    band,
    bandLabel: complete ? `${type}/${hostLo}/${limbLo}` : stage,
    notes,
    note: 'McPherson EJ et al, Am J Orthop 1999 and Clin Orthop Relat Res 2002; tables as reproduced by Coughlan A and Taylor F, Clin Orthop Relat Res 2020, who caution its use until validation studies exist. '
      + 'The stage describes the infection, host and limb; it does not choose the operation.',
  };
}
