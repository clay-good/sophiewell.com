// spec-v1551: renderers for act-weight-band-dose (the WHO 2026 weight-band dose of an ACT for uncomplicated
// falciparum malaria), severe-malaria-injectable, rectal-artesunate-prereferral and malaria-pregnancy-treatment
// (Medication & Infusion, Group F; spec-v1540).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/act-weight-band-dose-v1551.js';
import * as SI from '../lib/severe-malaria-injectable-v1551.js';
import * as RA from '../lib/rectal-artesunate-prereferral-v1551.js';
import * as MP from '../lib/malaria-pregnancy-treatment-v1551.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options, { blank = true, selected } = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [...(blank ? [NA] : []), ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  if (selected) s.value = selected;
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min: '0', max, step, placeholder }));
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
  'act-weight-band-dose'(root) {
    const pairs = [['act-regimen', 'regimen'], ['act-weight', 'weight']];
    selectField(root, 'ACT (artemisinin-based combination)', 'act-regimen', M.REGIMEN_OPTIONS);
    numField(root, 'Weight in kg', 'act-weight', 'e.g. 18', '150', 'any');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = M.actWeightBandDose(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2026 band', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'severe-malaria-injectable'(root) {
    const pairs = [['smi-drug', 'drug'], ['smi-weight', 'weight']];
    selectField(root, 'Injectable antimalarial', 'smi-drug', SI.DRUGS);
    numField(root, 'Weight in kg', 'smi-weight', 'e.g. 18', '150', 'any');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = SI.severeMalariaInjectable(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Dose', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'rectal-artesunate-prereferral'(root) {
    const pairs = [['ras-age', 'age'], ['ras-weight', 'weight'], ['ras-danger', 'danger'], ['ras-referral', 'referral'], ['ras-im', 'imAvailable']];
    numField(root, 'Age in years', 'ras-age', 'e.g. 3', '120', 'any');
    numField(root, 'Weight in kg', 'ras-weight', 'e.g. 14', '150', 'any');
    selectField(root, 'Fever with a danger sign (convulsions, unusually sleepy or unconscious, unable to drink or feed, vomits everything)', 'ras-danger', RA.DANGER_OPTIONS);
    selectField(root, 'Time to reach a facility that can give injectable treatment', 'ras-referral', RA.REFERRAL_OPTIONS);
    selectField(root, 'IM artesunate available here', 'ras-im', RA.IM_OPTIONS);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = RA.rectalArtesunatePrereferral(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Answer', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'malaria-pregnancy-treatment'(root) {
    const pairs = [['mp-trimester', 'trimester'], ['mp-severity', 'severity'], ['mp-species', 'species']];
    selectField(root, 'Trimester', 'mp-trimester', MP.TRIMESTER_OPTIONS);
    selectField(root, 'Severity', 'mp-severity', MP.SEVERITY_OPTIONS);
    selectField(root, 'Species', 'mp-species', MP.SPECIES_OPTIONS);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MP.malariaPregnancyTreatment(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2026', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
