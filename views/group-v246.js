// spec-v246 §2: renderers for the IBD / GI activity indices — SCCAI, PUCAI, the
// Boston Bowel Preparation Scale, and the simplified AIH criteria. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ibd-v246.js';
import { resultRow } from '../lib/result-copy.js';

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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}
const S03 = [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3']];

export const renderers = {
  'sccai'(root) {
    note(root, 'SCCAI (Walmsley 1998): 6 domains, 0-19. >= 5 active disease. Near-neighbors: mayo-uc, harvey-bradshaw.');
    root.appendChild(select('Bowel frequency, daytime', 'sc-day', [['0', '1-3/day (0)'], ['1', '4-6/day (1)'], ['2', '7-9/day (2)'], ['3', '> 9/day (3)']]));
    root.appendChild(select('Bowel frequency, night', 'sc-night', [['0', 'None (0)'], ['1', '1-3 (1)'], ['2', '4-6 (2)']]));
    root.appendChild(select('Urgency of defecation', 'sc-urg', [['0', 'None (0)'], ['1', 'Hurry (1)'], ['2', 'Immediately (2)'], ['3', 'Incontinence (3)']]));
    root.appendChild(select('Blood in stool', 'sc-blood', [['0', 'None (0)'], ['1', 'Trace (1)'], ['2', 'Occasionally frank (2)'], ['3', 'Usually frank (3)']]));
    root.appendChild(select('General wellbeing', 'sc-well', [['0', 'Very well (0)'], ['1', 'Slightly below par (1)'], ['2', 'Poor (2)'], ['3', 'Very poor (3)'], ['4', 'Terrible (4)']]));
    root.appendChild(select('Extracolonic manifestations', 'sc-extra', [['0', 'None (0)'], ['1', '1 (1)'], ['2', '2 (2)'], ['3', '3 (3)'], ['4', '4 (4)']]));
    const o = out(); root.appendChild(o);
    wire(['sc-day', 'sc-night', 'sc-urg', 'sc-blood', 'sc-well', 'sc-extra'], () => safe(o, () => {
      render(o, M.sccai({ freqDay: val('sc-day'), freqNight: val('sc-night'), urgency: val('sc-urg'), blood: val('sc-blood'), wellbeing: val('sc-well'), extracolonic: val('sc-extra') }), 'SCCAI');
    }));
    postureNote(root);
  },
  'pucai'(root) {
    note(root, 'PUCAI (Turner 2007): 6 items, 0-85. < 10 remission, 10-34 mild, 35-64 moderate, 65-85 severe. Near-neighbors: sccai, mayo-uc.');
    root.appendChild(select('Abdominal pain', 'pu-pain', [['0', 'None (0)'], ['5', 'Can be ignored (5)'], ['10', 'Cannot be ignored (10)']]));
    root.appendChild(select('Rectal bleeding', 'pu-bleed', [['0', 'None (0)'], ['10', 'Small, < 50% stools (10)'], ['20', 'Small, most stools (20)'], ['30', 'Large, > 50% (30)']]));
    root.appendChild(select('Stool consistency', 'pu-cons', [['0', 'Formed (0)'], ['5', 'Partially formed (5)'], ['10', 'Completely unformed (10)']]));
    root.appendChild(select('Number of stools / 24 h', 'pu-num', [['0', '0-2 (0)'], ['5', '3-5 (5)'], ['10', '6-8 (10)'], ['15', '> 8 (15)']]));
    root.appendChild(select('Nocturnal stools', 'pu-noct', [['0', 'No (0)'], ['10', 'Yes (10)']]));
    root.appendChild(select('Activity level', 'pu-act', [['0', 'No limitation (0)'], ['5', 'Occasionally limited (5)'], ['10', 'Severe restriction (10)']]));
    const o = out(); root.appendChild(o);
    wire(['pu-pain', 'pu-bleed', 'pu-cons', 'pu-num', 'pu-noct', 'pu-act'], () => safe(o, () => {
      render(o, M.pucai({ pain: val('pu-pain'), bleeding: val('pu-bleed'), consistency: val('pu-cons'), number: val('pu-num'), nocturnal: val('pu-noct'), activity: val('pu-act') }), 'PUCAI');
    }));
    postureNote(root);
  },
  'bbps-boston'(root) {
    note(root, 'Boston Bowel Prep Scale (Lai 2009): right, transverse, left colon each 0-3. Total 0-9; >= 6 (each segment >= 2) adequate. Near-neighbors: pucai.');
    root.appendChild(select('Right colon segment (0-3)', 'bb-right', S03));
    root.appendChild(select('Transverse colon segment (0-3)', 'bb-trans', S03));
    root.appendChild(select('Left colon segment (0-3)', 'bb-left', S03));
    const o = out(); root.appendChild(o);
    wire(['bb-right', 'bb-trans', 'bb-left'], () => safe(o, () => {
      render(o, M.bbpsBoston({ right: val('bb-right'), transverse: val('bb-trans'), left: val('bb-left') }), 'BBPS');
    }));
    postureNote(root);
  },
  'simplified-aih'(root) {
    note(root, 'Simplified AIH criteria (IAIHG 2008): autoantibodies + IgG + histology + viral-absent, 0-8. >= 6 probable, >= 7 definite. Near-neighbors: king-score.');
    root.appendChild(select('Autoantibodies (ANA/SMA/anti-LKM1/SLA)', 'aih-auto', [['0', 'Negative (0)'], ['1', 'Titer 1:40 (1)'], ['2', 'Titer >= 1:80 (2)']]));
    root.appendChild(select('IgG', 'aih-igg', [['0', 'Normal (0)'], ['1', '> upper limit of normal (1)'], ['2', '> 1.1x ULN (2)']]));
    root.appendChild(select('Liver histology', 'aih-hist', [['0', 'Atypical (0)'], ['1', 'Compatible with AIH (1)'], ['2', 'Typical of AIH (2)']]));
    root.appendChild(check('Absence of viral hepatitis (1)', 'aih-viral'));
    const o = out(); root.appendChild(o);
    wire(['aih-auto', 'aih-igg', 'aih-hist', 'aih-viral'], () => safe(o, () => {
      render(o, M.simplifiedAih({ autoantibody: val('aih-auto'), igg: val('aih-igg'), histology: val('aih-hist'), viralAbsent: chk('aih-viral') }), 'AIH');
    }));
    postureNote(root);
  },
};
