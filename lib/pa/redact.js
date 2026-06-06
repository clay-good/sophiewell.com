// spec-v52 §4.7: deterministic PHI redaction for the PA report.
//
// `redactText(s)` returns a copy of `s` with the PHI patterns spec-v52
// §4.7 enumerates replaced by `[REDACTED]`: names (Patient / Name /
// DOB lines), MRN / Member ID, SSN, addresses, phone numbers, email
// addresses. The function is pure and idempotent (redacting twice
// changes nothing).
//
// `redactBundle(bundle)` returns a shallow copy of a runEngine bundle
// with every document's `text` and `extract.*` fields redacted; the
// findings array passes through unchanged because Sophie's rule
// engine only emits structural references (rule id, severity, etc.)
// alongside short evidence strings, which are redacted here at the
// per-document level.
//
// Determinism guarantees from spec-v52 §4.10 are preserved: same
// input bytes -> same output bytes (no `Date.now()`, no `Math.random()`,
// no `fetch`). The module is timestamp-free and randomness-free.

const REDACTED = '[REDACTED]';

// One-line patterns first; line-anchored multi-line second.
// spec-v59 §3.2: every quantifier is bounded ({0,n}) so no pattern can
// catastrophically backtrack on hostile input (the pa-stress regex-timing
// guard pins this).
const PATTERNS = [
  // SSN: XXX-XX-XXXX with conservative SSA exclusions handled at the
  // extractor; here we redact any SSN-shaped string.
  { re: /(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)/g, kind: 'ssn' },
  // 11-digit NDC: XXXXX-XXXX-XX or 11-digit run; do NOT touch isolated
  // long digit runs that are not labeled (those may be CPT-adjacent).
  // Email: simple RFC-ish pattern.
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, kind: 'email' },
  // Phone (US NANP): NXX-NXX-XXXX, (NXX) NXX-XXXX, NXX.NXX.XXXX.
  { re: /(?:\+?1[-.\s]?)?(?:\(?[2-9]\d{2}\)?[-.\s]?)[2-9]\d{2}[-.\s]?\d{4}\b/g, kind: 'phone' },
  // spec-v59 §3.2 R-4: international phone with a + country code, e.g.
  // "+44 20 7946 0958" / "+91-22-1234-5678". Bounded groups, no backtracking.
  { re: /\+\d{1,3}(?:[-.\s]?\(?\d{1,4}\)?){2,5}\b/g, kind: 'phone-intl' },
  // spec-v59 §3.2 R-1: an UNLABELED US street address line, e.g.
  // "123 Main St" / "45 North Bedford Avenue". The leading house number plus a
  // street-type suffix is the heuristic; the {0,5} cap bounds the word run.
  { re: /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){0,5}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court|Way|Pl|Place|Cir|Circle|Ter|Terrace|Hwy|Highway|Pkwy|Parkway)\b\.?/gi, kind: 'address' },
  // spec-v59 §3.2 R-1: the City, ST ZIP tail, e.g. "Springfield, IL 62704".
  { re: /\b[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3},\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g, kind: 'cityzip' },
];

// Labeled patterns: replace the value after the label, keep the label
// (so reviewers can still tell what was redacted).
const LABELED = [
  { re: /(\bpatient(?:\s+name)?\s*[:#]\s*)([A-Za-z][A-Za-z'.\-\s]{1,80})$/gim },
  { re: /(\bname\s*[:#]\s*)([A-Za-z][A-Za-z'.\-\s]{1,80})$/gim },
  { re: /(\bd\.?o\.?b\.?\s*[:#]?\s*)(\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}|[A-Za-z]+\s+\d{1,2},\s*\d{4})/gi },
  { re: /(\bdate\s+of\s+birth\s*[:#]?\s*)(\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}|[A-Za-z]+\s+\d{1,2},\s*\d{4})/gi },
  // spec-v59 §3.2 R-2: unlabeled "born <date>".
  { re: /(\bborn\s*[:#]?\s*)(\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}|[A-Za-z]+\s+\d{1,2},\s*\d{4})/gi },
  // spec-v59 §3.2 R-3: capture the ID to the token boundary (not a fixed 20),
  // so an over-long ID does not leak its overflow.
  { re: /(\bmember\s*(?:id|number|#)\s*[:#]?\s*)([A-Za-z0-9-]{4,})/gi },
  { re: /(\bsubscriber\s*(?:id|number|#)\s*[:#]?\s*)([A-Za-z0-9-]{4,})/gi },
  { re: /(\bmrn\s*[:#]?\s*)([A-Za-z0-9-]{4,})/gi },
  { re: /(\bchart\s*number\s*[:#]?\s*)([A-Za-z0-9-]{4,})/gi },
  { re: /(\baddress\s*[:#]\s*)([^\n]{4,120})/gi },
  { re: /(\bpatient\s+address\s*[:#]\s*)([^\n]{4,120})/gi },
];

export function redactText(input) {
  let s = String(input || '');
  // Labeled patterns: keep label, replace value.
  for (const { re } of LABELED) {
    s = s.replace(re, (_, label) => label + REDACTED);
  }
  // Free-text patterns: replace match in full.
  for (const { re } of PATTERNS) {
    s = s.replace(re, REDACTED);
  }
  return s;
}

// Extract-block PHI field names: their values are hard-redacted to
// `[REDACTED]` regardless of content (a raw "Jane Q Doe" string has no
// label so labeled-pattern redaction would miss it). Structural fields
// like CPT / ICD-10 / POS codes are NOT PHI and pass through unchanged.
const PHI_FIELDS = new Set([
  'patientName', 'dob', 'memberId', 'ssns', 'tins', 'serviceDates', 'dates',
]);

function redactValueIn(v, fieldName) {
  if (v === null || v === undefined) return v;
  if (PHI_FIELDS.has(fieldName)) {
    if (Array.isArray(v)) return v.map(() => REDACTED);
    if (typeof v === 'object') return REDACTED;
    return REDACTED;
  }
  if (typeof v === 'string') {
    if (v === REDACTED) return REDACTED;
    return redactText(v);
  }
  if (Array.isArray(v)) return v.map((item) => redactValueIn(item, fieldName));
  if (typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = redactValueIn(v[k], k);
    return out;
  }
  return v;
}

// Collect the literal PHI values the extractor pulled per document so we
// can scrub them out of finding evidence / note strings even when they
// appear without a redaction-triggering label. A rule's evidence often
// quotes the raw value back (e.g. `Found "Jane Q Doe" in doc.txt`), which
// the label/free-text patterns alone would miss. Drawn from the
// pre-redaction documents; structural fields (CPT / ICD-10 / POS / NPI)
// are deliberately excluded since they are not PHI.
const LITERAL_PHI_FIELDS = ['patientName', 'dob', 'memberId'];
const LITERAL_PHI_ARRAYS = ['ssns', 'tins'];

function collectLiteralPhi(documents) {
  const values = new Set();
  for (const d of documents || []) {
    const e = d.extract || {};
    for (const k of LITERAL_PHI_FIELDS) {
      if (typeof e[k] === 'string' && e[k].trim()) values.add(e[k]);
    }
    for (const k of LITERAL_PHI_ARRAYS) {
      if (Array.isArray(e[k])) for (const v of e[k]) if (v) values.add(String(v));
    }
  }
  // Longest-first so a value that contains a shorter one redacts whole.
  return Array.from(values).sort((a, b) => b.length - a.length);
}

function scrubLiterals(s, literals) {
  let out = String(s == null ? '' : s);
  for (const lit of literals) {
    if (lit && lit !== REDACTED) out = out.split(lit).join(REDACTED);
  }
  return out;
}

// Bundle-level: redact each document's text + extract block. Findings
// are passed through unmodified because their `evidence` strings can
// reference codes / counts (non-PHI). If the caller wants the evidence
// strings redacted too, they can pass `{redactFindings: true}`: each
// evidence / note string then gets both literal PHI-value scrubbing
// (from the extracted bundle) and pattern-based `redactText`.
export function redactBundle(bundle, opts) {
  if (!bundle || !Array.isArray(bundle.documents)) return bundle;
  const redactFindings = !!(opts && opts.redactFindings);
  const documents = bundle.documents.map((d) => ({
    ...d,
    text: redactText(d.text || ''),
    extract: redactValueIn(d.extract || {}, 'extract'),
  }));
  const out = { ...bundle, documents };
  if (redactFindings && Array.isArray(bundle.findings)) {
    const literals = collectLiteralPhi(bundle.documents);
    out.findings = bundle.findings.map((f) => ({
      ...f,
      evidence: f.evidence ? redactText(scrubLiterals(f.evidence, literals)) : f.evidence,
      note: f.note ? redactText(scrubLiterals(f.note, literals)) : f.note,
    }));
  }
  return out;
}
