// spec-v1400: renderers for the six serology and TB tiles (Immunization & Infectious Disease,
// Group J): syphilis-serology-sequence, congenital-syphilis-scenario, hbv-serology,
// hcv-test-sequence, ca-adult-tb-risk, ltbi-regimen-dosing.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as SY from '../lib/syphilis-serology-sequence-v1400.js';
import * as CS from '../lib/congenital-syphilis-scenario-v1400.js';
import * as HB from '../lib/hbv-serology-v1400.js';
import * as HC from '../lib/hcv-test-sequence-v1400.js';
import * as TB from '../lib/ca-adult-tb-risk-v1400.js';
import * as LT from '../lib/ltbi-regimen-dosing-v1400.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, hint, step = '1') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step, inputmode: 'decimal' }));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
  root.appendChild(wrap);
}
function dateField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'date' }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'syphilis-serology-sequence'(root) {
    note(root, 'Pick the sequence the laboratory ran, then each result. In the reverse sequence a reactive immunoassay with a nonreactive RPR is not a false positive until a second treponemal test says so.');
    selectField(root, 'Testing sequence', 'syq-algorithm', SY.ALGORITHMS, '-- choose --');
    selectField(root, 'Treponemal test (EIA/CIA, or TP-PA in the traditional sequence)', 'syq-treponemal', SY.REACTIVITY_OR_NOT_DONE, '-- not entered --');
    selectField(root, 'Nontreponemal test (RPR or VDRL)', 'syq-nontreponemal', SY.REACTIVITY_OR_NOT_DONE, '-- not entered --');
    selectField(root, 'Second, different treponemal test (TP-PA), reverse sequence only', 'syq-second', SY.REACTIVITY_OR_NOT_DONE, '-- not entered --');
    numField(root, 'Current nontreponemal titer, 1:', 'syq-titer', 'optional');
    numField(root, 'Prior nontreponemal titer, 1:', 'syq-prior', 'optional');
    selectField(root, 'Prior titer from the same test (RPR vs RPR, VDRL vs VDRL)', 'syq-same', HC.YES_NO, '-- not entered --');

    const ids = ['syq-algorithm', 'syq-treponemal', 'syq-nontreponemal', 'syq-second', 'syq-titer', 'syq-prior', 'syq-same'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = SY.syphilisSerologySequence({
        algorithm: val('syq-algorithm'), treponemal: val('syq-treponemal'), nontreponemal: val('syq-nontreponemal'),
        secondTreponemal: val('syq-second'), titer: val('syq-titer'), priorTiter: val('syq-prior'), priorSameTest: val('syq-same'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Reading', value: r.bandLabel },
      ]);
      note(o, r.nextStep);
      note(o, r.titerNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'congenital-syphilis-scenario'(root) {
    note(root, 'For a newborn whose mother has reactive syphilis serology. Enter both dates: the scenario turns on whether her treatment began 30 or more days before delivery.');
    selectField(root, 'Infant physical exam', 'cs-exam', CS.EXAM, '-- not entered --');
    selectField(root, 'Darkfield or PCR of placenta, cord, lesions, or fluids', 'cs-direct', CS.DIRECT, '-- not entered --');
    numField(root, 'Infant nontreponemal titer, 1: (0 if nonreactive)', 'cs-infant', 'same test as the mother');
    numField(root, 'Maternal nontreponemal titer at delivery, 1:', 'cs-maternal', '');
    selectField(root, 'Maternal treatment', 'cs-treatment', CS.MATERNAL_TREATMENT, '-- not entered --');
    dateField(root, 'Date maternal treatment began', 'cs-start');
    dateField(root, 'Delivery date', 'cs-delivery');
    selectField(root, 'Maternal evidence of reinfection or relapse', 'cs-reinfection', CS.YES_NO, '-- not entered --');
    selectField(root, 'Maternal titer low and stable (VDRL 1:2 or less, RPR 1:4 or less), if treated before pregnancy', 'cs-lowstable', CS.YES_NO, '-- not entered --');
    numField(root, 'Infant weight', 'cs-weight', 'kg, for the dose in units', '0.01');

    const ids = ['cs-exam', 'cs-direct', 'cs-infant', 'cs-maternal', 'cs-treatment', 'cs-start', 'cs-delivery', 'cs-reinfection', 'cs-lowstable', 'cs-weight'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = CS.congenitalSyphilisScenario({
        exam: val('cs-exam'), direct: val('cs-direct'), infantTiter: val('cs-infant'), maternalTiter: val('cs-maternal'),
        maternalTreatment: val('cs-treatment'), treatmentStart: val('cs-start'), delivery: val('cs-delivery'),
        reinfection: val('cs-reinfection'), maternalLowStable: val('cs-lowstable'), weightKg: val('cs-weight'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Scenario', value: r.scenario === null ? 'none defined' : String(r.scenario) },
      ]);
      note(o, r.dayNote);
      if (r.evaluation) note(o, 'Evaluation: ' + r.evaluation);
      list(o, r.regimens);
      note(o, r.alternative);
      note(o, r.weightNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'hbv-serology'(root) {
    note(root, 'Mark each marker positive, negative, or not done. A marker not done is not a negative, and the result names what it cannot tell apart without it.');
    selectField(root, 'HBsAg', 'hbv-hbsag', HB.MARKER, '-- not entered --');
    selectField(root, 'Total anti-HBc', 'hbv-antihbc', HB.MARKER, '-- not entered --');
    selectField(root, 'IgM anti-HBc', 'hbv-igm', HB.MARKER, '-- not entered --');
    selectField(root, 'Anti-HBs', 'hbv-antihbs', HB.MARKER, '-- not entered --');

    const ids = ['hbv-hbsag', 'hbv-antihbc', 'hbv-igm', 'hbv-antihbs'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = HB.hbvSerology({ hbsag: val('hbv-hbsag'), antiHbc: val('hbv-antihbc'), igmAntiHbc: val('hbv-igm'), antiHbs: val('hbv-antihbs') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Reading', value: r.bandLabel },
      ]);
      list(o, r.possibilities);
      if (r.cannotTell) note(o, 'Cannot tell apart without the missing marker: ' + r.cannotTell + '.');
      note(o, r.nextStep);
      note(o, r.screeningNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'hcv-test-sequence'(root) {
    note(root, 'A reactive antibody is not a diagnosis. Enter the RNA result, or mark it not done.');
    selectField(root, 'HCV antibody', 'hcv-antibody', HC.ANTIBODY, '-- not entered --');
    selectField(root, 'HCV RNA', 'hcv-rna', HC.RNA, '-- not entered --');
    selectField(root, 'Possible exposure in the past 6 months', 'hcv-recent', HC.YES_NO, '-- not entered --');

    const ids = ['hcv-antibody', 'hcv-rna', 'hcv-recent'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = HC.hcvTestSequence({ antibody: val('hcv-antibody'), rna: val('hcv-rna'), recentExposure: val('hcv-recent') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Reading', value: r.bandLabel },
      ]);
      note(o, r.nextStep);
      note(o, r.screeningNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'ca-adult-tb-risk'(root) {
    note(root, 'For adults without symptoms. Answer every box: an unanswered risk is not a "no".');
    selectField(root, 'Symptoms of TB disease (cough over 2 weeks, fever, night sweats, weight loss) or an abnormal chest x-ray', 'catb-symptoms', TB.YES_NO, '-- not entered --');
    selectField(root, TB.CA_TB_BOXES[0].label, 'catb-country', TB.YES_NO, '-- not entered --');
    selectField(root, TB.CA_TB_BOXES[1].label, 'catb-immuno', TB.YES_NO, '-- not entered --');
    selectField(root, TB.CA_TB_BOXES[2].label, 'catb-contact', TB.YES_NO, '-- not entered --');
    selectField(root, TB.CA_TB_BOXES[3].label, 'catb-congregate', TB.YES_NO, '-- not entered --');

    const ids = ['catb-symptoms', 'catb-country', 'catb-immuno', 'catb-contact', 'catb-congregate'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = TB.caAdultTbRisk({
        symptoms: val('catb-symptoms'), country: val('catb-country'), immunosuppression: val('catb-immuno'),
        contact: val('catb-contact'), congregate: val('catb-congregate'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Decision', value: r.bandLabel },
      ]);
      note(o, r.nextStep);
      note(o, r.steroidNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'ltbi-regimen-dosing'(root) {
    note(root, 'Pick a regimen and enter the weight and age. The short rifamycin regimens are preferred over isoniazid alone.');
    selectField(root, 'Regimen', 'ltbi-regimen', LT.REGIMENS, '-- choose --');
    numField(root, 'Weight', 'ltbi-weight', 'kg', '0.1');
    numField(root, 'Age', 'ltbi-age', 'years');
    selectField(root, 'Pregnant, or expecting pregnancy during treatment', 'ltbi-pregnant', LT.YES_NO, '-- not entered --');
    selectField(root, 'HIV status', 'ltbi-hiv', LT.HIV_STATUS, '-- not entered --');
    selectField(root, 'Isoniazid frequency (6H or 9H only)', 'ltbi-frequency', LT.H_FREQUENCY, '-- not entered --');

    const ids = ['ltbi-regimen', 'ltbi-weight', 'ltbi-age', 'ltbi-pregnant', 'ltbi-hiv', 'ltbi-frequency'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = LT.ltbiRegimenDosing({
        regimen: val('ltbi-regimen'), weightKg: val('ltbi-weight'), ageYears: val('ltbi-age'),
        pregnant: val('ltbi-pregnant'), hiv: val('ltbi-hiv'), frequency: val('ltbi-frequency'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Regimen', value: r.regimen },
      ]);
      list(o, r.doses);
      list(o, r.cautions);
      note(o, r.activeTbNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },
};
