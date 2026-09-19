// spec-v1392: renderers for end of life -- aid in dying, ethics-committee review, and death
// declaration (State & Coverage Reference, Group M): ny-maid-timeline, nj-maid-timeline,
// ca-eoloa-timeline, tx-ethics-review-timeline, nj-death-religious-exemption, tx-death-cert-deadline.
//
// These compute dates and check documented steps; they never assess eligibility.
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as NYM from '../lib/ny-maid-timeline-v1392.js';
import * as NJM from '../lib/nj-maid-timeline-v1392.js';
import * as CAE from '../lib/ca-eoloa-timeline-v1392.js';
import * as TXE from '../lib/tx-ethics-review-timeline-v1392.js';
import * as NJD from '../lib/nj-death-religious-exemption-v1392.js';
import * as TXD from '../lib/tx-death-cert-deadline-v1392.js';
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
function inputField(root, label, id, type) {
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
function answer(o, r, warn) {
  resultRow(o, [
    { text: r.band, cls: warn ? 'warn' : null },
    { label: 'Answer', value: r.bandLabel },
  ]);
}

const NA = '-- not entered --';

export const renderers = {
  'ny-maid-timeline'(root) {
    note(root, 'New York. Enter each step as it happens; no prescription date shows until all five are in.');
    inputField(root, 'Recorded oral request', 'nym-oral', 'date');
    inputField(root, 'Written request signed', 'nym-written', 'date');
    selectField(root, 'Witness 1', 'nym-w1', NYM.WITNESS, NA);
    selectField(root, 'Witness 2', 'nym-w2', NYM.WITNESS, NA);
    inputField(root, 'Attending physician\'s determination', 'nym-attending', 'date');
    inputField(root, 'Consulting physician\'s confirmation', 'nym-consulting', 'date');
    inputField(root, 'Mental health professional\'s confirmation', 'nym-mh', 'date');
    inputField(root, 'Prescription written', 'nym-rx', 'datetime-local');
    selectField(root, 'Attending confirms death may come within five days', 'nym-sooner', NYM.YES_NO, NA);

    const ids = ['nym-oral', 'nym-written', 'nym-w1', 'nym-w2', 'nym-attending', 'nym-consulting', 'nym-mh', 'nym-rx', 'nym-sooner'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NYM.nyMaidTimeline({ oral: val('nym-oral'), written: val('nym-written'), witness1: val('nym-w1'), witness2: val('nym-w2'), attending: val('nym-attending'), consulting: val('nym-consulting'), mentalHealth: val('nym-mh'), prescribed: val('nym-rx'), dieSooner: val('nym-sooner') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.caveats);
      note(o, r.voluntaryNote);
      note(o, r.postureNote);
    }));
  },

  'nj-maid-timeline'(root) {
    note(root, 'New Jersey. Enter the requests as they happen; the latest of the three limits binds.');
    inputField(root, 'First oral request', 'njm-first', 'datetime-local');
    inputField(root, 'Written request received', 'njm-written', 'datetime-local');
    inputField(root, 'Second oral request', 'njm-second', 'datetime-local');

    const ids = ['njm-first', 'njm-written', 'njm-second'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NJM.njMaidTimeline({ firstOral: val('njm-first'), written: val('njm-written'), secondOral: val('njm-second') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.lines);
      note(o, r.secondNote);
      note(o, r.rescindNote);
      note(o, r.postureNote);
    }));
  },

  'ca-eoloa-timeline'(root) {
    note(root, 'California. Physician findings enter as documented or not; a blank one is not assessed.');
    inputField(root, 'First oral request', 'cae-oral1', 'datetime-local');
    inputField(root, 'Second oral request', 'cae-oral2', 'datetime-local');
    selectField(root, 'Written request witness 1', 'cae-w1', CAE.WITNESS, NA);
    selectField(root, 'Written request witness 2', 'cae-w2', CAE.WITNESS, NA);
    selectField(root, 'Adult (18 or older)', 'cae-adult', CAE.CRITERION, NA);
    selectField(root, 'Capacity to make medical decisions', 'cae-capacity', CAE.CRITERION, NA);
    selectField(root, 'Terminal disease, death expected within six months', 'cae-terminal', CAE.CRITERION, NA);
    selectField(root, 'California resident, with proof', 'cae-resident', CAE.CRITERION, NA);
    selectField(root, 'Able to self-administer', 'cae-self', CAE.CRITERION, NA);

    const ids = ['cae-oral1', 'cae-oral2', 'cae-w1', 'cae-w2', 'cae-adult', 'cae-capacity', 'cae-terminal', 'cae-resident', 'cae-self'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = CAE.caEoloaTimeline({ oral1: val('cae-oral1'), oral2: val('cae-oral2'), witness1: val('cae-w1'), witness2: val('cae-w2'), adult: val('cae-adult'), capacity: val('cae-capacity'), terminal: val('cae-terminal'), resident: val('cae-resident'), selfAdminister: val('cae-self') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.findings);
      note(o, r.witnessText);
      note(o, r.requestNote);
      note(o, r.postureNote);
    }));
  },

  'tx-ethics-review-timeline'(root) {
    note(root, 'Texas. Enter the dates as they happen; the 25 days start with the start notice or the delay-notice procedure.');
    inputField(root, 'Written notice of the meeting given', 'txe-notice', 'date');
    selectField(root, 'Seven-day notice waived in writing by both sides', 'txe-waived', TXE.YES_NO, NA);
    inputField(root, 'Meeting', 'txe-meeting', 'datetime-local');
    inputField(root, 'Consent requested for a transfer-enabling procedure', 'txe-consent', 'datetime-local');
    inputField(root, 'Start notice given', 'txe-start', 'date');
    inputField(root, 'Delay-notice procedure performed', 'txe-procedure', 'date');

    const ids = ['txe-notice', 'txe-waived', 'txe-meeting', 'txe-consent', 'txe-start', 'txe-procedure'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = TXE.txEthicsReviewTimeline({ noticeGiven: val('txe-notice'), waived: val('txe-waived'), meeting: val('txe-meeting'), consentRequested: val('txe-consent'), startNotice: val('txe-start'), procedureDone: val('txe-procedure') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.lines);
      note(o, r.carveOut);
      note(o, r.postureNote);
    }));
  },

  'nj-death-religious-exemption'(root) {
    note(root, 'New Jersey. Check the records and ask the family before declaring death on neurological criteria.');
    selectField(root, 'Reason to believe a neurological declaration would violate their religious beliefs', 'njd-belief', NJD.BELIEF, NA);
    selectField(root, 'Where that information came from', 'njd-source', NJD.SOURCES, NA);

    const ids = ['njd-belief', 'njd-source'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NJD.njDeathReligiousExemption({ belief: val('njd-belief'), source: val('njd-source') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.askNote);
      note(o, r.postureNote);
    }));
  },

  'tx-death-cert-deadline'(root) {
    note(root, 'Texas. Enter the date the death certificate reached the certifier.');
    inputField(root, 'Death certificate received', 'txd-received', 'date');
    selectField(root, 'Attending physician, PA, or APRN available', 'txd-available', TXD.YES_NO, NA);

    const ids = ['txd-received', 'txd-available'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = TXD.txDeathCertDeadline({ received: val('txd-received'), attendingAvailable: val('txd-available') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.who);
      note(o, r.delayNote);
      note(o, r.postureNote);
    }));
  },
};
