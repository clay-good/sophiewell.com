// spec-v495: the Ranawat classification of neurologic deficit in the rheumatoid cervical spine (classes I,
// II, IIIA, IIIB). It joins the cervical-myelopathy tiles (mjoa, nurick), which grade SPONDYLOTIC myelopathy;
// the Ranawat classes are the rheumatoid-specific descriptor. "ranawat" routed to nothing.
//
// HIGH-STAKES: this reports the CLASS the clinician has determined from the neurologic examination, NOT a
// diagnosis, a decision to operate, or a prognosis for an individual patient (spec-v11 section 5.3). The
// management decision stays with the spine team.
//
// CLASSES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ranawat CS, et al. Cervical spine fusion in rheumatoid arthritis. J Bone Joint Surg Am.
//     1979;61(7):1003-1010.
//   - Spine references reproducing the same no-deficit (I) / subjective-weakness (II) /
//     objective-weakness-ambulatory (IIIA) / objective-weakness-non-ambulatory (IIIB) grouping.
//
// Classes (neurologic deficit, the IIIA/IIIB split turning on ambulation):
//   I    : pain, but no neural deficit.
//   II   : subjective weakness, with dysesthesias and hyperreflexia.
//   IIIA : objective weakness and long-tract signs, still ambulatory.
//   IIIB : objective weakness and long-tract signs, no longer ambulatory.

const CLASSES = {
  I: { klass: 'I', text: 'Ranawat class I - pain, but no neural deficit.' },
  II: { klass: 'II', text: 'Ranawat class II - subjective weakness, with dysesthesias and hyperreflexia.' },
  IIIA: { klass: 'IIIA', text: 'Ranawat class IIIA - objective weakness and long-tract signs, still ambulatory.' },
  IIIB: { klass: 'IIIB', text: 'Ranawat class IIIB - objective weakness and long-tract signs, no longer ambulatory.' },
};

const NOTE = 'The Ranawat classification (Ranawat and colleagues 1979) describes the neurologic deficit of the rheumatoid cervical spine. I: pain without neural deficit. II: subjective weakness with dysesthesias and hyperreflexia. IIIA: objective weakness and long-tract signs, ambulatory. IIIB: objective weakness and long-tract signs, non-ambulatory. This reports the class the clinician has determined, not a diagnosis, a decision to operate, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', IIIA: 'IIIA', IIIB: 'IIIB',
  1: 'I', 2: 'II',
  '3A': 'IIIA', '3B': 'IIIB',
};

// input:
//   klass: 'I' / 'II' / 'IIIA' / 'IIIB' (case-insensitive; also accepts 1, 2, 3A, 3B).
export function ranawatMyelopathy(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.klass == null ? '' : o.klass).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the Ranawat class (I, II, IIIA, or IIIB).' };
  }
  return {
    valid: true,
    klass: c.klass,
    bandLabel: `Ranawat class ${c.klass}`,
    band: c.text,
    note: NOTE,
  };
}
