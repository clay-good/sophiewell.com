// spec-v223 §2: renderers for the dermatology instruments — UAS7, HiSCR, Hurley
// staging, POEM, ALDEN, PEST, and the weighted Glasgow 7-point checklist. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the treatment / referral decision to
// the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dermatology-v223.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function grade04(label, id) { return select(label, id, [['0', 'No days (0)'], ['1', '1-2 days (1)'], ['2', '3-4 days (2)'], ['3', '5-6 days (3)'], ['4', 'Every day (4)']]); }
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The treatment and referral decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'uas7'(root) {
    note(root, 'UAS7 (Mlynek 2008): 7-day sum of daily wheal (0-3) and itch (0-3) scores (0-42). 0 free, 1-6 well-controlled, 7-15 mild, 16-27 moderate, 28-42 severe. Near-neighbors: scorad, easi.');
    root.appendChild(num('Sum of 7 daily wheal scores (0-21)', 'uas-wheal', { min: '0', max: '21' }));
    root.appendChild(num('Sum of 7 daily itch scores (0-21)', 'uas-itch', { min: '0', max: '21' }));
    const o = out(); root.appendChild(o);
    wire(['uas-wheal', 'uas-itch'], () => safe(o, () => {
      const r = M.uas7({ whealSum: val('uas-wheal'), itchSum: val('uas-itch') });
      render(o, r, 'UAS7', r.score !== undefined ? `${r.score}` : '');
    }));
    postureNote(root);
  },
  'hiscr'(root) {
    note(root, 'HiSCR (Kimball 2014): responder if >= 50% reduction in abscess + nodule count with no increase in abscesses or draining fistulas. Near-neighbors: hurley-stage, pasi.');
    root.appendChild(num('Baseline abscess count', 'hs-bab', { min: '0' }));
    root.appendChild(num('Baseline inflammatory nodule count', 'hs-bnod', { min: '0' }));
    root.appendChild(num('Baseline draining-fistula count', 'hs-bfist', { min: '0' }));
    root.appendChild(num('Current abscess count', 'hs-cab', { min: '0' }));
    root.appendChild(num('Current inflammatory nodule count', 'hs-cnod', { min: '0' }));
    root.appendChild(num('Current draining-fistula count', 'hs-cfist', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['hs-bab', 'hs-bnod', 'hs-bfist', 'hs-cab', 'hs-cnod', 'hs-cfist'], () => safe(o, () => {
      const r = M.hiscr({ baselineAbscess: val('hs-bab'), baselineNodule: val('hs-bnod'), baselineFistula: val('hs-bfist'), currentAbscess: val('hs-cab'), currentNodule: val('hs-cnod'), currentFistula: val('hs-cfist') });
      render(o, r, 'HiSCR', r.achieved ? 'achieved' : 'not achieved');
    }));
    postureNote(root);
  },
  'hurley-stage'(root) {
    note(root, 'Hurley staging (Hurley 1989): Stage I abscess(es) without tracts/scarring; II recurrent abscesses with sinus tracts and scarring; III diffuse or interconnected tracts. Near-neighbors: hiscr, pasi.');
    root.appendChild(check('Sinus tract(s) present', 'hur-tract'));
    root.appendChild(check('Scarring / cicatrization present', 'hur-scar'));
    root.appendChild(check('Diffuse involvement or multiple interconnected tracts and abscesses', 'hur-diffuse'));
    const o = out(); root.appendChild(o);
    wire(['hur-tract', 'hur-scar', 'hur-diffuse'], () => safe(o, () => {
      const r = M.hurleyStage({ sinusTract: chk('hur-tract'), scarring: chk('hur-scar'), diffuse: chk('hur-diffuse') });
      render(o, r, 'Stage', r.stage);
    }));
    postureNote(root);
  },
  'poem'(root) {
    note(root, 'POEM (Charman 2004): 7 symptom items each 0-4 by days affected in the past week (0-28). 0-2 clear, 3-7 mild, 8-16 moderate, 17-24 severe, 25-28 very severe. Near-neighbors: scorad, easi.');
    const items = [['poem-itch', 'itch', 'Itch'], ['poem-sleep', 'sleep', 'Sleep disturbance'], ['poem-bleed', 'bleeding', 'Bleeding'], ['poem-weep', 'weeping', 'Weeping / oozing'], ['poem-crack', 'cracking', 'Cracking'], ['poem-flake', 'flaking', 'Flaking'], ['poem-dry', 'dryness', 'Dryness / roughness']];
    for (const [id, , label] of items) root.appendChild(grade04(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.poem(inp), 'POEM', `${M.poem(inp).score}`);
    }));
    postureNote(root);
  },
  'alden'(root) {
    note(root, 'ALDEN (Sassolas 2010): per-drug causality for SJS/TEN. < 0 very unlikely, 0-1 unlikely, 2-3 possible, 4-5 probable, >= 6 very probable. Near-neighbors: scorten, regiscar-dress.');
    root.appendChild(select('Delay from drug intake to index day', 'ald-delay', [['3', 'Suggestive: 5-28 days (+3)'], ['2', 'Compatible: 29-56 days (+2)'], ['1', 'Likely: 1-4 days (+1)'], ['-1', 'Unlikely: > 56 days (-1)'], ['-3', 'Excluded: on/after index day (-3)']]));
    root.appendChild(select('Drug present in body on index day', 'ald-present', [['0', 'Definite (0)'], ['-1', 'Doubtful (-1)'], ['-3', 'Excluded (-3)']]));
    root.appendChild(select('Prechallenge / rechallenge', 'ald-chal', [['4', 'Positive, specific for disease and drug (+4)'], ['2', 'Positive for disease or drug (+2)'], ['1', 'Positive, unspecific (+1)'], ['0', 'Not done / unknown (0)'], ['-2', 'Negative (-2)']]));
    root.appendChild(select('Dechallenge', 'ald-dechal', [['0', 'Neutral / stopped / unknown (0)'], ['-2', 'Negative: drug continued without harm (-2)']]));
    root.appendChild(select('Drug notoriety', 'ald-not', [['3', 'Strongly associated (+3)'], ['2', 'Associated (+2)'], ['1', 'Suspected (+1)'], ['0', 'Unknown (0)'], ['-1', 'Not suspected (-1)']]));
    root.appendChild(check('Another drug or cause is more likely (-1)', 'ald-other'));
    const o = out(); root.appendChild(o);
    wire(['ald-delay', 'ald-present', 'ald-chal', 'ald-dechal', 'ald-not', 'ald-other'], () => safe(o, () => {
      const r = M.alden({ delay: val('ald-delay'), drugPresent: val('ald-present'), challenge: val('ald-chal'), dechallenge: val('ald-dechal'), notoriety: val('ald-not'), otherCause: chk('ald-other') });
      render(o, r, 'ALDEN', `${r.score}`);
    }));
    postureNote(root);
  },
  'pest'(root) {
    note(root, 'PEST (Ibrahim 2009): 5 yes/no items; >= 3 refers for possible psoriatic arthritis. Near-neighbors: dapsa, rapid3.');
    const items = [['pest-swollen', 'swollenJoint', 'Have you ever had a swollen joint (or joints)?'], ['pest-dx', 'arthritisDx', 'Has a doctor ever told you that you have arthritis?'], ['pest-nail', 'nailPits', 'Do your nails have holes or pits?'], ['pest-heel', 'heelPain', 'Have you had pain in your heel?'], ['pest-dact', 'dactylitis', 'Have you had a finger or toe completely swollen and painful (dactylitis)?']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.pest(inp), 'PEST', `${M.pest(inp).score}`);
    }));
    postureNote(root);
  },
  'glasgow-7-point-checklist'(root) {
    note(root, 'Weighted Glasgow 7-point checklist (MacKie 1990; NICE weighting): major features 2 points each, minor 1 point each. >= 3 prompts referral for a suspicious lesion. Near-neighbors: melanoma-t-stage, abcde.');
    root.appendChild(check('Change in size of lesion (major, +2)', 'g7-size'));
    root.appendChild(check('Irregular shape or border (major, +2)', 'g7-shape'));
    root.appendChild(check('Irregular colour / change in pigmentation (major, +2)', 'g7-color'));
    root.appendChild(check('Largest diameter >= 7 mm (minor, +1)', 'g7-diam'));
    root.appendChild(check('Inflammation (minor, +1)', 'g7-inflam'));
    root.appendChild(check('Oozing / crusting (minor, +1)', 'g7-ooze'));
    root.appendChild(check('Change in sensation, including itch (minor, +1)', 'g7-sens'));
    const o = out(); root.appendChild(o);
    wire(['g7-size', 'g7-shape', 'g7-color', 'g7-diam', 'g7-inflam', 'g7-ooze', 'g7-sens'], () => safe(o, () => {
      const r = M.glasgow7({ size: chk('g7-size'), shape: chk('g7-shape'), color: chk('g7-color'), diameter: chk('g7-diam'), inflammation: chk('g7-inflam'), oozing: chk('g7-ooze'), sensation: chk('g7-sens') });
      render(o, r, 'Glasgow', `${r.score}`);
    }));
    postureNote(root);
  },
};
