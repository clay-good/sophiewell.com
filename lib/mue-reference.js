// spec-v1614 §6: the reader's own CMS medically unlikely edits (MUE) table, used by itemized-bill-check for that
// run instead of the bundled data/mue (when the bundle has lapsed, or the reader has a newer quarter).
//
// Layout (the same CSV the data/mue builder reads, scripts/data/builders/mue.mjs): a quoted copyright preamble,
// then a header whose first cell is "HCPCS/ CPT Code" (with a line break inside the quotes), then the code, the
// "<setting> MUE Values" column, the "MUE Adjudication Indicator" (its first digit) and the rationale. CMS posts one
// table per setting (practitioner, facility outpatient hospital, DME supplier), each as a zip holding a CSV named
// MCR_MUE_<setting>_Eff_MM-DD-YYYY.csv; the effective date in that name is the edition.
//
// parseMueTable is pure; readMueFile reads a File (the CSV, or the CMS zip) in the page.

import { zipMembers, memberBlob, refusal } from './zip-reader.js';
import { rowsOf } from './csv-rows.js';

const SETTING = (h) => (/practitioner/i.test(h) ? 'practitioner' : /dme/i.test(h) ? 'dme' : /hospital|facility/i.test(h) ? 'hospital' : null);

// parseMueTable(text, name) -> { setting, edition, rows: { CODE: { mue, mai } }, count } or throws RangeError.
export function parseMueTable(text, name = '') {
  const rows = rowsOf(String(text ?? '').replace(/^﻿/, ''));
  const h = rows.findIndex((r) => /^HCPCS\/\s*CPT Code$/i.test((r[0] || '').trim()));
  if (h < 0 || !/MUE Values/i.test(rows[h][1] || '') || !/Adjudication Indicator/i.test(rows[h][2] || '')) {
    throw new RangeError('This is not a CMS MUE table: no "HCPCS/CPT Code, MUE Values, MUE Adjudication Indicator" header was found.');
  }
  const setting = SETTING(rows[h][1]);
  const out = {};
  for (const r of rows.slice(h + 1)) {
    const code = (r[0] || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(code)) continue;
    const mue = Number((r[1] || '').trim());
    const mai = Number(/^(\d)/.exec((r[2] || '').trim())?.[1]);
    if (Number.isInteger(mue) && mue >= 0 && [1, 2, 3].includes(mai)) out[code] = { mue, mai };
  }
  const count = Object.keys(out).length;
  if (!count) throw new RangeError('This MUE table has no code rows.');
  const eff = /Eff_(\d{2})-(\d{2})-(\d{4})/i.exec(name);
  const edition = eff ? `effective ${eff[3]}-${eff[1]}-${eff[2]}` : 'the MUE table you supplied';
  return { setting, edition, rows: out, count };
}

// readMueFile(file) -> parseMueTable of the CSV, or of the MCR_MUE_*.csv member when the file is the CMS zip.
export async function readMueFile(file) {
  if (/\.zip$/i.test(file.name || '')) {
    const members = (await zipMembers(file)).filter((m) => !m.dir && /\.csv$/i.test(m.name));
    const no = refusal(members);
    if (no) throw new RangeError(no);
    const m = members.find((x) => /MCR_MUE_/i.test(x.name)) || members[0];
    if (!m) throw new RangeError(`${file.name} holds no MUE CSV.`);
    return parseMueTable(new TextDecoder('latin1').decode(await (await memberBlob(file, m)).arrayBuffer()), m.name);
  }
  return parseMueTable(new TextDecoder('latin1').decode(await file.arrayBuffer()), file.name);
}
