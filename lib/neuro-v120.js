// spec-v120 (Wave 4 of the spec-v100 MDCalc Parity Completion program): five
// deterministic epilepsy-prognosis, headache-likelihood, and vertigo-
// localization instruments a neurologist or ED clinician runs daily. v117-v119
// covered stroke imaging, hemorrhagic grading, and prehospital LVO triage; v120
// fills the epilepsy / headache / vertigo gap. None duplicates a live tile; each
// takes the clinician's bedside exam or cEEG *read* as input -- v120 parses no
// EEG waveform, no DICOM, and no radiology report (spec-v120 §7).
//
//   stess            - Status Epilepticus Severity Score (0-6)
//   helps2b          - 2HELPS2B 72-hour seizure-risk score (0-7, integer->risk lookup)
//   messFirstSeizure - MESS first-seizure recurrence risk group (low/medium/high)
//   poundMigraine    - POUND migraine-likelihood mnemonic (0-5)
//   hints            - HINTS / HINTS-plus central-vs-peripheral vestibular exam
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v120.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the score,
// risk band, or classification and the source's stated framing; the treat /
// admit / image / monitor decision stays with the clinician and local protocol
// -- none authors that order in Sophie's voice (spec-v11 §5.3).
//
// POINT TABLES / DIAGNOSTIC LOGIC RE-FETCHED, NEVER RECALLED (spec-v97 lesson),
// each cross-verified across >= 2 independent sources (the derivation paper +
// MDCalc / PMC / JAMA reproductions). NO-FABRICATION notes:
//   - stess (Rossetti 2008, J Neurol): four items -- consciousness (alert or
//     somnolent/confused 0, stuporous or comatose 1), worst seizure type
//     (simple/complex-partial, absence, or myoclonic 0; generalized convulsive
//     1; nonconvulsive SE in coma 2), age (< 65 yr 0, >= 65 yr 2), and history
//     of prior seizures (yes 0; no or unknown 1); total 0-6. The validated
//     dichotomy is >= 3 = unfavorable. The original paper publishes NO per-score
//     mortality table -- its strength is a high negative predictive value (about
//     0.97) for survival at the 0-2 / >= 3 split (sensitivity ~0.94, specificity
//     ~0.60) -- so the tile frames the favorable / unfavorable dichotomy and the
//     NPV, inventing no per-band mortality percentage.
//   - helps2b (Struck 2017, JAMA Neurol): six cEEG-read items -- brief
//     potentially-ictal rhythmic discharges B(I)RDs (+2), lateralized periodic
//     discharges / LRDA / bilateral independent periodic discharges (+1),
//     sporadic epileptiform discharges (+1), any periodic/rhythmic pattern with
//     frequency > 2 Hz (+1), "plus" features (superimposed rhythmic/sharp/fast
//     activity, +1), and prior seizure history (+1); total 0-7. The score is
//     mapped through the PUBLISHED fixed integer->risk lookup of calibrated
//     72-hour seizure probabilities {0:5, 1:12, 2:27, 3:50, 4:73, 5:88,
//     6:>95, 7:>95}% (the paper collapses 6 and 7 into a single ">95%" stratum,
//     so the tile folds 7 into it rather than inventing a 7-specific figure).
//     ML-DERIVATION NOTE: the score was derived by a machine-learning method but
//     ships as a deterministic integer->risk lookup computed at authoring time
//     -- NO model runs at render time (spec-v100 §11). The total is clamped to
//     0-7 before the lookup.
//   - messFirstSeizure (Kim 2006, Lancet Neurol; MRC MESS trial): prognostic
//     index -- number of seizures at presentation (1 = 0, 2-3 = +1, >= 4 = +2),
//     a neurological disorder (+1), and an abnormal EEG (+1); total 0-4 mapped to
//     LOW (0), MEDIUM (1), or HIGH (>= 2) risk groups. The full 1-/3-/5-year x
//     treated/deferred recurrence grid lives ONLY in the paywalled Lancet Neurol
//     Table 4 and is NOT reproducible from open sources, so -- per the v97
//     re-fetch discipline and the project no-fabrication governance -- the tile
//     reports the risk-group classification with the confirmable risk-group
//     RANGES over a 3-5 year window (low ~30-39% both arms; medium ~35-39%
//     immediate vs ~50-56% deferred; high > 50% immediate and ~65% at 5 yr
//     deferred), inventing no discrete annual cell.
//   - poundMigraine (Detsky 2006, JAMA): five mnemonic features -- Pulsatile,
//     hOurs (lasting 4-72 h), Unilateral, Nausea/vomiting, Disabling; count 0-5.
//     The published likelihood ratios for definite-or-possible migraine are
//     LR ~24 (>= 4 features), ~3.5 (exactly 3), and ~0.41 (<= 2) -- verbatim from
//     the JAMA abstract; the tile quotes these and invents no probability.
//   - hints (Kattah 2009, Stroke): the three-step bedside oculomotor exam for
//     acute vestibular syndrome -- Head-Impulse test (abnormal/saccade =
//     peripheral, normal = central), Nystagmus (direction-fixed = peripheral,
//     direction-changing = central), and Test of Skew (absent = peripheral,
//     present = central). A benign / PERIPHERAL pattern needs ALL THREE
//     reassuring together; ANY ONE central feature flags a CENTRAL (stroke)
//     cause (the counter-intuitive INFARCT rule -- a NORMAL head impulse is the
//     worrying finding). HINTS-plus adds new unilateral hearing loss as a fourth
//     central feature. The tile reports central-vs-peripheral; it names the
//     Kattah single-examiner operating characteristics (~100%/96%) and does not
//     author the imaging decision.

import { r1 } from './num.js';

void r1; // shared lib/num.js dependency (spec-v120 §6); the v120 scores are integer point-sums / lookups.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);
const lvl = (v, max) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round(n), 0, max);
};

// --- 2.1 stess ----------------------------------------------------------------
const STESS_NOTE = 'Status Epilepticus Severity Score (Rossetti AO, Logroscino G, Bromfield EB, J Neurol 2008): a four-item prognostic score -- level of consciousness (alert or somnolent/confused 0, stuporous or comatose 1), worst seizure type (simple or complex partial, absence, or myoclonic 0; generalized convulsive 1; nonconvulsive status epilepticus in coma 2), age (under 65 years 0, 65 or older 2), and history of prior seizures (yes 0; no or unknown 1) -- for a total of 0-6. A total of 3 or more is unfavorable and is associated with higher in-hospital mortality and a lower likelihood of return to baseline; the score’s strength is a high negative predictive value, about 0.97, for survival at the 0-2 versus 3-or-more split (sensitivity about 0.94, specificity about 0.60). It frames prognosis; the management decision stays with the clinician and local protocol.';

export function stess(input = {}) {
  const counted = [];
  const con = lvl(input.consciousness, 1);
  if (con > 0) counted.push('stuporous or comatose (+1)');
  const sz = lvl(input.seizureType, 2);
  if (sz === 1) counted.push('generalized convulsive (+1)');
  else if (sz === 2) counted.push('nonconvulsive SE in coma (+2)');
  let total = con + sz;
  if (onFlag(input.age65)) { total += 2; counted.push('age >= 65 (+2)'); }
  if (onFlag(input.noPrior)) { total += 1; counted.push('no or unknown history of prior seizures (+1)'); }
  total = clamp(total, 0, 6);
  const high = total >= 3;
  return {
    valid: true, total,
    abnormal: high,
    band: `STESS ${total}/6: ${high ? 'an unfavorable score (>= 3) -- associated with higher in-hospital mortality and a lower likelihood of return to baseline' : 'a favorable score (0-2) -- a high negative predictive value (about 0.97) for survival'}.`,
    counted: counted.length ? counted.join(', ') : 'all items at their 0-point level (favorable)',
    note: STESS_NOTE,
  };
}

// --- 2.2 helps2b --------------------------------------------------------------
const HELPS2B_NOTE = '2HELPS2B Score (Struck AF, Ustun B, Ruiz AR, et al, JAMA Neurol 2017): a continuous-EEG seizure-risk score built from six clinician-read items -- brief potentially-ictal rhythmic discharges (B(I)RDs, +2), lateralized periodic discharges / lateralized rhythmic delta / bilateral independent periodic discharges (+1), sporadic epileptiform discharges (+1), any periodic or rhythmic pattern faster than 2 Hz (+1), superimposed rhythmic, sharp, or fast "plus" features (+1), and a prior seizure history (+1) -- for a total of 0-7. The total maps through a published fixed integer-to-risk lookup of calibrated 72-hour seizure probabilities (0 about 5%, 1 about 12%, 2 about 27%, 3 about 50%, 4 about 73%, 5 about 88%, 6 or 7 above 95%). The score was derived by a machine-learning method but ships here as a fixed lookup table computed once -- no model runs on the page. It frames seizure risk to guide monitoring duration; the monitoring decision stays with the clinician and local protocol.';
const HELPS2B_RISK = ['5%', '12%', '27%', '50%', '73%', '88%', 'above 95%', 'above 95%'];

export function helps2b(input = {}) {
  const counted = [];
  let total = 0;
  if (onFlag(input.birds)) { total += 2; counted.push('B(I)RDs (+2)'); }
  if (onFlag(input.periodic)) { total += 1; counted.push('LPDs/LRDA/BIPDs (+1)'); }
  if (onFlag(input.sporadic)) { total += 1; counted.push('sporadic epileptiform discharges (+1)'); }
  if (onFlag(input.fast)) { total += 1; counted.push('frequency > 2 Hz (+1)'); }
  if (onFlag(input.plus)) { total += 1; counted.push('plus features (+1)'); }
  if (onFlag(input.priorSeizure)) { total += 1; counted.push('prior seizure history (+1)'); }
  total = clamp(total, 0, 7);
  const risk = HELPS2B_RISK[total];
  const high = total >= 1;
  return {
    valid: true, total, risk,
    abnormal: high,
    band: `2HELPS2B ${total}/7: about a ${risk} calibrated risk of an electrographic seizure within 72 hours on continuous EEG.`,
    counted: counted.length ? counted.join(', ') : 'no cEEG risk features (total 0)',
    note: HELPS2B_NOTE,
  };
}

// --- 2.3 mess-first-seizure ---------------------------------------------------
const MESS_NOTE = 'MESS first-seizure recurrence prognostic index (Kim LG, Johnson TL, Marson AG, Chadwick DW; MRC MESS Study Group, Lancet Neurol 2006): groups seizure-recurrence risk after a single seizure or early epilepsy from three factors -- number of seizures at presentation (1 = 0, 2 to 3 = +1, 4 or more = +2), a neurological disorder such as a deficit or learning disability (+1), and an abnormal EEG (+1) -- for a total of 0-4, mapped to a low (0), medium (1), or high (2 or more) risk group. The full per-year treated-versus-deferred recurrence grid is published only in the source’s paywalled table, so the tile reports the risk-group ranges over a 3-to-5-year window -- low about 30 to 39% with little treatment benefit; medium about 35 to 39% with immediate treatment versus about 50 to 56% deferred; high more than 50% even with immediate treatment and about 65% at 5 years if deferred. It frames recurrence risk; the treatment decision stays with the clinician and patient.';

export function messFirstSeizure(input = {}) {
  const counted = [];
  let total = 0;
  const sc = lvl(input.seizures, 2); // 0 = 1 seizure, 1 = 2-3, 2 = >= 4
  if (sc === 1) { total += 1; counted.push('2-3 seizures at presentation (+1)'); }
  else if (sc === 2) { total += 2; counted.push('4 or more seizures at presentation (+2)'); }
  if (onFlag(input.neuroDisorder)) { total += 1; counted.push('neurological disorder (+1)'); }
  if (onFlag(input.abnormalEeg)) { total += 1; counted.push('abnormal EEG (+1)'); }
  total = clamp(total, 0, 4);

  let group; let detail;
  if (total >= 2) {
    group = 'High';
    detail = 'more than 50% recurrence within 3-5 years even with immediate treatment, and about 65% at 5 years if treatment is deferred';
  } else if (total === 1) {
    group = 'Medium';
    detail = 'about 35-39% recurrence at 3-5 years with immediate treatment versus about 50-56% deferred';
  } else {
    group = 'Low';
    detail = 'about 30-39% recurrence over 3-5 years with little difference between immediate and deferred treatment';
  }
  return {
    valid: true, total, group,
    abnormal: total >= 1,
    band: `MESS ${group.toLowerCase()} risk (score ${total}/4): ${detail}.`,
    counted: counted.length ? counted.join(', ') : 'a single seizure with no neurological disorder or EEG abnormality (score 0)',
    note: MESS_NOTE,
  };
}

// --- 2.4 pound-migraine -------------------------------------------------------
const POUND_NOTE = 'POUND mnemonic for migraine likelihood (Detsky ME, McDonald DR, Baerlocher MO, Tomlinson GA, McCrory DC, Booth CM, JAMA 2006): counts five bedside headache features -- Pulsatile or throbbing quality, hOurs duration (the headache lasts 4 to 72 hours), Unilateral location, Nausea or vomiting, and Disabling intensity -- for a count of 0-5. The published likelihood ratios for definite or possible migraine are about 24 when 4 or more features are present, about 3.5 when exactly 3 are present, and about 0.41 when 2 or fewer are present. It frames migraine likelihood at the bedside; the diagnosis and any neuroimaging decision stay with the clinician and local protocol.';
const POUND_ITEMS = [
  ['pulsatile', 'pulsatile/throbbing quality'],
  ['hours', 'duration 4-72 hours'],
  ['unilateral', 'unilateral location'],
  ['nausea', 'nausea or vomiting'],
  ['disabling', 'disabling intensity'],
];

export function poundMigraine(input = {}) {
  const counted = [];
  let count = 0;
  for (const [key, label] of POUND_ITEMS) {
    if (onFlag(input[key])) { count += 1; counted.push(label); }
  }
  count = clamp(count, 0, 5);
  let detail; let high;
  if (count >= 4) {
    detail = '4 or more features strongly favor migraine (likelihood ratio about 24)';
    high = true;
  } else if (count === 3) {
    detail = 'an intermediate migraine likelihood (likelihood ratio about 3.5)';
    high = false;
  } else {
    detail = '2 or fewer features make migraine unlikely (likelihood ratio about 0.41)';
    high = false;
  }
  return {
    valid: true, total: count,
    abnormal: high,
    band: `POUND ${count}/5: ${detail}.`,
    counted: counted.length ? counted.join(', ') : 'no POUND features present (count 0)',
    note: POUND_NOTE,
  };
}

// --- 2.5 hints ----------------------------------------------------------------
const HINTS_NOTE = 'HINTS / HINTS-plus exam for acute vestibular syndrome (Kattah JC, Talkad AV, Wang DZ, Hsieh YH, Newman-Toker DE, Stroke 2009): a three-step bedside oculomotor exam -- the Head-Impulse test (an abnormal test with a corrective saccade is reassuring/peripheral; a normal test is concerning/central), Nystagmus (direction-fixed is peripheral; direction-changing on eccentric gaze is central), and the Test of Skew (absent is peripheral; a present vertical skew is central). A benign peripheral pattern requires all three reassuring together; any one central feature -- a normal head impulse, direction-changing nystagmus, or a skew -- flags a central (stroke) cause (the INFARCT rule, where a normal head impulse is the worrying finding). HINTS-plus adds new unilateral hearing loss as a fourth central feature. In the derivation the exam was about 100% sensitive and 96% specific for a central cause with an expert examiner. It frames central-versus-peripheral localization; the imaging decision stays with the clinician and local protocol.';

export function hints(input = {}) {
  const impulseCentral = input.headImpulse === 'normal';
  const nystagmusCentral = input.nystagmus === 'changing';
  const skewCentral = input.skew === 'present';
  const hearingLoss = onFlag(input.hearingLoss);

  const central = [];
  if (impulseCentral) central.push('normal head impulse');
  if (nystagmusCentral) central.push('direction-changing nystagmus');
  if (skewCentral) central.push('skew present');
  if (hearingLoss) central.push('new unilateral hearing loss');

  if (central.length > 0) {
    return {
      valid: true, category: 'Central (stroke) pattern',
      abnormal: true,
      band: `HINTS exam: a central (stroke) pattern -- ${central.join(', ')} -- concerning for a central cause; the imaging decision stays with the clinician and local protocol.`,
      detail: central.join(', '),
      note: HINTS_NOTE,
    };
  }
  return {
    valid: true, category: 'Peripheral (benign) pattern',
    abnormal: false,
    band: 'HINTS exam: a peripheral (benign) pattern -- an abnormal head impulse, direction-fixed nystagmus, no skew, and no new hearing loss -- consistent with a peripheral vestibular cause.',
    detail: 'abnormal head impulse, direction-fixed nystagmus, no skew, no new hearing loss',
    note: HINTS_NOTE,
  };
}
