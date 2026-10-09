// spec-v1614 §6 and spec-v1621 §3.4 (browser path): the reader's own CMS NCCI procedure-to-procedure (PTP) edit
// files, read so itemized-bill-check can check code pairs. The site does not bundle them: CMS serves them behind
// the AMA click-through agreement, which the reader accepts when downloading them.
//
// Layout (spec-v1621 §3.4): tab-delimited text, a few preamble rows, a header row beginning "Column 1, Column 2",
// then column 1, column 2, an "in existence prior to 1996" mark, the effective date (YYYYMMDD), the deletion date
// ("*" while active), the modifier indicator (0 not allowed, 1 allowed, 9 not applicable) and the rationale. Each
// file is a few hundred thousand rows; deleted edits are included. The files come as zips of four parts, and the
// member names carry the version ("ccioph-v322r0-f1.txt": outpatient hospital, version 32.2, revision 0).
//
// What an edit means (NCCI Policy Manual for Medicare Services, 2026, Introduction and ch. I sec. E, read October
// 9, 2026): when a provider reports both codes for the same beneficiary on the same date, column 1 is eligible
// for payment and column 2 is denied unless a clinically appropriate PTP-associated modifier (such as 59, XE or an
// anatomic modifier) is allowed and reported. Indicator 0: no modifier bypasses the edit; 1: one may, when the
// circumstances justify it; 9: not specified, used for pairs deleted on the day they took effect (skipped).
//
// readPtp streams: only rows whose two codes are both on the bill are kept, so memory follows the bill, not the
// file. ptpFindings is pure.

import { zipMembers, memberBlob, refusal } from './zip-reader.js';

const ymd = (s) => (/^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null);

// parsePtpLine(line, codes) -> a row when both codes are in the Set, else null.
export function parsePtpLine(line, codes) {
  const c = line.split('\t');
  if (c.length < 6) return null;
  const col1 = c[0].trim().toUpperCase(); const col2 = c[1].trim().toUpperCase();
  if (!codes.has(col1) || !codes.has(col2)) return null;
  const effective = ymd(c[3].trim());
  if (!effective) return null;
  const del = c[4].trim();
  return { col1, col2, effective, deleted: del === '*' ? null : ymd(del), modifier: c[5].trim() };
}

// The version a member or file name carries, as "v32.2 r0", and the setting.
export function ptpEdition(name) {
  const m = /cci(pra|oph)-v(\d+?)(\d)r(\d+)/i.exec(String(name || ''));
  if (!m) return null;
  return { setting: m[1].toLowerCase() === 'oph' ? 'hospital outpatient' : 'practitioner', version: `version ${m[2]}.${m[3]}, revision ${m[4]}` };
}

async function scanText(blob, codes, rows) {
  const reader = blob.stream().pipeThrough(new TextDecoderStream('latin1')).getReader();
  let rest = ''; let header = false; let lines = 0;
  for (;;) {
    const { value, done } = await reader.read();
    const text = rest + (value || '');
    const parts = text.split(/\r?\n/);
    rest = done ? '' : parts.pop();
    for (const line of parts) {
      lines += 1;
      if (!header) { if (/^column 1\tcolumn 2/i.test(line.trim())) header = true; continue; }
      const r = parsePtpLine(line, codes);
      if (r) rows.push(r);
    }
    if (done) break;
  }
  if (!header) throw new RangeError('This is not a CMS NCCI PTP edit file: no "Column 1, Column 2" header was found.');
  return lines;
}

// readPtp(files, codes) -> { rows, editions: [names], settings: Set, lines }. `files` are Blobs with names (File).
export async function readPtp(files, codeList) {
  const codes = new Set(codeList.map((c) => String(c).toUpperCase()));
  const rows = []; const editions = new Set(); const settings = new Set(); let lines = 0;
  for (const f of files) {
    const parts = [];
    if (/\.zip$/i.test(f.name || '')) {
      const members = (await zipMembers(f)).filter((m) => !m.dir && /\.txt$/i.test(m.name));
      const no = refusal(members);
      if (no) throw new RangeError(no);
      for (const m of members) parts.push({ name: m.name, blob: await memberBlob(f, m) });
      if (!parts.length) throw new RangeError(`${f.name} holds no PTP text file.`);
    } else parts.push({ name: f.name, blob: f });
    for (const p of parts) {
      lines += await scanText(p.blob, codes, rows);
      const e = ptpEdition(p.name);
      if (e) { editions.add(e.version); settings.add(e.setting); }
    }
  }
  return { rows, editions: [...editions], settings: [...settings], lines };
}

const active = (r, date) => r.effective <= date && (!r.deleted || date < r.deleted);

// ptpFindings(lines [{ line, code, date }], rows) -> Map line -> [finding strings], for the column 2 lines.
// Lines without a date are paired with each other and checked only against edits the file still has active
// (no deletion date), so the answer never depends on today's date.
export function ptpFindings(lines, rows) {
  const out = new Map();
  const byKey = new Map();
  for (const l of lines) { const k = l.date || ''; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(l); }
  for (const [date, group] of byKey) {
    const codes = new Set(group.map((l) => l.code));
    for (const r of rows) {
      if (r.modifier === '9' || !codes.has(r.col1) || !codes.has(r.col2) || r.col1 === r.col2 || !(date ? active(r, date) : !r.deleted)) continue;
      const how = r.modifier === '1' ? 'unless a modifier the record supports (such as 59 or XE) shows a separate service' : 'and no modifier allows it';
      const text = `billed with ${r.col1}${date ? ` on ${date}` : ''}: an NCCI pair edit, so ${r.col2} is not paid separately ${how}`;
      for (const l of group) if (l.code === r.col2) { if (!out.has(l.line)) out.set(l.line, []); if (!out.get(l.line).includes(text)) out.get(l.line).push(text); }
    }
  }
  return out;
}
