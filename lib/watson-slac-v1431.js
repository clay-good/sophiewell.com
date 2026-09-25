// spec-v1431: Watson and Ballet classification of scapholunate advanced collapse (SLAC) wrist arthritis.
//
// Sources, read 2026-09-24:
//   Watson HK, Ballet FL. The SLAC wrist: scapholunate advanced collapse pattern of degenerative
//     arthritis. J Hand Surg Am 1984;9(3):358-365 (PubMed 6725894) -- the original, from 4000 films.
//   McLean A, Taylor F. Classifications in brief: Watson and Ballet classification of scapholunate
//     advanced collapse wrist arthritis. Clin Orthop Relat Res 2019;477(3):663-666 (PMC6382201).
//     Its text:
//       Stage 1 "degenerative changes are limited to the articulation between the tip of the radial
//         styloid and the distal pole of the scaphoid"
//       Stage 2 "degeneration progresses to include the whole radioscaphoid articulation"
//       Stage 3 "degeneration progresses to include the capitolunate joint"
//       "the radiolunate joint was almost never involved"; Peterson and Szabo and Weiss and Rodner
//         "added a fourth stage to include pancarpal arthritis", with the radiolunate joint involved.
//       A styloscaphoid plus lunocapitate pattern without complete radioscaphoid involvement "raises a
//         diagnostic problem between Stage 1 with lunocapitate osteoarthritis and the Stage 3"; it has
//         been proposed that "individual joints are documented".
//       Reliability (Vishwanathan 2013, 41 wrists): interobserver kappa 0.65, intraobserver 0.59;
//         by stage 0.47, 0.52, 0.69. No study has validated the stage against surgical findings.
//         Radiographic change does "not correlate closely with patients' symptoms"; up to two-thirds
//         stay asymptomatic for up to 2 years (Fassler).
//
// The stage is DERIVED from which joints show arthritis. A combination the progression does not
// describe returns "no single stage" and asks for the joints to be documented, as the review does.
// Pure: no DOM, no clock, no network.

export const WSLAC_RADIOSCAPHOID = [
  { value: 'none', text: 'No arthritis' },
  { value: 'styloid', text: 'Radial styloid and distal scaphoid pole only' },
  { value: 'whole', text: 'Whole radioscaphoid joint' },
];
export const WSLAC_YESNO = [
  { value: 'no', text: 'No arthritis' },
  { value: 'yes', text: 'Arthritis' },
];

const WORDS = {
  1: 'arthritis limited to the radial styloid and the distal pole of the scaphoid',
  2: 'arthritis of the whole radioscaphoid joint',
  3: 'arthritis of the radioscaphoid and capitolunate joints, with the radiolunate joint spared',
  4: 'pancarpal arthritis with the radiolunate joint involved (a stage added after the original three)',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

const NOTE = 'Watson HK and Ballet FL, J Hand Surg Am 1984 (stages 1 to 3); stage 4 added by Peterson and Szabo and by Weiss and Rodner; as described by McLean A and Taylor F, Clin Orthop Relat Res 2019. '
  + 'The stage describes the radiograph; it does not choose the treatment, and it has not been validated against what is seen at surgery.';

export function watsonSlac(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rs = pick(WSLAC_RADIOSCAPHOID, o.radioscaphoid);
  const cl = pick(WSLAC_YESNO, o.capitolunate);
  const rl = pick(WSLAC_YESNO, o.radiolunate);
  if (!rs) return { valid: false, message: 'Choose how much of the radioscaphoid joint shows arthritis.' };
  if (!cl) return { valid: false, message: 'Say whether the capitolunate joint shows arthritis.' };
  if (!rl) return { valid: false, message: 'Say whether the radiolunate joint shows arthritis.' };

  const notes = [];
  let stage = null;
  if (rl === 'yes') {
    if (rs === 'whole' && cl === 'yes') stage = 4;
  } else if (cl === 'no') {
    if (rs === 'styloid') stage = 1;
    else if (rs === 'whole') stage = 2;
  } else if (rs === 'whole') stage = 3;

  const reliability = 'Agreement between hand surgeons reading the same films was moderate (kappa 0.65 between and 0.59 within readers) and weakest in the early stages (0.47 for stage 1), and radiographic change correlates poorly with symptoms.';

  if (rs === 'none' && cl === 'no' && rl === 'no') {
    return {
      valid: true,
      abnormal: false,
      stage: null,
      band: 'No SLAC stage: none of the joints the stages describe shows arthritis.',
      bandLabel: 'No arthritis',
      notes: ['Early arthritis can look like normal variation on a plain film; a lateral or semisupinated view may show the radioscaphoid joint better.'],
      note: NOTE,
    };
  }

  if (!stage) {
    let why;
    if (rs === 'styloid' && cl === 'yes' && rl === 'no') {
      why = 'styloscaphoid and capitolunate arthritis without the whole radioscaphoid joint sits between stage 1 and stage 3, a pattern the review names as a known diagnostic problem';
    } else if (rl === 'yes') {
      why = 'radiolunate arthritis belongs to the pancarpal stage 4, which also involves the whole radioscaphoid and capitolunate joints; the joints entered do not complete that picture';
    } else {
      why = 'capitolunate arthritis without radioscaphoid arthritis does not follow the SLAC progression, which starts at the radial styloid';
    }
    notes.push(reliability);
    return {
      valid: true,
      abnormal: true,
      stage: null,
      band: `Does not fit one Watson and Ballet stage: ${why}. Record the arthritis joint by joint instead of forcing a stage.`,
      bandLabel: 'No single stage',
      notes,
      note: NOTE,
    };
  }

  if (stage === 4) notes.push('Watson and Ballet described the radiolunate joint as almost never involved; stage 4 comes from later authors, not the original paper.');
  notes.push(reliability);
  notes.push('Plain films can miss joint-level arthritis that MRI shows, though MRI did not significantly improve agreement on the stage; at surgery the joints are seen directly.');

  return {
    valid: true,
    abnormal: true,
    stage,
    band: `SLAC stage ${stage}: ${WORDS[stage]}.`,
    bandLabel: `Stage ${stage}`,
    notes,
    note: NOTE,
  };
}
