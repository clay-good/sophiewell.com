// spec-v52 §4.3: deterministic extractors for the PA rule engine.
//
// Each `extract*` function takes one document's plain-text body (the
// output of the ingest step in views/pa-lint.js) and returns the
// structured values the rule engine consumes. Extractors are pure
// over their input string and emit no side effects (no fetch, no
// storage, no random, no timestamp).
//
// The shape returned by `extractAll` is the "extracted bundle" the
// engine.js dispatcher iterates. Wave 52-1e ships a small subset of
// the spec-v52 §4.3 fields; subsequent waves add modifiers, units,
// signatures, etc., to the same shape without changing the engine
// contract.

// NPI: 10 digits with a Luhn-mod-10 check digit, prefixed by the
// "80840" issuer-identifier per CMS. Luhn applies to the 9 leading
// digits + the implicit 80840 prefix (NPPES checksum spec).
export function luhnNpi(npi) {
  if (typeof npi !== 'string' || !/^\d{10}$/.test(npi)) return false;
  // Per CMS NPPES: prepend "80840" before computing Luhn.
  const padded = '80840' + npi;
  let sum = 0;
  let alt = false;
  for (let i = padded.length - 1; i >= 0; i -= 1) {
    let n = Number(padded[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// Bounded scan helper: matchAll, take ≤ cap distinct matches.
function uniqueMatches(text, re, cap = 50) {
  const out = new Set();
  const matches = String(text || '').matchAll(re);
  for (const m of matches) {
    out.add(m[0]);
    if (out.size >= cap) break;
  }
  return [...out];
}

export function extractNpis(text) {
  // Anchor on 10-digit runs that are not part of a longer digit run.
  // Boundary checks avoid catching 11-digit phone numbers + account
  // numbers etc. Then filter to Luhn-valid candidates.
  const all = uniqueMatches(text, /(?<!\d)(\d{10})(?!\d)/g);
  return all.filter(luhnNpi);
}

export function extractSsns(text) {
  // SSN format: XXX-XX-XXXX, with conservative exclusions per SSA:
  // area 000, 666, 9xx are invalid; group 00 invalid; serial 0000
  // invalid. Spec-v52 R-PA-041 flags any SSN-shaped string regardless
  // of validity (the existence of the pattern is the privacy concern).
  return uniqueMatches(text, /(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)/g);
}

export function extractCptHcpcs(text) {
  // CPT: 5 digits. HCPCS Level II: 1 letter + 4 digits. Bounded by
  // non-alphanumerics so they don't collide with longer code strings.
  const cpt = uniqueMatches(text, /(?<![A-Za-z0-9])\d{5}(?![A-Za-z0-9])/g);
  const hcpcs = uniqueMatches(text, /(?<![A-Za-z0-9])[A-V]\d{4}(?![A-Za-z0-9])/g);
  return [...cpt, ...hcpcs];
}

export function extractIcd10(text) {
  // ICD-10-CM: letter + 2 digits + (optional . + 1-4 alphanumerics).
  // Bounded by non-alphanumerics.
  return uniqueMatches(text, /(?<![A-Za-z0-9])[A-TV-Z][0-9][0-9A-Z](?:\.[0-9A-Z]{1,4})?(?![A-Za-z0-9])/g);
}

// spec-v52 §5.3, wave 52-1k: bundled code-validity tables. Both ship
// intentionally empty at wave 52-1k close (the wave R-PA-008/009/011
// are introduced) so the rules behave as well-formed-format checks;
// payer-overlay waves (v52-2+) populate the entries without an engine
// change. Listed here so the per-rule code stays a one-liner.
export const DELETED_CPT_HCPCS_BUNDLED = new Set([
  // populated by `scripts/refresh-pa-rules.mjs` (maintainer-only) from
  // CMS HCPCS-deleted-codes and AMA CPT Errata. Empty at v52-1k.
]);
export const DELETED_ICD10_BUNDLED = new Set([
  // populated from CMS ICD-10-CM annual files. Empty at v52-1k.
]);
// NCCI Procedure-to-Procedure (PTP) edit pairs. Per spec-v52 §5.3 the
// shipped subset will be ~5,000 high-volume pairs; v52-1k ships empty
// so R-PA-012 is a placeholder until the table lands.
export const NCCI_PAIRS_BUNDLED = new Set([
  // entries are stable strings of the form "<cpt1>-<cpt2>" (sorted
  // numerically) so set membership is a single Set.has() call.
]);

// The complete CMS Place of Service code set for professional claims (every
// ASSIGNED POS code). Used by R-PA-013. The unassigned/reserved numbers in the
// gaps -- 28-30, 35-40, 43-48, 59, 63-64, 66-70, 73-80, 82-98 -- are
// intentionally absent so R-PA-013 still blocks a genuinely invalid code (e.g.
// 88). The 01-10 range was previously missing (wave 52-46 completes it), which
// false-blocked legitimate packets in the most common modern settings: POS 02
// (telehealth other than in the patient's home) and POS 10 (telehealth in the
// patient's home, added 2022-01-01), plus pharmacy (01), school (03), homeless
// shelter (04), the Indian Health Service / Tribal 638 facilities (05-08), and
// prison/correctional (09). POS 16 (temporary lodging), 18 (place of
// employment-worksite), and 27 (outreach site/street, added 2023-10-01) were
// also missing. Source: CMS Place of Service Code Set, re-verified on the §4.5.6
// cadence (docs/pa-maintenance.md, ledger source `cms-pos`).
export const POS_CODES_BUNDLED = new Set([
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27',
  '31', '32', '33', '34',
  '41', '42',
  '49', '50', '51', '52', '53', '54', '55', '56', '57', '58',
  '60', '61', '62', '65',
  '71', '72', '81', '99',
]);

export function extractPosCodes(text) {
  // "Place of service: 11" / "POS 22" / "POS: 21". Conservative: only
  // accept the labeled form to avoid catching unlabeled 2-digit pairs.
  const out = new Set();
  const re = /(?:place\s+of\s+service|pos)\s*[:#]?\s*(\d{2})\b/gi;
  const matches = String(text || '').matchAll(re);
  for (const m of matches) out.add(m[1]);
  return [...out];
}

export function extractDates(text) {
  // Three forms emitted into a normalized YYYY-MM-DD where possible,
  // else the raw match. Order is the order encountered.
  const out = [];
  const re = /\b(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/g;
  const matches = String(text || '').matchAll(re);
  for (const m of matches) out.push(m[1]);
  return out;
}

// Dates explicitly labeled as service dates: "Date of service: ...",
// "DOS: ...", "Service date: ...". Used by R-PA-005 / R-PA-006 so the
// retro-auth window and future-date ceiling do not catch DOB or
// signature dates that happen to live in the same document.
export function extractServiceDates(text) {
  const out = [];
  const re = /(?:date\s+of\s+service|service\s+date|dos)\s*[:#]?\s*(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4})/gi;
  for (const m of String(text || '').matchAll(re)) out.push(m[1]);
  return out;
}

export function extractPatientName(text) {
  // "Patient: Jane Doe" / "Name: Jane Doe" -- capture letters + spaces
  // up to end of line. Conservative for the wave 52-1e starter: a
  // formal NER pass lands in a later wave.
  const re = /(?:patient(?:\s+name)?|name)\s*[:#]\s*([A-Za-z][A-Za-z'.\-\s]{1,60})$/im;
  const m = String(text || '').match(re);
  if (!m) return null;
  return m[1].trim().replace(/\s+/g, ' ');
}

// spec-v52 wave 52-1f extractors.

// "DOB: 1985-03-12" / "Date of birth: 03/12/1985" / "D.O.B. 3/12/85".
// Returns the raw date string for parseDate() downstream; null if absent.
export function extractDob(text) {
  const re = /(?:d\.?o\.?b\.?|date\s+of\s+birth)\s*[:#]?\s*(\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}|[A-Za-z]+\s+\d{1,2},\s*\d{4})/i;
  const m = String(text || '').match(re);
  if (!m) return null;
  return m[1].trim();
}

// "Member ID: W123456789" / "Subscriber ID: 0123456789" / "MRN: 12345".
// Captures 4-20 alphanumerics + hyphens following the label.
export function extractMemberId(text) {
  const re = /(?:member\s*(?:id|number|#)|subscriber\s*(?:id|number|#)|mrn|chart\s*number)\s*[:#]?\s*([A-Za-z0-9-]{4,20})/i;
  const m = String(text || '').match(re);
  if (!m) return null;
  return m[1].trim();
}

// US federal TIN/EIN: 9 digits, sometimes formatted XX-XXXXXXX.
export function extractTin(text) {
  const out = new Set();
  const re = /(?:tin|ein|tax\s*id)\s*[:#]?\s*(\d{2}-\d{7}|\d{9})\b/gi;
  for (const m of String(text || '').matchAll(re)) {
    out.add(m[1].replace(/-/g, ''));
  }
  return [...out];
}

// "Quantity: 12" / "Qty 30" / "Units: 1". Returns the largest reported
// quantity as a number, or null. Rule engine asserts >= 1.
export function extractQuantity(text) {
  const re = /(?:quantity|qty|units?)\s*[:#]?\s*(\d{1,4})\b/gi;
  let best = null;
  for (const m of String(text || '').matchAll(re)) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && (best === null || n > best)) best = n;
  }
  return best;
}

// Presence heuristic: was a signature line typed into the document?
// Common forms: "Signature: Jane Doe", "Signed: J. Doe MD", "/s/ J. Doe",
// "Electronically signed by Jane Doe". Returns { present, dated }.
export function extractSignature(text) {
  const s = String(text || '');
  const anchorRe = /(?:\bsignature\s*[:#]|\bsigned\s*(?:by|:)|\belectronically\s+signed\b|\/s\/\s*[A-Za-z])/i;
  const m = s.match(anchorRe);
  if (!m) return { present: false, dated: false };
  // Look for a date within the same line / next ~120 chars after the
  // anchor for the "dated" half of the contract.
  const window = s.slice(m.index, m.index + 160);
  const dated = /\b(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/.test(window);
  return { present: true, dated };
}

// "Weight: 70 kg" / "Wt 154 lb". Returns the first reported weight as
// { value, unit: 'kg'|'lb' }, or null. The unit is preserved (no
// conversion) so payer overlays can express dose-per-kg or
// dose-per-lb without a second translation step.
export function extractWeight(text) {
  const re = /(?:weight|wt)\s*[:#]?\s*(\d{1,3}(?:\.\d{1,2})?)\s*(kg|kgs|lb|lbs|pounds)\b/i;
  const m = String(text || '').match(re);
  if (!m) return null;
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return null;
  const u = m[2].toLowerCase();
  const unit = (u === 'kg' || u === 'kgs') ? 'kg' : 'lb';
  return { value, unit };
}

// "Height: 175 cm" / "Ht 5'10\"". Returns { value, unit: 'cm'|'in' }
// or null. The 5'10" shape is normalized to inches (5*12 + 10 = 70).
export function extractHeight(text) {
  const s = String(text || '');
  const ftIn = s.match(/(?:height|ht)\s*[:#]?\s*(\d)\s*['′]\s*(\d{1,2})\s*(?:["″]|in)?/i);
  if (ftIn) {
    const inches = Number(ftIn[1]) * 12 + Number(ftIn[2]);
    if (Number.isFinite(inches)) return { value: inches, unit: 'in' };
  }
  const metric = s.match(/(?:height|ht)\s*[:#]?\s*(\d{2,3}(?:\.\d{1,2})?)\s*(cm|cms|m|inches?|in)\b/i);
  if (!metric) return null;
  const value = Number(metric[1]);
  if (!Number.isFinite(value)) return null;
  const u = metric[2].toLowerCase();
  const unit = (u === 'cm' || u === 'cms') ? 'cm'
    : (u === 'm') ? 'cm'  // 1.75 m treated as cm-equivalent for v52-1h
    : 'in';
  return { value: unit === 'cm' && u === 'm' ? value * 100 : value, unit };
}

// "BID" / "twice daily" / "every 6 hours" / "qHS" / "daily" -- returns
// the first matched canonical token, or null. Used by R-PA-036.
const FREQUENCY_TOKENS = [
  'qd', 'daily', 'once daily', 'every day',
  'bid', 'twice daily',
  'tid', 'three times daily',
  'qid', 'four times daily',
  'qhs', 'at bedtime', 'nightly',
  'qac', 'before meals',
  'q4h', 'q6h', 'q8h', 'q12h', 'q24h',
  'every 4 hours', 'every 6 hours', 'every 8 hours', 'every 12 hours', 'every 24 hours',
  'prn', 'as needed',
  'weekly', 'monthly',
];
export function extractFrequency(text) {
  const s = String(text || '').toLowerCase();
  for (const token of FREQUENCY_TOKENS) {
    const re = new RegExp('(?:^|[^a-z0-9])' + token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:$|[^a-z0-9])', 'i');
    if (re.test(s)) return token;
  }
  return null;
}

// Cheap keyword-presence helper. Case-insensitive substring scan. Used
// by the info-level "did the packet mention X?" rules so each rule's
// check() stays a one-liner. Returns the first matched needle or null.
export function keywordPresent(text, needles) {
  const s = String(text || '').toLowerCase();
  for (const n of needles) {
    const needle = String(n).toLowerCase();
    if (s.includes(needle)) return needle;
  }
  return null;
}

// U+FFFD REPLACEMENT CHARACTER count. Non-zero count after PDF / DOCX
// extraction strongly suggests a non-UTF8 source the extractor couldn't
// decode (the "mojibake" condition spec-v52 §4.5.1 R-PA-046 flags).
export function countReplacementChars(text) {
  const s = String(text || '');
  let n = 0;
  for (let i = 0; i < s.length; i += 1) {
    if (s.charCodeAt(i) === 0xFFFD) n += 1;
  }
  return n;
}

// One-shot: roll a single document's extractor outputs into one bundle.
// The engine aggregates these across documents.
export function extractAll(text) {
  return {
    npis: extractNpis(text),
    ssns: extractSsns(text),
    cpts: extractCptHcpcs(text),
    icd10: extractIcd10(text),
    pos: extractPosCodes(text),
    dates: extractDates(text),
    serviceDates: extractServiceDates(text),
    patientName: extractPatientName(text),
    dob: extractDob(text),
    memberId: extractMemberId(text),
    tins: extractTin(text),
    quantity: extractQuantity(text),
    signature: extractSignature(text),
    weight: extractWeight(text),
    height: extractHeight(text),
    frequency: extractFrequency(text),
    replacementChars: countReplacementChars(text),
    textLength: String(text || '').length,
  };
}
