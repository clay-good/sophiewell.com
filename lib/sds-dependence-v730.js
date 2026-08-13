// spec-v730: Severity of Dependence Scale (SDS).
//
// A brief 5-item measure of the degree of psychological dependence on a substance. Source:
//   Gossop M, Darke S, Griffiths P, et al. The Severity of Dependence Scale (SDS):
//   psychometric properties of the SDS in English and Australian samples of heroin, cocaine
//   and amphetamine users. Addiction. 1995;90(5):607-614. (PMID 7795497.)
//
// Five items, each scored 0-3 (item 1-4: never/almost never 0 ... always/nearly always 3;
// item 5: not difficult 0 ... impossible 3), summed to a total of 0-15. Higher = greater
// psychological dependence.
//
// Substance-specific screening cutoffs (a total at/above the cutoff suggests dependence):
//   heroin >= 5; cocaine >= 3; amphetamines >= 5; cannabis >= 4; alcohol >= 4.
// For other/unspecified substances no fixed cutoff is applied.
//
// Pure: no DOM, no clock, no network.

export const SDS_NOTE = 'Severity of Dependence Scale (SDS) (Gossop M, Darke S, Griffiths P, et al, Addiction 1995;90(5):607-614), a brief five-item measure of the degree of psychological dependence on a substance. Each item is scored from 0 to 3 - the first four from never or almost never to always or nearly always, and the fifth from not difficult to impossible - and summed to a total of 0 to 15, where higher means greater psychological dependence. Screening cutoffs are substance-specific: a total of 5 or more for heroin, 3 or more for cocaine, 5 or more for amphetamines, 4 or more for cannabis, and 4 or more for alcohol suggests dependence; no fixed cutoff is applied to other substances. It screens the severity of psychological dependence to prompt fuller assessment, it is not a diagnosis, and it supports rather than replaces clinical evaluation.';

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return null;
  return n;
}

const ITEMS = ['outOfControl', 'anxiousMissing', 'worried', 'wishStop', 'difficultyStopping'];
const CUTOFF = { heroin: 5, cocaine: 3, amphetamines: 5, cannabis: 4, alcohol: 4 };

export function sdsDependence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const substance = o.substance;
  if (!(substance === 'heroin' || substance === 'cocaine' || substance === 'amphetamines' || substance === 'cannabis' || substance === 'alcohol' || substance === 'other')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'substance', message: 'Select the substance (heroin, cocaine, amphetamines, cannabis, alcohol, or other).', note: SDS_NOTE };
  }

  let total = 0;
  for (const k of ITEMS) {
    const v = optIn(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate ${k} from 0 to 3.`, note: SDS_NOTE };
    }
    total += v;
  }

  const cutoff = CUTOFF[substance] || null;
  const atCutoff = cutoff !== null && total >= cutoff;

  return {
    valid: true,
    score: total,
    tier: cutoff === null ? 'no-cutoff' : (atCutoff ? 'at-or-above-cutoff' : 'below-cutoff'),
    abnormal: atCutoff,
    substance,
    cutoff,
    bandLabel: `SDS ${total} of 15`,
    band: `SDS ${total} of 15 — ${cutoff === null ? 'higher scores indicate greater dependence (no fixed cutoff for this substance)' : (atCutoff ? `at or above the ${substance} dependence cutoff (>= ${cutoff})` : `below the ${substance} dependence cutoff (>= ${cutoff})`)}.`,
    detail: `Cutoffs: heroin >= 5, cocaine >= 3, amphetamines >= 5, cannabis >= 4, alcohol >= 4. Higher totals indicate greater psychological dependence.`,
    note: SDS_NOTE,
  };
}
