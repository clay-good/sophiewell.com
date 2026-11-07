// spec-v1708: IV thrombolysis checklist for acute ischemic stroke, as the AHA/ASA 2026 guideline states it (Prabhakaran
// S, et al. Stroke 2026;57(8), doi:10.1161/STR.0000000000000513, and its correction of July 27, 2026), beside the TNKase
// and Activase labels (DailyMed, read November 7, 2026). The guideline's recommendation tables and Table 8 were read from
// their published images; each row below is a paraphrase of a few words, cited by section (the text is copyrighted).
//
// It is a checklist, never an order: it reports which guideline recommendation the timing falls under and which Table 8
// rows were ticked, by tier, and where a label disagrees. Only what is entered is considered. Nothing here computes a
// dose or says to give a drug.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';
import { labelRow } from './label-row.js';

// The two labels the statements come from (DailyMed set ids, watched in scripts/data/label-editions.json).
export const LABELS = { tnkase: 'e647640d-c395-4b4b-a0be-1162f9c21d84', activase: 'c669f77c-fa48-478b-a14b-80b20a0139c2' };

export const TIMING_OPTIONS = [
  { value: 'within-3h', text: 'Within 3 hours of last known well' },
  { value: '3-4.5h', text: 'More than 3 and up to 4.5 hours from last known well' },
  { value: 'unknown-onset', text: 'Unknown onset, within 4.5 hours of symptom recognition' },
  { value: 'wake-up', text: 'Woke with symptoms, within 9 hours of the midpoint of sleep' },
  { value: '4.5-9h', text: 'More than 4.5 and up to 9 hours from last known well' },
  { value: '9-24h', text: 'More than 9 and up to 24 hours from last known well' },
  { value: 'beyond-24h', text: 'More than 24 hours from last known well' },
];
export const DISABLING_OPTIONS = [
  { value: 'yes', text: 'Yes, the deficits are disabling' },
  { value: 'no', text: 'No, mild and non-disabling' },
];
export const EVT_OPTIONS = [
  { value: 'no', text: 'Not eligible for, or cannot receive, thrombectomy' },
  { value: 'yes', text: 'Thrombectomy is an option' },
];

// Table 8, tier by tier, with each row's key, short label and the guideline's point in a few words. `label` marks a
// row that both labels contraindicate (and how).
export const CONDITIONS = [
  // Absolute contraindications (Table 8, pinkish red).
  { key: 'ctHypodensity', tier: 'absolute', text: 'Extensive clear hypodensity on imaging explaining the symptoms' },
  { key: 'ctHemorrhage', tier: 'absolute', text: 'Acute intracranial hemorrhage on CT', label: 'both labels (active or current intracranial hemorrhage)' },
  { key: 'tbiUnder14d', tier: 'absolute', text: 'Moderate to severe traumatic brain injury within 14 days (over 30 min unconscious with GCS under 13, or hemorrhage, contusion or skull fracture on imaging)', label: 'both labels (head trauma within 2 months, TNKase; serious head trauma within 3 months, Activase)' },
  { key: 'neurosurgeryUnder14d', tier: 'absolute', text: 'Intracranial or spinal surgery within 14 days', label: 'both labels (within 2 months, TNKase; within 3 months, Activase)' },
  { key: 'spinalCordInjury3mo', tier: 'absolute', text: 'Acute spinal cord injury within 3 months', label: 'Activase (intraspinal trauma within 3 months), and TNKase if within 2 months' },
  { key: 'intraAxialNeoplasm', tier: 'absolute', text: 'Intra-axial intracranial neoplasm', label: 'both labels (intracranial neoplasm)' },
  { key: 'endocarditis', tier: 'absolute', text: 'Symptoms consistent with infective endocarditis' },
  { key: 'coagulopathy', tier: 'absolute', text: 'Severe coagulopathy or thrombocytopenia (platelets under 100,000/mm³, INR over 1.7, aPTT over 40 s or PT over 15 s)', label: 'both labels (bleeding diathesis)' },
  { key: 'aorticArchDissection', tier: 'absolute', text: 'Known or suspected aortic arch dissection' },
  { key: 'aria', tier: 'absolute', text: 'Amyloid-related imaging abnormalities, or amyloid immunotherapy' },
  // Relative contraindications (Table 8, peach).
  { key: 'preexistingDisability', tier: 'relative', text: 'Pre-existing disability or frailty' },
  { key: 'doac48h', tier: 'relative', text: 'DOAC taken within 48 hours (timing, renal function, assays and reversal weighed individually)' },
  { key: 'ischemicStroke3mo', tier: 'relative', text: 'Ischemic stroke within 3 months' },
  { key: 'priorIch', tier: 'relative', text: 'Prior intracranial hemorrhage (amyloid angiopathy higher risk than a modifiable cause)' },
  { key: 'trauma14d', tier: 'relative', text: 'Major non-CNS trauma within 14 days (surgical consultation)' },
  { key: 'surgery10d', tier: 'relative', text: 'Major non-CNS surgery within 10 days (surgical consultation)' },
  { key: 'giGuBleed21d', tier: 'relative', text: 'GI or GU bleeding within 21 days (GI or GU consultation)', label: 'both labels if the bleeding is active (active internal bleeding)' },
  { key: 'intracranialDissection', tier: 'relative', text: 'Intracranial arterial dissection (safety unknown)' },
  { key: 'vascularMalformation', tier: 'relative', text: 'Unruptured, untreated intracranial vascular malformation (safety unknown)', label: 'both labels (arteriovenous malformation)' },
  { key: 'stemi3mo', tier: 'relative', text: 'STEMI within 3 months (emergent cardiology consultation)' },
  { key: 'pericarditis', tier: 'relative', text: 'Acute pericarditis (with major, likely disabling stroke; emergent cardiology consultation)' },
  { key: 'cardiacThrombus', tier: 'relative', text: 'Left atrial or ventricular thrombus (with major, likely disabling stroke; emergent cardiology consultation)' },
  { key: 'activeMalignancy', tier: 'relative', text: 'Systemic active malignancy (emergent oncology consultation)' },
  { key: 'pregnancy', tier: 'relative', text: 'Pregnancy or the post-partum period (moderate or severe stroke; emergent obstetric consultation)' },
  { key: 'duralPuncture7d', tier: 'relative', text: 'Dural puncture within 7 days' },
  { key: 'arterialPuncture7d', tier: 'relative', text: 'Puncture of a noncompressible artery within 7 days (safety unknown)' },
  { key: 'tbi14dTo3mo', tier: 'relative', text: 'Moderate to severe traumatic brain injury 14 days to 3 months ago (neurosurgical and neurocritical care consultation)', label: 'Activase (serious head trauma within 3 months), and TNKase if within 2 months' },
  { key: 'neurosurgery14dTo3mo', tier: 'relative', text: 'Intracranial or spinal surgery 14 days to 3 months ago (neurosurgical consultation)', label: 'Activase (within 3 months), and TNKase if within 2 months' },
  // Benefit generally greater than bleeding risk (Table 8, light teal).
  { key: 'cervicalDissection', tier: 'favorable', text: 'Extracranial cervical arterial dissection' },
  { key: 'extraAxialNeoplasm', tier: 'favorable', text: 'Extra-axial intracranial neoplasm', label: 'both labels (intracranial neoplasm)' },
  { key: 'angiographicStroke', tier: 'favorable', text: 'Stroke during or right after angiography' },
  { key: 'unrupturedAneurysm', tier: 'favorable', text: 'Unruptured intracranial aneurysm', label: 'both labels (aneurysm)' },
  { key: 'remoteGiGuBleed', tier: 'favorable', text: 'Remote, stable GI or GU bleeding (GI or GU consultation)' },
  { key: 'remoteMi', tier: 'favorable', text: 'Remote myocardial infarction' },
  { key: 'recreationalDrugs', tier: 'favorable', text: 'Recreational drug use' },
  { key: 'mimicUncertain', tier: 'favorable', text: 'Uncertain whether this is a stroke or a mimic' },
  { key: 'moyamoya', tier: 'favorable', text: 'Moyamoya disease' },
];

const TIER_WORDS = {
  absolute: 'absolute contraindication (Table 8)',
  relative: 'relative contraindication (Table 8): weigh individually',
  favorable: 'benefit generally greater than bleeding risk (Table 8)',
};
const on = (v) => v === true || v === 'true' || v === '1';

// A blank field is null; anything else must be a plain number inside a plausible range, so a stray array,
// object or unit slip (platelets typed as 50000 rather than 50) is refused by name, never read as a value.
// Ranges (spec-v1712) are plausibility fences, not clinical limits.
const FENCES = {
  sbp: ['Systolic BP', 40, 350, 'mm Hg'],
  dbp: ['Diastolic BP', 20, 250, 'mm Hg'],
  glucose: ['Glucose', 10, 2000, 'mg/dL'],
  platelets: ['Platelets', 0, 2000, 'thousand/mm³ (150 means 150,000/mm³)'],
  inr: ['INR', 0.5, 20, ''],
  aptt: ['aPTT', 10, 250, 's'],
  pt: ['PT', 5, 150, 's'],
};
function fenced(o, key) {
  const v = o[key];
  if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) return { value: null };
  const [name, lo, hi, unit] = FENCES[key];
  const x = typeof v === 'number' || typeof v === 'string' ? measured(v) : null;
  if (x === null || x < lo || x > hi) return { fault: `${name} must be a number from ${lo} to ${hi.toLocaleString('en-US')}${unit ? ` ${unit}` : ''}, or left blank.` };
  return { value: x };
}

// The recommendation the timing falls under, or what it still needs.
function timingRule(t, o) {
  const evtNo = o.evtCandidate === 'no';
  const evtBlank = o.evtCandidate === null || o.evtCandidate === undefined || o.evtCandidate === '';
  switch (t) {
    case 'within-3h':
    case '3-4.5h':
      return { ok: true, line: 'Within 4.5 hours of last known well: IV thrombolysis is recommended for disabling deficits, as quickly as possible and without waiting for vessel or perfusion imaging (§4.6.1, recommendations 1 and 2, class 1).' };
    case 'unknown-onset':
      return on(o.dwiFlairMismatch)
        ? { ok: true, line: 'Unknown onset within 4.5 hours of symptom recognition with an MRI-DWI lesion under one-third of the MCA territory and no marked FLAIR change: can be beneficial (§4.6.3, recommendation 1, class 2a).' }
        : { ok: false, line: 'Unknown onset: the guideline\'s extended-window recommendation needs an MRI-DWI lesion under one-third of the MCA territory with no marked FLAIR change (§4.6.3, recommendation 1); that is not ticked.' };
    case 'wake-up':
    case '4.5-9h':
      if (!on(o.perfusionPenumbra)) return { ok: false, line: 'This window needs salvageable penumbra on automated perfusion imaging (§4.6.3, recommendation 2); that is not ticked.' };
      if (!evtNo) return { ok: false, line: `This window's recommendation is for patients not eligible for thrombectomy (§4.6.3, recommendation 2, as corrected July 27, 2026)${evtBlank ? '; whether thrombectomy is an option was not answered' : '; thrombectomy was marked as an option'}.` };
      return { ok: true, line: `${t === 'wake-up' ? 'Woke with symptoms within 9 hours of the midpoint of sleep' : '4.5 to 9 hours from last known well'}, salvageable penumbra on automated perfusion imaging, not a thrombectomy candidate: can be beneficial (§4.6.3, recommendation 2, class 2a).` };
    case '9-24h':
      if (!on(o.lvo) || !on(o.perfusionPenumbra)) return { ok: false, line: 'Beyond 9 hours, the only recommendation covers a large-vessel occlusion with salvageable penumbra (§4.6.3, recommendation 3); both are needed and not both are ticked.' };
      if (!evtNo) return { ok: false, line: `That recommendation is for patients who cannot receive thrombectomy${evtBlank ? '; whether thrombectomy is an option was not answered' : '; thrombectomy was marked as an option'}.` };
      return { ok: true, line: 'Large-vessel occlusion with salvageable penumbra, 4.5 to 24 hours, cannot receive thrombectomy: may be beneficial when directed by clinicians with thrombolysis expertise (§4.6.3, recommendation 3, class 2b).' };
    default:
      return { ok: false, line: 'More than 24 hours from last known well: the 2026 guideline makes no IV thrombolysis recommendation.' };
  }
}

export function tpaEligibility(input = {}, now = undefined) {
  const o = input && typeof input === 'object' ? input : {};
  // Fail closed on the labels: a superseded or lapsed label's statements are withheld; the guideline part answers.
  const rows = Object.values(LABELS).map((id) => labelRow(id, now));
  const labelsOk = rows.every((r) => r.answers);
  const timing = String(o.timing ?? '').trim();
  if (!TIMING_OPTIONS.some((x) => x.value === timing)) return { valid: false, message: 'Choose the time from last known well (or the unknown-onset or wake-up situation). An unknown time is not read as within the window.' };
  const disabling = String(o.disabling ?? '').trim();
  if (disabling !== 'yes' && disabling !== 'no') return { valid: false, message: 'Answer whether the deficits are disabling. The guideline turns on it (§4.6.1), and a blank answer is not read as either.' };

  if (!(o.evtCandidate === null || o.evtCandidate === undefined || o.evtCandidate === '' || EVT_OPTIONS.some((x) => x.value === o.evtCandidate))) {
    return { valid: false, message: 'Answer whether thrombectomy is an option with yes or no, or leave it blank; an unrecognized answer is not read as either.' };
  }
  const val = {};
  for (const key of Object.keys(FENCES)) {
    const r = fenced(o, key);
    if (r.fault) return { valid: false, message: r.fault };
    val[key] = r.value;
  }

  const notes = [];
  // Labs fire the coagulopathy row by number; blank labs are said to be blank.
  const plt = val.platelets; const inr = val.inr; const aptt = val.aptt; const pt = val.pt;
  const missingLabs = [['platelets', plt], ['INR', inr], ['aPTT', aptt], ['PT', pt]].filter(([, v]) => v === null).map(([n]) => n);
  const labHits = [];
  if (plt !== null && plt < 100) labHits.push(`platelets ${plt},000/mm³`);
  if (inr !== null && inr > 1.7) labHits.push(`INR ${inr}`);
  if (aptt !== null && aptt > 40) labHits.push(`aPTT ${aptt} s`);
  if (pt !== null && pt > 15) labHits.push(`PT ${pt} s`);
  const checked = new Set(CONDITIONS.filter((c) => on(o[c.key])).map((c) => c.key));
  if (labHits.length) checked.add('coagulopathy');
  if ([plt, inr, aptt, pt].every((v) => v === null)) {
    notes.push(on(o.recentAnticoagulant)
      ? 'No coagulation results were entered, and recent warfarin or heparin use was ticked: the guideline\'s permission to start before results applies only without recent warfarin or heparin (Table 8).'
      : 'No coagulation results were entered. The guideline: it is reasonable not to wait for them if nothing suggests an abnormal result (§4.6.1, recommendation 10, class 2a); without recent warfarin or heparin, treatment may start before results and stops if they come back abnormal (Table 8).');
  } else {
    const blankPart = missingLabs.length ? ` Not entered: ${missingLabs.join(', ')}, so the coagulopathy row is checked only on the values given.` : '';
    notes.push(labHits.length
      ? `Labs beyond the Table 8 coagulopathy limits: ${labHits.join(', ')}.${blankPart}`
      : `Labs entered are within the Table 8 coagulopathy limits.${blankPart}`);
    if (missingLabs.length && on(o.recentAnticoagulant)) notes.push('Recent warfarin or heparin use was ticked: the guideline\'s permission to start before results applies only without recent warfarin or heparin (Table 8).');
  }

  const rule = timingRule(timing, o);
  const byTier = (tier) => CONDITIONS.filter((c) => c.tier === tier && checked.has(c.key));
  const absolute = byTier('absolute');
  const relative = byTier('relative');
  const favorable = byTier('favorable');

  // Blood pressure and glucose are conditions to correct before treatment, not rows of Table 8.
  const sbp = val.sbp; const dbp = val.dbp;
  const bpHigh = (sbp !== null && sbp >= 185) || (dbp !== null && dbp >= 110);
  if (bpHigh) notes.push(`BP ${sbp ?? '?'}/${dbp ?? '?'} mm Hg: the guideline asks that SBP be lowered below 185 and DBP below 110 before IV thrombolysis is started (§4.3, recommendation 5, class 1).${labelsOk ? ' The labels contraindicate current severe uncontrolled hypertension.' : ''}`);
  else if (sbp === null && dbp === null) notes.push('Blood pressure was not entered; the guideline asks for SBP below 185 and DBP below 110 mm Hg before starting (§4.3, recommendation 5).');
  else if (sbp === null || dbp === null) notes.push(`${sbp === null ? 'Systolic' : 'Diastolic'} BP was not entered, so only half of the guideline's below-185/below-110 check was made (§4.3, recommendation 5).`);
  const glu = val.glucose;
  if (glu !== null && (glu < 50 || glu > 400)) notes.push(`Glucose ${glu} mg/dL: correct it and reassess; if disabling deficits persist after correction, the guideline recommends IV thrombolysis (§4.6.1, recommendations 5 and 6).`);
  else if (glu === null) notes.push('Glucose was not entered; the guideline asks for it before IV thrombolysis (§4.6.1, recommendation 5).');

  for (const [tier, tierRows] of [['absolute', absolute], ['relative', relative], ['favorable', favorable]]) {
    for (const r of tierRows) notes.push(`${r.text}: ${TIER_WORDS[tier]}.${r.label && labelsOk ? ` A labeled contraindication for ${r.label}.` : ''}`);
  }
  if (!labelsOk) for (const r of rows.filter((x) => !x.answers)) notes.push(`Label statements withheld: ${r.message}`);
  if (labelsOk && on(o.activeInternalBleeding)) notes.push('Active internal bleeding: a contraindication in both labels; Table 8 grades GI or GU bleeding by timing (within 21 days relative, remote and stable favorable).');
  if (labelsOk && on(o.subarachnoid)) notes.push('Subarachnoid hemorrhage: a contraindication in the Activase label.');
  if (labelsOk && timing !== 'within-3h') notes.push('Both labels state treatment within 3 hours of symptom onset for acute ischemic stroke; the guideline recommends beyond that as shown. The tool states both and reconciles neither.');
  notes.push(rule.line);
  const doses = ' tenecteplase 0.25 mg/kg up to 25 mg by weight band (under 60 kg 15 mg; 60 to under 70 kg 17.5; 70 to under 80 kg 20; 80 to under 90 kg 22.5; 90 kg or more 25); alteplase 0.9 mg/kg up to 90 mg, 10% over 1 minute and the rest over 60 minutes.';
  notes.push(`${labelsOk ? 'Doses as Table 7 and both labels state them, for information:' : 'Doses as Table 7 states them, for information:'}${doses}`);

  let band;
  let label;
  if (absolute.length) {
    band = `Absolute contraindication in the 2026 guideline (Table 8): ${absolute.map((r) => r.text.replace(/ \(.*\)$/, '')).join('; ')}. The guideline says IV thrombolysis should not be used.`;
    label = 'Absolute contraindication';
  } else if (disabling === 'no' && (timing === 'within-3h' || timing === '3-4.5h')) {
    band = 'Mild, non-disabling deficits: the guideline does not recommend IV thrombolysis within 4.5 hours, as it has not shown benefit over dual antiplatelet therapy (§4.6.1, recommendation 8, 3: No Benefit).';
    label = 'Not recommended (non-disabling)';
  } else if (!rule.ok) {
    band = `The timing does not meet a 2026 IV thrombolysis recommendation as entered. ${rule.line}${disabling === 'no' ? ' The deficits were also marked non-disabling.' : ''}`;
    label = 'Timing not met';
  } else if (disabling === 'no') {
    band = 'Deficits marked non-disabling, in an extended window: the guideline\'s recommendation against IV thrombolysis for mild non-disabling deficits is stated for within 4.5 hours, and this tool does not carry it, or the extended-window recommendation, over to this case. The decision rests with the stroke team.';
    label = 'Non-disabling, extended window';
  } else {
    band = `No absolute contraindication was ticked, and the timing falls under a 2026 recommendation.${relative.length ? ` ${relative.length} relative contraindication${relative.length === 1 ? '' : 's'} to weigh.` : ''} Only the items entered were considered; the decision rests with the stroke team.`;
    label = relative.length ? 'Relative contraindications to weigh' : 'No contraindication ticked';
  }
  return {
    valid: true, absolute: absolute.map((r) => r.key), relative: relative.map((r) => r.key), favorable: favorable.map((r) => r.key),
    timingMet: rule.ok, abnormal: Boolean(absolute.length) || disabling === 'no' || !rule.ok,
    band, bandLabel: label, notes,
    note: 'A checklist of the 2026 AHA/ASA guideline and the TNKase and Activase labels, not a treatment decision or an order. Check every item against the patient and the full guideline.',
  };
}
