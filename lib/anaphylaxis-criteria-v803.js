// spec-v803: 2020 World Allergy Organization anaphylaxis diagnostic criteria.
//
// Source:
//   Cardona V, Ansotegui IJ, Ebisawa M, et al. World Allergy Organization anaphylaxis
//   guidance 2020. World Allergy Organ J. 2020;13(10):100472. (PMID 33204386.)
//
// Anaphylaxis is highly likely when EITHER criterion is met. They are alternatives, not
// steps: criterion 2 exists precisely so that a reaction with no rash still counts.
//
//   CRITERION 1  acute onset with skin or mucosal involvement, or both,
//                AND at least one of:
//                  respiratory compromise
//                  reduced blood pressure, or symptoms of end-organ dysfunction
//                  severe gastrointestinal symptoms
//
//   CRITERION 2  acute onset of hypotension OR bronchospasm OR laryngeal involvement
//                after exposure to a known or highly probable allergen for that patient,
//                EVEN WITHOUT any skin involvement
//
// The 2020 revision cut the older three-criterion set to two and added severe
// gastrointestinal symptoms as a qualifying system under criterion 1.
//
// Anaphylaxis is a clinical diagnosis and epinephrine is the first-line treatment; nothing
// here is a reason to delay it, and not meeting either criterion does not exclude it.
//
// Pure: no DOM, no clock, no network.

export const ANAPHYLAXIS_NOTE = 'The 2020 World Allergy Organization criteria (Cardona V, Ansotegui IJ, Ebisawa M, et al, World Allergy Organ J 2020;13(10):100472) make anaphylaxis highly likely when either of two criteria is met, and they are alternatives rather than steps. The first is an acute illness involving the skin or mucosa, or both, together with at least one of respiratory compromise, reduced blood pressure or symptoms of end-organ dysfunction such as collapse, syncope or incontinence, or severe gastrointestinal symptoms such as severe crampy pain or repeated vomiting. The second is an acute onset of hypotension, bronchospasm or laryngeal involvement after exposure to a known or highly probable allergen for that patient, even with no skin involvement at all, and that second route exists precisely because a reaction with no rash still counts. The 2020 revision cut the older three-criterion set to two and added severe gastrointestinal symptoms as a qualifying system. Anaphylaxis is a clinical diagnosis and epinephrine is the first-line treatment, so nothing here is a reason to delay it, and not meeting either criterion does not exclude it.';

const SYSTEMS = [
  { arg: 'respiratory', text: 'respiratory compromise' },
  { arg: 'circulatory', text: 'reduced blood pressure or end-organ dysfunction' },
  { arg: 'gastrointestinal', text: 'severe gastrointestinal symptoms' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function anaphylaxisCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const skin = truthy(o.skinOrMucosal);
  const systems = SYSTEMS.filter((s) => truthy(o[s.arg])).map((s) => s.text);
  const criterion1 = skin && systems.length > 0;

  const knownAllergen = truthy(o.knownAllergen);
  const c2Features = [];
  if (truthy(o.hypotension)) c2Features.push('hypotension');
  if (truthy(o.bronchospasm)) c2Features.push('bronchospasm');
  if (truthy(o.laryngeal)) c2Features.push('laryngeal involvement');
  const criterion2 = knownAllergen && c2Features.length > 0;

  const met = criterion1 || criterion2;
  const routes = [];
  if (criterion1) routes.push('criterion 1');
  if (criterion2) routes.push('criterion 2');

  let band;
  if (met) {
    band = `Anaphylaxis criteria met by ${routes.join(' and ')} — anaphylaxis is highly likely. Epinephrine is first-line.`;
  } else {
    const missing = [];
    if (!skin) missing.push('criterion 1 needs skin or mucosal involvement');
    else missing.push('criterion 1 needs at least one other organ system');
    if (!knownAllergen) missing.push('criterion 2 needs exposure to a known or highly probable allergen');
    else missing.push('criterion 2 needs hypotension, bronchospasm or laryngeal involvement');
    band = `Anaphylaxis criteria not met — ${missing.join('; ')}. This does NOT exclude anaphylaxis.`;
  }

  return {
    valid: true,
    met,
    criterion1,
    criterion2,
    routes,
    systems,
    criterion2Features: c2Features,
    abnormal: met,
    bandLabel: met ? 'Anaphylaxis criteria met' : 'Anaphylaxis criteria not met',
    band,
    detail: 'Criterion 1: acute onset with skin or mucosal involvement plus at least one of respiratory compromise, reduced blood pressure or end-organ dysfunction, or severe gastrointestinal symptoms. Criterion 2: acute hypotension, bronchospasm or laryngeal involvement after a known or highly probable allergen, even with no skin involvement. Either one is enough; they are alternatives, not steps.',
    note: ANAPHYLAXIS_NOTE,
  };
}
