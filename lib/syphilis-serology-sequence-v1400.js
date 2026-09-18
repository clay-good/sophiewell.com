// spec-v1400: the syphilis serology interpreter, for both testing sequences.
//
// Source:
//   Papp JR, Park IU, Fakile Y, Pereira L, Pillay A, Bolan GA. CDC Laboratory Recommendations for
//   Syphilis Testing, United States, 2024. MMWR Recomm Rep. 2024;73(1):1-32. PMID 38319847.
//
// Two algorithms reach the same answers in a different order:
//
//   traditional  nontreponemal (RPR/VDRL) first; a reactive one is confirmed by a treponemal test.
//                Nontreponemal reactive with the treponemal test NONreactive is a biologic false
//                positive.
//   reverse      a treponemal immunoassay (EIA/CIA) first; a reactive one gets a quantitative
//                nontreponemal test. If that is NONreactive, the discordance is adjudicated by a
//                SECOND treponemal assay of a different format, usually TP-PA.
//
// THE READING THIS TILE PREVENTS: a reactive EIA with a nonreactive RPR called "false positive"
// without the TP-PA. Until the second treponemal test is back, the answer is "discordant", and a
// reactive TP-PA means past or present syphilis -- treated long ago, or untreated late latent.
//
// A fourfold change in titer (two dilutions) between two results from the SAME nontreponemal test
// is clinically significant. RPR and VDRL titers are not interchangeable, so the change is only
// computed when the prior titer came from the same test.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const SYPHILIS_NOTE = 'CDC 2024 laboratory recommendations. In the traditional sequence a reactive nontreponemal test (RPR or VDRL) is confirmed with a treponemal test; in the reverse sequence a reactive treponemal immunoassay is followed by a quantitative nontreponemal test, and a nonreactive one sends the specimen to a second, different treponemal assay such as TP-PA. A fourfold titer change (two dilutions) on the same nontreponemal test is clinically significant; RPR and VDRL titers are not interchangeable. Very early primary syphilis can be nonreactive on every test. It interprets the results entered and is not a diagnosis.';

export const ALGORITHMS = [
  { value: 'traditional', text: 'Traditional: nontreponemal (RPR/VDRL) first' },
  { value: 'reverse', text: 'Reverse sequence: treponemal immunoassay (EIA/CIA) first' },
];
export const REACTIVITY = [
  { value: 'reactive', text: 'Reactive' },
  { value: 'nonreactive', text: 'Nonreactive' },
];
export const REACTIVITY_OR_NOT_DONE = [
  { value: 'reactive', text: 'Reactive' },
  { value: 'nonreactive', text: 'Nonreactive' },
  { value: 'not-done', text: 'Not done yet' },
];

const MAX_TITER = 65536;

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function isPowerOfTwo(n) {
  return Number.isInteger(n) && n >= 1 && (n & (n - 1)) === 0;
}

function titerFault(label, raw) {
  const fault = inputFault([[label, raw, 1, MAX_TITER, '']]);
  if (fault) return fault;
  const n = Number(String(raw).trim());
  if (!isPowerOfTwo(n)) return `${label.charAt(0).toUpperCase()}${label.slice(1)} must be a doubling dilution (1, 2, 4, 8, 16, ...), entered as the number after "1:". Check the value entered.`;
  return null;
}

const EARLY_NOTE = 'A nonreactive result does not exclude very early primary syphilis, which can precede a detectable antibody. With a lesion or a recent exposure, test the lesion directly or repeat serology in 2 to 4 weeks.';

export function syphilisSerologySequence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (isBlank(o.algorithm)) {
    return { valid: false, message: 'Choose the testing sequence the laboratory used: traditional (nontreponemal first) or reverse (treponemal first). The same pair of results means different next steps in each.' };
  }
  if (o.algorithm !== 'traditional' && o.algorithm !== 'reverse') {
    return { valid: false, message: 'Choose the testing sequence: traditional or reverse.' };
  }

  // Titers: optional, but a titer that is entered must be a real dilution.
  const hasTiter = !isBlank(o.titer);
  const hasPrior = !isBlank(o.priorTiter);
  if (hasTiter) { const f = titerFault('the current nontreponemal titer', o.titer); if (f) return { valid: false, message: f }; }
  if (hasPrior) { const f = titerFault('the prior nontreponemal titer', o.priorTiter); if (f) return { valid: false, message: f }; }

  const r = o.algorithm === 'traditional' ? traditional(o) : reverse(o);
  if (!r.valid) return r;

  // The titer change is only read when the current test is reactive, both titers are entered, and
  // the prior one came from the same nontreponemal test.
  let titerNote = null;
  let fourfold = null;
  if (r.nontreponemalReactive && hasTiter && hasPrior) {
    if (o.priorSameTest !== 'yes' && o.priorSameTest !== true) {
      titerNote = 'The change in titer is not computed: the prior titer has to come from the same nontreponemal test (RPR against RPR, VDRL against VDRL), because their titers are not interchangeable.';
    } else {
      const cur = Number(String(o.titer).trim());
      const prior = Number(String(o.priorTiter).trim());
      const dilutions = Math.round(Math.log2(cur / prior));
      if (dilutions >= 2) {
        fourfold = 'rise';
        titerNote = `The titer rose from 1:${prior} to 1:${cur}, ${dilutions} dilutions. A fourfold or greater rise is clinically significant: consider reinfection or treatment failure.`;
      } else if (dilutions <= -2) {
        fourfold = 'fall';
        titerNote = `The titer fell from 1:${prior} to 1:${cur}, ${-dilutions} dilutions. A fourfold or greater fall is consistent with a response to treatment.`;
      } else {
        fourfold = 'none';
        titerNote = `The titer moved from 1:${prior} to 1:${cur}, less than two dilutions. A change under fourfold is within the test's own variation and is not clinically significant.`;
      }
    }
  }

  return {
    ...r,
    fourfold,
    titerNote,
    postureNote: 'Decision support, not a verdict. The stage, the treatment history, and the exam decide what the serology means for this patient.',
    note: SYPHILIS_NOTE,
  };
}

function traditional(o) {
  if (isBlank(o.nontreponemal)) {
    return { valid: false, message: 'Enter the nontreponemal result (RPR or VDRL), which comes first in the traditional sequence.' };
  }
  if (o.nontreponemal === 'nonreactive') {
    return {
      valid: true, interpretation: 'no-evidence', nontreponemalReactive: false, abnormal: false,
      bandLabel: 'No serologic evidence of syphilis',
      band: 'Nontreponemal test nonreactive: no serologic evidence of syphilis on this test.',
      nextStep: EARLY_NOTE,
    };
  }
  if (isBlank(o.treponemal) || o.treponemal === 'not-done') {
    return {
      valid: true, interpretation: 'confirm', nontreponemalReactive: true, abnormal: true,
      bandLabel: 'Reactive: confirm with a treponemal test',
      band: 'Nontreponemal test reactive. This is not yet a diagnosis: confirm it with a treponemal test (for example TP-PA, EIA, or CIA).',
      nextStep: 'Order a treponemal test on the same specimen. A reactive nontreponemal test with a nonreactive treponemal test is a biologic false positive.',
    };
  }
  if (o.treponemal === 'reactive') {
    return {
      valid: true, interpretation: 'past-or-present', nontreponemalReactive: true, abnormal: true,
      bandLabel: 'Past or present syphilis',
      band: 'Nontreponemal and treponemal tests both reactive: past or present syphilis. The treatment history and the stage decide whether this is a current infection.',
      nextStep: 'Take the treatment history and stage the infection. Without documented adequate treatment, treat for the stage. Keep the titer as the baseline for follow-up.',
    };
  }
  return {
    valid: true, interpretation: 'biologic-false-positive', nontreponemalReactive: true, abnormal: false,
    bandLabel: 'Biologic false positive',
    band: 'Nontreponemal test reactive and treponemal test nonreactive: a biologic false positive nontreponemal result, seen in about 0.2 to 0.8% of people.',
    nextStep: 'No syphilis treatment on this result. Pregnancy, autoimmune disease, recent infection or vaccination, and injection drug use are among the causes of a false positive nontreponemal test.',
  };
}

function reverse(o) {
  if (isBlank(o.treponemal)) {
    return { valid: false, message: 'Enter the treponemal immunoassay result (EIA or CIA), which comes first in the reverse sequence.' };
  }
  if (o.treponemal === 'nonreactive') {
    return {
      valid: true, interpretation: 'no-evidence', nontreponemalReactive: false, abnormal: false,
      bandLabel: 'No serologic evidence of syphilis',
      band: 'Treponemal immunoassay nonreactive: no serologic evidence of syphilis.',
      nextStep: EARLY_NOTE,
    };
  }
  if (o.treponemal === 'not-done') {
    return { valid: false, message: 'In the reverse sequence the treponemal immunoassay is the first test. Enter its result.' };
  }
  if (isBlank(o.nontreponemal) || o.nontreponemal === 'not-done') {
    return {
      valid: true, interpretation: 'needs-nontreponemal', nontreponemalReactive: false, abnormal: true,
      bandLabel: 'Reactive: quantitative nontreponemal test next',
      band: 'Treponemal immunoassay reactive. The next test is a quantitative nontreponemal test (RPR or VDRL) on the same specimen.',
      nextStep: 'Order a quantitative RPR or VDRL. A reactive result with a titer is the baseline for staging and follow-up.',
    };
  }
  if (o.nontreponemal === 'reactive') {
    return {
      valid: true, interpretation: 'past-or-present', nontreponemalReactive: true, abnormal: true,
      bandLabel: 'Past or present syphilis',
      band: 'Treponemal and nontreponemal tests both reactive: past or present syphilis. The treatment history and the stage decide whether this is a current infection.',
      nextStep: 'Take the treatment history and stage the infection. Without documented adequate treatment, treat for the stage. Keep the titer as the baseline for follow-up.',
    };
  }
  // Treponemal reactive, nontreponemal nonreactive: discordant. The second treponemal assay decides.
  if (isBlank(o.secondTreponemal) || o.secondTreponemal === 'not-done') {
    return {
      valid: true, interpretation: 'discordant', nontreponemalReactive: false, abnormal: true,
      bandLabel: 'Discordant: second treponemal test needed',
      band: 'Treponemal immunoassay reactive with a nonreactive nontreponemal test: discordant. This is not yet a false positive. Run a second treponemal assay of a different format, such as TP-PA.',
      nextStep: 'Order a TP-PA (or another treponemal assay of a different format). Reactive means past or present syphilis; nonreactive makes syphilis unlikely.',
    };
  }
  if (o.secondTreponemal === 'reactive') {
    return {
      valid: true, interpretation: 'past-or-present', nontreponemalReactive: false, abnormal: true,
      bandLabel: 'Past or present syphilis',
      band: 'Discordant result confirmed by a reactive second treponemal test: past or present syphilis. This is either infection treated in the past or untreated infection, often late latent, with a nonreactive nontreponemal test.',
      nextStep: 'Check for documented prior treatment. If there is none, treat as late latent syphilis unless the history places it earlier.',
    };
  }
  return {
    valid: true, interpretation: 'unlikely', nontreponemalReactive: false, abnormal: false,
    bandLabel: 'Syphilis unlikely',
    band: 'Second treponemal test nonreactive: syphilis is unlikely, and the first treponemal result was probably falsely reactive.',
    nextStep: 'No treatment on these results. With a recent exposure or a lesion, repeat testing in 2 to 4 weeks, because early infection can be missed.',
  };
}
