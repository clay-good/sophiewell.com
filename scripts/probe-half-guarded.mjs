#!/usr/bin/env node
// spec-v1101: the tile that guards one input and not its sibling.
//
// Three times in one programme a calculator had already been fixed for a missing
// input and left silent on the identical gap beside it:
//
//   scorad     (spec-v1093) refused without the extent since spec-v1016, and read
//              a blank itch score as a symptom the patient denied.
//   dka-hhs    (spec-v1099) refused on one exit for want of a ketone measurement,
//              and asserted "with minimal ketosis" on the other.
//   abi        (spec-v1100) carried a caveat for a missing ANKLE pressure since
//              spec-v1067, and divided silently by one of two brachials.
//
// Each time the reasoning was already written out in the code, for the half that
// was guarded. Nobody walked the other half.
//
// That asymmetry is a SMELL, and it is cheap to detect: inside ONE tile, drop
// each field in turn. If dropping some fields makes the tile ask or disclose,
// the author knew this class of gap mattered here -- so the fields that stay
// silent while the verdict moves are the ones they did not get to.
//
// This is a PRIORITISER, not a new defect list. Every row it prints also appears
// in probe-omitted-field-decides.mjs; what it adds is the evidence that this
// particular tile already agrees the question is worth asking.
//
// REVIEWED 2026-11-15 (spec-v1730): spec-v1696 opened one of its 21 rows (TLS);
// the other 20 were read. One was a defect: mfp-refund-check read a blank
// "refund already received" as "no" and stated "No refund received" as a fact
// (fixed in spec-v1730). The rest need no change. HEAR refuses the very-low band
// and lists what is ungraded; NISS reports a partial total as a floor and says so;
// the case definitions (chikungunya, zika, yellow fever) and the antivenom tiles
// stay at the lower category or "not decided"; DALY says "No deaths were entered,
// so this is the disability side only"; HAT assumes follow-up is NOT assured (the
// safe direction) and says so; the syphilis sequence names the next test; SAAR,
// the dose and week fields are optional extras whose absence changes no verdict; the PJI, NP-tracker and levodopa fields are boxes and doses where
// absence is a real "no". A new row after this date is one nobody has read.
//
// REVIEWED 2026-11-24 (spec-v1788): four tiles had appeared since, and one was a defect.
// `herd-immunity-threshold` refuses a missing R0 and was silent on the vaccine efficacy beside it: with the
// efficacy blank it compared coverage with the THRESHOLD ITSELF, the arithmetic for a vaccine that protects
// every person it reaches, and said "coverage of 80% is at or above the 75% needed, by 5% of the
// population" -- where the same example with its 95% efficacy needs 78.9% and clears it by 1.1. The field's
// label said a blank is a perfect vaccine; the reading did not, and the reading is what a reader acts on.
// Fixed. The other three disclose, and well: `hf-ef-classification` says "With no baseline measurement this
// is HFmrEF. The same 45 percent in a patient whose baseline was at or below 40 percent ... would be
// HFimpEF - a different category and a different conversation"; `osha-lead-airborne-pel-shift` reports the
// day's limit and ASKS for the measured TWA rather than claiming compliance; `palm-coein` leaves the
// tertiary type out of the notation it prints, where its absence is visible. A new row after THIS date is
// one nobody has read.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-half-guarded.mjs
//   node scripts/probe-half-guarded.mjs --tile abi

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';
import { ASKING, DISCLOSING, saysGap } from '../test/lib/asking-language.js';

const only = (() => {
  const i = process.argv.indexOf('--tile');
  return i > -1 ? process.argv[i + 1] : null;
})();

// Same rule as the sibling probes: a disclosure has to be about THESE inputs,
// not the tile's static explanatory prose.
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

// spec-v1239: `band` is the SENTENCE, not the verdict, and including it made
// this probe compare prose.
//
// `nichd-fhr` reads "Category II" with the late decelerations entered and
// "Category II" without them -- the tracing has minimal variability, so neither
// Category I nor Category III is reachable and the decelerations cannot change
// it. What differs is the REASON list: "Not Category I because variability is
// minimal, not moderate; late decelerations are recurrent" loses its second
// clause. The verdict did not move; the explanation got shorter, and the probe
// called that a tile answering in silence from a field that decides the answer.
//
// So the classification fields come first, and `band` is the fallback only when
// a tile has none of them -- which many do, and dropping it outright would blind
// the probe on those (the reach line below counts them).
// spec-v1239: and the list of classification fields was short. Measured across
// the catalog, a tile's structured verdict also arrives as `tier` (87 tiles),
// `grade` (76), `stage` (60), `category` (50), `severity` (28), `group` (28),
// `risk` (27), `verdict` (18), `classification` (17), `gradeLabel` (16) and
// `bandKey`. `truelove-witts` returns `bandKey: 'severe'` unchanged whichever
// systemic criterion is dropped -- the grade is severe either way, because the
// others are met -- and was flagged for a criteria LIST that got shorter.
//
// `type` and `basis` are deliberately out: they name what KIND of calculation
// ran, not what it concluded.
const VERDICT_KEYS = ['bandLabel', 'bandKey', 'stage', 'severity', 'grade', 'gradeLabel',
  'risk', 'category', 'class', 'classification', 'tier', 'group', 'verdict'];
function verdictKey(r) {
  if (!r || typeof r !== 'object') return null;
  const parts = [];
  for (const k of VERDICT_KEYS) {
    if (typeof r[k] === 'string' && r[k]) parts.push(`${k}=${r[k]}`);
  }
  if (!parts.length && typeof r.band === 'string' && r.band) parts.push(`band=${r.band}`);
  return parts.length ? parts.join(' | ').replace(/[\d.]+/g, '') : null;
}

// spec-v1812: the rows that have been READ, with the reason each one is right.
//
// The two reviews above read every row and changed what needed changing; the rows that remained kept
// printing, so a new row arrived into a report of eleven known ones and nobody could tell it apart. The
// reasons move into a ledger keyed by the tile and the silent field, the probe prints only what is NOT
// in it, and `test/unit/finder-ledgers.test.js` fails on an unjudged row in one direction and on a
// judged row the probe no longer reaches in the other -- so a reason cannot outlive what it describes.
const JUDGED = {
  'niss:ni-a2': 'The band lists the AIS values it summed ("three worst AIS 6, 2"), so a reader can see one is '
    + 'absent; and the example carries an AIS 6, which forces 75 by convention whatever the other two are',
  'niss:ni-a3': 'The same: the band enumerates what it summed, and the AIS 6 forces the maximal score',
  'palm-coein:pc-leiomyomaType': 'spec-v1788: the tertiary type is left out of the notation the tool prints '
    + '(L1(SM) rather than L1(SM)-3), so its absence is on screen in the answer itself',
  'hf-ef-classification:hfef-baseline': 'spec-v1788: read and sound -- with no baseline it says HFmrEF, which '
    + 'is what the current measurement alone supports, and the tile asks for the baseline on the other path',
  'syphilis-serology-sequence:syq-nontreponemal': 'The reading NAMES the test that is missing as the next step '
    + '("The next test is a quantitative nontreponemal test (RPR or VDRL) on the same specimen"), which is the '
    + 'whole purpose of a sequence tool and a stronger disclosure than saying the field is blank',
  'mfp-refund-check:mr-recv': 'spec-v1730 fixed the assertion this row was raised for. The reading is now '
    + 'CONDITIONAL on the thing it does not know -- "The refund was due by September 29, 2026. If it has not '
    + 'arrived by ..., follow up with the manufacturer" -- so it states no fact about whether one arrived',
  'hat-treatment:hat-follow': 'It assumes follow-up is NOT assured, which is the safe direction, and says so in '
    + 'the band: "Gambiense HAT needing a lumbar puncture (follow-up not assured)"',
  'yellow-fever-case-def:yfd-igm': 'A case definition stays at the lower category when a tier is not met: '
    + '"Suspected yellow fever" is what fever with jaundice supports, and the probable and confirmed tiers it '
    + 'does not reach are the ones the IgM decides',
  'leprosy-reaction-prednisolone:lr-week': 'The week is an optional extra that selects which line of the track to '
    + 'highlight; with it blank the tool prints the WHOLE 20-week track week by week, so nothing is withheld',
  'osha-lead-airborne-pel-shift:olp-measured': 'spec-v1788: it reports the day\'s limit and ASKS for the '
    + 'measured TWA -- "Enter the measured TWA for the day to compare it with the limit and the 30 µg/m³ action '
    + 'level" -- and claims no compliance. The sentence is in the top-level `note`, which this probe skips '
    + 'because a note is usually standing prose; here it is the conditional ask, and the probe cannot tell',
  'levodopa-equivalent-dose:led-pramipexole-salt': 'The notes itemise every drug that WAS entered with its '
    + 'factor and the band says how many items the total is from ("from 2 items"), so a drug left out is absent '
    + 'from a list the reader is looking at rather than silently scored as zero',
  'levodopa-equivalent-dose:led-comt': 'The same itemised list and item count',
  'dropper-calibration:dc-dose': 'The dose is optional and feeds a second, separate line; without it the tool '
    + 'gives the drops-per-mL identity it was asked for and says nothing about a dose',
};
const ALL = process.argv.includes('--all');
const judgedSeen = new Set();

const rows = [];
for (const tool of allCalculators()) {
  if (only && tool.id !== only) continue;
  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const full = computeCalculator({ id: tool.id, inputs: { ...ex } });
  if (full?.valid !== true) continue;
  const fullVerdict = verdictKey(full.result);

  const guarded = [];
  const silent = [];

  for (const f of tool.fields || []) {
    // spec-v1102: numbers AND enums. Booleans are excluded on purpose -- rule 4
    // of the programme says an unticked checkbox is a real "no", so a missing
    // boolean is an answer rather than a gap. An enum is different: the browser
    // always sends one because a select always has a value, but an API caller
    // omits keys by default, which is the surface split spec-v1073 is about.
    if (f.kind !== 'number' && f.kind !== 'enum') continue;
    if (ex[f.dom] === undefined || String(ex[f.dom]).trim() === '') continue;

    const partial = { ...ex };
    delete partial[f.dom];
    const got = computeCalculator({ id: tool.id, inputs: partial });

    // A refusal is the strongest form of guarding.
    if (got?.valid !== true) { guarded.push({ dom: f.dom, how: 'refuses' }); continue; }

    // spec-v1812: EACH string, not the lot of them joined. Two phrases in the shared vocabulary are
    // ANCHORED to the start of the reading on purpose -- DISCLOSING's floor pattern
    // (`^[^.]{0,40}\bat least \d`), which spec-v1805 anchored so a criterion quoted mid-sentence could
    // not pass as a total stated as a floor. Joining a tile's strings puts whatever `Object.entries`
    // reaches first in front of the band, so the anchor could never match here, and `hear` -- the very
    // tile spec-v1805 measured that pattern on -- was still being reported as answering in silence while
    // it said "HEAR score at least 3". Testing the strings one at a time is what the anchor was written
    // for; a phrase matched anywhere still matches, because every string is still read.
    const said = texts(got.result);
    if (said.some((x) => ASKING.test(x))) { guarded.push({ dom: f.dom, how: 'asks' }); continue; }
    if (saysGap(said)) { guarded.push({ dom: f.dom, how: 'discloses' }); continue; }

    // Silent. Only interesting if the answer actually moved.
    const gotVerdict = verdictKey(got.result);
    if (fullVerdict && gotVerdict && gotVerdict !== fullVerdict) {
      silent.push({ dom: f.dom, label: String(f.label || '').slice(0, 44) });
    }
  }

  if (guarded.length && silent.length) {
    const unjudged = silent.filter((x) => {
      const key = `${tool.id}:${x.dom}`;
      if (!JUDGED[key]) return true;
      judgedSeen.add(key);
      if (ALL) console.log(`JUDGED\t${key}\t${JUDGED[key]}`);
      return false;
    });
    if (unjudged.length) rows.push({ id: tool.id, guarded, silent: unjudged });
  }
}

console.log('Tiles that guard at least one missing input and stay silent on another,');
console.log('where the silent one moves the answer. The tile already agrees the');
console.log('question matters; these are the fields it does not ask about.\n');
console.log(`${rows.length} calculator(s).\n`);
for (const r of rows) {
  console.log(`  ${r.id}`);
  console.log(`      guards : ${r.guarded.map((g) => `${g.dom} (${g.how})`).join(', ')}`);
  console.log(`      silent : ${r.silent.map((s) => `${s.dom}: ${s.label}`).join('; ')}`);
}
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
if (stale.length) {
  console.log(`\nSTALE-LEDGER: ${stale.length} judged row(s) this run no longer reaches: ${stale.join(', ')}.`);
  console.log('A reason cannot outlive what it describes -- re-read the tile and remove the row.');
}
