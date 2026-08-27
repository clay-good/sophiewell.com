// spec-v812: Leipzig (Ferenci) scoring system for the diagnosis of Wilson disease.
//
// Sources:
//   Ferenci P, Caca K, Loudianos G, et al. Diagnosis and phenotypic classification of
//     Wilson disease. Liver Int. 2003;23(3):139-142. (The scoring system agreed by the
//     Working Party at the 8th International Meeting on Wilson Disease, Leipzig 2001.)
//   Reproduced identically in two independent reviews: Wilson's Disease: Facing the
//     Challenge of Diagnosing a Rare Disease (PMC8471362) and Wilson's Disease: An Update
//     on the Diagnostic Workup and Management (PMC8584493).
//
// Two features of this score are unlike the usual additive checklist, and both are easy to
// implement wrongly:
//
//   1. A NORMAL liver copper scores MINUS ONE. It is not a zero. A normal quantitative
//      hepatic copper is evidence against the diagnosis and the score says so, which means
//      a tool that clamps items at zero will report a higher score than the rule gives.
//
//   2. Rhodanine-positive granules are an ALTERNATIVE to quantitative liver copper, not an
//      addition to it. The published table scores them "if no quantitative liver copper is
//      available". Adding both is double-counting the same histology.
//
// Bands: 4 or more = diagnosis established; exactly 3 = possible, more tests needed;
// 2 or fewer = very unlikely.
//
// Pure: no DOM, no clock, no network.

export const LEIPZIG_NOTE = 'The Leipzig scoring system (Ferenci P, Caca K, Loudianos G, et al, Liver Int 2003;23(3):139-142, agreed at the 8th International Meeting on Wilson Disease, Leipzig 2001) adds up clinical, biochemical, histological and genetic evidence for Wilson disease. Kayser-Fleischer rings score 2. Neurologic symptoms or typical brain MRI changes score 2 if severe and 1 if mild. Serum ceruloplasmin scores 1 between 0.1 and 0.2 grams per litre and 2 below 0.1. Coombs-negative hemolytic anemia scores 1. Quantitative liver copper scores 2 above 4 micromoles per gram dry weight, 1 between 0.8 and 4, and minus 1 when normal. Rhodanine-positive granules score 1 but only when no quantitative liver copper is available. Twenty-four-hour urinary copper scores 1 at one to two times the upper limit, 2 above twice it, and 2 when normal at baseline but above five times the upper limit after D-penicillamine. Mutation analysis scores 4 for deleterious variants on both chromosomes and 1 on one. Four or more points establishes the diagnosis; exactly 3 makes it possible and calls for more tests; 2 or fewer makes it very unlikely. Two things are easy to get wrong: a normal liver copper subtracts a point rather than scoring zero, and the rhodanine stain substitutes for quantitative copper rather than adding to it. It scores evidence already gathered and it does not start chelation or zinc.';

const KF = { 0: { pts: 0, text: 'Kayser-Fleischer rings absent' }, 1: { pts: 2, text: 'Kayser-Fleischer rings present' } };
const NEURO = {
  0: { pts: 0, text: 'no neurologic symptoms or MRI changes' },
  1: { pts: 1, text: 'mild neurologic symptoms or MRI changes' },
  2: { pts: 2, text: 'severe neurologic symptoms or MRI changes' },
};
const CERULO = {
  0: { pts: 0, text: 'ceruloplasmin normal, above 0.2 g/L' },
  1: { pts: 1, text: 'ceruloplasmin 0.1 to 0.2 g/L' },
  2: { pts: 2, text: 'ceruloplasmin below 0.1 g/L' },
};
const HEMOLYSIS = { 0: { pts: 0, text: 'no Coombs-negative hemolytic anemia' }, 1: { pts: 1, text: 'Coombs-negative hemolytic anemia present' } };
const LIVER_CU = {
  0: { pts: -1, text: 'liver copper normal, below 0.8 micromol/g' },
  1: { pts: 1, text: 'liver copper 0.8 to 4 micromol/g' },
  2: { pts: 2, text: 'liver copper above 4 micromol/g' },
  na: { pts: 0, text: 'no quantitative liver copper available' },
};
const URINE_CU = {
  0: { pts: 0, text: 'urinary copper normal' },
  1: { pts: 1, text: 'urinary copper 1 to 2 times the upper limit' },
  2: { pts: 2, text: 'urinary copper above twice the upper limit' },
  3: { pts: 2, text: 'urinary copper normal at baseline but above 5 times the upper limit after D-penicillamine' },
};
const MUTATION = {
  0: { pts: 0, text: 'no disease-causing ATP7B variant detected' },
  1: { pts: 1, text: 'a deleterious ATP7B variant on one chromosome' },
  2: { pts: 4, text: 'deleterious ATP7B variants on both chromosomes' },
};

function pick(table, raw, fallback) {
  const k = String(raw == null ? '' : raw).trim().toLowerCase();
  if (!k) return table[fallback];
  return Object.prototype.hasOwnProperty.call(table, k) ? table[k] : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function leipzigWilson(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const parts = [
    pick(KF, o.kfRings, '0'),
    pick(NEURO, o.neurologic, '0'),
    pick(CERULO, o.ceruloplasmin, '0'),
    pick(HEMOLYSIS, o.hemolysis, '0'),
    pick(URINE_CU, o.urinaryCopper, '0'),
    pick(MUTATION, o.mutation, '0'),
  ];
  const liver = pick(LIVER_CU, o.liverCopper, 'na');
  if (parts.some((p) => !p) || !liver) {
    return { valid: false, message: 'One of the entries is not a recognized option.' };
  }

  const items = parts.slice(0, 4).map((p) => ({ text: p.text, pts: p.pts }));
  items.push({ text: liver.text, pts: liver.pts });

  // Rhodanine stands IN PLACE OF quantitative liver copper, never alongside it.
  const rhodanine = truthy(o.rhodanineGranules);
  const liverCopperAvailable = String(o.liverCopper == null ? '' : o.liverCopper).trim().toLowerCase() !== 'na'
    && String(o.liverCopper == null ? '' : o.liverCopper).trim() !== '';
  let rhodanineNote = null;
  if (rhodanine && liverCopperAvailable) {
    rhodanineNote = 'Rhodanine-positive granules were entered but are NOT scored: the published table scores them only when no quantitative liver copper is available, so counting both would double-count the same histology.';
  } else if (rhodanine) {
    items.push({ text: 'rhodanine-positive granules, standing in for quantitative liver copper', pts: 1 });
  }

  items.push({ text: parts[4].text, pts: parts[4].pts });
  items.push({ text: parts[5].text, pts: parts[5].pts });

  const score = items.reduce((a, i) => a + i.pts, 0);
  const scoring = items.filter((i) => i.pts !== 0);

  let bandLabel, band, abnormal;
  if (score >= 4) {
    bandLabel = 'Diagnosis established';
    band = `Leipzig score ${score} — 4 or more: diagnosis of Wilson disease established.`;
    abnormal = true;
  } else if (score === 3) {
    bandLabel = 'Diagnosis possible';
    band = `Leipzig score ${score} — exactly 3: diagnosis possible, more tests needed.`;
    abnormal = true;
  } else {
    bandLabel = 'Diagnosis very unlikely';
    band = `Leipzig score ${score} — 2 or fewer: diagnosis very unlikely.`;
    abnormal = false;
  }

  // Worth naming: the score only got below the line because a normal liver copper subtracted.
  const negativeNote = liver.pts < 0
    ? 'A normal quantitative liver copper subtracts a point. It is evidence against the diagnosis, not a neutral result, so the total here is one lower than an add-only reading of the table would give.'
    : null;

  return {
    valid: true,
    score,
    contributions: scoring.map((i) => `${i.text} (${i.pts > 0 ? '+' : ''}${i.pts})`),
    rhodanineCounted: rhodanine && !liverCopperAvailable,
    rhodanineNote,
    negativeNote,
    abnormal,
    bandLabel,
    band,
    detail: 'Bands: 4 or more establishes the diagnosis; exactly 3 makes it possible and calls for further testing; 2 or fewer makes it very unlikely.',
    note: LEIPZIG_NOTE,
  };
}
