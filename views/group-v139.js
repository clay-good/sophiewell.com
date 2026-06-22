// spec-v139 §2: renderers for the six gynecology decision rules (flamm-vbac,
// roma-ovarian, rmi-ovarian, iota-simple-rules, rotterdam-pcos, popq-staging).
// All six are Clinical Scoring & Risk (Group G). v139 is the second feature spec
// of Wave 7 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score,
// index, or verdict, not management; none authors a surgery / referral order in
// Sophie's voice (spec-v11 §5.3). The ROMA logistic and the RMI product surface a
// complete-the-fields fallback rather than a number from a bad input
// (lib/gyn-v139.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gyn-v139.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, index, or verdict is the cited instrument’s, computed from the values you entered. The management decision — counsel, refer, image, or treat — stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

export const renderers = {
  // ----- 2.1 flamm-vbac -------------------------------------------------
  'flamm-vbac'(root) {
    note(root, 'Flamm VBAC admission score (Flamm & Geiger 1997): the five admission factors known at the start of a trial of labor after cesarean. The 0-10 total maps to a predicted likelihood of a successful vaginal birth. Offered as the free substitute for the paywalled Grobman MFMU calculator.');
    root.appendChild(checkField('Maternal age under 40', 'fv-age'));
    root.appendChild(selectField('Prior vaginal birth', 'fv-vb', [
      { value: 'none', text: 'None' },
      { value: 'before', text: 'Before the first cesarean only' },
      { value: 'after', text: 'After the first cesarean only' },
      { value: 'beforeAfter', text: 'Both before and after the first cesarean' },
    ]));
    root.appendChild(checkField('Prior cesarean for a reason other than failure to progress', 'fv-reason'));
    root.appendChild(selectField('Cervical effacement at admission', 'fv-eff', [
      { value: 'lt25', text: 'Under 25%' },
      { value: 'mid', text: '25 to 75%' },
      { value: 'gt75', text: 'Over 75%' },
    ]));
    root.appendChild(checkField('Cervical dilation 4 cm or more at admission', 'fv-dil'));
    const o = out(); root.appendChild(o);
    wire(['fv-age', 'fv-vb', 'fv-reason', 'fv-eff', 'fv-dil'], () => safe(o, () => {
      const r = M.flammVbac({ ageUnder40: chk('fv-age'), vaginalBirth: selVal('fv-vb'), reasonNotFtp: chk('fv-reason'), effacement: selVal('fv-eff'), dilation4: chk('fv-dil') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Score', value: `${r.score}/10` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 roma-ovarian -----------------------------------------------
  'roma-ovarian'(root) {
    note(root, 'ROMA (Moore 2009): the probability of epithelial ovarian cancer from HE4, CA-125, and menopausal status. Enter HE4 in pmol/L and CA-125 in U/mL. The high-risk cut-point is assay-platform dependent — about 13.1% premenopausal and 27.7% postmenopausal per Moore 2009.');
    root.appendChild(field('HE4 (pmol/L)', 'ro-he4', { step: '0.1', min: 0, placeholder: 'e.g. 150' }));
    root.appendChild(field('CA-125 (U/mL)', 'ro-ca125', { step: '0.1', min: 0, placeholder: 'e.g. 100' }));
    root.appendChild(checkField('Postmenopausal', 'ro-post'));
    const o = out(); root.appendChild(o);
    wire(['ro-he4', 'ro-ca125', 'ro-post'], () => safe(o, () => {
      const r = M.romaOvarian({ he4: optNum('ro-he4'), ca125: optNum('ro-ca125'), postmenopausal: chk('ro-post') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ROMA', value: `${r.roma.toFixed(1)}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 rmi-ovarian ------------------------------------------------
  'rmi-ovarian'(root) {
    note(root, 'Risk of Malignancy Index (Jacobs 1990; Tingulstad for II/III): RMI = U × M × CA-125. Tick each ultrasound feature present; the U and M scaling depends on the variant. An RMI over 200 is the conventional high-risk threshold.');
    root.appendChild(selectField('RMI variant', 'rm-var', [
      { value: '1', text: 'RMI I (Jacobs 1990)' },
      { value: '2', text: 'RMI II (Tingulstad 1996)' },
      { value: '3', text: 'RMI III (Tingulstad 1999)' },
    ]));
    root.appendChild(checkField('Multilocular cyst', 'rm-mult'));
    root.appendChild(checkField('Solid areas', 'rm-solid'));
    root.appendChild(checkField('Bilateral lesions', 'rm-bilat'));
    root.appendChild(checkField('Ascites', 'rm-asc'));
    root.appendChild(checkField('Intra-abdominal metastases', 'rm-meta'));
    root.appendChild(checkField('Postmenopausal', 'rm-post'));
    root.appendChild(field('CA-125 (U/mL)', 'rm-ca125', { step: '0.1', min: 0, placeholder: 'e.g. 80' }));
    const o = out(); root.appendChild(o);
    wire(['rm-var', 'rm-mult', 'rm-solid', 'rm-bilat', 'rm-asc', 'rm-meta', 'rm-post', 'rm-ca125'], () => safe(o, () => {
      const r = M.rmiOvarian({ variant: selVal('rm-var'), multilocular: chk('rm-mult'), solidAreas: chk('rm-solid'), bilateral: chk('rm-bilat'), ascites: chk('rm-asc'), metastases: chk('rm-meta'), postmenopausal: chk('rm-post'), ca125: optNum('rm-ca125') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'RMI', value: `${r.rmi}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 iota-simple-rules ------------------------------------------
  'iota-simple-rules'(root) {
    note(root, 'IOTA Simple Rules (Timmerman 2008): tick the benign (B) and malignant (M) ultrasound descriptors present. Benign needs ≥1 B and no M; malignant needs ≥1 M and no B; both or neither is inconclusive. Offered as the free substitute for the IOTA ADNEX model.');
    note(root, 'Benign (B) features:');
    root.appendChild(checkField('B1 — unilocular cyst', 'is-b1'));
    root.appendChild(checkField('B2 — solid components, largest under 7 mm', 'is-b2'));
    root.appendChild(checkField('B3 — acoustic shadows', 'is-b3'));
    root.appendChild(checkField('B4 — smooth multilocular tumor under 100 mm', 'is-b4'));
    root.appendChild(checkField('B5 — no blood flow (color score 1)', 'is-b5'));
    note(root, 'Malignant (M) features:');
    root.appendChild(checkField('M1 — irregular solid tumor', 'is-m1'));
    root.appendChild(checkField('M2 — ascites', 'is-m2'));
    root.appendChild(checkField('M3 — at least 4 papillary structures', 'is-m3'));
    root.appendChild(checkField('M4 — irregular multilocular solid tumor 100 mm or more', 'is-m4'));
    root.appendChild(checkField('M5 — very strong blood flow (color score 4)', 'is-m5'));
    const o = out(); root.appendChild(o);
    wire(['is-b1', 'is-b2', 'is-b3', 'is-b4', 'is-b5', 'is-m1', 'is-m2', 'is-m3', 'is-m4', 'is-m5'], () => safe(o, () => {
      const r = M.iotaSimpleRules({ b1: chk('is-b1'), b2: chk('is-b2'), b3: chk('is-b3'), b4: chk('is-b4'), b5: chk('is-b5'), m1: chk('is-m1'), m2: chk('is-m2'), m3: chk('is-m3'), m4: chk('is-m4'), m5: chk('is-m5') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Verdict', value: r.verdict },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 rotterdam-pcos ---------------------------------------------
  'rotterdam-pcos'(root) {
    note(root, 'Rotterdam PCOS criteria (ESHRE/ASRM 2003): PCOS needs at least two of three features after the exclusion of mimics. Tick each feature present and confirm that mimics have been excluded.');
    root.appendChild(checkField('Oligo- or anovulation', 'rp-oligo'));
    root.appendChild(checkField('Clinical and/or biochemical hyperandrogenism', 'rp-hyper'));
    root.appendChild(checkField('Polycystic ovarian morphology on ultrasound', 'rp-pcom'));
    root.appendChild(checkField('Mimics excluded (thyroid, prolactin, CAH, androgen-secreting tumor)', 'rp-excl'));
    const o = out(); root.appendChild(o);
    wire(['rp-oligo', 'rp-hyper', 'rp-pcom', 'rp-excl'], () => safe(o, () => {
      const r = M.rotterdamPcos({ oligoAnovulation: chk('rp-oligo'), hyperandrogenism: chk('rp-hyper'), pcom: chk('rp-pcom'), mimicsExcluded: chk('rp-excl') });
      resultRow(o, [
        { text: r.band, cls: r.met ? 'warn' : null },
        { label: 'Features', value: `${r.count}/3` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 popq-staging -----------------------------------------------
  'popq-staging'(root) {
    note(root, 'POP-Q staging (Bump 1996): enter the prolapse points in centimeters relative to the hymen (negative above, positive below). The leading edge drives the stage 0–IV. Point D is optional (omit after hysterectomy).');
    root.appendChild(field('Aa (cm)', 'pq-aa', { step: '0.5', placeholder: 'e.g. -1' }));
    root.appendChild(field('Ba (cm)', 'pq-ba', { step: '0.5', placeholder: 'e.g. -1' }));
    root.appendChild(field('C — cervix or cuff (cm)', 'pq-c', { step: '0.5', placeholder: 'e.g. -5' }));
    root.appendChild(field('D — posterior fornix (cm, optional)', 'pq-d', { step: '0.5', placeholder: 'e.g. -6' }));
    root.appendChild(field('Ap (cm)', 'pq-ap', { step: '0.5', placeholder: 'e.g. -3' }));
    root.appendChild(field('Bp (cm)', 'pq-bp', { step: '0.5', placeholder: 'e.g. -3' }));
    root.appendChild(field('Total vaginal length, TVL (cm)', 'pq-tvl', { step: '0.5', min: 0, placeholder: 'e.g. 9' }));
    root.appendChild(field('Genital hiatus, GH (cm, optional)', 'pq-gh', { step: '0.5', min: 0, placeholder: 'e.g. 3' }));
    root.appendChild(field('Perineal body, PB (cm, optional)', 'pq-pb', { step: '0.5', min: 0, placeholder: 'e.g. 3' }));
    const o = out(); root.appendChild(o);
    wire(['pq-aa', 'pq-ba', 'pq-c', 'pq-d', 'pq-ap', 'pq-bp', 'pq-tvl', 'pq-gh', 'pq-pb'], () => safe(o, () => {
      const r = M.popqStaging({ aa: optNum('pq-aa'), ba: optNum('pq-ba'), c: optNum('pq-c'), d: optNum('pq-d'), ap: optNum('pq-ap'), bp: optNum('pq-bp'), tvl: optNum('pq-tvl'), gh: optNum('pq-gh'), pb: optNum('pq-pb') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
