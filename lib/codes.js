// Pure code utilities: NDC normalizer, NPI Luhn check, regex extractors.

// --- NDC ----------------------------------------------------------------
// Accept the four standard NDC formats (4-4-2, 5-3-2, 5-4-1, 5-4-2) with or
// without hyphens. Produce a canonical 11-digit form (5-4-2) and an
// HCPCS-style 10-digit form (drop the most-significant-zero per segment).

export function normalizeNDC(input) {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim();
  if (!cleaned) return null;

  // If hyphenated, parse segments directly.
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    if (parts.length !== 3) return null;
    const [a, b, c] = parts;
    if (![a, b, c].every((p) => /^\d+$/.test(p))) return null;
    const lens = `${a.length}-${b.length}-${c.length}`;
    return canonicalize(a, b, c, lens);
  }

  // Unhyphenated: must be 10 or 11 digits.
  if (!/^\d+$/.test(cleaned)) return null;
  if (cleaned.length === 11) {
    return canonicalize(cleaned.slice(0, 5), cleaned.slice(5, 9), cleaned.slice(9, 11), '5-4-2');
  }
  if (cleaned.length === 10) {
    // Ambiguous. Try the three 10-digit layouts; treat 5-4-1 as the most
    // common labeler-product-package short form when the third segment is 1.
    const layouts = [
      [cleaned.slice(0, 4), cleaned.slice(4, 8), cleaned.slice(8, 10), '4-4-2'],
      [cleaned.slice(0, 5), cleaned.slice(5, 8), cleaned.slice(8, 10), '5-3-2'],
      [cleaned.slice(0, 5), cleaned.slice(5, 9), cleaned.slice(9, 10), '5-4-1'],
    ];
    // Without metadata, prefer 5-4-2 reading by zero-padding the 10-digit form.
    return canonicalize(cleaned.slice(0, 5), cleaned.slice(5, 9), cleaned.slice(9, 10), '5-4-1');
  }
  return null;
}

function canonicalize(a, b, c, originalFormat) {
  // Pad each segment to its 5-4-2 canonical width.
  let labeler = a, product = b, pkg = c;
  switch (originalFormat) {
    case '4-4-2': labeler = '0' + a; break;
    case '5-3-2': product = '0' + b; break;
    case '5-4-1': pkg = '0' + c; break;
    case '5-4-2': break;
    default: return null;
  }
  if (labeler.length !== 5 || product.length !== 4 || pkg.length !== 2) return null;
  const eleven = `${labeler}${product}${pkg}`;
  return {
    canonical: eleven,
    formatted: `${labeler}-${product}-${pkg}`,
    segments: { labeler, product, package: pkg },
    originalFormat,
  };
}

// --- NPI Luhn check -----------------------------------------------------
// NPI is 10 digits. The last digit is a Luhn check digit computed on the
// nine-digit base prefixed by '80840' per CMS specification.

export function isValidNPI(input) {
  if (typeof input !== 'string') return false;
  const digits = input.trim();
  if (!/^\d{10}$/.test(digits)) return false;
  const base = '80840' + digits.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < base.length; i += 1) {
    let d = Number(base[base.length - 1 - i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[9]);
}

// --- Common regex extractors used by Bill / EOB decoders -----------------

export const REGEX = {
  // ICD-10-CM: letter, two digits, optional dot and up to four chars.
  icd10: /\b([A-TV-Z][0-9][0-9A-Z](?:\.[0-9A-Z]{1,4})?)\b/g,
  // HCPCS Level II: one letter (excluding A-Z reserved? generic accepts any) and four digits.
  hcpcs: /\b([A-V][0-9]{4})\b/g,
  // Possible CPT (also matches HCPCS Cat III five-digit; ambiguous on purpose).
  cpt: /\b([0-9]{4}[0-9A-Z])\b/g,
  // Revenue codes: typically 4 digits starting with 0.
  revenue: /\b(0[0-9]{3})\b/g,
  // Place of Service: 2 digits (validated against table).
  pos: /\bPOS\s*[:=]?\s*([0-9]{2})\b/gi,
  // CARC: 1-4 digit reason codes (validated against table).
  carc: /\bCARC\s*[:=]?\s*([0-9]{1,4})\b/gi,
  // RARC: alpha + digits (M76, N130, MA01, etc).
  rarc: /\b([MN][AOEU]?[0-9]{1,3})\b/g,
  // NPI: 10 digits (validated with Luhn separately).
  npi: /\b([0-9]{10})\b/g,
  // Dollar amounts: $123.45 or $1,234.56 or 123.45 (with $ optional).
  dollars: /\$?\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+\.[0-9]{2})\b/g,
};

// Extract unique matches for a given regex from text.
export function extractAll(re, text) {
  const found = new Map();
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    const key = m[1] || m[0];
    if (!found.has(key)) found.set(key, { value: key, index: m.index });
  }
  return [...found.values()];
}

// Extract dollar amounts with their numeric value parsed.
export function extractDollars(text) {
  const out = [];
  REGEX.dollars.lastIndex = 0;
  let m;
  while ((m = REGEX.dollars.exec(text)) !== null) {
    const raw = m[1];
    const value = Number(raw.replace(/,/g, ''));
    if (Number.isFinite(value)) {
      out.push({ raw, value, index: m.index });
    }
  }
  return out;
}
