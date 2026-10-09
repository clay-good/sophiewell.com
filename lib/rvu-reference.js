// spec-v1614 §6: the reader's own CMS physician fee schedule relative value file, used by claims-pct-medicare for
// that run instead of the bundled data/mpfs (a newer quarter, or a lapsed bundle).
//
// The same columns scripts/data/builders/mpfs.mjs reads: the PPRRVU CSV (a few preamble rows, then a header row
// beginning "HCPCS, MOD, DESCRIPTION"; status code in column 4, work RVU 6, nonfacility PE RVU 7, facility PE RVU 9,
// malpractice RVU 11, conversion factor 26) and, when the reader drops CMS's whole RVU zip, its GPCI CSV (header
// row with "Locality Number" in column 3; MAC, state, locality, name, work, PE and malpractice GPCIs). In the zip the
// nonQPP PPRRVU file is used, as the bundle does. The member name is the edition ("PPRRVU2026_Oct_nonQPP").

import { zipMembers, memberBlob, refusal } from './zip-reader.js';
import { rowsOf } from './csv-rows.js';

const str = (v) => (v || '').trim();
const num = (v) => { const n = Number(str(v)); return Number.isFinite(n) ? n : 0; };

// parsePprrvu(text) -> { rows: { CODE: [records] }, conversionFactor, count } or throws RangeError.
export function parsePprrvu(text) {
  const all = rowsOf(String(text ?? '').replace(/^﻿/, ''));
  const h = all.findIndex((r) => str(r[0]) === 'HCPCS' && str(r[1]) === 'MOD' && str(r[2]) === 'DESCRIPTION');
  if (h < 0) throw new RangeError('This is not a CMS physician fee schedule relative value (PPRRVU) file: no "HCPCS, MOD, DESCRIPTION" header was found.');
  const rows = {}; const cfs = new Set(); let count = 0;
  for (const r of all.slice(h + 1)) {
    const code = str(r[0]).toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(code) || r.length < 26) continue;
    const rec = { code, ...(str(r[1]) ? { modifier: str(r[1]) } : {}), statusCode: str(r[3]), workRvu: num(r[5]), peRvuNonFacility: num(r[6]), peRvuFacility: num(r[8]), mpRvu: num(r[10]) };
    (rows[code] ||= []).push(rec);
    if (str(r[25])) cfs.add(str(r[25]));
    count += 1;
  }
  if (!count) throw new RangeError('This relative value file has no code rows.');
  if (cfs.size !== 1) throw new RangeError(`This relative value file carries ${cfs.size} conversion factors; use the nonQPP file.`);
  return { rows, conversionFactor: num([...cfs][0]), count };
}

// parseGpci(text) -> [{ mac, state, locality, name, workGpci, peGpci, mpGpci }]
export function parseGpci(text) {
  const all = rowsOf(String(text ?? ''));
  const h = all.findIndex((r) => /Locality Number/i.test(r[2] || ''));
  if (h < 0) return [];
  const out = [];
  for (const r of all.slice(h + 1)) {
    if (!str(r[2])) break; // footnotes follow the data
    out.push({ mac: str(r[0]), state: str(r[1]), locality: str(r[2]), name: str(r[3]).replace(/\*+$/, ''), workGpci: num(r[4]), peGpci: num(r[5]), mpGpci: num(r[6]) });
  }
  return out;
}

const latin1 = async (blob) => new TextDecoder('latin1').decode(await blob.arrayBuffer());

// readRvuFile(file) -> { edition, rows, conversionFactor, localities (empty when the file has no GPCIs), count }.
export async function readRvuFile(file) {
  if (/\.zip$/i.test(file.name || '')) {
    const members = (await zipMembers(file)).filter((m) => !m.dir);
    const no = refusal(members);
    if (no) throw new RangeError(no);
    const rvu = members.find((m) => /PPRRVU\d{4}_\w+_nonQPP\.csv$/i.test(m.name)) || members.find((m) => /PPRRVU.*\.csv$/i.test(m.name));
    if (!rvu) throw new RangeError(`${file.name} holds no PPRRVU file.`);
    const g = members.find((m) => /GPCI\d{4}\.csv$/i.test(m.name));
    const p = parsePprrvu(await latin1(await memberBlob(file, rvu)));
    const localities = g ? parseGpci(await latin1(await memberBlob(file, g))) : [];
    return { ...p, localities, edition: rvu.name.replace(/^.*\//, '').replace(/\.csv$/i, '') };
  }
  const p = parsePprrvu(await latin1(file));
  return { ...p, localities: [], edition: String(file.name || 'your relative value file').replace(/\.csv$/i, '') };
}
