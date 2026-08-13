// spec-v724: Miller classification of gingival recession.
//
// Classifies marginal-tissue (gingival) recession and predicts the achievable root coverage.
// Source:
//   Miller PD Jr. A classification of marginal tissue recession. Int J Periodontics
//   Restorative Dent. 1985;5(2):8-13. (PMID 3858267.)
//
// Decision logic on (a) whether recession reaches the mucogingival junction (MGJ) and (b) the
// interdental bone / soft-tissue loss:
//   Class I   = recession does NOT extend to the MGJ; no interdental loss -> 100% coverage anticipated
//   Class II  = recession extends to or beyond the MGJ; no interdental loss -> 100% coverage
//   Class III = recession to/beyond MGJ + interdental loss that is apical to the CEJ but coronal
//               to the apical extent of the recession -> partial coverage anticipated
//   Class IV  = recession to/beyond MGJ + interdental bone loss to a level apical to the
//               recession -> no root coverage anticipated
//
// Returns the class code and the anticipated root coverage. Pure: no DOM, no clock, no network.

export const MILLER_RECESSION_NOTE = 'Miller classification of gingival (marginal-tissue) recession (Miller PD Jr, Int J Periodontics Restorative Dent 1985;5(2):8-13), which predicts the root coverage achievable by a mucogingival procedure. It depends on whether the recession reaches the mucogingival junction and on the interdental bone and soft-tissue loss. Class I is recession that does not reach the mucogingival junction with no interdental loss, and Class II is recession that reaches or passes the junction with no interdental loss; both anticipate 100 percent root coverage. Class III adds interdental loss that is apical to the cemento-enamel junction but still coronal to the apical extent of the recession, so only partial coverage is anticipated. Class IV has interdental bone loss to a level apical to the recession, so no root coverage is anticipated. It classifies the defect to guide the prognosis and surgical plan and does not by itself prescribe a technique; it supports rather than replaces the periodontal assessment and clinical judgment.';

const CLASS = {
  I: { label: 'recession not reaching the MGJ, no interdental loss', coverage: '100% root coverage anticipated' },
  II: { label: 'recession to/beyond the MGJ, no interdental loss', coverage: '100% root coverage anticipated' },
  III: { label: 'interdental loss coronal to the apical extent of recession', coverage: 'partial root coverage anticipated' },
  IV: { label: 'interdental bone loss apical to the recession', coverage: 'no root coverage anticipated' },
};

export function millerGingivalRecession(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const loss = o.interdentalLoss;
  if (!(loss === 'none' || loss === 'coronal' || loss === 'apical')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'interdentalLoss', message: 'Select the interdental bone / soft-tissue loss (none, coronal to the recession, or apical to it).', note: MILLER_RECESSION_NOTE };
  }

  let cls;
  if (loss === 'coronal') cls = 'III';
  else if (loss === 'apical') cls = 'IV';
  else {
    // no interdental loss -> Class I or II by whether recession reaches the MGJ
    if (!(o.recessionExtent === 'not-to-mgj' || o.recessionExtent === 'to-or-beyond-mgj')) {
      return { valid: false, code: 'MISSING_INPUT', field: 'recessionExtent', message: 'With no interdental loss, select whether the recession reaches the mucogingival junction.', note: MILLER_RECESSION_NOTE };
    }
    cls = o.recessionExtent === 'not-to-mgj' ? 'I' : 'II';
  }

  const c = CLASS[cls];
  const advanced = cls === 'III' || cls === 'IV';
  return {
    valid: true,
    millerClass: cls,
    tier: `class-${cls.toLowerCase()}`,
    abnormal: advanced,
    coverage: c.coverage,
    bandLabel: `Miller Class ${cls}`,
    band: `Miller Class ${cls} — ${c.coverage}.`,
    detail: `${c.label}. Class I/II 100% coverage; Class III partial; Class IV none.`,
    note: MILLER_RECESSION_NOTE,
  };
}
