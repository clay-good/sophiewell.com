// spec-v183 MCP wave 45: adapters for the seven dermatology instruments in
// lib/dermatology-v223.js — UAS7 (chronic urticaria), HiSCR and Hurley staging
// (hidradenitis suppurativa), POEM (atopic eczema), ALDEN (SJS/TEN drug
// causality), PEST (psoriatic-arthritis screen), and the weighted Glasgow
// 7-point checklist. dom keys mirror views/group-v223.js. ALDEN's five causality
// axes are numeric-string enums (including negative-point options); POEM takes
// seven 0–4 symptom scores; the rest are counts and boolean items.

import * as F from '../../lib/dermatology-v223.js';

export default [
  {
    id: 'uas7',
    summary: 'UAS7 (Urticaria Activity Score over 7 days): the summed daily wheal and itch scores (0–42) grade chronic spontaneous urticaria activity.',
    compute: F.uas7,
    fields: [
      { dom: 'uas-wheal', arg: 'whealSum', kind: 'number', required: true, label: '7-day wheal score sum (0–21)' },
      { dom: 'uas-itch', arg: 'itchSum', kind: 'number', required: true, label: '7-day itch score sum (0–21)' },
    ],
  },
  {
    id: 'hiscr',
    summary: 'HiSCR (Kimball 2014): a hidradenitis-suppurativa responder shows ≥ 50% reduction in abscess + inflammatory-nodule count with no increase in abscesses or draining fistulas.',
    compute: F.hiscr,
    fields: [
      { dom: 'hs-bab', arg: 'baselineAbscess', kind: 'number', required: true, label: 'Baseline abscess count' },
      { dom: 'hs-bnod', arg: 'baselineNodule', kind: 'number', required: true, label: 'Baseline inflammatory nodule count' },
      { dom: 'hs-bfist', arg: 'baselineFistula', kind: 'number', required: true, label: 'Baseline draining-fistula count' },
      { dom: 'hs-cab', arg: 'currentAbscess', kind: 'number', required: true, label: 'Current abscess count' },
      { dom: 'hs-cnod', arg: 'currentNodule', kind: 'number', required: true, label: 'Current inflammatory nodule count' },
      { dom: 'hs-cfist', arg: 'currentFistula', kind: 'number', required: true, label: 'Current draining-fistula count' },
    ],
  },
  {
    id: 'hurley-stage',
    summary: 'Hurley staging (Hurley 1989): sinus tracts, scarring, and diffuse involvement classify hidradenitis suppurativa into stage I (abscesses without tracts), II (recurrent abscesses with tracts/scarring), or III (diffuse interconnected tracts).',
    compute: F.hurleyStage,
    fields: [
      { dom: 'hur-tract', arg: 'sinusTract', kind: 'bool', required: false, label: 'Sinus tract(s) present' },
      { dom: 'hur-scar', arg: 'scarring', kind: 'bool', required: false, label: 'Scarring present' },
      { dom: 'hur-diffuse', arg: 'diffuse', kind: 'bool', required: false, label: 'Diffuse or interconnected tracts' },
    ],
  },
  {
    id: 'poem',
    summary: 'POEM (Charman 2004): seven symptom items each scored 0–4 by days affected in the past week give a 0–28 patient-oriented eczema-measure score (clear to very severe).',
    compute: F.poem,
    fields: [
      { dom: 'poem-itch', arg: 'itch', kind: 'number', required: false, label: 'Itch (0–4)' },
      { dom: 'poem-sleep', arg: 'sleep', kind: 'number', required: false, label: 'Sleep disturbance (0–4)' },
      { dom: 'poem-bleed', arg: 'bleeding', kind: 'number', required: false, label: 'Bleeding (0–4)' },
      { dom: 'poem-weep', arg: 'weeping', kind: 'number', required: false, label: 'Weeping / oozing (0–4)' },
      { dom: 'poem-crack', arg: 'cracking', kind: 'number', required: false, label: 'Cracking (0–4)' },
      { dom: 'poem-flake', arg: 'flaking', kind: 'number', required: false, label: 'Flaking (0–4)' },
      { dom: 'poem-dry', arg: 'dryness', kind: 'number', required: false, label: 'Dryness / roughness (0–4)' },
    ],
  },
  {
    id: 'alden',
    summary: 'ALDEN (Sassolas 2010): per-drug causality for SJS/TEN from delay, drug presence, prechallenge/rechallenge, dechallenge, drug notoriety, and other causes; < 0 very unlikely to ≥ 6 very probable.',
    compute: F.alden,
    fields: [
      { dom: 'ald-delay', arg: 'delay', kind: 'enum', values: ['3', '2', '1', '-1', '-3'], required: true, label: 'Delay from drug intake to index day (points)' },
      { dom: 'ald-present', arg: 'drugPresent', kind: 'enum', values: ['0', '-1', '-3'], required: true, label: 'Drug present in body on index day (points)' },
      { dom: 'ald-chal', arg: 'challenge', kind: 'enum', values: ['4', '2', '1', '0', '-2'], required: true, label: 'Prechallenge / rechallenge (points)' },
      { dom: 'ald-dechal', arg: 'dechallenge', kind: 'enum', values: ['0', '-2'], required: true, label: 'Dechallenge (points)' },
      { dom: 'ald-not', arg: 'notoriety', kind: 'enum', values: ['3', '2', '1', '0', '-1'], required: true, label: 'Drug notoriety (points)' },
      { dom: 'ald-other', arg: 'otherCause', kind: 'bool', required: false, label: 'Another more likely cause (−1)' },
    ],
  },
  {
    id: 'pest',
    summary: 'PEST (Ibrahim 2009): five yes/no items (swollen joint, arthritis diagnosis, nail pits, heel pain, dactylitis); ≥ 3 refers for possible psoriatic arthritis.',
    compute: F.pest,
    fields: [
      { dom: 'pest-swollen', arg: 'swollenJoint', kind: 'bool', required: false, label: 'Ever had a swollen joint (or joints)?' },
      { dom: 'pest-dx', arg: 'arthritisDx', kind: 'bool', required: false, label: 'A doctor ever told you that you have arthritis?' },
      { dom: 'pest-nail', arg: 'nailPits', kind: 'bool', required: false, label: 'Do your nails have holes or pits?' },
      { dom: 'pest-heel', arg: 'heelPain', kind: 'bool', required: false, label: 'Have you had pain in your heel?' },
      { dom: 'pest-dact', arg: 'dactylitis', kind: 'bool', required: false, label: 'A finger or toe completely swollen and painful (dactylitis)?' },
    ],
  },
  {
    id: 'glasgow-7-point-checklist',
    summary: 'Weighted Glasgow 7-point checklist (MacKie 1990): major features (change in size, shape, color) score 2 points each and minor features (diameter ≥ 7 mm, inflammation, oozing, altered sensation) 1 point each; ≥ 3 prompts referral of a suspicious pigmented lesion.',
    compute: F.glasgow7,
    fields: [
      { dom: 'g7-size', arg: 'size', kind: 'bool', required: false, label: 'Change in size (major, 2)' },
      { dom: 'g7-shape', arg: 'shape', kind: 'bool', required: false, label: 'Change in shape (major, 2)' },
      { dom: 'g7-color', arg: 'color', kind: 'bool', required: false, label: 'Change in color (major, 2)' },
      { dom: 'g7-diam', arg: 'diameter', kind: 'bool', required: false, label: 'Diameter ≥ 7 mm (minor, 1)' },
      { dom: 'g7-inflam', arg: 'inflammation', kind: 'bool', required: false, label: 'Inflammation (minor, 1)' },
      { dom: 'g7-ooze', arg: 'oozing', kind: 'bool', required: false, label: 'Oozing / crusting (minor, 1)' },
      { dom: 'g7-sens', arg: 'sensation', kind: 'bool', required: false, label: 'Change in sensation (minor, 1)' },
    ],
  },
];
