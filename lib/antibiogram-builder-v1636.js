// spec-v1636 tool 18: a cumulative antibiogram from the reader's own isolate list.
//
// Source: AHRQ, Nursing Home Antimicrobial Stewardship Guide, Comprehensive Antibiogram Toolkit,
// "Antibiogram Specifications" (AHRQ Pub. No. 14-0022-4-EF, May 2014), re-read October 12, 2026.
// It states these rules and attributes them to the CLSI guideline (it cites the third edition):
//   "Include only final, verified test results."
//   "Include only species with testing data for 30 or more isolates. If less than 30 isolates,
//     include a note that 'results must be interpreted with caution.'" AHRQ's own addition for
//     nursing homes: "We recommend reporting species with 10-30 specimens but clearly marking these
//     species with a disclaimer."
//   "Include only diagnostic isolates (not surveillance)."
//   "Eliminate duplicates by including only the first isolate of a species per patient,
//     irrespective of body site or antimicrobial profile."
//   "Report percentage sensitive (%S) and do not include percentage with intermediate
//     susceptibility (%I)."
// No CLSI text ships. Whether a later CLSI edition changes a rule could not be checked in an open
// source.
// The same document's organism rules, re-read October 14, 2026:
//   "S.aureus specimens should be reported as two populations: (1) all S. aureus isolates and (2)
//     just MRSA isolates." The document does not define MRSA; an isolate counts here when its organism
//     is written as MRSA (or methicillin-resistant S. aureus), or its oxacillin, cefoxitin or methicillin
//     result is R. MRSA written as the organism is the same species as S. aureus for duplicates.
//   "Streptococcus pneumoniae and cefotaxime/ceftriaxone/penicillin: List percent S using both
//     meningitis and nonmeningitis breakpoints; for penicillin, also indicate percent S using oral
//     breakpoint." The breakpoint is the laboratory's interpretation, so each breakpoint is its own
//     agent column; the result says so when S. pneumoniae is listed. (AHRQ does not recommend these
//     rows for a standard nursing-home antibiogram.)
//   "Viridans group streptococci and penicillin: List both percent I and percent S."
//
// The interval is the Wilson score interval, from the same function proportion-ci uses.
//
// Pure: no DOM, no clock, no network.

import { rowsOf } from './csv-rows.js';
import { proportionCi } from './specialtymath-v186.js';
import { csvValue } from './upload-intake.js';

const MAX_ROWS = 20000;
const clean = (v) => String(v === undefined || v === null ? '' : v).trim();
const key = (v) => clean(v).toLowerCase().replace(/\s+/g, ' ');
function dayOf(raw) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?$/.exec(clean(raw));
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}
const COLUMN = [
  ['patient', /^(patient|patient reference|patient id|mrn|resident)$/],
  ['organism', /^(organism|species|isolate)$/],
  ['date', /^(date|collection date|collected|specimen date)$/],
  ['status', /^(status|result status|final)$/],
  ['purpose', /^(purpose|type|isolate type|surveillance)$/],
  ['specimen', /^(specimen|specimen type|source|site|body site)$/],
];
const FINAL = /^(final|verified|final verified|f|yes|y|true)$/;
const SURVEILLANCE = /^(surveillance|screen|screening|yes|y|true)$/;
const MRSA_NAME = /^(mrsa|methicillin[- ]resistant (staphylococcus|s\.?) aureus)$/;
const SA_NAME = /^(staphylococcus aureus|s\.? ?aureus|staph aureus)$/;
const MRSA_AGENT = /^(oxacillin|cefoxitin|methicillin)\b/i;

export function antibiogramBuilder(input) {
  const o = input && typeof input === 'object' ? input : {};
  const rows = rowsOf(String(o.isolates === undefined || o.isolates === null ? '' : o.isolates)).filter((r) => r.some((c) => clean(c) !== ''));
  if (rows.length < 2) {
    return { valid: false, message: 'Enter the isolate list with a header row: patient, organism, date, then one column per agent holding S, I or R. A status column (final) and a purpose column (surveillance) are read if present.' };
  }
  if (rows.length > MAX_ROWS) return { valid: false, message: `Enter no more than ${MAX_ROWS.toLocaleString('en-US')} rows.` };
  const head = rows[0].map(key);
  const at = {};
  const agents = [];
  head.forEach((h, i) => {
    const hit = COLUMN.find(([name, re]) => re.test(h) && at[name] === undefined);
    if (hit) at[hit[0]] = i;
    else if (h) agents.push({ index: i, name: clean(rows[0][i]) });
  });
  for (const need of ['patient', 'organism', 'date']) {
    if (at[need] === undefined) return { valid: false, message: `Enter a header row that names the ${need} column. The first row read was: ${rows[0].map(clean).join(', ').slice(0, 120)}.` };
  }
  if (!agents.length) return { valid: false, message: 'Enter at least one agent column holding S, I or R.' };
  const from = clean(o.from) === '' ? null : dayOf(o.from);
  const to = clean(o.to) === '' ? null : dayOf(o.to);
  if (clean(o.from) !== '' && !from) return { valid: false, message: 'Enter the first day of the period as YYYY-MM-DD, or leave it blank.' };
  if (clean(o.to) !== '' && !to) return { valid: false, message: 'Enter the last day of the period as YYYY-MM-DD, or leave it blank.' };
  if (from && to && to < from) return { valid: false, message: 'Enter a period whose last day is not before its first.' };

  const dropped = { undated: 0, outsidePeriod: 0, notFinal: 0, surveillance: 0, duplicate: 0, incomplete: 0 };
  let unreadable = 0;
  const kept = [];
  rows.slice(1).forEach((cells, i) => {
    const patient = key(cells[at.patient]); let organism = key(cells[at.organism]);
    const mrsaByName = MRSA_NAME.test(organism);
    if (mrsaByName) organism = 'staphylococcus aureus';
    if (!patient || !organism) { dropped.incomplete += 1; return; }
    const day = dayOf(cells[at.date]);
    if (!day) { dropped.undated += 1; return; }
    if ((from && day < from) || (to && day > to)) { dropped.outsidePeriod += 1; return; }
    if (at.status !== undefined && !FINAL.test(key(cells[at.status]))) { dropped.notFinal += 1; return; }
    if (at.purpose !== undefined && SURVEILLANCE.test(key(cells[at.purpose]))) { dropped.surveillance += 1; return; }
    kept.push({ patient, organism, organismName: mrsaByName ? 'Staphylococcus aureus' : clean(cells[at.organism]), mrsaByName, day, order: i, cells });
  });
  // The first isolate of a species per patient, whatever the body site or profile.
  kept.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.order - b.order));
  const first = new Map();
  for (const r of kept) {
    const k = `${r.patient}|${r.organism}`;
    if (first.has(k)) dropped.duplicate += 1; else first.set(k, r);
  }
  if (!first.size) {
    return { valid: false, message: `Enter at least one isolate that can be counted. Of ${rows.length - 1} rows: ${dropped.undated} without a readable date, ${dropped.outsidePeriod} outside the period, ${dropped.notFinal} not final, ${dropped.surveillance} surveillance, ${dropped.incomplete} without a patient or an organism.` };
  }
  const byOrganism = new Map();
  const tally = (g, r, count) => {
    g.isolates += 1;
    for (const a of agents) {
      const v = key(r.cells[a.index]).toUpperCase();
      if (v === '') continue;
      if (v !== 'S' && v !== 'I' && v !== 'R') { if (count) unreadable += 1; continue; }
      const c = g.cells.get(a.name) || { s: 0, i: 0, r: 0 };
      c[v.toLowerCase()] += 1;
      g.cells.set(a.name, c);
    }
  };
  const mrsaAgents = agents.filter((a) => MRSA_AGENT.test(a.name));
  let saSeen = false;
  for (const r of first.values()) {
    if (!byOrganism.has(r.organism)) byOrganism.set(r.organism, { name: r.organismName, isolates: 0, cells: new Map() });
    tally(byOrganism.get(r.organism), r, true);
    // The MRSA subset: S. aureus written as MRSA, or R to oxacillin, cefoxitin or methicillin.
    if (r.organism === 'staphylococcus aureus' || SA_NAME.test(r.organism)) {
      saSeen = true;
      if (r.mrsaByName || mrsaAgents.some((a) => key(r.cells[a.index]).toUpperCase() === 'R')) {
        if (!byOrganism.has('mrsa subset')) byOrganism.set('mrsa subset', { name: 'Staphylococcus aureus, MRSA subset', isolates: 0, cells: new Map(), subset: true });
        tally(byOrganism.get('mrsa subset'), r, false);
      }
    }
  }
  const table = [];
  const notes = [];
  const csv = [['organism', 'isolates', 'agent', 'tested', 'susceptible', 'percent susceptible', 'Wilson 95% low', 'Wilson 95% high', 'note'].map(csvValue).join(',')];
  const sorted = [...byOrganism.values()].filter((g) => !g.subset).sort((a, b) => b.isolates - a.isolates || a.name.localeCompare(b.name));
  const subset = byOrganism.get('mrsa subset');
  const organisms = [];
  for (const g of sorted) { organisms.push(g); if (subset && SA_NAME.test(key(g.name))) organisms.push(subset); }
  let caution = 0;
  for (const g of organisms) {
    const small = g.isolates < 30;
    if (small) caution += 1;
    const mark = g.isolates < 10 ? 'fewer than 10 isolates, below the 10 to 30 the AHRQ document suggests reporting with a disclaimer' : small ? 'fewer than 30 isolates: results must be interpreted with caution' : '';
    const parts = [];
    for (const a of agents) {
      const c = g.cells.get(a.name);
      if (!c) continue;
      const tested = c.s + c.i + c.r;
      const ci = proportionCi({ n: tested, events: c.s, level: 95 });
      const row = { organism: g.name, isolates: g.isolates, agent: a.name, tested, susceptible: c.s, percentSusceptible: ci.proportion, ciLow: ci.ciLow, ciHigh: ci.ciHigh, caution: small };
      // AHRQ: viridans group streptococci and penicillin, percent I as well as percent S.
      const showI = /viridans/.test(key(g.name)) && /^penicillin/i.test(a.name);
      if (showI) row.percentIntermediate = Math.round((c.i / tested) * 1000) / 10;
      table.push(row);
      parts.push(`${a.name} ${ci.proportion}% susceptible (${c.s} of ${tested}; 95% interval ${ci.ciLow} to ${ci.ciHigh})${showI ? `, ${row.percentIntermediate}% intermediate (${c.i} of ${tested})` : ''}`);
      csv.push([g.name, g.isolates, a.name, tested, c.s, ci.proportion, ci.ciLow, ci.ciHigh, mark].map(csvValue).join(','));
    }
    notes.push(`${g.name}, ${g.isolates} isolate${g.isolates === 1 ? '' : 's'}${mark ? ` (${mark})` : ''}: ${parts.length ? parts.join('; ') : 'no agent column held S, I or R'}.`);
  }
  notes.push(`First isolate of each species per patient kept; ${dropped.duplicate} later isolate${dropped.duplicate === 1 ? '' : 's'} removed as duplicates. Intermediate results count as tested and not as susceptible.`);
  const out = [];
  if (dropped.outsidePeriod) out.push(`${dropped.outsidePeriod} outside the period`);
  if (dropped.notFinal) out.push(`${dropped.notFinal} not final`);
  if (dropped.surveillance) out.push(`${dropped.surveillance} surveillance`);
  if (dropped.undated) out.push(`${dropped.undated} without a date written as YYYY-MM-DD`);
  if (dropped.incomplete) out.push(`${dropped.incomplete} without a patient or an organism`);
  if (out.length) notes.push(`Rows left out: ${out.join(', ')}.`);
  if (unreadable) notes.push(`${unreadable} result cell${unreadable === 1 ? ' was' : 's were'} not S, I or R and ${unreadable === 1 ? 'was' : 'were'} not counted as tested.`);
  if (at.status === undefined) notes.push('The list has no status column, so the tool could not check that each result is final and verified; the specification includes only those.');
  if (at.purpose === undefined) notes.push('The list has no purpose column, so the tool could not remove surveillance isolates; the specification includes only diagnostic ones.');
  notes.push(from || to ? `Period: ${from || 'the first row'} to ${to || 'the last row'}.` : 'No period was entered, so every dated row is used. The specification calls for an antibiogram at least annually.');
  if (saSeen) {
    if (subset) notes.push(`The MRSA subset is reported after all Staphylococcus aureus, as the specification asks: ${subset.isolates} isolate${subset.isolates === 1 ? '' : 's'} written as MRSA or resistant to ${mrsaAgents.length ? mrsaAgents.map((a) => a.name).join(' or ') : 'none of oxacillin, cefoxitin or methicillin (no such column)'}.`);
    else if (mrsaAgents.length) notes.push(`No Staphylococcus aureus isolate was written as MRSA or resistant to ${mrsaAgents.map((a) => a.name).join(' or ')}, so the MRSA subset is empty.`);
    else notes.push('Staphylococcus aureus is listed, but no isolate is written as MRSA and there is no oxacillin, cefoxitin or methicillin column, so the MRSA subset the specification asks for could not be made.');
  }
  if ([...byOrganism.keys()].some((k) => /pneumoniae/.test(k) && /strep|^s\.? ?pneumoniae/.test(k))) notes.push('Streptococcus pneumoniae: the specification lists cefotaxime, ceftriaxone and penicillin under both meningitis and nonmeningitis breakpoints, and penicillin also under the oral breakpoint. Give each breakpoint its own column, such as "penicillin (meningitis)"; for a nursing home AHRQ does not recommend these rows.');
  notes.push('The specification also says to include only agents routinely tested; the tool cannot tell which those are.');
  return {
    valid: true, flag: caution ? 'small-samples' : 'built',
    organisms: organisms.length, isolates: first.size, duplicatesRemoved: dropped.duplicate, dropped, table, csv: csv.join('\n'),
    band: `Antibiogram of ${first.size} first isolate${first.size === 1 ? '' : 's'} across ${organisms.length} organism${organisms.length === 1 ? '' : 's'}; ${dropped.duplicate} duplicate${dropped.duplicate === 1 ? '' : 's'} removed.`,
    bandLabel: caution ? `${caution} organism${caution === 1 ? '' : 's'} under 30 isolates` : 'Every organism has 30 or more isolates',
    abnormal: caution > 0,
    notes, note: 'The antibiogram is built from the list entered and the AHRQ specification; it is not a laboratory report.',
  };
}
