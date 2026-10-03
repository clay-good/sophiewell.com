// scripts/data/builders/uspstf.mjs -- spec-v1621 §3.6, for spec-v1601 preventive-owed.
//
// The USPSTF "A and B Recommendations" page: one HTML table, one row per recommendation, with its topic (and
// the population after the topic's last colon), its description, its grade and the release month of the
// current recommendation. The description is stored verbatim, as the USPSTF terms require. Each row's key is
// its page alias and the first 8 hex characters of its description's SHA-256, so two rows of one topic stay
// apart and a reworded row is a new key. Structured age, sex, pregnancy and risk come from the curated
// scripts/data/uspstf-populations.json; a row without one fails the run, so a new or reworded recommendation
// goes to review with its key named.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const LANDING = 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations';
const ORIGIN = 'https://www.uspreventiveservicestaskforce.org';
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => iso(new Date(Date.parse(`${s}T00:00:00Z`) + n * 86400000));

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': '\'', apos: '\'', nbsp: ' ', dagger: '†', ndash: '–', mdash: '—', ge: '≥', le: '≤', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
const text = (h) => h.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e] ?? m))
  .replace(/\s+/g, ' ').trim();
export const keyOf = (alias, description) => `${alias}#${createHash('sha256').update(description).digest('hex').slice(0, 8)}`;

export async function discover() {
  // The page is the source; its rows carry their own dates, so the edition is the run's (set in parse).
  return { url: LANDING, edition: 'pending', expiresOn: null };
}

export function parseTable(html) {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => c[1]));
  const head = rows.find((r) => r.length >= 4 && /topic/i.test(text(r[0])));
  if (!head || !/description/i.test(text(head[1])) || !/grade/i.test(text(head[2])) || !/release date/i.test(text(head[3]))) throw new Error('uspstf: the table header changed');
  const out = [];
  for (const r of rows.slice(rows.indexOf(head) + 1)) {
    if (r.length < 4) continue;
    const href = (/href=["']([^"']+)["']/i.exec(r[0]) || [])[1];
    if (!href) throw new Error(`uspstf: a row has no recommendation link: ${text(r[0]).slice(0, 60)}`);
    const alias = href.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
    const topic = text(r[0]);
    const description = text(r[1]);
    const grade = text(r[2]);
    const m = /^([A-Za-z]+)\s+(\d{4})\s*(\*)?$/.exec(text(r[3]));
    if (!m || !MONTHS.includes(m[1].toLowerCase())) throw new Error(`uspstf: release date "${text(r[3])}" for ${alias} does not parse`);
    out.push({
      key: keyOf(alias, description), alias, topic, population: topic.slice(topic.lastIndexOf(':') + 1).trim(), description, grade,
      released: `${m[2]}-${String(MONTHS.indexOf(m[1].toLowerCase()) + 1).padStart(2, '0')}`, priorGradeAOrB: Boolean(m[3]),
      url: new URL(href, ORIGIN).href,
    });
  }
  return out;
}

export async function parse(bytes, found = {}, { bounds = true, populations } = {}) {
  const rows = parseTable(Buffer.from(bytes).toString('utf8'));
  if (bounds && (rows.length < 40 || rows.length > 80)) throw new Error(`uspstf: ${rows.length} rows, outside 40-80`);
  const bad = rows.filter((r) => !['A', 'B'].includes(r.grade));
  if (bad.length) throw new Error(`uspstf: grade other than A or B: ${bad.map((r) => r.key).join(', ')}`);
  const pops = populations || JSON.parse(readFileSync(fileURLToPath(new URL('../uspstf-populations.json', import.meta.url)), 'utf8')).populations;
  const missing = rows.filter((r) => !pops[r.key]);
  if (missing.length) throw new Error(`uspstf: no curated population for ${missing.map((r) => `${r.key} (${r.population})`).join('; ')} -- add it to scripts/data/uspstf-populations.json`);
  const latest = rows.map((r) => r.released).sort().at(-1);
  const today = iso(new Date());
  found.edition = `A and B list read ${today} (latest release ${latest})`;
  found.effectiveFrom = today;
  found.nextExpected = addDays(today, 30);
  found.expiresOn = addDays(today, 60);
  return { records: rows.map((r) => ({ ...r, ...pops[r.key] })) };
}

export default {
  id: 'uspstf',
  label: 'USPSTF A and B recommendations',
  agency: 'USPSTF (AHRQ)',
  sourceUrl: LANDING,
  status: 'public-domain-with-attribution',
  cadence: 'monthly',
  notes: 'One record per row of the A and B list: topic, population, description verbatim, grade, release month and link, joined with the curated age, sex, pregnancy and risk of scripts/data/uspstf-populations.json. The USPSTF terms require verbatim reproduction with the source cited.',
  recordBounds: { min: 40, max: 80 },
  shardKey: () => 'recommendations',
  discover,
  parse,
  shape: (r) => (r.key && r.description && ['A', 'B'].includes(r.grade) && /^\d{4}-\d{2}$/.test(r.released) ? null : 'a row without key, description, A/B grade or release month'),
  stableCanaries: [
    { label: 'Colorectal cancer screening at 50 to 75 is grade A', value: (rs) => (rs.find((r) => r.alias === 'colorectal-cancer-screening' && r.ageMin === 50) || {}).grade, expect: 'A' },
  ],
  canaries: null,
};
