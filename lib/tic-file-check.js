// spec-v1604 tool 1: tic-file-check. Streams an insurer's Transparency in Coverage file (in-network
// rates, allowed amounts or table of contents; plain or gzipped JSON) and checks it against the CMS
// schema at the pinned version (lib/tic-schemas.js), then the references the schema cannot state:
// every provider group a rate names must be defined in the file, and every file a table of contents
// names must be among the files chosen with it. Memory follows one item, not the file.

import { JsonParser } from './json-stream.js';
import { walk, skip, check, checkObjectLevel, dependencyGaps, pathKey } from './schema-check.js';
import { TIC_SCHEMA, IN_NETWORK, ALLOWED_AMOUNTS, TABLE_OF_CONTENTS } from './tic-schemas.js';

const MAX_FINDINGS = 200;
const MAX_REFERENCES = 100000;

export const FILE_TYPES = {
  'in-network': { schema: IN_NETWORK, label: 'In-network rates file', items: 'in_network', itemWord: ['item', 'items'] },
  'allowed-amounts': { schema: ALLOWED_AMOUNTS, label: 'Allowed-amounts file', items: 'out_of_network', itemWord: ['item', 'items'] },
  'table-of-contents': { schema: TABLE_OF_CONTENTS, label: 'Table of contents', items: 'reporting_structure', itemWord: ['reporting structure', 'reporting structures'] },
};
// The keys that say which file this is.
const DECIDES = { in_network: 'in-network', provider_references: 'in-network', out_of_network: 'allowed-amounts', reporting_structure: 'table-of-contents' };
// Root keys every type shares, held until a deciding key names the schema.
const SHARED = ['reporting_entity_name', 'reporting_entity_type', 'plan_name', 'issuer_name', 'plan_sponsor_name', 'plan_id_type', 'plan_id', 'plan_market_type', 'last_updated_on', 'version'];

function collector() {
  const findings = []; let errorCount = 0;
  return {
    add(code, location, message) { errorCount += 1; if (findings.length < MAX_FINDINGS) findings.push({ code, location, message }); },
    get count() { return errorCount; },
    result(extra) { return { ...extra, valid: errorCount === 0, errorCount, findings, findingsTruncated: errorCount > findings.length }; },
  };
}

// A gzipped file (the way insurers post them) is read through DecompressionStream; progress counts
// the bytes of the file itself.
async function openJson(blob, onProgress) {
  const magic = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  const gzip = magic[0] === 0x1f && magic[1] === 0x8b;
  let bytes = 0;
  const counted = blob.stream().pipeThrough(new TransformStream({ transform(chunk, c) { bytes += chunk.byteLength; onProgress?.(bytes); c.enqueue(chunk); } }));
  return { parser: new JsonParser(gzip ? counted.pipeThrough(new DecompressionStream('gzip')) : counted), gzip, bytes: () => bytes };
}

// checkTicFile(blob, onProgress) -> one file's result.
export async function checkTicFile(blob, onProgress) {
  const out = collector(); const { parser, gzip, bytes } = await openJson(blob, onProgress);
  let type = null; const held = {}; const shallow = {}; let items = 0; const advisories = [];
  const defined = new Set(); const referenced = new Map(); const locations = [];
  const ctx = {
    add: out.add,
    onValue(path, v) {
      if (/^\$\.provider_references\[\d+\]\.provider_group_id$/.test(path)) defined.add(v);
      else if (/^\$\.in_network\[\d+\]\.negotiated_rates\[\d+\]\.provider_references$/.test(path) && Array.isArray(v)) {
        for (const id of v) if (typeof id === 'number' && !referenced.has(id) && referenced.size < MAX_REFERENCES) referenced.set(id, path);
      } else if (/^\$\.reporting_structure\[\d+\]$/.test(path) && v && typeof v === 'object') {
        // A reporting structure is read whole (the schema says each is unique), so its files are found here.
        (Array.isArray(v.in_network_files) ? v.in_network_files : []).forEach((f, i) => { if (f && typeof f.location === 'string') locations.push({ location: f.location, path: `${path}.in_network_files[${i}].location`, expects: 'in-network' }); });
        if (v.allowed_amount_file && typeof v.allowed_amount_file.location === 'string') locations.push({ location: v.allowed_amount_file.location, path: `${path}.allowed_amount_file.location`, expects: 'allowed-amounts' });
      }
    },
  };
  try {
    await parser.expect('{');
    const keys = new Set();
    if ((await parser.peek()).type !== '}') {
      while (true) {
        const keyToken = await parser.expect('value'); if (typeof keyToken.value !== 'string') throw new SyntaxError('JSON object keys must be strings.');
        const key = keyToken.value; if (keys.has(key)) throw new SyntaxError(`Duplicate JSON key ${key}.`); keys.add(key);
        await parser.expect(':');
        if (!type && DECIDES[key]) {
          type = DECIDES[key];
          for (const [k, v] of Object.entries(held)) check(v, FILE_TYPES[type].schema.properties[k], FILE_TYPES[type].schema, pathKey('$', k), out.add);
        }
        const props = type ? FILE_TYPES[type].schema.properties : null;
        if (props && Object.hasOwn(props, key)) {
          shallow[key] = await walk(parser, props[key], FILE_TYPES[type].schema, pathKey('$', key), ctx);
          if (key === FILE_TYPES[type].items && shallow[key] && typeof shallow[key].count === 'number') items = shallow[key].count;
        } else if (!type && SHARED.includes(key)) { held[key] = await parser.value(); shallow[key] = held[key]; } else { await skip(parser); shallow[key] = null; }
        const separator = await parser.next(); if (separator.type === '}') break; if (separator.type !== ',') throw new SyntaxError('Expected a comma or closing brace in the JSON root.');
      }
    } else await parser.next();
    if ((await parser.next()).type !== 'eof') throw new SyntaxError('Unexpected content follows the JSON root object.');
    if (!type) out.add('type', '$', 'is not a Transparency in Coverage file: it has none of in_network, out_of_network or reporting_structure.');
    else {
      checkObjectLevel(shallow, FILE_TYPES[type].schema, FILE_TYPES[type].schema, '$', out.add);
      // The allowed-amounts schema states this under dependentRequired, which its declared draft (07)
      // does not define, and CMS's single-plan sample omits issuer_name: a note, not a deficiency.
      const deps = FILE_TYPES[type].schema.dependentRequired;
      if (dependencyGaps(shallow, deps).length) {
        const fields = Object.keys(deps); const has = fields.filter((k) => Object.hasOwn(shallow, k));
        advisories.push(`It has ${has.join(', ')} but not ${fields.filter((k) => !has.includes(k)).join(', ')}. The allowed-amounts schema asks for these plan fields together under dependentRequired, a keyword its declared JSON Schema draft (07) does not enforce, so this is noted, not counted.`);
      }
      for (const [id, path] of referenced) if (!defined.has(id)) out.add('reference', path, `names provider group ${id}, which the file's provider_references does not define.`);
    }
  } catch (error) {
    out.add('invalid_json', '$', error instanceof Error ? error.message : String(error));
  }
  const text = (k) => (typeof held[k] === 'string' ? held[k] : typeof shallow[k] === 'string' ? shallow[k] : null);
  return out.result({
    name: blob.name || 'file', type, typeLabel: type ? FILE_TYPES[type].label : 'Not a Transparency in Coverage file',
    entity: text('reporting_entity_name'), declaredVersion: text('version'), lastUpdatedOn: text('last_updated_on'),
    items, itemLabel: type ? FILE_TYPES[type].itemWord[items === 1 ? 0 : 1] : 'items', gzip, bytesRead: bytes(), locations, advisories,
  });
}

// The file a URL names, for matching against chosen files: its last path segment, decoded, without
// a trailing .gz (a reader may have unzipped it).
export function nameOf(location) {
  let last;
  try { last = new URL(location).pathname.split('/').pop(); } catch { last = String(location).split(/[/?#]/).filter(Boolean).pop() || ''; }
  try { last = decodeURIComponent(last); } catch { /* keep it as written */ }
  return last.toLowerCase().replace(/\.gz$/, '');
}

function versionNote(r) {
  if (!r.declaredVersion || r.declaredVersion === TIC_SCHEMA.version) return null;
  const major = (v) => String(v).trim().replace(/^v/i, '').split('.')[0];
  return major(r.declaredVersion) === major(TIC_SCHEMA.version)
    ? `${r.name} declares schema version ${r.declaredVersion}; it was checked against ${TIC_SCHEMA.version}.`
    : `${r.name} declares schema version ${r.declaredVersion}; it was checked against ${TIC_SCHEMA.version}, the current version, so fields that changed between the two show as deficiencies.`;
}

const plural = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

// The 2026 Transparency in Coverage final rules (91 FR 63748, October 6, 2026; read October 9, 2026) amend 45 CFR
// 147.212(b) and its Labor and Treasury twins: from March 6, 2027 an in-network file is per provider network and
// carries the network's name and identifier and each coverage option's product type, unlikely provider-and-service
// rate rows are left out, an allowed-amounts file is per market over 6 months with an 11-claim threshold, and both
// are updated quarterly; the contextual files and website footer follow on September 6, 2027 (147.212(c)(1)(ii)).
// Schema v2.2.1 was written for the rule before it. The notes are by the file's own last_updated_on, never the
// clock, so the same file reads the same on any day.
export const RULE_2026 = { applies: '2027-03-06', contextual: '2027-09-06', fr: '91 FR 63748' };
const ruleNotes = (results) => {
  const after = results.filter((r) => /^\d{4}-\d{2}-\d{2}/.test(r.lastUpdatedOn || '') && r.lastUpdatedOn.slice(0, 10) >= RULE_2026.applies);
  const base = `This check uses schema v${TIC_SCHEMA.version}, written for the rule in force until March 6, 2027. From that date the amended rule (${RULE_2026.fr}) applies: in-network files per provider network with the network's name and identifier and each coverage option's product type, allowed-amounts files per market, and quarterly updates.`;
  if (!after.length) return [base];
  return [base, `${after.map((r) => r.name).join(', ')} ${after.length === 1 ? 'says it was' : 'say they were'} last updated on or after March 6, 2027, so the amended rule applies to ${after.length === 1 ? 'it' : 'them'}: a finding here may not be a deficiency under it, and what it newly requires is not checked.`];
};

// summarize(results) -> the whole answer from each file's result: the table-of-contents
// cross-check (run only when a table of contents is chosen with other files), the band and notes.
export function summarize(results) {
  const tocs = results.filter((r) => r.type === 'table-of-contents');
  const others = results.filter((r) => r.type && r.type !== 'table-of-contents');
  const cross = collector(); const notes = [];
  if (tocs.length && others.length) {
    const byName = new Map(others.map((r) => [r.name.toLowerCase().replace(/\.gz$/, ''), r]));
    const named = new Set();
    for (const toc of tocs) {
      for (const loc of toc.locations) {
        const want = nameOf(loc.location); named.add(want);
        const hit = byName.get(want);
        if (!hit) cross.add('missing_file', `${toc.name} ${loc.path}`, `names ${want || loc.location}, which is not among the files chosen.`);
        else if (hit.type !== loc.expects) cross.add('wrong_file_type', `${toc.name} ${loc.path}`, `names ${hit.name}, which is ${hit.typeLabel.toLowerCase()}, where ${FILE_TYPES[loc.expects].label.toLowerCase()} belongs.`);
      }
    }
    for (const r of others) if (!named.has(r.name.toLowerCase().replace(/\.gz$/, ''))) notes.push(`${r.name} is not named in the table of contents chosen with it.`);
  } else if (tocs.length) {
    const n = tocs.reduce((a, t) => a + t.locations.length, 0);
    if (n) notes.push(`The table of contents names ${plural(n, 'file', 'files')}. Choose them with it to check that each one is there and is the right type.`);
  }
  for (const r of results) { const v = versionNote(r); if (v) notes.push(v); for (const a of r.advisories || []) notes.push(`${r.name}: ${a}`); }
  if (results.some((r) => r.type)) notes.push(...ruleNotes(results));
  const crossResult = cross.result({ checked: Boolean(tocs.length && others.length) });
  const total = results.reduce((a, r) => a + r.errorCount, 0) + crossResult.errorCount;
  const failing = results.filter((r) => !r.valid).length;
  const schema = `the CMS Transparency in Coverage schema v${TIC_SCHEMA.version}`;
  const band = results.length === 1 && !results[0].type && results[0].findings[0]?.code === 'type'
    ? 'This is not a Transparency in Coverage file: it has none of in_network, out_of_network or reporting_structure.'
    : total === 0
    ? (results.length === 1 ? `No deficiencies against ${schema}.` : `All ${results.length.toLocaleString('en-US')} files conform to ${schema}.`)
    : results.length === 1 ? `${plural(total, 'deficiency', 'deficiencies')} against ${schema}.`
      : `${plural(total, 'deficiency', 'deficiencies')} against ${schema}${failing ? `, in ${plural(failing, 'file', 'files')} of ${results.length.toLocaleString('en-US')}` : ''}${crossResult.errorCount ? `${failing ? ' and' : ','} in the table of contents' references` : ''}.`;
  return { valid: total === 0, band, files: results, cross: crossResult, notes, schemaVersion: TIC_SCHEMA.version };
}

export async function checkTicFiles(blobs, onProgress) {
  const results = [];
  for (const [i, blob] of blobs.entries()) results.push(await checkTicFile(blob, (b) => onProgress?.(i, b)));
  return summarize(results);
}
