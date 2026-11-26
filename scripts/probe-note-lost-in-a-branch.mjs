#!/usr/bin/env node
// spec-v1814: the tile that owns the gap on one path and not on another.
//
// spec-v1813 found `lf-mda-regimen` saying "Severe illness: not entered. The severely ill are excluded."
// as the LAST statement before its final return, with four branches returning before it. At the worked
// example's own values the note was there; halve the height and the same person, with the same question
// unanswered, was told "Eligible for DA" with no word about it. The reading that most needed the sentence
// was the one that could not reach it.
//
// That is not a question about whether a tile SHOULD own a gap -- every other finder in this family asks
// that, and it needs a judgement each time. This one asks something the tile has already answered for
// itself:
//
//   with ONE field left blank, does the tile own the gap in some configurations and answer without
//   owning it in others?
//
// If it does, the tile's own code says the reader is owed a word about that field, and some path through
// it does not pay. There is no clinical judgement in the row: the two readings differ only in the OTHER
// fields' values, and the missing field is missing in both.
//
// The configurations are the same scalings `probe-omitted-field-decides.mjs` uses -- the example's other
// numbers at 1/10 to 10 times their value, which is what reaches a tile's other branches without
// inventing clinical cases -- plus each enum's own options one at a time, because a branch is as often
// chosen by a select as by a number.
//
// A REFUSAL is not a silence: a configuration that declines to answer owes nothing, and is skipped.
//
// AND NEITHER IS A VERDICT THAT CANNOT MOVE, which is the whole care in this finder. A monotone score
// states its total as a floor while the floor is below the cutoff -- "CPIS at least 6/12 on what was
// entered: the oxygenation is not stated, and each can only add points" -- and drops that sentence once
// the entered items alone reach the cutoff, because then the missing one cannot change the reading. That
// is correct, and it is the commonest shape in the catalog: without this clause the report is 278 rows and
// nearly all of them are a tile being right twice. So a silent configuration is a suspect only where some
// value of the missing field would still have moved the verdict there -- the test
// `probe-omitted-field-decides.mjs` applies to the worked example, asked of each configuration.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-note-lost-in-a-branch.mjs
//   node scripts/probe-note-lost-in-a-branch.mjs --tile lf-mda-regimen
//   node scripts/probe-note-lost-in-a-branch.mjs --all   (print the judged rows with their reasons)

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';
import { saysGap } from '../test/lib/asking-language.js';

const only = (() => {
  const i = process.argv.indexOf('--tile');
  return i > -1 ? process.argv[i + 1] : null;
})();
const ALL = process.argv.includes('--all');

// spec-v1814: the rows that have been read, with the reason each one is right.
//
// Three shapes recur, and the first is a LIMIT OF THE METHOD worth naming. `saysGap` matches a gap
// sentence anywhere in the reading, and a tile with several optional inputs owns ONE of them in a
// configuration while being silent about ANOTHER -- so the evidence that "this tile thinks the reader is
// owed a word about THIS field" is sometimes evidence about its neighbour. Those rows say so.
//
// The second is `verdictKey`'s fallback to the band, kept deliberately by spec-v1239 because many tiles
// carry no classification field: a tile that enumerates the criteria it met has a band that grows by one
// clause, which reads as a verdict moving when the verdict is the same word.
//
// The third is a real and correct silence: once a monotone reading is at the limit of its scale, or an
// organ failure is found, or a case definition sits at the tier its entered criteria support, the missing
// field cannot change the answer.
const JUDGED = {
  'metabolic-syndrome|ms-hdltx': 'The verdict is "Metabolic syndrome PRESENT" in both readings and the band '
    + 'ENUMERATES the criteria met; entering the treatment flag adds a clause to that list and changes no '
    + 'word of the conclusion. verdictKey falls back to the band here (spec-v1239), so a longer list of '
    + 'criteria reads to this probe as a verdict moving',
  'metabolic-syndrome|ms-bptx': 'The same: PRESENT either way, with the met criteria listed',
  'modified-marshall|mm-pao2': 'The band NAMES the systems it assessed -- "organ failure -- renal scored >= 2 '
    + '(the Revised Atlanta threshold; assessed: renal 2)" -- and an organ failure already found cannot be '
    + 'undone by a system nobody measured',
  'modified-marshall|mm-fio2': 'The same assessed-system list, and the same found organ failure',
  'niss|ni-a2': 'The band lists the AIS values it summed ("three worst AIS 6, 2"), so a reader can see one is '
    + 'absent; and an AIS 6 forces 75 by convention whatever the other two are',
  'cauchy-frostbite|cf-bone': 'Grade 4 is the worst grade, so the bone scan cannot raise it, and the band '
    + 'names what set the grade: "(set by topography)" without the scan, "(set by topography + bone scan)" '
    + 'with it',
  'gardner-robertson|gr-sds': 'spec-v1095 decided this deliberately and wrote the reason in the code: only '
    + 'the SERVICEABLE reading carries the missing-measure sentence, because a non-serviceable class already '
    + 'rests on a measure that was taken and the missing one can only confirm it. The class could be poorer '
    + 'still; the serviceable/non-serviceable call the instrument exists for cannot change',
  'aat-deficiency|aat-level': 'A limit of the method: the owning configuration is the tile ASKING for input '
    + '("Enter a serum level or a genotype"), not disclosing about this field. With a genotype and no level '
    + 'its bandLabel is "Nothing to interpret yet"',
  'pertussis-case-def|pcd-lab': 'The band names the absence in the definition\'s own words: "Probable '
    + 'pertussis: the clinical criteria are met, with neither laboratory confirmation nor an epidemiologic '
    + 'link" -- which is what probable MEANS in this definition',
  'newborn-hypoglycemia-who|nh-unit': 'A limit of the method: the owning configuration names the WEIGHT as '
    + 'not entered, not the unit. The band carries the unit it read the glucose in ("glucose 4.8 mmol/L '
    + '(2.6 or more)"), so a value entered in mg/dL is visibly not the one being judged',
  'hat-treatment|hat-lp': 'The silent reading is the one where the lumbar puncture DECIDES, and it says so '
    + 'and gives both arms: "a lumbar puncture decides. Pentamidine for first stage; NECT for second stage '
    + 'or without a reliable result"',
  'chikungunya-case-def|ck-lab': 'A case definition at the tier its entered criteria support, named by those '
    + 'criteria: "Suspected chikungunya: fever over 38.5 degrees C, acute joint pain, and residence in or a '
    + 'visit to an area with local transmission in the last 15 days"',
  'chikungunya-case-def|ck-chronic': 'The same suspected tier, named by the criteria that reach it',
  'leprosy-reaction-prednisolone|lr-track': 'The silent reading prints NO schedule -- "Below the table: at 15 '
    + 'kg the 30 mg start is over 1.0 mg/kg ... and prints no schedule at this weight" -- so which track '
    + 'would have been used is moot',
};
const judgedSeen = new Set();

const SCALES = [1, 0.5, 0.25, 0.1, 2, 4, 10];

// The same two helpers the sibling probes use: plausible values for a number, scaled from the example's
// own so each tile's range guards throw out the implausible ones, and the CONCLUSION rather than the
// arithmetic (spec-v1239: `band` is the sentence, and comparing sentences compares prose).
function candidates(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return [];
  const out = new Set([0]);
  for (const k of [0.1, 0.25, 0.5, 2, 4, 10]) out.add(Number((n * k).toPrecision(4)));
  return [...out];
}

const VERDICT_KEYS = ['bandLabel', 'bandKey', 'stage', 'severity', 'grade', 'gradeLabel',
  'risk', 'category', 'class', 'classification', 'tier', 'group', 'verdict', 'flag'];
function verdictKey(r) {
  if (!r || typeof r !== 'object') return null;
  const parts = [];
  for (const k of VERDICT_KEYS) if (typeof r[k] === 'string' && r[k]) parts.push(`${k}=${r[k]}`);
  if (!parts.length && typeof r.band === 'string' && r.band) parts.push(`band=${r.band}`);
  return parts.length ? parts.join(' | ').replace(/[\d.]+/g, '') : null;
}

// The same text rule as the sibling probes: the top-level `note` is a tile's standing prose about the
// instrument and is the same whatever was entered, so it cannot be a statement about this gap.
function texts(v, out = [], top = true) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out, false));
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (top && k === 'note') continue;
      texts(x, out, false);
    }
  }
  return out;
}

const rows = [];
for (const tool of allCalculators()) {
  if (only && tool.id !== only) continue;
  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const fields = (tool.fields || []).filter((f) => f.kind === 'number' || f.kind === 'enum');
  const numericDoms = fields.filter((f) => f.kind === 'number').map((f) => f.dom);
  const enums = fields.filter((f) => Array.isArray(f.values) && f.values.length > 1);

  for (const f of fields) {
    if (ex[f.dom] === undefined || String(ex[f.dom]).trim() === '') continue;

    // Every configuration of the OTHER fields, with this one blank throughout.
    const configs = [];
    for (const k of SCALES) {
      const c = { ...ex };
      delete c[f.dom];
      if (k !== 1) {
        for (const d of numericDoms) {
          if (d === f.dom) continue;
          const n = Number(ex[d]);
          if (Number.isFinite(n) && n !== 0) c[d] = Number((n * k).toPrecision(4));
        }
      }
      configs.push({ how: `others x${k}`, inputs: c });
    }
    for (const e of enums) {
      if (e.dom === f.dom) continue;
      for (const v of e.values.slice(0, 6)) {
        if (String(v) === String(ex[e.dom])) continue;
        const c = { ...ex, [e.dom]: v };
        delete c[f.dom];
        configs.push({ how: `${e.dom}=${v}`, inputs: c });
      }
    }

    const owned = [];
    const silent = [];
    const tries = f.kind === 'enum' && Array.isArray(f.values)
      ? f.values.slice(0, 8)
      : candidates(ex[f.dom]);
    for (const c of configs) {
      const got = computeCalculator({ id: tool.id, inputs: c.inputs });
      if (got?.valid !== true) continue;                      // refused: owes nothing
      const say = String(got.result?.bandLabel || got.result?.band || '').slice(0, 92);
      if (saysGap(texts(got.result))) { owned.push({ ...c, say }); continue; }
      // Silent. Only a suspect if the field could still have changed the verdict HERE.
      const here = verdictKey(got.result);
      const movedBy = tries.find((v) => {
        const alt = computeCalculator({ id: tool.id, inputs: { ...c.inputs, [f.dom]: v } });
        if (alt?.valid !== true) return false;
        const there = verdictKey(alt.result);
        return here && there && there !== here;
      });
      if (movedBy !== undefined) silent.push({ ...c, say, movedBy });
    }

    // The tile has to have owned it SOMEWHERE, or there is no evidence it thinks the reader is owed a word.
    if (!owned.length || !silent.length) continue;
    rows.push({ id: tool.id, dom: f.dom, label: String(f.label || '').slice(0, 44), owned, silent });
  }
}

const unjudged = rows.filter((r) => {
  const key = `${r.id}|${r.dom}`;
  if (!JUDGED[key]) return true;
  judgedSeen.add(key);
  if (ALL) console.log(`JUDGED\t${key}\t${JUDGED[key]}`);
  return false;
});
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
if (stale.length) {
  console.log(`STALE-LEDGER: ${stale.length} judged row(s) this run no longer reaches: ${stale.join(', ')}.`);
  console.log('A reason cannot outlive what it describes -- re-read the tile and remove the row.');
}

if (process.argv.includes('--json')) {
  // The exact inputs of one owned and one silent configuration per row, for reading the two readings
  // side by side. Reconstructing them by hand from the `how` column gets the configuration wrong.
  console.log(JSON.stringify(unjudged.map((r) => ({
    id: r.id, dom: r.dom, owned: r.owned[0], silent: r.silent[0],
  })), null, 0));
  process.exit(0);
}

console.log('One field left blank, and the tile owns the gap in some configurations of the');
console.log('others and answers without owning it in the rest. The tile\'s own code says the');
console.log('reader is owed a word about that field; some path through it does not pay.\n');
console.log(`${unjudged.length} field(s) across ${new Set(unjudged.map((r) => r.id)).size} calculator(s).\n`);
for (const r of unjudged) {
  console.log(`  ${r.id}|${r.dom}  (${r.label})`);
  console.log(`      owns it  (${r.owned.length}): ${r.owned[0].how} -> ${r.owned[0].say}`);
  console.log(`      silent   (${r.silent.length}): ${r.silent[0].how} -> ${r.silent[0].say}`);
  console.log(`         ... and there ${r.dom}=${r.silent[0].movedBy} would have changed it`);
}
