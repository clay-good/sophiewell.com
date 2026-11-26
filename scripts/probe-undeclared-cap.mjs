#!/usr/bin/env node
// spec-v1777: a cap the library enforces that nothing declares.
//
// [spec-v1646](../docs/spec-v1646.md) settled where a field's range lives: a field whose label states its
// range DECLARES it, the declaration rides on the adapter descriptor as `min`/`max`, and `mcp/fields.js`
// refuses a value past it before the library is called. 609 of the catalog's 5,189 number fields declare a
// range that way, and `scripts/probe-adapter-only-bounds.mjs` holds those 609 honest: it drives just past
// each declared edge and reports a declaration the library does not enforce.
//
// This finder is that probe's mirror image. It asks the question nobody had asked: how many fields have the
// opposite gap -- a cap the library DOES enforce, with nothing declaring it? Those caps are invisible. An
// agent reading `describe_calculator` is told the input is a number and nothing more, calls the tool with a
// weight of 160 kg, and is refused by a sentence it had no way to anticipate. The browser reader is told
// nothing either until the refusal appears.
//
// Only fields whose worked example is POSITIVE are driven. A decade walk away from a negative example runs
// the wrong way (-2 x 10 is smaller, not larger), and the quantities with negative examples are the signed
// ones -- Z scores, base excess, POP-Q points -- whose edges are not a cap in the sense asked about here.
//
// Method, per field: start from the tool's own worked example, walk the value outward by decades until a
// refusal whose message is a RANGE sentence appears, then bisect to the edge. A refusal for any other reason
// (a missing pair, a conflicting pick, a date order) is not a cap and is not counted. The refusal must also
// still hold ten times further out, so a band-specific complaint cannot pass for a ceiling.
//
// A found cap is not automatically declarable, and the sections exist because of three ways it is not:
//
//   * ENVELOPE -- the cap is not the tool's own: both edges are one of the 45 `lib/bounds.js` envelopes, to
//     the decimal. A descriptor can only hold a literal, so declaring one here would copy a number that
//     moves: specs v1762-v1765 widened four envelopes past values verified in survivors and then spent
//     three specs chasing the narrower copies left behind in libraries. Freezing 300 more copies into the
//     agent descriptors would rebuild that problem on the agent side. These wait for a declaration that can
//     name an envelope instead of restating it.
//   * UNIT-TOGGLED -- the tool carries a unit select that rescales this field. The library's cap is in one
//     unit; a static `min`/`max` on the descriptor would be applied to whatever unit the caller chose, and
//     would refuse 160 lb against a cap meant for kilograms. These need the declaration to move with the
//     toggle, which the descriptor cannot express today. Where such a field IS declared, the declaration is
//     the union of its units -- wasting-classify's MUAC reads 8 to 250, which is 8 cm through 250 mm -- so
//     the section is settled before the comparison below, which would call the union a contradiction.
//   * VARIES -- the cap moved when another input moved, so it is not a property of this field alone.
//   * DISAGREES -- a range IS declared and the library enforces a different one. That is a defect either
//     way round, and it is the only section here that is not merely an omission.
//
// What is left is DECLARABLE: a stable, unit-free cap the library already enforces, which the descriptor can
// state and `probe-adapter-only-bounds` can then police. Each row prints the edge found and the sentence the
// library refused with, which is where the number in the declaration comes from.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-undeclared-cap.mjs
//   node scripts/probe-undeclared-cap.mjs --limit 50
//   TOOLS=peds-dose,maggic node scripts/probe-undeclared-cap.mjs

import { META } from '../lib/meta.js';
import { computeCalculator, describeCalculator } from '../mcp/tools.js';
import { allCalculators } from '../mcp/catalog.js';
import { BOUNDS, CEILING_ONLY } from '../lib/bounds.js';
import { RANGE_SENTENCE } from './lib/range-sentence.mjs';

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;
const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;

// spec-v1794: the shapes a library uses to say "outside the range I accept" now live in one place,
// shared with probe-envelope-inside. The note there records what each shape is and why the last one needs
// a number after "between".
const RANGE = RANGE_SENTENCE;

// A select that rescales a numeric sibling. `unit` covers weightUnit/heightUnit/tempUnit; the rest are the
// spellings in use for the same thing.
const UNIT_SELECT = /unit|imperial|metric|\blbs?\b|\bkg\b|celsius|fahrenheit/i;

// Is this pair of edges one of the 45 shared envelopes, rather than a cap of the tool's own? Asked of the
// NUMBERS, not of the refusal sentence: libraries restate an envelope in their own words as often as they
// pass it through `inputFault()` ("The weight must be between 0.2 and 500 kg" is lib/bounds.js's weightKg
// to the decimal), and the sentence-matching first draft of this finder let three such copies through into
// a batch of declarations. A scale factor covers an envelope the field states in a sub-unit: height in cm
// against an envelope in m, a decimal fraction against a percent.
const SCALES = [1, 0.01, 0.1, 10, 100, 1000];
const near = (a, b) => Math.abs(a - b) <= Math.max(Math.abs(b) * 0.005, 1e-9);

// Four pairs of envelopes share their edges exactly, and two of those pairs are round numbers that any
// number of quantities stop at on their own: 0 to 100 (percentWeightLoss and spo2) and 0 to 2,000 (wbc and
// sixMinuteWalkM). A percentage capped at 100 is the field's OWN domain, not an envelope it happens to
// coincide with, and calling it one declares a reference that would follow the wrong number if either
// envelope ever moved. So an ambiguous match counts as an envelope only where the field names which
// quantity it is; otherwise it is the tool's own cap and gets a literal (spec-v1781).
const EDGE_SIG = new Map();
for (const [k, b] of Object.entries(BOUNDS)) {
  if (!Number.isFinite(b.min) || !Number.isFinite(b.max)) continue;
  const sig = `${b.min}|${b.max}`;
  if (!EDGE_SIG.has(sig)) EDGE_SIG.set(sig, []);
  EDGE_SIG.get(sig).push(k);
}
const KEY_WORDS = {
  wbc: /wbc|white (blood )?cell|leuko/i, sixMinuteWalkM: /walk|6mwd|six.?minute/i,
  eGFR: /egfr|gfr|filtration/i, esr: /esr|sedimentation/i,
  percentWeightLoss: /weight loss/i, spo2: /spo2|sao2|saturation/i,
  alt: /\balt\b|alanine/i, ast: /\bast\b|aspartate/i,
};
function identifies(key, text) {
  const sharers = EDGE_SIG.get(`${BOUNDS[key].min}|${BOUNDS[key].max}`) || [key];
  if (sharers.length < 2) return key;
  const named = sharers.filter((k) => KEY_WORDS[k] && KEY_WORDS[k].test(text));
  return named.length === 1 ? named[0] : null;
}

function sharedEnvelope(min, max, text = '') {
  for (const [key, b] of Object.entries(BOUNDS)) {
    if (!Number.isFinite(b.min) || !Number.isFinite(b.max)) continue;
    for (const s of SCALES) {
      if (min !== null && max !== null && near(min, b.min * s) && near(max, b.max * s)) {
        const id = identifies(key, text);
        if (id) return `${id}${s === 1 ? '' : ` x${s}`}`;
      }
      // spec-v1781: a CEILING ALONE is still the envelope when the envelope's floor is 0 or below. There is
      // nothing to probe under such a floor -- the decade walk downward is never refused -- so the ceiling
      // is the only edge this finder can find, and requiring both sides sent BOUNDS.wbc x1000 and
      // BOUNDS.ageYears into the declarable list as literals. Two tests caught it: CPIS's leukocyte count
      // and SMART-COP's age each assert the envelope's own sentence, which a literal pre-empts.
      if (max !== null && min === null && b.min * s <= 0 && near(max, b.max * s)) {
        const id = identifies(key, text);
        if (id) return `${id}${s === 1 ? '' : ` x${s}`}`;
      }
      // The mirror, for the envelopes whose ceiling is not enforced at all (spec-v1762).
      if (min !== null && max === null && CEILING_ONLY.has(key) && near(min, b.min * s)) {
        const id = identifies(key, text);
        if (id) return `${id}${s === 1 ? '' : ` x${s}`}`;
      }
    }
  }
  // spec-v1793: an envelope restated through a MOLAR CONVERSION, which no list of decade scales can cover.
  // `hscore-hlh` reads triglyceride in mmol/L and calls `boundsAdvisory('triglycerides', tg * 88.57)`, so
  // its enforced edges are BOUNDS.triglycerides / 88.57 -- 0.0113 and 395.168. Both are the envelope and
  // neither is a decade of it, so the finder called them the tool's own cap and offered them for a
  // declaration. Freezing those two numbers into a descriptor is exactly what the ENVELOPE section exists
  // to prevent: specs v1762-v1765 widened four envelopes and then spent three specs chasing the narrower
  // copies left behind in libraries.
  //
  // A single free factor is only admissible evidence when BOTH edges are known, because two points pin the
  // factor and one does not: any lone ceiling is some factor times any envelope's ceiling. Requiring both,
  // a non-zero floor, and agreement to half a percent, the match is the envelope's SHAPE -- the ratio of
  // its edges -- which a round number pair does not imitate by accident.
  if (min !== null && max !== null && min !== 0) {
    for (const [key, b] of Object.entries(BOUNDS)) {
      if (!Number.isFinite(b.min) || !Number.isFinite(b.max) || b.min === 0 || b.max === b.min) continue;
      const s = max / b.max;
      if (!(s > 0) || !near(min, b.min * s)) continue;
      const id = identifies(key, text);
      if (id) return `${id} x${Number(s.toPrecision(6))}`;
    }
  }
  return null;
}

const refusedByRange = (id, inputs) => {
  let res;
  try { res = computeCalculator({ id, inputs }); } catch { return false; }
  if (!res || res.valid !== false) return false;
  return RANGE.test(String(res.message || (res.result && res.result.band) || ''));
};

const messageAt = (id, inputs) => {
  try {
    const res = computeCalculator({ id, inputs });
    return String((res && res.message) || '').replace(/\s+/g, ' ').trim();
  } catch { return ''; }
};

// The outermost value this field still accepts, walking away from `from` in `dir`, or null when nothing out
// there is refused by a range sentence. `set` builds the inputs for a candidate value.
function edge(id, set, from, dir) {
  const ok = (v) => !refusedByRange(id, set(v));
  // Decade walk to bracket the edge. A floor search stops at a value small enough to be absurd for any
  // quantity in the catalog; a ceiling at one large enough to be past every one of them.
  let last = from;
  let found = null;
  for (let i = 0; i < 12; i += 1) {
    const v = dir > 0 ? last * 10 || 10 : last / 10;
    if (!Number.isFinite(v) || v === 0) break;
    if (dir > 0 ? v > 1e9 : v < 1e-6) break;
    if (ok(v)) { last = v; continue; }
    found = v;
    break;
  }
  if (found === null) return null;
  // The refusal has to hold further out as well, or it was a complaint about this value rather than a cap.
  const beyond = dir > 0 ? found * 10 : found / 10;
  if (Number.isFinite(beyond) && beyond !== 0 && !refusedByRange(id, set(beyond))) return null;
  let lo = last;
  let hi = found;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (mid === lo || mid === hi) break;
    if (ok(mid)) lo = mid; else hi = mid;
    if (Math.abs(hi - lo) <= Math.abs(lo) * 1e-9) break;
  }
  return { accepted: lo, refused: hi };
}

const round = (v) => {
  const p = Number(v.toPrecision(10));
  // The caps in lib/ are written as round numbers; report the edge at the precision that shows which.
  for (const d of [0, 1, 2, 3]) {
    const r = Number(p.toFixed(d));
    if (Math.abs(r - p) <= Math.abs(p) * 1e-6) return r;
  }
  return p;
};

const byId = new Map(allCalculators().map((t) => [t.id, t]));
const sections = { DECLARABLE: [], ENVELOPE: [], 'UNIT-TOGGLED': [], VARIES: [], DISAGREES: [] };
let tools = 0;
let fields = 0;
let capped = 0;

for (const [id, meta] of Object.entries(META)) {
  if (tools >= LIMIT) break;
  if (ONLY && !ONLY.has(id)) continue;
  const example = meta && meta.example && meta.example.fields;
  if (!example) continue;
  const tool = byId.get(id);
  if (!tool) continue;
  let props;
  try { props = describeCalculator({ id }).inputSchema.properties; } catch { continue; }
  if (!props) continue;
  const base = computeCalculator({ id, inputs: example });
  if (!base || base.valid !== true) continue;
  tools += 1;

  const descriptors = new Map((tool.fields || []).map((f) => [f.dom, f]));
  const unitSelect = (tool.fields || []).find((f) => f.kind === 'enum' && UNIT_SELECT.test(`${f.arg || ''} ${f.label || ''}`));

  for (const [dom, p] of Object.entries(props)) {
    if (p.type !== 'number' || Array.isArray(p.enum)) continue;
    if (!Object.prototype.hasOwnProperty.call(example, dom)) continue;
    const ex = Number(example[dom]);
    if (!Number.isFinite(ex) || ex <= 0) continue;
    const f = descriptors.get(dom) || {};
    if (Array.isArray(f.values)) continue; // a scored scale; its range is the option list
    fields += 1;
    const set = (v) => ({ ...example, [dom]: String(v) });
    const hi = edge(id, set, ex, 1);
    const lo = edge(id, set, ex, -1);
    if (!hi && !lo) continue;
    capped += 1;

    // Does the cap belong to this field alone? spec-v1793 rewrote this test, which was the finder's weakest
    // part and the reason a batch of its declarations had to be judged by hand. It used to shift ONE
    // sibling -- the first positive numeric input -- by 25%, flip each enum, and re-bisect; a cap that held
    // under that shift was called the field's own. Driving the surviving 63 rows against every single-factor
    // variation of the worked example instead showed 20 of them moving: `qbl-pph`'s dry tare is capped at
    // the weighed pad mass, `popq-staging`'s point Ba at the vaginal length, `hadlock-efw`'s biometry at the
    // abdominal circumference, and `mfp-refund-check`'s quantity at whichever drug is picked. Every one of
    // those would have been frozen into a descriptor as a number that is only true for one worked example.
    //
    // So the question is no longer "did the edge move?" but the one a declaration actually makes: IS
    // ANYTHING PAST THIS EDGE EVER ACCEPTED? It is asked of every single-factor variation that still
    // computes -- each numeric sibling at six multiples, each enum option, each flag -- and at three
    // distances past the edge, since a cap that merely shifts outward is still not this field's own.
    const variants = [];
    for (const q of tool.fields || []) {
      if (q.dom === dom) continue;
      if (q.kind === 'enum' && Array.isArray(q.values)) {
        // spec-v1793: EVERY option, not the first eight. `mfp-refund-check`'s quantity ceiling moves with
        // the drug picked, and the drug this finder needed was the ninth in the list, so the slice called a
        // cap the field's own that a tenth of the drug list does not keep.
        for (const v of q.values) {
          if (String(example[q.dom]) !== String(v)) variants.push([q.dom, { ...example, [q.dom]: String(v) }]);
        }
      } else if (q.kind === 'number') {
        const b = Number(example[q.dom]);
        if (!Number.isFinite(b) || b === 0) { variants.push([q.dom, { ...example, [q.dom]: '1' }]); continue; }
        // A counted quantity has to stay a whole number or the configuration is simply refused and proves
        // nothing. DHI's two answer counts share a budget of 25 and were read as two contradicted
        // declarations until the shift stayed integral.
        for (const k of [0.1, 0.33, 0.5, 0.75, 1.25, 2, 3, 5, 10]) {
          variants.push([q.dom, { ...example, [q.dom]: String(Number.isInteger(b) ? Math.max(1, Math.round(b * k)) : b * k) }]);
        }
        // A sibling whose own range is NARROW is unreachable by multiples: `corrected-potassium-ph` takes a
        // pH of 6.3 to 8, so every multiple of its 7.4 example lands outside and is refused, no variant
        // computes, and the finder concluded the potassium's floor was the potassium's own. It is not --
        // the floor is where the pH-corrected potassium leaves its output range, and it moves with the pH.
        // Where a sibling DECLARES a range, that declaration says where to look: sample inside it.
        const sp = props[q.dom] || {};
        const qlo = Number.isFinite(sp.minimum) ? sp.minimum : (Number.isFinite(sp.exclusiveMinimum) ? sp.exclusiveMinimum : null);
        const qhi = Number.isFinite(sp.maximum) ? sp.maximum : (Number.isFinite(sp.exclusiveMaximum) ? sp.exclusiveMaximum : null);
        if (qlo !== null && qhi !== null && qhi > qlo) {
          for (const frac of [0.02, 0.25, 0.5, 0.75, 0.98]) {
            const v = qlo + (qhi - qlo) * frac;
            variants.push([q.dom, { ...example, [q.dom]: String(Number.isInteger(b) ? Math.round(v) : Number(v.toPrecision(10))) }]);
          }
        }
      } else if (q.kind === 'bool' || q.kind === 'checkbox') {
        variants.push([q.dom, { ...example, [q.dom]: String(example[q.dom] === 'true' ? 'false' : 'true') }]);
      }
    }

    // spec-v1793: `exclusiveMaximum` is a declaration too. mcp/fields.js publishes an edge the library
    // itself refuses under the exclusive key, and reading only `maximum` called `fagan-post-test`'s pre-test
    // probability undeclared when it has declared 0 to 100 exclusive since spec-v1777 -- one of three
    // fields that use the key, so the blind spot was the whole of it.
    const declaredMax = Number.isFinite(p.maximum) ? p.maximum
      : (Number.isFinite(p.exclusiveMaximum) ? p.exclusiveMaximum : null);
    // A declared minimum of 0 on a positive quantity is a non-negativity rule, not a claim about where the
    // quantity starts. Reading it as a floor would call "declared 0, enforced 0.21" a contradiction, when
    // what it is is an undeclared floor.
    const declaredMinAny = Number.isFinite(p.minimum) ? p.minimum
      : (Number.isFinite(p.exclusiveMinimum) ? p.exclusiveMinimum : null);
    const declaredMin = declaredMinAny !== null && declaredMinAny !== 0 ? declaredMinAny : null;
    const foundMax = hi ? round(hi.accepted) : null;
    const foundMin = lo ? round(lo.accepted) : null;
    // Compare the rounded edges: the bisection stops a nanometre short of the cap, and 0.9999999993 against
    // a declared 1 is this method's own noise, not a disagreement.
    const off = (declared, found) => declared !== null && found !== null
      && Math.abs(declared - found) > Math.max(Math.abs(found) * 0.01, 1e-9);

    const detail = `${hi ? `max~${foundMax}` : ''}${hi && lo ? ' ' : ''}${lo ? `min~${foundMin}` : ''}`;
    const said = messageAt(id, set(hi ? hi.refused : lo.refused)).slice(0, 96);
    const row = `${id}\t${dom}\t${f.arg || ''}\t${detail}\tdeclared=[${declaredMin ?? (p.minimum === 0 ? 0 : '-')}, ${declaredMax ?? '-'}]\t${said}`;

    // spec-v1793: a DISAGREES row is the strongest claim this finder makes -- a defect either way round --
    // so it is also the one that has to survive the most. `corrected-potassium-ph` declares a pH of 6.3 to 8
    // and the bisection found its floor at 6.5, which looks like a declaration the library does not keep.
    // It is neither: 6.4 is accepted whenever the potassium is high enough to leave the corrected value
    // inside its output range, and the gap closes as the sibling moves. The edges past a cap are tested far
    // out, where a declared floor's own refusal arrives first and hides this, so the gap BETWEEN the
    // declaration and the found edge is sampled in its own right.
    const gapReachable = (declared, found, side) => {
      if (declared === null || found === null) return false;
      const [lowEnd, highEnd] = side === 'min' ? [declared, found] : [found, declared];
      if (!(highEnd > lowEnd)) return false;
      for (const frac of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        const v = lowEnd + (highEnd - lowEnd) * frac;
        for (const cfg of [example, ...variants.map(([, c]) => c)]) {
          if (computeCalculator({ id, inputs: cfg }).valid !== true) continue;
          const r = computeCalculator({ id, inputs: { ...cfg, [dom]: String(v) } });
          if (r && r.valid === true) return true;
        }
      }
      return false;
    };
    const contradicted = (off(declaredMax, foundMax) && !gapReachable(declaredMax, foundMax, 'max'))
      || (off(declaredMin, foundMin) && !gapReachable(declaredMin, foundMin, 'min'));
    // Already declared on every side that exists, and in agreement: nothing to report.
    if (!contradicted && (!hi || declaredMax !== null) && (!lo || declaredMin !== null)) continue;

    // A rescaled field is settled before anything else is asked of it, BUT ONLY IF IT IS ACTUALLY RESCALED.
    // spec-v1787: this used to ask whether the TOOL carried a unit-looking select, and was wrong three
    // ways at once -- `iv-iron-course`'s sex select is labelled "INFeD above 15 kg: sex" and matched on the
    // kilograms; `mayo-adpkd`'s imaging-morphology class matched on a word further along its label; and
    // `chatelut-carboplatin` has a real unit select, for the CREATININE, which rescales neither the weight
    // nor the age. All three had their caps held back from a declaration that was safe. The question is
    // answered below by flipping the select and re-bisecting: a cap that does not move is not rescaled.
    // Where a declaration IS on a rescaled field it is deliberately the UNION of its units --
    // wasting-classify reads MUAC as 8 to 250, which is 8 cm through 250 mm -- so it is never compared to a
    // cap measured in one unit.
    if (unitSelect && declaredMax === null && declaredMin === null && contradicted) {
      sections['UNIT-TOGGLED'].push(`${row}\t[rescaled by ${unitSelect.dom}]`);
      continue;
    }
    if (contradicted && unitSelect) {
      sections['UNIT-TOGGLED'].push(`${row}\t[declaration spans the units of ${unitSelect.dom}]`);
      continue;
    }

    let varies = false;
    let movedBy = null;
    for (const [src, cfg] of variants) {
      if (computeCalculator({ id, inputs: cfg }).valid !== true) {
        // The flip left the worked example itself uncomputable, so this configuration proves nothing --
        // and for a UNIT select that is the loudest evidence there is. `gmi`'s mean glucose example of
        // 180 mg/dL is absurd as mmol/L, so the configuration was skipped and the probe never learned
        // that the library's 40-600 guard is applied to a converted number. It declared 40 to 600 on a
        // field a reader can put 8.3 in, and probe-unit-equivalent caught it (spec-v1787).
        if (unitSelect && src === unitSelect.dom) { varies = true; movedBy = src; break; }
        continue;
      }
      for (const [side, e] of [['max', hi], ['min', lo]]) {
        if (!e) continue;
        for (const mult of side === 'max' ? [1.05, 1.5, 10] : [0.95, 0.5, 0.1]) {
          const past = side === 'max' ? e.accepted * mult + 1e-6 : e.accepted * mult - 1e-9;
          if (!Number.isFinite(past) || past === 0) continue;
          if (!refusedByRange(id, { ...cfg, [dom]: String(past) })) { varies = true; movedBy = src; break; }
        }
        if (varies) break;
      }
      if (varies) break;
    }
    // The acceptance sweep above asks whether anything PAST the edge is ever accepted, which is the question
    // a declaration answers -- but it is blind to a cap that moves INWARD, and that is what a unit select
    // does. `donor-recipient-size-match` reads a weight in kg or lb and converts before the weightKg
    // envelope, so its floor is 0.2 in kg and 0.44 in lb; nothing below either is accepted, the sweep was
    // satisfied, and the field was offered for a declaration. It was declared, and the sibling gate
    // answered at 525 lb against a published ceiling of 500 inside the hour. So where a unit select exists,
    // the edge is re-bisected under each of its options and a cap that MOVES AT ALL is held back.
    if (!varies && unitSelect && (hi || lo)) {
      for (const v of unitSelect.values || []) {
        if (String(example[unitSelect.dom]) === String(v)) continue;
        const cfg = { ...example, [unitSelect.dom]: String(v) };
        if (computeCalculator({ id, inputs: cfg }).valid !== true) { varies = true; movedBy = unitSelect.dom; break; }
        const setU = (x) => ({ ...cfg, [dom]: String(x) });
        const hiU = hi ? edge(id, setU, Number(cfg[dom]), 1) : null;
        const loU = lo ? edge(id, setU, Number(cfg[dom]), -1) : null;
        const movedU = (a, b) => (!a) !== (!b)
          || (a && b && Math.abs(a.accepted - b.accepted) > Math.max(Math.abs(a.accepted) * 0.01, 1e-9));
        if (movedU(hi, hiU) || movedU(lo, loU)) { varies = true; movedBy = unitSelect.dom; break; }
      }
    }
    if (varies) {
      const rescaled = movedBy && unitSelect && movedBy === unitSelect.dom;
      sections[rescaled ? 'UNIT-TOGGLED' : 'VARIES'].push(`${row}\t[moves with ${movedBy}]`);
      continue;
    }
    if (contradicted) { sections.DISAGREES.push(row); continue; }
    const shared = sharedEnvelope(foundMin, foundMax, `${f.arg || ''} ${f.label || ''} ${f.unit || ''}`);
    if (shared) { sections.ENVELOPE.push(`${row}\t[= BOUNDS.${shared}]`); continue; }
    sections.DECLARABLE.push(row);
  }
}

for (const [name, rows] of Object.entries(sections)) {
  if (!rows.length) continue;
  console.log(`\n== ${name} (${rows.length})`);
  for (const r of rows.sort()) console.log(r);
}

console.error(`\n${sections.DECLARABLE.length} field(s) enforce a stable, unit-free cap that nothing declares; `
  + `${sections.DISAGREES.length} declare one the library does not enforce.\n`
  + `Reach: ${tools} tool(s) with a computable worked example, ${fields} free numeric field(s) driven, `
  + `${capped} of them enforce a cap at all; ${sections.ENVELOPE.length} are refused by the shared envelope `
  + `rather than a cap of their own, ${sections['UNIT-TOGGLED'].length} cannot take a static `
  + `declaration (a unit select rescales them) and ${sections.VARIES.length} have a cap that moves with another input.`);
