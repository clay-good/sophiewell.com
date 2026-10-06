// spec-v1560 tool 3: suspected acute bacterial meningitis: should the lumbar puncture wait, which empiric
// antibiotics, do corticosteroids apply, and for how long (WHO 2025).
//
// Source: WHO. WHO guidelines on meningitis diagnosis, treatment and care, 2025 (MEN25; IRIS 10665/381006;
// CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026, executive summary pp. xiii-xxi:
//   - Cranial imaging not routinely. Where imaging is readily accessible, image before lumbar puncture if GCS
//     below 10, focal neurological signs, cranial nerve deficits, papilledema, new-onset seizures (adults) or
//     a severe immunocompromised state; where it is not, defer the puncture until they resolve. Never delay
//     treatment for imaging or a deferred puncture; take blood cultures first. A new isolated seizure in a
//     child needs no imaging.
//   - Empiric IV ceftriaxone or cefotaxime (ceftriaxone preferred in meningococcal or pneumococcal
//     epidemics); add IV ampicillin or amoxicillin for any Listeria risk factor (over 60, pregnancy,
//     immunosuppressive therapy, transplant, malignancy, advanced HIV, diabetes, end-stage kidney disease,
//     cirrhosis, alcohol use disease); consider vancomycin where pneumococcal resistance is high;
//     chloramphenicol with benzylpenicillin, ampicillin or amoxicillin only if neither cephalosporin is
//     immediately available. Consider a parenteral dose before transfer.
//   - Duration: non-epidemic with no pathogen, may stop after 7 days if recovered (48 hours without fever,
//     with normal vital signs, consciousness and mental status); meningococcal epidemic 5 days of
//     ceftriaxone; pneumococcal epidemic 10 days (conditional).
//   - Corticosteroids (IV, with the first antibiotic dose): non-epidemic with LP possible (strong) or not
//     possible and strongly suspected (conditional); not routinely in a meningococcal epidemic; yes in a
//     pneumococcal epidemic (epidemic rules when the agent is identified by culture or PCR); stop if the CSF
//     is not bacterial; 4 days at most; never in cerebral malaria; not shown to help in advanced HIV.
//   - Contacts: single-dose ceftriaxone or ciprofloxacin (rifampicin if neither) for close contacts, from 7
//     days before onset to 24 hours after antibiotics; little or no benefit after 14 days.
//
// MEN25 gives no mg/kg doses, so none are printed. A red flag left blank is not assessed, and then the
// puncture decision is not made.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SETTING_OPTIONS = [
  { value: 'sporadic', text: 'Non-epidemic' },
  { value: 'meningo', text: 'Meningococcal epidemic' },
  { value: 'pneumo', text: 'Pneumococcal epidemic' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const FLAGS = [
  ['gcs', 'GCS below 10'],
  ['focal', 'focal neurological signs'],
  ['cranial', 'cranial nerve deficits'],
  ['papill', 'papilledema'],
  ['seizure', 'new-onset seizures (adult)'],
  ['immuno', 'a severe immunocompromised state'],
];
const join = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const yn = (v) => YES_NO.some((x) => x.value === v);
const NOTE = 'This follows WHO\'s 2025 meningitis guidelines. They give no doses: use your local formulary. Never delay antibiotics for imaging or a deferred puncture.';

export function meningitisWho2025(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const years = Number(o.age);
  const setting = SETTING_OPTIONS.find((x) => x.value === o.setting);
  if (!setting) return { valid: false, message: 'Choose the setting: non-epidemic, or a meningococcal or pneumococcal epidemic.' };
  if (!yn(o.imaging)) return { valid: false, message: 'Choose whether cranial imaging is readily accessible: it decides between imaging first and deferring the puncture.' };

  const present = FLAGS.filter(([k]) => o[k] === 'yes').map(([, t]) => t);
  const open = FLAGS.filter(([k]) => !yn(o[k])).map(([, t]) => t);
  const notes = [];

  // 1. Lumbar puncture.
  let lp;
  let label;
  let lpPossible;
  if (present.length) {
    lp = o.imaging === 'yes' ? `Image the head before the lumbar puncture (${join(present)}).` : `Defer the lumbar puncture until ${join(present)} ${present.length > 1 ? 'have' : 'has'} resolved; imaging is not accessible.`;
    label = o.imaging === 'yes' ? 'Image before LP' : 'Defer LP';
    lpPossible = false;
    notes.push('Take blood cultures and start antibiotics now, before imaging or the deferred puncture.');
  } else if (open.length) {
    lp = `Lumbar puncture not decided: ${join(open)} not assessed. Any one would mean ${o.imaging === 'yes' ? 'imaging first' : 'deferring the puncture'}.`;
    label = 'LP not decided';
    lpPossible = null;
  } else {
    lp = 'Lumbar puncture now, before the first antibiotic dose if it causes no delay; no imaging needed.';
    label = 'LP now';
    lpPossible = true;
  }
  notes.push('A new isolated seizure in a child, without other red flags, needs no imaging before the puncture.');

  // 2. Empiric antibiotics.
  const listeria = years > 60 || o.listeria === 'yes';
  const ceph = setting.value === 'sporadic' ? 'IV ceftriaxone or cefotaxime' : 'IV ceftriaxone (preferred over cefotaxime in an epidemic; IM if IV is not feasible)';
  let abx = o.cephAvailable === 'no'
    ? 'IV chloramphenicol with benzylpenicillin, ampicillin or amoxicillin (ampicillin or amoxicillin where Hib vaccination is low), because neither ceftriaxone nor cefotaxime is available'
    : ceph;
  if (listeria) abx += `, plus IV ampicillin or amoxicillin for Listeria (${years > 60 ? 'over 60' : 'a risk factor'})`;
  if (o.resistant === 'yes') abx += ', plus IV vancomycin for high local pneumococcal resistance';
  notes.push(`Empiric antibiotics, as early as possible: ${abx}.`);
  if (o.listeria !== 'yes' && o.listeria !== 'no' && years <= 60) notes.push('Listeria risk factors: not entered. Pregnancy, immunosuppressive therapy, transplant, malignancy, advanced HIV, diabetes, end-stage kidney disease, cirrhosis or alcohol use disease would add ampicillin or amoxicillin.');
  if (o.resistant !== 'yes' && o.resistant !== 'no') notes.push('Local pneumococcal resistance: not entered. Where it is high, add vancomycin.');
  if (o.cephAvailable !== 'yes' && o.cephAvailable !== 'no') notes.push('Cephalosporin availability: not entered. If neither ceftriaxone nor cefotaxime is available, chloramphenicol with a penicillin is the alternative.');
  notes.push('Before a transfer with a long delay, give a parenteral dose first.');

  // 3. Corticosteroids.
  if (o.malaria === 'yes') notes.push('Corticosteroids: no. Not in cerebral malaria (prolonged coma).');
  else if (setting.value === 'meningo') notes.push('Corticosteroids: not routinely in a meningococcal epidemic (when the agent is confirmed by culture or PCR).');
  else {
    const why = setting.value === 'pneumo' ? 'in a pneumococcal epidemic (agent confirmed by culture or PCR)' : lpPossible === false ? 'where the puncture cannot be done now, if bacterial meningitis is strongly suspected (conditional)' : 'where the puncture can be done';
    notes.push(`Corticosteroids: IV dexamethasone (or hydrocortisone or methylprednisolone) with the first antibiotic dose, ${why}. Stop if the CSF is not bacterial; 4 days at most.${o.ahd === 'yes' ? ' In advanced HIV disease they have not been shown to help.' : ''}`);
    if (o.malaria !== 'no') notes.push('Cerebral malaria: not entered. Corticosteroids are not given if it is suspected.');
  }

  // 4. Duration.
  notes.push(setting.value === 'meningo'
    ? 'Duration: ceftriaxone for 5 days; extend and investigate if not recovered.'
    : setting.value === 'pneumo'
      ? 'Duration: ceftriaxone for 10 days (conditional); extend and investigate if not recovered.'
      : 'Duration, if no pathogen is found: may stop after 7 days once recovered for 48 hours (no fever, normal vital signs, consciousness and mental status); otherwise continue and repeat the puncture.');

  // 5. Contacts.
  notes.push('Close contacts (household, or exposed to oral secretions from 7 days before onset to 24 hours after antibiotics) of meningococcal disease: single-dose ceftriaxone or ciprofloxacin (rifampicin if neither), as soon as possible; little benefit after 14 days.');

  return { valid: true, band: lp, bandLabel: label, abnormal: true, notes, note: NOTE };
}
