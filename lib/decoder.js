// Bill / EOB decoder: pure parsing logic. The DOM rendering and the optional
// Web Worker wrapper live in the views module. Keeping this pure makes it
// straightforward to unit-test against a fixture bank.

import { REGEX, extractAll, extractDollars, isValidNPI } from './codes.js';

export function decodeBillText(input) {
  const text = String(input || '');

  // Extract candidate codes by category.
  const icd10 = extractAll(REGEX.icd10, text);
  const hcpcs = extractAll(REGEX.hcpcs, text);
  const cptOrFiveDigit = extractAll(REGEX.cpt, text).filter((m) => !hcpcs.find((h) => h.value === m.value));
  const revenue = extractAll(REGEX.revenue, text).filter((r) => /^0[0-9]{3}$/.test(r.value));
  const npiCandidates = extractAll(REGEX.npi, text);
  const npis = npiCandidates.filter((n) => isValidNPI(n.value));
  const dollars = extractDollars(text);
  const carc = extractAll(REGEX.carc, text);
  const rarc = extractAll(REGEX.rarc, text);
  const pos = extractAll(REGEX.pos, text);

  // Adjacency: associate each dollar with the nearest preceding code on the
  // same line. Compute by index distance within the same line.
  const lines = splitLines(text);
  const associations = associateAmountsToCodes(lines, [
    ...icd10.map((m) => ({ ...m, kind: 'icd10' })),
    ...hcpcs.map((m) => ({ ...m, kind: 'hcpcs' })),
    ...cptOrFiveDigit.map((m) => ({ ...m, kind: 'cpt' })),
    ...revenue.map((m) => ({ ...m, kind: 'revenue' })),
  ], dollars);

  return {
    codes: {
      icd10: icd10.map((m) => m.value),
      hcpcs: hcpcs.map((m) => m.value),
      cpt: cptOrFiveDigit.map((m) => m.value),
      revenue: revenue.map((m) => m.value),
      pos: pos.map((m) => m.value),
      carc: carc.map((m) => m.value),
      rarc: rarc.map((m) => m.value),
      npi: npis.map((m) => m.value),
    },
    npiCandidates: npiCandidates.map((m) => m.value),
    dollars: dollars.map((d) => d.value),
    associations,
  };
}

function splitLines(text) {
  const lines = [];
  let start = 0;
  for (let i = 0; i <= text.length; i += 1) {
    if (i === text.length || text[i] === '\n') {
      lines.push({ text: text.slice(start, i), start, end: i });
      start = i + 1;
    }
  }
  return lines;
}

function lineOf(lines, index) {
  for (const ln of lines) {
    if (index >= ln.start && index <= ln.end) return ln;
  }
  return null;
}

function associateAmountsToCodes(lines, codeMatches, dollars) {
  const out = [];
  for (const d of dollars) {
    const ln = lineOf(lines, d.index);
    if (!ln) continue;
    // Choose nearest code on same line that occurs before the dollar.
    const candidates = codeMatches.filter((c) => {
      const cl = lineOf(lines, c.index);
      return cl && cl.start === ln.start && c.index < d.index;
    });
    if (candidates.length === 0) continue;
    candidates.sort((a, b) => b.index - a.index);
    const pick = candidates[0];
    out.push({ code: pick.value, kind: pick.kind, amount: d.value });
  }
  return out;
}

// EOB-specific extractor. Looks for adjacent CARC/RARC patterns and
// allowed/paid/responsibility amounts.
export function decodeEobText(input) {
  const base = decodeBillText(input);
  const text = String(input || '');
  // Heuristic field extraction.
  const fields = {};
  const patterns = [
    ['allowed',  /\b(?:allowed|allowed amount|approved)\b[^$0-9]*\$?\s*([0-9.,]+)/i],
    ['planPaid', /\b(?:plan paid|insurance paid|paid by plan)\b[^$0-9]*\$?\s*([0-9.,]+)/i],
    ['patientResp', /\b(?:patient responsibility|you owe|you pay|patient pays)\b[^$0-9]*\$?\s*([0-9.,]+)/i],
    ['adjustment', /\b(?:adjustment|contractual adjustment|write[- ]off)\b[^$0-9]*\$?\s*([0-9.,]+)/i],
  ];
  for (const [k, re] of patterns) {
    const m = text.match(re);
    if (m) fields[k] = Number(m[1].replace(/,/g, ''));
  }
  return { ...base, fields };
}

// Good Faith Estimate dispute threshold check (Public Health Service Act).
// Threshold is $400 over the GFE.
export function gfeDisputeCheck({ gfeTotal, actualBillTotal, status }) {
  for (const [k, v] of Object.entries({ gfeTotal, actualBillTotal })) {
    if (!Number.isFinite(v) || v < 0) {
      throw new TypeError(`gfeDisputeCheck: ${k} must be a non-negative finite number.`);
    }
  }
  const overage = actualBillTotal - gfeTotal;
  const eligible = (status === 'uninsured' || status === 'self-pay') && overage > 400;
  return {
    overage: Math.round(overage * 100) / 100,
    threshold: 400,
    eligible,
    note: eligible
      ? 'Bill exceeds the GFE by more than $400. The patient may file a Patient-Provider Dispute within 120 days of the bill. Reference only.'
      : 'Bill does not meet the federal $400 dispute threshold for uninsured / self-pay patients. Reference only.',
  };
}
