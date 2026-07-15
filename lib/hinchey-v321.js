// spec-v321: Hinchey classification of acute (perforated) diverticulitis. The clinician
// selects the stage (I-IV) from the operative/CT findings; the tile reports the stage and
// its standard definition. The catalog had no Hinchey tile ("hinchey" had zero corpus
// hits); it is the standard severity staging for complicated diverticulitis and the peer
// of the existing acute-abdomen severity classifications. "hinchey" / "diverticulitis
// stage" routed to nothing.
//
// HIGH-STAKES: this reports the STAGE the clinician has determined from the findings, NOT a
// diagnosis or a management order (spec-v11 §5.3). The drainage-vs-surgery decision stays
// with the clinician.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Hinchey EJ, Schaal PG, Richards GK. Treatment of perforated diverticular disease of
//     the colon. Adv Surg. 1978;12:85-109 (the original four-stage classification).
//   - Radiopaedia / Wikipedia reproductions of the original I-IV stages.
//
// Original Hinchey stages:
//   I   : localized (pericolic/mesocolic) abscess or phlegmon.
//   II  : pelvic, distant intra-abdominal, or retroperitoneal abscess.
//   III : generalized purulent peritonitis.
//   IV  : generalized fecal (feculent) peritonitis.

const STAGES = {
  I: {
    label: 'Hinchey stage I',
    text: 'Hinchey stage I — localized pericolic (or mesocolic) abscess or phlegmon confined to the colon.',
    severe: false,
  },
  II: {
    label: 'Hinchey stage II',
    text: 'Hinchey stage II — pelvic, distant intra-abdominal, or retroperitoneal abscess.',
    severe: false,
  },
  III: {
    label: 'Hinchey stage III',
    text: 'Hinchey stage III — generalized purulent peritonitis (pus in the peritoneal cavity, without an open communication with the bowel lumen).',
    severe: true,
  },
  IV: {
    label: 'Hinchey stage IV',
    text: 'Hinchey stage IV — generalized fecal (feculent) peritonitis from free perforation with fecal contamination of the peritoneal cavity.',
    severe: true,
  },
};

const NOTE = 'Original Hinchey classification of perforated diverticulitis (Hinchey 1978). Stage I: localized pericolic/mesocolic abscess or phlegmon. Stage II: pelvic, distant intra-abdominal, or retroperitoneal abscess. Stage III: generalized purulent peritonitis. Stage IV: generalized fecal peritonitis. Stages I-II (abscess) are often managed with antibiotics +/- image-guided drainage; III-IV (generalized peritonitis) generally require emergent surgery. A CT-era modified Hinchey (Wasvary) adds stage 0 (mild clinical diverticulitis) and splits stage I into Ia (phlegmon) and Ib (abscess); this tile uses the original four stages. It reports the stage the clinician has determined, not a diagnosis or a management order.';

// input:
//   stage: 'I' | 'II' | 'III' | 'IV' (also accepts 1-4)
export function hinchey(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const ARABIC = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
  const key = Object.prototype.hasOwnProperty.call(ARABIC, raw) ? ARABIC[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Hinchey stage (I, II, III, or IV).' };
  }
  return {
    valid: true,
    stage: key,
    severe: s.severe,
    abnormal: s.severe,
    bandLabel: s.label,
    band: s.text,
    note: NOTE,
  };
}
