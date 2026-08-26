// spec-v799: Caine criteria for Wernicke encephalopathy.
//
// Sources:
//   Caine D, Halliday GM, Kril JJ, Harper CG. Operational criteria for the classification
//   of chronic alcoholics: identification of Wernicke's encephalopathy. J Neurol Neurosurg
//   Psychiatry. 1997;62(1):51-60. (PMID 9010400.) Restated in Wernicke Encephalopathy,
//   StatPearls, NCBI Bookshelf NBK470344.
//
// TWO of the following four signs:
//   dietary deficiency
//   oculomotor abnormalities
//   cerebellar dysfunction
//   an altered mental state OR mild memory impairment
//
// The reason these criteria exist is that the classic triad - confusion, ataxia,
// ophthalmoplegia - is present in only about 16% of cases, and roughly 19% of patients
// show none of the three at first assessment. Waiting for the triad misses most of them.
// At two or more signs the criteria are about 85% sensitive.
//
// Thiamine is given on suspicion. Nothing here is a reason to withhold it, and not meeting
// the criteria does not exclude the diagnosis.
//
// Pure: no DOM, no clock, no network.

export const CAINE_NOTE = 'The Caine criteria (Caine D, Halliday GM, Kril JJ, Harper CG, J Neurol Neurosurg Psychiatry 1997;62(1):51-60) call for Wernicke encephalopathy to be considered when two of four signs are present: dietary deficiency, oculomotor abnormalities, cerebellar dysfunction, and either an altered mental state or mild memory impairment. They exist because the classic triad of confusion, ataxia and ophthalmoplegia appears in only about 16 percent of cases and roughly 19 percent of patients show none of the three when first assessed, so waiting for the triad misses most of them; at two or more signs the criteria are about 85 percent sensitive. Thiamine is given on suspicion and is safe, so nothing here is a reason to withhold it, and failing to meet two signs does not exclude the diagnosis. This flags a possibility on findings already gathered; it does not diagnose, and it does not set a thiamine dose or route.';

const SIGNS = [
  { arg: 'dietaryDeficiency', text: 'dietary deficiency' },
  { arg: 'oculomotor', text: 'oculomotor abnormalities' },
  { arg: 'cerebellar', text: 'cerebellar dysfunction' },
  { arg: 'mentalOrMemory', text: 'altered mental state or mild memory impairment' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function caineWernicke(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const present = SIGNS.filter((s) => truthy(o[s.arg])).map((s) => s.text);
  const met = present.length >= 2;

  return {
    valid: true,
    signCount: present.length,
    signs: present,
    met,
    abnormal: met,
    bandLabel: `Caine criteria ${present.length} of 4`,
    band: met
      ? `Caine criteria met — ${present.length} of 4 signs present. Consider Wernicke encephalopathy and give thiamine.`
      : `Caine criteria not met — ${present.length} of 4 signs present, and two are needed. This does NOT exclude Wernicke encephalopathy.`,
    detail: 'Two of four: dietary deficiency, oculomotor abnormalities, cerebellar dysfunction, and either an altered mental state or mild memory impairment. The classic triad of confusion, ataxia and ophthalmoplegia is present in only about 16 percent of cases and about 19 percent show none of the three at first assessment, which is why two of these four is the working rule; at that threshold the criteria are about 85 percent sensitive.',
    note: CAINE_NOTE,
  };
}
