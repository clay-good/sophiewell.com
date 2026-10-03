// spec-v1624 step 2 / spec-v1613 §1: coded values from a C-CDA document.
//
// Reads only the results (2.16.840.1.113883.10.20.22.2.3.1) and vital signs
// (2.16.840.1.113883.10.20.22.2.4.1) sections: each observation with a LOINC
// code, a physical-quantity value with a unit, and a time. And the patient's
// birth date and administrative gender from the header. Narrative text is
// never read. A small scanner, not a DOM: it runs in a worker (which has no
// DOMParser) and in Node, and resolves nothing external.

const LOINC_OID = '2.16.840.1.113883.6.1';
const SECTIONS = ['2.16.840.1.113883.10.20.22.2.3.1', '2.16.840.1.113883.10.20.22.2.4.1'];

const attr = (tag, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`).exec(tag);
  return m ? (m[2] ?? m[3]) : null;
};
const firstTag = (text, name) => {
  const m = new RegExp(`<(?:\\w+:)?${name}\\b[^>]*>`).exec(text);
  return m ? m[0] : null;
};

// hl7Date('20260614101500-0500') -> '2026-06-14'
export function hl7Date(ts) {
  const m = /^(\d{4})(\d{2})?(\d{2})?/.exec(String(ts || ''));
  if (!m) return null;
  return `${m[1]}-${m[2] || '01'}-${m[3] || '01'}`;
}

function blocks(text, name) {
  const out = [];
  const open = new RegExp(`<(?:\\w+:)?${name}\\b`, 'g');
  const close = new RegExp(`</(?:\\w+:)?${name}>`, 'g');
  let m;
  while ((m = open.exec(text)) !== null) {
    close.lastIndex = m.index;
    const c = close.exec(text);
    if (!c) break;
    out.push(text.slice(m.index, c.index + c[0].length));
    open.lastIndex = m.index + 1;
  }
  return out;
}

export function readCcda(text) {
  const doc = String(text || '');
  const header = doc.slice(0, doc.search(/<component\b/) === -1 ? doc.length : doc.search(/<component\b/));
  const birth = firstTag(header, 'birthTime');
  const gender = firstTag(header, 'administrativeGenderCode');
  const g = gender ? attr(gender, 'code') : null;
  const observations = [];
  for (const section of blocks(doc, 'section')) {
    const ids = [...section.matchAll(/<(?:\w+:)?templateId\b[^>]*\broot\s*=\s*["']([\d.]+)["']/g)].map((x) => x[1]);
    if (!ids.some((id) => SECTIONS.includes(id))) continue;
    for (const obs of blocks(section, 'observation')) {
      const code = firstTag(obs, 'code');
      if (!code || attr(code, 'codeSystem') !== LOINC_OID) continue;
      const valueTag = [...obs.matchAll(/<(?:\w+:)?value\b[^>]*>/g)].map((x) => x[0]).find((t) => /\bxsi:type\s*=\s*["']PQ["']/.test(t));
      if (!valueTag || attr(valueTag, 'nullFlavor')) continue;
      const value = Number(attr(valueTag, 'value'));
      if (!Number.isFinite(value)) continue;
      const time = firstTag(obs, 'effectiveTime');
      let at = time ? attr(time, 'value') : null;
      if (!at) { const low = /<(?:\w+:)?effectiveTime\b[^>]*>\s*<(?:\w+:)?low\b[^>]*\bvalue\s*=\s*["'](\d+)/.exec(obs); at = low ? low[1] : null; }
      observations.push({ system: 'LOINC', code: attr(code, 'code'), value, unit: attr(valueTag, 'unit') || '', at: hl7Date(at) });
    }
  }
  return { observations, birthDate: birth ? hl7Date(attr(birth, 'value')) : null, sex: g === 'F' || g === 'M' ? g : null };
}
