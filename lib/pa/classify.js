// spec-v52 §4.3 "[Classify]" step: deterministic document-role
// classifier.
//
// Each ingested document is tagged with one of the roles below based
// on keyword anchors. The classifier is deterministic and explainable
// (no ML, no probabilities): the first role whose anchors match wins,
// ties broken by the order of ROLES below. Documents with no anchor
// hit fall through to 'other'.
//
// The role tag is consumed by downstream rules that want to limit
// their search to a specific document class (e.g. R-PA-005 looks at
// dates inside the clinical-note role, not at DOB strings sprinkled
// across the packet).

export const ROLES = [
  'clinical-note',
  'pa-form',
  'medical-necessity-letter',
  'lab-result',
  'imaging-report',
  'path-report',
  'prior-auth-denial',
  'other',
];

// Per-role anchors. Each entry is a lowercase substring that, if
// present in the document text, contributes to a role hit. The
// classifier requires `min` anchors to match before a role is
// assigned; `min: 1` is loose but keeps the false-positive rate low
// because the anchors are role-specific phrases (e.g. "history of
// present illness" is essentially never in a lab report).
const ANCHORS = {
  'clinical-note': {
    min: 1,
    needles: [
      'chief complaint',
      'history of present illness',
      'review of systems',
      'physical exam',
      'assessment and plan',
      'progress note',
      'clinical note',
      'soap note',
      'h&p',
    ],
  },
  'pa-form': {
    min: 1,
    needles: [
      'prior authorization request',
      'prior auth request',
      'prior authorization form',
      'authorization request form',
      'pa request form',
      'service authorization request',
      'request for prior authorization',
    ],
  },
  'medical-necessity-letter': {
    min: 1,
    needles: [
      'letter of medical necessity',
      'medical necessity letter',
      'to whom it may concern',
      'medical necessity statement',
    ],
  },
  'lab-result': {
    min: 1,
    needles: [
      'laboratory report',
      'lab report',
      'lab results',
      'reference range',
      'reference interval',
      'loinc',
      'specimen received',
    ],
  },
  'imaging-report': {
    min: 1,
    needles: [
      'mri',
      'ct of',
      'ct scan',
      'ultrasound',
      'radiology report',
      'impression:',
      'findings:',
    ],
  },
  'path-report': {
    min: 1,
    needles: [
      'pathology report',
      'surgical pathology',
      'gross description',
      'microscopic description',
      'final diagnosis:',
    ],
  },
  'prior-auth-denial': {
    min: 1,
    needles: [
      'authorization denied',
      'prior authorization denied',
      'adverse determination',
      'denial reason',
      'notice of denial',
      'we are unable to approve',
    ],
  },
};

function lcMatchCount(haystack, needles) {
  let hits = 0;
  for (const n of needles) {
    if (haystack.includes(n)) hits += 1;
  }
  return hits;
}

export function classifyDocument(text) {
  const s = String(text || '').toLowerCase();
  if (s.length === 0) return 'other';
  let bestRole = 'other';
  let bestHits = 0;
  for (const role of ROLES) {
    const spec = ANCHORS[role];
    if (!spec) continue;
    const hits = lcMatchCount(s, spec.needles);
    if (hits >= spec.min && hits > bestHits) {
      bestHits = hits;
      bestRole = role;
    }
  }
  return bestRole;
}
