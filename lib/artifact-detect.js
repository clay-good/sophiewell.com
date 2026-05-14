// spec-v7 §3.3: artifact-detecting dropzone classifier.
//
// Pure-function deterministic classifier. Takes plain-text extracted from
// a dropped PDF or DOCX (parser plumbing lives elsewhere) and returns the
// best-matching artifact kind plus the fingerprint that fired, or
// `unknown` when no fingerprint scores high enough. No AI, no network,
// no probabilistic model — just a small hand-written table of regexes
// and keyword sets.
//
// The classifier is the routing brain behind the §3.1 dropzone: a patient
// drops a PDF, the file is parsed in a Web Worker, the extracted text is
// passed here, and the returned `kind` decides which v7 decoder page the
// router opens with the text pre-loaded.
//
// Design rules:
//   - Every fingerprint is testable against fixture text. The unit test
//     file exercises each kind with a representative excerpt.
//   - Scores are integers so ties are deterministic.
//   - When two kinds tie, the more specific kind wins via the
//     `KIND_PRIORITY` order (e.g. an EOB that also mentions "balance"
//     should not be misrouted to `bill`).
//   - `unknown` is a real outcome, not an error. The UI shows a chooser
//     pane when this is returned.

export const ARTIFACT_KINDS = Object.freeze([
  'bill',
  'eob',
  'msn',
  'lab-result',
  'denial-letter',
  'pharmacy-list',
  'discharge-summary',
  'insurance-card',
]);

// Higher index = more specific. Used only to break exact-score ties.
const KIND_PRIORITY = Object.freeze({
  bill: 1,
  'lab-result': 2,
  'pharmacy-list': 2,
  'discharge-summary': 2,
  'insurance-card': 2,
  msn: 3,
  eob: 4,
  'denial-letter': 4,
});

// Lowest total score that counts as a confident match. Below this we
// return `unknown` and the UI prompts the user to pick a decoder.
const MIN_CONFIDENT_SCORE = 3;

// A small library of bundled analyte names the lab-result fingerprint
// keys on. Intentionally a hand-picked subset of common outpatient
// panels — keeps the heuristic tight and predictable.
const LAB_ANALYTE_TOKENS = [
  'hemoglobin', 'hematocrit', 'platelet', 'platelets', 'wbc', 'rbc',
  'mcv', 'mch', 'mchc', 'rdw', 'neutrophil', 'lymphocyte',
  'sodium', 'potassium', 'chloride', 'bicarbonate', 'co2', 'bun',
  'creatinine', 'glucose', 'calcium', 'magnesium', 'phosphorus',
  'albumin', 'protein', 'bilirubin', 'alt', 'ast', 'alkaline phosphatase',
  'cholesterol', 'triglyceride', 'triglycerides', 'hdl', 'ldl',
  'a1c', 'hemoglobin a1c', 'hba1c', 'tsh', 'free t4', 'free t3',
  'ferritin', 'iron', 'tibc', 'vitamin d', 'vitamin b12',
  'inr', 'pt', 'ptt',
];

const CURRENCY_RE = /\$\s?\d|\bUSD\b|\b\d{1,3}(?:,\d{3})*\.\d{2}\b/;
const DATE_RE = /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])[\/\-](?:\d{2}|\d{4})\b|\b\d{4}-\d{2}-\d{2}\b/;
const REFERENCE_RANGE_RE = /\breference\s+(?:range|interval)\b|\bnormal\s+range\b/i;

// --- text normalization -----------------------------------------------------

export function normalizeText(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Returns the number of unique entries in `tokens` that appear as
// whole-word substrings of the (already-lowercased) text.
function countTokens(text, tokens) {
  let n = 0;
  for (const t of tokens) {
    const re = new RegExp('(?:^|\\W)' + escapeRe(t) + '(?:\\W|$)');
    if (re.test(text)) n++;
  }
  return n;
}

function hasAll(text, tokens) {
  for (const t of tokens) {
    if (!text.includes(t)) return false;
  }
  return true;
}

function hasAny(text, tokens) {
  for (const t of tokens) {
    if (text.includes(t)) return true;
  }
  return false;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- fingerprints -----------------------------------------------------------
//
// Each fingerprint returns an object { score, hits } where `hits` is the
// list of matched fragments (used by the UI to explain why this kind was
// chosen). Score is a small integer; we never compare across kinds via
// raw magnitude unless the values come from the same fingerprint family.

function scoreBill(text) {
  const hits = [];
  let score = 0;
  const billTerms = ['amount due', 'balance due', 'balance forward', 'statement date', 'patient responsibility', 'pay this amount'];
  for (const t of billTerms) {
    if (text.includes(t)) { score += 2; hits.push(t); }
  }
  if (CURRENCY_RE.test(text)) { score += 1; hits.push('currency'); }
  // The §3.3 illustrative rule: "CPT" or "DRG" tokens often appear on a
  // bill but not on a lab result.
  if (/\bcpt\b/i.test(text)) { score += 1; hits.push('CPT'); }
  if (/\bdrg\b/i.test(text)) { score += 1; hits.push('DRG'); }
  // Negative guard: explicit "this is not a bill" should pull score way
  // down so an EOB cannot win the bill kind.
  if (text.includes('this is not a bill')) score -= 100;
  return { score, hits };
}

function scoreEob(text) {
  const hits = [];
  let score = 0;
  if (text.includes('this is not a bill')) { score += 5; hits.push('this is not a bill'); }
  if (text.includes('allowed amount') && text.includes('patient responsibility')) {
    score += 4; hits.push('allowed amount + patient responsibility');
  } else {
    if (text.includes('allowed amount')) { score += 2; hits.push('allowed amount'); }
    if (text.includes('patient responsibility')) { score += 1; hits.push('patient responsibility'); }
  }
  if (text.includes('explanation of benefits')) { score += 3; hits.push('explanation of benefits'); }
  if (/\bcarc\b/i.test(text) || /\brarc\b/i.test(text)) { score += 1; hits.push('CARC/RARC'); }
  if (text.includes('claim number')) { score += 1; hits.push('claim number'); }
  return { score, hits };
}

function scoreMsn(text) {
  const hits = [];
  let score = 0;
  if (text.includes('medicare summary notice')) { score += 5; hits.push('medicare summary notice'); }
  if (text.includes('your medicare number')) { score += 2; hits.push('your medicare number'); }
  if (text.includes('part a') || text.includes('part b')) { score += 1; hits.push('part a/b'); }
  if (text.includes('this is not a bill')) { score += 1; hits.push('this is not a bill'); }
  return { score, hits };
}

function scoreLabResult(text) {
  const hits = [];
  let score = 0;
  if (REFERENCE_RANGE_RE.test(text)) { score += 3; hits.push('reference range'); }
  const analyteCount = countTokens(text, LAB_ANALYTE_TOKENS);
  if (analyteCount >= 3) { score += 3; hits.push(`${analyteCount} analytes`); }
  else if (analyteCount === 2) { score += 1; hits.push('2 analytes'); }
  // Lab printouts often carry "specimen" / "collected" / "ordering provider"
  if (/\bspecimen\b/.test(text)) { score += 1; hits.push('specimen'); }
  if (/\bordering provider\b/.test(text)) { score += 1; hits.push('ordering provider'); }
  // Currency on the page strongly suggests bill/EOB, not a lab report
  if (CURRENCY_RE.test(text)) score -= 2;
  return { score, hits };
}

function scoreDenialLetter(text) {
  const hits = [];
  let score = 0;
  if (text.includes('adverse benefit determination')) { score += 5; hits.push('adverse benefit determination'); }
  if (text.includes('right to appeal') || text.includes('your appeal rights')) { score += 3; hits.push('appeal rights'); }
  if (text.includes('external review')) { score += 2; hits.push('external review'); }
  const denied = /\bdenied\b/.test(text);
  const appeal = /\bappeal\b/.test(text);
  if (denied && appeal && DATE_RE.test(text)) { score += 2; hits.push('denied + appeal + date'); }
  if (text.includes('reason for denial') || text.includes('denial reason')) { score += 2; hits.push('reason for denial'); }
  return { score, hits };
}

function scorePharmacyList(text) {
  const hits = [];
  let score = 0;
  const dose = /\b\d+\s?(?:mg|mcg|g|ml|units)\b/i;
  const form = /\b(?:tablet|tablets|capsule|capsules|injection|solution|suspension)\b/i;
  if (dose.test(text)) { score += 2; hits.push('dose unit'); }
  if (form.test(text)) { score += 1; hits.push('dosage form'); }
  if (/\brefill[s]?\b/.test(text)) { score += 2; hits.push('refill'); }
  if (/\bsig\b|\btake\s+\d/.test(text)) { score += 1; hits.push('sig'); }
  if (/\brx\s*#|\bprescription\s*#/i.test(text)) { score += 2; hits.push('rx number'); }
  if (/\bpharmacy\b/.test(text)) { score += 1; hits.push('pharmacy'); }
  // A clinical discharge packet often mentions meds too; pull score down
  // when the discharge fingerprint terms are present.
  if (text.includes('discharge instructions')) score -= 2;
  return { score, hits };
}

function scoreDischargeSummary(text) {
  const hits = [];
  let score = 0;
  if (text.includes('discharge instructions')) { score += 4; hits.push('discharge instructions'); }
  if (text.includes('discharge summary')) { score += 4; hits.push('discharge summary'); }
  if (text.includes('return precautions') || text.includes('when to return')) { score += 3; hits.push('return precautions'); }
  if (text.includes('follow-up') || text.includes('follow up appointment')) { score += 2; hits.push('follow-up'); }
  if (text.includes('admitting diagnosis') || text.includes('discharge diagnosis')) { score += 2; hits.push('admit/discharge diagnosis'); }
  return { score, hits };
}

function scoreInsuranceCard(text) {
  const hits = [];
  let score = 0;
  if (/\bmember\s*(?:id|#|number)\b/i.test(text)) { score += 3; hits.push('member id'); }
  if (/\bgroup\s*(?:id|#|number)\b/i.test(text)) { score += 2; hits.push('group number'); }
  if (/\brx\s*bin\b/i.test(text)) { score += 3; hits.push('rx bin'); }
  if (/\brx\s*pcn\b/i.test(text)) { score += 2; hits.push('rx pcn'); }
  if (/\bpayer\s*id\b/i.test(text)) { score += 2; hits.push('payer id'); }
  if (text.includes('copay') || text.includes('copayment')) { score += 1; hits.push('copay'); }
  if (text.includes('subscriber')) { score += 1; hits.push('subscriber'); }
  // An EOB also mentions copay; cards are short, so penalize long text.
  if (text.length > 4000) score -= 2;
  return { score, hits };
}

const FINGERPRINTS = Object.freeze({
  bill: scoreBill,
  eob: scoreEob,
  msn: scoreMsn,
  'lab-result': scoreLabResult,
  'denial-letter': scoreDenialLetter,
  'pharmacy-list': scorePharmacyList,
  'discharge-summary': scoreDischargeSummary,
  'insurance-card': scoreInsuranceCard,
});

// --- public API -------------------------------------------------------------

// Detect the artifact kind in plain-text `input`. Returns:
//   {
//     kind: one of ARTIFACT_KINDS or 'unknown',
//     score: integer (0 when unknown),
//     hits: string[] of matched fragments (empty when unknown),
//     scores: { [kind]: { score, hits } }   // every fingerprint, for tests/UI
//   }
//
// The function is pure: same `input` → same return value, no I/O.
export function detectArtifact(input) {
  const text = normalizeText(input);
  const scores = {};
  for (const kind of ARTIFACT_KINDS) {
    scores[kind] = FINGERPRINTS[kind](text);
  }
  let bestKind = 'unknown';
  let bestScore = -Infinity;
  let bestPriority = -Infinity;
  for (const kind of ARTIFACT_KINDS) {
    const s = scores[kind].score;
    const pri = KIND_PRIORITY[kind] || 0;
    if (s > bestScore || (s === bestScore && pri > bestPriority)) {
      bestScore = s;
      bestPriority = pri;
      bestKind = kind;
    }
  }
  if (bestScore < MIN_CONFIDENT_SCORE) {
    return { kind: 'unknown', score: 0, hits: [], scores };
  }
  return { kind: bestKind, score: bestScore, hits: scores[bestKind].hits.slice(), scores };
}

// Convenience: just the kind, no scoring detail. Useful in the router.
export function detectArtifactKind(input) {
  return detectArtifact(input).kind;
}
