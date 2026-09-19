// spec-v1391: renderers for who decides -- surrogates, proxies, MOLST, and DNR (State & Coverage
// Reference, Group M): ny-fhcda-surrogate, ca-surrogate-decisionmaker, tx-surrogate-consent-hierarchy,
// ny-health-care-proxy-check, ny-molst-checklist-router, tx-ooh-dnr-validity, tx-in-hospital-dnr-pathway.
//
// Every select starts blank, and blank is "not answered", never "no".
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as FH from '../lib/ny-fhcda-surrogate-v1391.js';
import * as CAS from '../lib/ca-surrogate-decisionmaker-v1391.js';
import * as TXS from '../lib/tx-surrogate-consent-hierarchy-v1391.js';
import * as HCP from '../lib/ny-health-care-proxy-check-v1391.js';
import * as MOLST from '../lib/ny-molst-checklist-router-v1391.js';
import * as OOH from '../lib/tx-ooh-dnr-validity-v1391.js';
import * as IHD from '../lib/tx-in-hospital-dnr-pathway-v1391.js';
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

const NA = '-- not answered --';

export const renderers = {
  'ny-fhcda-surrogate'(root) {
    note(root, 'New York, adult patient without capacity. Answer from the top; the list is ranked.');
    selectField(root, 'Health care proxy agent available', 'fh-proxy', FH.YES_NO, NA);
    selectField(root, 'Has an SCPA Article 17-A guardian', 'fh-17a', FH.YES_NO, NA);
    selectField(root, '(a) Article 81 guardian with health care authority', 'fh-guardian', FH.AVAILABLE, NA);
    selectField(root, '(b) Spouse (not legally separated) or domestic partner', 'fh-spouse', FH.AVAILABLE, NA);
    selectField(root, '(c) Son or daughter 18 or older', 'fh-child', FH.AVAILABLE, NA);
    selectField(root, '(d) Parent', 'fh-parent', FH.AVAILABLE, NA);
    selectField(root, '(e) Brother or sister 18 or older', 'fh-sibling', FH.AVAILABLE, NA);
    selectField(root, '(f) Close friend', 'fh-friend', FH.AVAILABLE, NA);

    const ids = ['fh-proxy', 'fh-17a', 'fh-guardian', 'fh-spouse', 'fh-child', 'fh-parent', 'fh-sibling', 'fh-friend'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = FH.nyFhcdaSurrogate({ proxy: val('fh-proxy'), article17a: val('fh-17a'), guardian: val('fh-guardian'), spouse: val('fh-spouse'), child: val('fh-child'), parent: val('fh-parent'), sibling: val('fh-sibling'), friend: val('fh-friend') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.standardNote);
      note(o, r.njNote);
      note(o, r.postureNote);
    }));
  },

  'ca-surrogate-decisionmaker'(root) {
    note(root, 'California, patient without capacity. The first three are ranked; the family list below them is not.');
    selectField(root, 'Surrogate the patient named to the provider (4711)', 'cas-designated', CAS.AVAILABLE, NA);
    selectField(root, 'Agent under an advance directive or power of attorney', 'cas-agent', CAS.AVAILABLE, NA);
    selectField(root, 'Conservator or guardian with health care authority', 'cas-conservator', CAS.AVAILABLE, NA);
    selectField(root, 'Spouse or domestic partner', 'cas-spouse', CAS.AVAILABLE, NA);
    selectField(root, 'Adult child', 'cas-child', CAS.AVAILABLE, NA);
    selectField(root, 'Parent', 'cas-parent', CAS.AVAILABLE, NA);
    selectField(root, 'Adult sibling', 'cas-sibling', CAS.AVAILABLE, NA);
    selectField(root, 'Adult grandchild', 'cas-grandchild', CAS.AVAILABLE, NA);
    selectField(root, 'Adult relative or close personal friend', 'cas-relative', CAS.AVAILABLE, NA);

    const ids = ['cas-designated', 'cas-agent', 'cas-conservator', 'cas-spouse', 'cas-child', 'cas-parent', 'cas-sibling', 'cas-grandchild', 'cas-relative'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = CAS.caSurrogateDecisionmaker({
        designated: val('cas-designated'), agent: val('cas-agent'), conservator: val('cas-conservator'), spouse: val('cas-spouse'),
        adultChild: val('cas-child'), parent: val('cas-parent'), sibling: val('cas-sibling'), grandchild: val('cas-grandchild'), relativeFriend: val('cas-relative'),
      });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.duty);
      note(o, r.note);
      note(o, r.njNote);
      note(o, r.postureNote);
    }));
  },

  'tx-surrogate-consent-hierarchy'(root) {
    note(root, 'Texas, adult patient who cannot decide or communicate. Answer from the top; the list is ranked.');
    selectField(root, 'Treatment', 'txs-treatment', TXS.TREATMENTS, '-- choose --');
    selectField(root, 'County or municipal jail inmate', 'txs-inmate', TXS.YES_NO, NA);
    selectField(root, 'Legal guardian', 'txs-guardian', TXS.AVAILABLE, NA);
    selectField(root, 'Medical power of attorney agent', 'txs-mpoa', TXS.AVAILABLE, NA);
    selectField(root, 'Spouse', 'txs-spouse', TXS.AVAILABLE, NA);
    selectField(root, 'Adult children', 'txs-children', TXS.AVAILABLE, NA);
    selectField(root, 'Parents', 'txs-parents', TXS.AVAILABLE, NA);
    selectField(root, 'Nearest living relative', 'txs-relative', TXS.AVAILABLE, NA);

    const ids = ['txs-treatment', 'txs-inmate', 'txs-guardian', 'txs-mpoa', 'txs-spouse', 'txs-children', 'txs-parents', 'txs-relative'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = TXS.txSurrogateConsentHierarchy({
        treatment: val('txs-treatment'), inmate: val('txs-inmate'), guardian: val('txs-guardian'), mpoa: val('txs-mpoa'),
        spouse: val('txs-spouse'), children: val('txs-children'), parents: val('txs-parents'), relative: val('txs-relative'),
      });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.inmateNote);
      note(o, r.scopeNote);
      note(o, r.postureNote);
    }));
  },

  'ny-health-care-proxy-check'(root) {
    note(root, 'New York. Answer each item; an unanswered one is not a pass.');
    selectField(root, 'Where the principal lives or is treated', 'hcp-facility', HCP.FACILITIES, '-- choose --');
    selectField(root, 'Principal signed and dated it', 'hcp-signed', HCP.YES_NO, NA);
    selectField(root, 'Two adult witnesses signed it', 'hcp-witnesses', HCP.YES_NO, NA);
    selectField(root, 'The agent signed as a witness', 'hcp-agent-witness', HCP.YES_NO, NA);
    selectField(root, "The agent's tie to that facility", 'hcp-role', HCP.AGENT_ROLES, NA);
    selectField(root, 'Agent related by blood, marriage, or adoption', 'hcp-related', HCP.YES_NO, NA);
    selectField(root, 'A witness is unaffiliated with the facility (OMH, OPWDD)', 'hcp-unaffiliated', HCP.YES_NO, NA);
    selectField(root, 'A witness is a psychiatrist or psychiatric NP (OMH hospital)', 'hcp-psych', HCP.YES_NO, NA);
    selectField(root, 'A witness is a clinician meeting the OPWDD criteria', 'hcp-opwdd', HCP.YES_NO, NA);

    const ids = ['hcp-facility', 'hcp-signed', 'hcp-witnesses', 'hcp-agent-witness', 'hcp-role', 'hcp-related', 'hcp-unaffiliated', 'hcp-psych', 'hcp-opwdd'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = HCP.nyHealthCareProxyCheck({
        facility: val('hcp-facility'), signedDated: val('hcp-signed'), twoWitnesses: val('hcp-witnesses'), agentWitnessed: val('hcp-agent-witness'),
        agentRole: val('hcp-role'), related: val('hcp-related'), unaffiliated: val('hcp-unaffiliated'), psychWitness: val('hcp-psych'), opwddClinician: val('hcp-opwdd'),
      });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.clinicianNote);
      note(o, r.limitsNote);
      note(o, r.postureNote);
    }));
  },

  'ny-molst-checklist-router'(root) {
    note(root, 'New York. Answer from the top; later questions apply only when needed.');
    selectField(root, 'Patient', 'molst-age', MOLST.AGES, '-- choose --');
    selectField(root, 'Intellectual or developmental disability', 'molst-dd', MOLST.YES_NO, NA);
    selectField(root, 'Has medical decision-making capacity (adult)', 'molst-capacity', MOLST.YES_NO, NA);
    selectField(root, 'Has a health care proxy', 'molst-proxy', MOLST.YES_NO, NA);
    selectField(root, 'Setting', 'molst-setting', MOLST.SETTINGS, NA);
    selectField(root, 'An FHCDA surrogate from the list is available', 'molst-surrogate', MOLST.YES_NO, NA);

    const ids = ['molst-age', 'molst-dd', 'molst-capacity', 'molst-proxy', 'molst-setting', 'molst-surrogate'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = MOLST.nyMolstChecklistRouter({ age: val('molst-age'), dd: val('molst-dd'), capacity: val('molst-capacity'), proxy: val('molst-proxy'), setting: val('molst-setting'), surrogate: val('molst-surrogate') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, false);
      note(o, r.reviewNote);
      note(o, r.formNote);
      note(o, r.postureNote);
    }));
  },

  'tx-ooh-dnr-validity'(root) {
    note(root, 'Texas out-of-hospital DNR. Answer each item; an unanswered one is not a pass.');
    selectField(root, 'Who executed it', 'ooh-executor', OOH.EXECUTORS, '-- choose --');
    selectField(root, 'Witnessing', 'ooh-witnessing', OOH.WITNESSING, NA);
    selectField(root, 'The attending physician signed it', 'ooh-physician', OOH.YES_NO, NA);
    selectField(root, 'Revoked, or the person now expresses a contrary wish', 'ooh-revoked', OOH.YES_NO, NA);
    selectField(root, 'Minor: diagnosed terminal or irreversible condition', 'ooh-terminal', OOH.YES_NO, NA);
    selectField(root, 'No relative: a second physician concurred', 'ooh-concurred', OOH.YES_NO, NA);

    const ids = ['ooh-executor', 'ooh-witnessing', 'ooh-physician', 'ooh-revoked', 'ooh-terminal', 'ooh-concurred'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = OOH.txOohDnrValidity({ executor: val('ooh-executor'), witnessing: val('ooh-witnessing'), physicianSigned: val('ooh-physician'), revoked: val('ooh-revoked'), terminalDx: val('ooh-terminal'), concurred: val('ooh-concurred') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.readingNote);
      note(o, r.limitsNote);
      note(o, r.postureNote);
    }));
  },

  'tx-in-hospital-dnr-pathway'(root) {
    note(root, 'Texas hospital DNR order. Choose what it rests on; only that pathway\'s elements are read.');
    selectField(root, 'The order rests on', 'ihd-basis', IHD.BASES, '-- choose --');
    selectField(root, 'The order is dated', 'ihd-dated', IHD.YES_NO, NA);
    selectField(root, 'Oral directions: two qualifying witnesses', 'ihd-witnesses', IHD.CRITERION, NA);
    selectField(root, "Imminent: not contrary to a competent patient's directions", 'ihd-not-contrary', IHD.CRITERION, NA);
    selectField(root, 'Imminent: death within minutes to hours regardless of CPR', 'ihd-imminent', IHD.CRITERION, NA);
    selectField(root, 'Imminent: the order is medically appropriate', 'ihd-appropriate', IHD.CRITERION, NA);
    selectField(root, 'Imminent: the patient is competent', 'ihd-competent', IHD.YES_NO, NA);
    selectField(root, 'Agreed: the patient is incompetent', 'ihd-incompetent', IHD.CRITERION, NA);
    selectField(root, 'Agreed: attending and decision-maker agree', 'ihd-agreed', IHD.CRITERION, NA);
    selectField(root, 'Agreed: a second physician or ethics representative concurred', 'ihd-second', IHD.CRITERION, NA);

    const ids = ['ihd-basis', 'ihd-dated', 'ihd-witnesses', 'ihd-not-contrary', 'ihd-imminent', 'ihd-appropriate', 'ihd-competent', 'ihd-incompetent', 'ihd-agreed', 'ihd-second'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = IHD.txInHospitalDnrPathway({
        basis: val('ihd-basis'), dated: val('ihd-dated'), witnesses: val('ihd-witnesses'), notContrary: val('ihd-not-contrary'),
        deathImminent: val('ihd-imminent'), appropriate: val('ihd-appropriate'), patientCompetent: val('ihd-competent'),
        incompetent: val('ihd-incompetent'), agreed: val('ihd-agreed'), secondPhysician: val('ihd-second'),
      });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.notice);
      note(o, r.concurNote);
      note(o, r.postureNote);
    }));
  },
};
