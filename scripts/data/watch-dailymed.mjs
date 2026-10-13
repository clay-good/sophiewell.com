#!/usr/bin/env node
// scripts/data/watch-dailymed.mjs -- spec-v1628 section 1, route D (the label-edition watcher).
//
// A route-D value is a number a person read from one section of one FDA label on DailyMed. Each such
// reading is a row in scripts/data/label-editions.json: the label's set id, the version and published
// date it was read at, and a SHA-256 of the normalized text of every section the tools read. Weekly,
// this asks DailyMed for each label's history:
//
//   same version            nothing to do; the reading is renewed (written about monthly).
//   newer, sections same    the text the tools read did not change. The row moves to the new version
//                           and published date, and its 12 months start again. No person.
//   newer, a section changed  the row is marked superseded and listed for the data-refresh pull
//                           request with the tools to re-read. It never edits a dose.
//   retired set id          a 404 or an empty history counts as a change.
//
// An edition is dated by (setId, spl_version) and the published_date of history.json, never by the
// effectiveTime inside the label's XML, which can be years older. It never fails the job.
//
// Usage: node scripts/data/watch-dailymed.mjs [--json] [--offline]
//        node scripts/data/watch-dailymed.mjs --write            (apply renewals and supersessions to the state file)
//        node scripts/data/watch-dailymed.mjs --record SETID|all (after re-reading the label: store its sections)

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from './http.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const STATE = join(ROOT, 'scripts', 'data', 'label-editions.json');
const API = 'https://dailymed.nlm.nih.gov/dailymed/services/v2/spls';
export const labelUrl = (setId) => `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}`;

// The sections a tool may read, by LOINC code.
export const SECTIONS = {
  '34068-7': 'Dosage and Administration',
  '34070-3': 'Contraindications',
  '34069-5': 'How Supplied/Storage and Handling',
  '43684-0': 'Use in Specific Populations',
  '34089-3': 'Description',
  '43678-2': 'Dosage Forms and Strengths',
  '34066-1': 'Boxed Warning',
  '34073-7': 'Drug Interactions',
  '34092-7': 'Clinical Studies',
  '34067-9': 'Indications and Usage',
  '34090-1': 'Clinical Pharmacology',
  '34071-1': 'Warnings',
  '43685-7': 'Warnings and Precautions',
};

const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

// isoDate('Aug 17, 2026') -> '2026-08-17', the form history.json prints; null when it is not that form.
export function isoDate(text) {
  const m = /^([A-Za-z]{3})[a-z]* (\d{1,2}), (\d{4})$/.exec(String(text || '').trim());
  if (!m || !MONTHS[m[1].toLowerCase()]) return null;
  return `${m[3]}-${MONTHS[m[1].toLowerCase()]}-${m[2].padStart(2, '0')}`;
}

// addMonths('2026-10-10', 12) -> '2027-10-10'.
export function addMonths(iso, months) {
  const [y, mo, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1 + months, d)).toISOString().slice(0, 10);
}

// extractSection(xml, loinc) -> the XML of every <section> whose own <code> is that LOINC code, subsections
// included and joined in document order, or null when there is none. An old-format label can carry the same
// section twice (acetylcysteine has one Dosage and Administration for each of its two uses), and a tool
// may read either. A section is found by its code and closed by counting nested <section> tags, so a
// later version that renumbers or reorders sections still yields the same text.
export function extractSection(xml, loinc) {
  const text = String(xml || '');
  const code = new RegExp(`<code\\b[^>]*\\bcode="${loinc.replace(/[^0-9-]/g, '')}"`, 'g');
  const parts = [];
  let end = 0;
  for (let c = code.exec(text); c; c = code.exec(text)) {
    if (c.index < end) continue; // inside a section already taken
    const open = text.lastIndexOf('<section', c.index);
    // The code must belong to that section, not follow a subsection opened in between.
    if (open < 0 || text.slice(open + 8, c.index).includes('<section')) continue;
    const tag = /<section\b|<\/section>/g;
    tag.lastIndex = open;
    let depth = 0;
    for (let m = tag.exec(text); m; m = tag.exec(text)) {
      depth += m[0] === '</section>' ? -1 : 1;
      if (depth === 0) { end = m.index + m[0].length; parts.push(text.slice(open, end)); break; }
    }
  }
  return parts.length ? parts.join('\n') : null;
}

// normalize(sectionXml) -> the section's text: no markup, entities decoded, whitespace collapsed. Ids and
// styling change between versions of a label whose words did not; the words are what a tool reads.
export function normalize(sectionXml) {
  return String(sectionXml || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// sectionHashes(xml, loincs) -> { loinc: sha256 | null } for each requested section.
export function sectionHashes(xml, loincs) {
  const out = {};
  for (const loinc of loincs) {
    const s = extractSection(xml, loinc);
    out[loinc] = s === null ? null : createHash('sha256').update(normalize(s)).digest('hex');
  }
  return out;
}

// latest(history) -> { version, published } of the newest entry of a history.json body, or null when the
// set id is retired (no history).
export function latest(history) {
  const rows = history && history.data && Array.isArray(history.data.history) ? history.data.history : [];
  const best = rows.filter((r) => Number.isInteger(r.spl_version)).sort((a, b) => b.spl_version - a.spl_version)[0];
  return best ? { version: best.spl_version, published: isoDate(best.published_date) } : null;
}

// decide(row, newest, hashes, today) -> { status, row } where status is
//   'same' | 'renewed' | 'superseded' | 'retired' | 'already superseded', and row is the state row to store.
// `newest` is latest(history) (null when retired); `hashes` is sectionHashes of the newest label, needed
// only when the version moved.
export function decide(row, newest, hashes, today) {
  if (row.supersededOn) return { status: 'already superseded', row };
  if (!newest) return { status: 'retired', row: { ...row, supersededOn: today, supersededBy: 'the set id is no longer on DailyMed' } };
  if (newest.version === row.splVersion) {
    // Renewed in the file about monthly, not weekly: a row with 11 months or more left is left alone, so
    // a week in which nothing changed opens no pull request.
    const renew = row.validThrough < addMonths(today, 11);
    return { status: 'same', row: renew ? { ...row, validThrough: addMonths(today, 12) } : row };
  }
  const changed = Object.keys(row.sections).filter((loinc) => !hashes || hashes[loinc] !== row.sections[loinc]);
  if (changed.length) {
    return { status: 'superseded', changed, row: { ...row, supersededOn: today, supersededBy: `version ${newest.version}${newest.published ? ` (${newest.published})` : ''}` } };
  }
  // The new version's watched sections were hashed above and match the reading, so the reading is
  // confirmed today -- and verifiedOn has to move with publishedOn, which is the new version's date and
  // can be later than the last reading (Macrobid version 27 was published after version 26 was read).
  return { status: 'renewed', row: { ...row, splVersion: newest.version, publishedOn: newest.published || row.publishedOn, verifiedOn: today, validThrough: addMonths(today, 12) } };
}

// expired(rows, today) -> the rows whose 12 months ran out: the watch stopped renewing them.
export const expired = (rows, today) => rows.filter((r) => !r.supersededOn && r.validThrough < today);

export function markdown(results, { unreachable = [], today }) {
  const lines = ['## FDA labels the tools read (DailyMed)', ''];
  const changed = results.filter((r) => r.status === 'superseded' || r.status === 'retired');
  const renewed = results.filter((r) => r.status === 'renewed');
  const same = results.filter((r) => r.status === 'same');
  if (!changed.length) lines.push(`No label section a tool reads changed (${same.length + renewed.length} of ${results.length + unreachable.length} labels compared).`);
  for (const r of changed) {
    const tools = r.row.tools.map((t) => `\`${t}\``).join(', ');
    lines.push(r.status === 'retired'
      ? `- ${r.row.label} (${labelUrl(r.row.setId)}) is no longer on DailyMed under this set id. Re-read the label for ${tools} and record the new set id.`
      : `- ${r.row.label}: ${r.changed.map((c) => SECTIONS[c] || c).join(' and ')} changed in ${r.row.supersededBy}. Re-read these rows in ${tools} (${labelUrl(r.row.setId)}), then record it (\`node scripts/data/watch-dailymed.mjs --record ${r.row.setId}\`).`);
  }
  if (renewed.length) lines.push('', `${renewed.length} label${renewed.length === 1 ? ' has' : 's have'} a new version whose watched sections did not change: ${renewed.map((r) => `${r.row.label} (now version ${r.row.splVersion})`).join('; ')}.`);
  const standing = results.filter((r) => r.status === 'already superseded');
  if (standing.length) lines.push('', `Still awaiting a re-read: ${standing.map((r) => `${r.row.label} (superseded ${r.row.supersededOn})`).join('; ')}.`);
  const late = expired(results.map((r) => r.row), today);
  if (late.length) lines.push('', `Past their 12 months without a renewal: ${late.map((r) => r.label).join('; ')}.`);
  if (unreachable.length) lines.push('', `DailyMed could not answer for ${unreachable.length} label${unreachable.length === 1 ? '' : 's'}: ${unreachable.join('; ')}.`);
  return lines.join('\n') + '\n';
}

const readState = () => JSON.parse(readFileSync(STATE, 'utf8'));
const writeState = (rows) => writeFileSync(STATE, JSON.stringify([...rows].sort((a, b) => a.label.localeCompare(b.label) || a.setId.localeCompare(b.setId)), null, 2) + '\n');

async function fetchHistory(setId) {
  try {
    const r = await get(`${API}/${setId}/history.json`, { retries: 2, timeoutMs: 60000 });
    return { ok: true, newest: latest(JSON.parse(r.bytes.toString('utf8'))) };
  } catch (err) {
    // A missing set id is an answer (retired); anything else is DailyMed not answering.
    return /returned 404/.test(err.message) ? { ok: true, newest: null } : { ok: false };
  }
}

async function fetchLabel(setId) {
  const r = await get(`${API}/${setId}.xml`, { retries: 2, timeoutMs: 120000 });
  return r.bytes.toString('utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const rows = readState();
  const today = new Date().toISOString().slice(0, 10);
  if (args.includes('--offline') || process.env.SOPHIEWELL_OFFLINE === '1') {
    process.stdout.write(`## FDA labels the tools read (DailyMed)\n\nOffline run: ${rows.length} labels were not compared.\n`);
    return;
  }
  if (args.includes('--record')) {
    const which = args[args.indexOf('--record') + 1];
    let done = 0;
    for (const [i, row] of rows.entries()) {
      if (which !== 'all' && row.setId !== which) continue;
      const h = await fetchHistory(row.setId);
      if (!h.ok || !h.newest) continue;
      const hashes = sectionHashes(await fetchLabel(row.setId), Object.keys(row.sections));
      if (Object.values(hashes).some((v) => v === null)) { process.stdout.write(`watch-dailymed: ${row.label} has no ${Object.keys(hashes).filter((k) => hashes[k] === null).join(', ')} section; not recorded.\n`); continue; }
      const { supersededOn: _on, supersededBy: _by, ...rest } = row;
      rows[i] = { ...rest, splVersion: h.newest.version, publishedOn: h.newest.published || row.publishedOn, verifiedOn: today, validThrough: addMonths(today, 12), sections: hashes };
      done += 1;
    }
    writeState(rows);
    process.stdout.write(`watch-dailymed: recorded ${done} label(s).\n`);
    return;
  }
  const results = []; const unreachable = [];
  for (const row of rows) {
    const h = await fetchHistory(row.setId);
    if (!h.ok) { unreachable.push(row.label); continue; }
    let hashes = null;
    if (h.newest && h.newest.version !== row.splVersion && !row.supersededOn) {
      try { hashes = sectionHashes(await fetchLabel(row.setId), Object.keys(row.sections)); } catch { unreachable.push(row.label); continue; }
    }
    results.push(decide(row, h.newest, hashes, today));
    await new Promise((r) => setTimeout(r, 250));
  }
  if (args.includes('--write')) {
    const byId = new Map(results.map((r) => [r.row.setId, r.row]));
    writeState(rows.map((r) => byId.get(r.setId) || r));
  }
  process.stdout.write(args.includes('--json') ? JSON.stringify({ results, unreachable }, null, 2) + '\n' : markdown(results, { unreachable, today }));
}

if (process.argv[1] && process.argv[1].endsWith('watch-dailymed.mjs')) {
  main().catch((err) => { process.stdout.write(`## FDA labels the tools read (DailyMed)\n\nThe label watcher did not run: ${err.message}\n`); });
}
