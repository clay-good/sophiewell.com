// spec-v1507: renderers for the Medicare enrollment, premium and penalty tools and the COBRA clock.

import { el, clear } from '../lib/dom.js';
import * as MP from '../lib/medicare-penalties-v1507.js';
import * as CB from '../lib/cobra-clock-v1507.js';
import * as MW from '../lib/medicare-enrollment-window-v1507.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function dateInput(root, label, id, type) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'partb-late-penalty'(root) {
    const pairs = [['pbl-months', 'monthsLate'], ['pbl-year', 'year'], ['pbl-premium', 'premium']];
    numField(root, 'Months late (not counting special enrollment months)', 'pbl-months', 'e.g. 38', '1200', '1');
    numField(root, 'Premium year (blank for this year)', 'pbl-year', 'e.g. 2026', '2100', '1');
    numField(root, 'Standard Part B premium, if not the published figure', 'pbl-premium', 'e.g. 202.90', '10000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MP.partbLatePenalty(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Penalty', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'partd-late-penalty'(root) {
    const pairs = [['pdl-g1s', 'gap1Start'], ['pdl-g1e', 'gap1End'], ['pdl-g2s', 'gap2Start'], ['pdl-g2e', 'gap2End'], ['pdl-g3s', 'gap3Start'], ['pdl-g3e', 'gap3End'], ['pdl-year', 'year'], ['pdl-base', 'base']];
    dateInput(root, 'Gap 1: first day without drug coverage', 'pdl-g1s', 'date');
    dateInput(root, 'Gap 1: last day without drug coverage', 'pdl-g1e', 'date');
    dateInput(root, 'Gap 2: first day (optional)', 'pdl-g2s', 'date');
    dateInput(root, 'Gap 2: last day (optional)', 'pdl-g2e', 'date');
    dateInput(root, 'Gap 3: first day (optional)', 'pdl-g3s', 'date');
    dateInput(root, 'Gap 3: last day (optional)', 'pdl-g3e', 'date');
    numField(root, 'Premium year (blank for this year)', 'pdl-year', 'e.g. 2027', '2100', '1');
    numField(root, 'Base beneficiary premium, if not a published figure', 'pdl-base', 'e.g. 41.33', '10000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MP.partdLatePenalty(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Penalty', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'cobra-clock'(root) {
    const pairs = [['cb-event', 'event'], ['cb-date', 'eventDate'], ['cb-loss', 'lossDate'], ['cb-admin', 'employerAdministers'], ['cb-notice', 'noticeDate'], ['cb-elect', 'electionDate'], ['cb-disab', 'disability']];
    selectField(root, 'Qualifying event', 'cb-event', CB.EVENTS);
    dateInput(root, 'Date of the event', 'cb-date', 'date');
    dateInput(root, 'Date coverage is lost (if later than the event)', 'cb-loss', 'date');
    selectField(root, 'Is the employer also the plan administrator?', 'cb-admin', CB.YES_NO);
    dateInput(root, 'Date of the election notice (optional)', 'cb-notice', 'date');
    dateInput(root, 'Date COBRA was elected (optional)', 'cb-elect', 'date');
    selectField(root, 'Disability extension (Social Security disability)?', 'cb-disab', CB.YES_NO);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CB.cobraClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Coverage', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'parta-premium'(root) {
    const pairs = [['pap-quarters', 'quarters'], ['pap-late', 'monthsLate'], ['pap-year', 'year']];
    numField(root, 'Quarters of Medicare-covered work (yours or a spouse\'s)', 'pap-quarters', 'e.g. 34', '400', '1');
    numField(root, 'Months late for premium Part A (optional)', 'pap-late', 'e.g. 30', '1200', '1');
    numField(root, 'Premium year (blank for this year)', 'pap-year', 'e.g. 2026', '2100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MP.partaPremium(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Premium', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'medicare-enrollment-window'(root) {
    const pairs = [['mew-birth', 'birthDate'], ['mew-elig', 'eligibleFrom'], ['mew-enroll', 'enrollDate'], ['mew-cov', 'employerCoverageEnd']];
    dateInput(root, 'Date of birth', 'mew-birth', 'date');
    dateInput(root, 'Or, for Medicare through disability: first month of eligibility', 'mew-elig', 'date');
    dateInput(root, 'Date of signing up (or the date to check)', 'mew-enroll', 'date');
    dateInput(root, 'Last day of employer coverage from current work (optional)', 'mew-cov', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MW.medicareEnrollmentWindow(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Window', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
