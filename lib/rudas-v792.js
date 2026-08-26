// spec-v792: RUDAS (Rowland Universal Dementia Assessment Scale).
//
// Source:
//   Storey JE, Rowland JTJ, Basic D, Conforti DA, Dickson HG. The Rowland Universal
//   Dementia Assessment Scale (RUDAS): a multicultural cognitive assessment scale.
//   Int Psychogeriatr. 2004;16(1):13-31. (PMID 15190994.)
//
// Six items with DIFFERENT maxima, summing to exactly 30:
//   memory            0-8
//   body orientation  0-5
//   praxis            0-2
//   drawing           0-3
//   judgement         0-4
//   language          0-8
//
// Higher is better. A total of 22 or less is possible cognitive impairment and
// warrants further investigation - the 22/23 cut point, at which the original
// multi-ethnic validation reported about 89% sensitivity and 98% specificity.
//
// The point of this scale is that it was built to be minimally affected by culture,
// language and education, which is where MMSE and MoCA lose accuracy. It is also free
// to use, where those two are not.
//
// Pure: no DOM, no clock, no network.

export const RUDAS_NOTE = 'The Rowland Universal Dementia Assessment Scale (Storey JE, Rowland JTJ, Basic D, Conforti DA, Dickson HG, Int Psychogeriatr 2004;16(1):13-31) is a cognitive screen built to be minimally affected by culture, language and education, which is where the more familiar screens lose accuracy, and it is free to use where several of them are not. Six items carry different maxima and add to exactly 30: memory out of 8, body orientation out of 5, praxis out of 2, drawing out of 3, judgement out of 4, and language out of 8. Unlike the 6CIT, higher is better here. A total of 22 or less counts as possible cognitive impairment and should prompt further investigation, the cut point at which the original multi-ethnic validation reported about 89 percent sensitivity and 98 percent specificity. It is a screening test that flags the need for a fuller assessment; it does not diagnose dementia or identify its cause.';

const ITEMS = [
  { arg: 'memory', max: 8, label: 'memory' },
  { arg: 'bodyOrientation', max: 5, label: 'body orientation' },
  { arg: 'praxis', max: 2, label: 'praxis' },
  { arg: 'drawing', max: 3, label: 'drawing' },
  { arg: 'judgement', max: 4, label: 'judgement' },
  { arg: 'language', max: 8, label: 'language' },
];

export const MAX_TOTAL = ITEMS.reduce((n, i) => n + i.max, 0);

function optIn(v, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > max) return undefined;
  return n;
}

export function rudas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  const parts = [];
  for (const it of ITEMS) {
    const v = optIn(o[it.arg], it.max);
    if (v === undefined) {
      return { valid: false, code: 'INVALID_INPUT', field: it.arg, message: `Score ${it.label} from 0 to ${it.max}.`, note: RUDAS_NOTE };
    }
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: it.arg, message: `Score ${it.label} from 0 to ${it.max}.`, note: RUDAS_NOTE };
    }
    total += v;
    parts.push(`${it.label} ${v}/${it.max}`);
  }

  const impaired = total <= 22;
  return {
    valid: true,
    score: total,
    parts,
    tier: impaired ? 'possible-impairment' : 'above-cutoff',
    abnormal: impaired,
    bandLabel: `RUDAS ${total} of ${MAX_TOTAL}`,
    band: `RUDAS ${total} of ${MAX_TOTAL} — ${impaired ? 'possible cognitive impairment, refer for further investigation' : 'above the 22 cut point'}.`,
    detail: 'Six items with different maxima adding to 30: memory 8, body orientation 5, praxis 2, drawing 3, judgement 4, language 8. Higher is better. A total of 22 or less is possible cognitive impairment; at that cut point the original validation reported about 89 percent sensitivity and 98 percent specificity.',
    note: RUDAS_NOTE,
  };
}
