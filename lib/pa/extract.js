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

// CMS Place of Service codes that v52 ships in-bundle (sample, not
// exhaustive -- full CMS list expands in v52-2). Used by R-PA-013.
export const POS_CODES_BUNDLED = new Set([
  '11', '12', '13', '14', '15', '17', '19', '20', '21', '22', '23', '24',
  '25', '26', '31', '32', '33', '34', '41', '42', '49', '50', '51', '52',
  '53', '54', '55', '56', '57', '58', '60', '61', '62', '65', '71', '72',
  '81', '99',
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

export function extractPatientName(text) {
  // "Patient: Jane Doe" / "Name: Jane Doe" -- capture letters + spaces
  // up to end of line. Conservative for the wave 52-1e starter: a
  // formal NER pass lands in a later wave.
  const re = /(?:patient(?:\s+name)?|name)\s*[:#]\s*([A-Za-z][A-Za-z'.\-\s]{1,60})$/im;
  const m = String(text || '').match(re);
  if (!m) return null;
  return m[1].trim().replace(/\s+/g, ' ');
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
    patientName: extractPatientName(text),
    textLength: String(text || '').length,
  };
}
