// spec-v1391: Texas surrogate consent, Health & Safety Code 313.004 (and 166.039 for life-sustaining
// treatment decisions).
//
// Sources (official mirror tcss.legis.texas.gov, read 2026-09-18):
//   313.004(a) For an adult hospital, nursing home, or home and community support services agency
//     patient, or an adult county or municipal jail inmate, who is comatose, incapacitated, or
//     otherwise incapable of communication and has no legal guardian or medical power of attorney
//     agent reasonably available after a reasonably diligent inquiry, an adult surrogate "in order of
//     priority" who has decision-making capacity, is reasonably available, and is willing may
//     consent: (1) spouse; (2) adult children; (3) parents; (4) nearest living relative.
//   (a-1) With none of them available, another physician not involved in the treatment may concur.
//   (c) Consent must rest on what the patient would want, if known.
//   (d) A surrogate may not consent to (1) voluntary inpatient mental health services, (2)
//     electro-convulsive treatment, or (3) appointing another surrogate.
//   (e) For a jail inmate, also not (1) psychotropic medication, (2) involuntary inpatient mental
//     health services, or (3) psychiatric services to restore competency to stand trial.
//   (f) An inmate's surrogate may act only until the earlier of the 120th day after agreeing to act
//     or the inmate's release; no successor surrogate may then be appointed.
//   166.039(b), (e) For withholding or withdrawing life-sustaining treatment without a directive,
//     the same order applies, and with no one available the decision needs a second physician not
//     involved in treatment, or an ethics or medical committee representative.
//
// No majority-vote rule among adult children is modeled: none was found in the sections read.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const TXS_VERIFIED = '2026-09-18';
export const AVAILABLE = [
  { value: 'yes', text: 'Reasonably available and willing' },
  { value: 'no', text: 'None, or not available' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const TREATMENTS = [
  { value: 'general', text: 'Medical treatment (general)' },
  { value: 'life-sustaining', text: 'Withholding or withdrawing life-sustaining treatment' },
  { value: 'inpatient-mh', text: 'Voluntary inpatient mental health services' },
  { value: 'ect', text: 'Electroconvulsive therapy' },
  { value: 'appoint', text: 'Appointing another surrogate' },
  { value: 'psychotropic', text: 'Psychotropic medication' },
  { value: 'involuntary-mh', text: 'Involuntary inpatient mental health services' },
  { value: 'competency', text: 'Psychiatric services to restore competency to stand trial' },
];
const CLASSES = [
  ['spouse', '(1)', 'the spouse'],
  ['children', '(2)', 'the adult children'],
  ['parents', '(3)', 'the parents'],
  ['relative', '(4)', 'the nearest living relative'],
];
const BARRED = { 'inpatient-mh': '(d)(1)', ect: '(d)(2)', appoint: '(d)(3)' };
const BARRED_INMATE = { psychotropic: '(e)(1)', 'involuntary-mh': '(e)(2)', competency: '(e)(3)' };

const st = (v) => (v === 'yes' || v === 'no' ? v : null);

export function txSurrogateConsentHierarchy(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tr = TREATMENTS.find((t) => t.value === o.treatment);
  if (!tr) return { valid: false, message: 'Choose the treatment. A surrogate may not consent to some of them at all.' };
  const inmate = st(o.inmate);
  if (!inmate) return { valid: false, message: 'Answer whether the patient is a county or municipal jail inmate. It adds three more bars and a 120-day limit.' };
  const base = { valid: true, scopeNote: 'Section 313.004 covers adult patients of a hospital, nursing home, or home and community support services agency, and adult county or municipal jail inmates.', postureNote: scopeSentence(TXS_VERIFIED) };
  const inmateNote = inmate === 'yes'
    ? "An inmate's surrogate may act only until the 120th day after agreeing to act, or release, whichever is earlier; no successor surrogate may then be appointed (313.004(f))."
    : null;

  if (BARRED[tr.value] || (inmate === 'yes' && BARRED_INMATE[tr.value])) {
    const ref = BARRED[tr.value] || BARRED_INMATE[tr.value];
    return {
      ...base, mayConsent: false, abnormal: true, bandLabel: 'A surrogate may not consent',
      band: `Health & Safety Code 313.004${ref}: a surrogate may not consent to ${tr.text.toLowerCase()}${BARRED_INMATE[tr.value] ? ' for a jail inmate' : ''}.`,
      inmateNote,
    };
  }
  for (const [k, label] of [['guardian', 'a legal guardian'], ['mpoa', 'an agent under a medical power of attorney']]) {
    const s = st(o[k]);
    if (!s) return { valid: false, message: `Answer whether ${label} is reasonably available. The surrogate list applies only when neither is.` };
    if (s === 'yes') {
      return { ...base, mayConsent: true, decider: k, abnormal: false, bandLabel: `Decides: ${label.replace(/^(a|an) /, '')}`, band: `${label[0].toUpperCase()}${label.slice(1)} decides; the 313.004(a) surrogate list applies only when neither a guardian nor an agent is available.`, inmateNote };
    }
  }
  for (const [k, ref, label] of CLASSES) {
    const s = st(o[k]);
    if (!s) return { valid: false, message: `Answer whether ${label} ${k === 'children' || k === 'parents' ? 'are' : 'is'} available. The list is in priority order, and a higher class cannot be skipped unanswered.` };
    if (s === 'yes') {
      const sec = tr.value === 'life-sustaining' ? '166.039(b)' : '313.004(a)';
      return {
        ...base, mayConsent: true, decider: k, abnormal: false,
        bandLabel: `Surrogate: ${label.replace(/^the /, '')}`,
        band: `${sec}${ref}: ${label} may consent, as the highest-priority class available. The decision rests on what the patient would want, if known.`,
        inmateNote,
      };
    }
  }
  const concur = tr.value === 'life-sustaining'
    ? 'No surrogate is available. The decision to withhold or withdraw life-sustaining treatment must be concurred in by another physician not involved in the treatment, or by a representative of the ethics or medical committee (166.039(e)).'
    : 'No surrogate is available. Another physician who is not involved in the treatment may concur with the treatment (313.004(a-1)).';
  return { ...base, mayConsent: false, decider: null, abnormal: true, bandLabel: 'No surrogate: a second physician concurs', band: concur, inmateNote };
}
