// spec-v330: Nottingham Prognostic Index (NPI) for early invasive breast cancer. Combines
// tumor size, lymph-node stage, and histologic grade into a single prognostic score. The
// catalog carries many prognostic indices (CLL-IPI, FLIPI-2, MIPI, PPI, ...) and the
// gleason-grade-group tile but had no Nottingham Prognostic Index ("nottingham" was absent;
// the "NPI" tile is the billing National-Provider-Identifier validator). "nottingham
// prognostic index" / "breast cancer prognosis" routed to nothing.
//
// HIGH-STAKES: this reports the CITED PROGNOSTIC SCORE and group from the inputs, NOT a
// diagnosis or a treatment order (spec-v11 §5.3). The adjuvant-therapy decision stays with
// the multidisciplinary team.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Haybittle JL, Blamey RW, Elston CW, et al. A prognostic index in primary breast
//     cancer. Br J Cancer. 1982;45(3):361-366 (the original index).
//   - Galea MH, Blamey RW, Elston CE, Ellis IO. The Nottingham Prognostic Index in primary
//     breast cancer. Breast Cancer Res Treat. 1992;22(3):207-219 (the prognostic groups).
//
// NPI = (0.2 x tumor size in cm) + lymph-node stage + histologic grade.
//   Node stage : 1 = 0 nodes; 2 = 1-3 positive nodes; 3 = >= 4 positive nodes.
//   Grade      : 1 = grade I; 2 = grade II; 3 = grade III (Nottingham / Elston-Ellis).
// Prognostic groups: excellent <= 2.4 (~93% 5-yr survival), good > 2.4 to <= 3.4 (~85%),
//   moderate > 3.4 to <= 5.4 (~70%), poor > 5.4 (~50%).

function toNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

const NOTE = 'Nottingham Prognostic Index (NPI; Haybittle 1982 / Galea 1992) for early invasive breast cancer. NPI = (0.2 x tumor size in cm) + lymph-node stage + histologic grade. Node stage: 1 = 0 nodes, 2 = 1-3 positive, 3 = >= 4 positive. Grade: 1/2/3 (Nottingham / Elston-Ellis). Prognostic groups: excellent <= 2.4 (~93% 5-year survival), good > 2.4 to <= 3.4 (~85%), moderate > 3.4 to <= 5.4 (~70%), poor > 5.4 (~50%). This reports the cited prognostic score and group computed from the pathology entered, not a diagnosis or a treatment order; the adjuvant-therapy decision stays with the multidisciplinary team.';

// input:
//   size: number, tumor size in cm
//   nodeStage: 1 | 2 | 3
//   grade: 1 | 2 | 3
export function nottinghamNpi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const size = toNum(o.size);
  const node = toNum(o.nodeStage);
  const grade = toNum(o.grade);

  if (size === null || Number.isNaN(size) || size < 0) {
    return { valid: false, message: 'Enter the tumor size in cm (e.g. 2.5).' };
  }
  if (![1, 2, 3].includes(node)) {
    return { valid: false, message: 'Select the lymph-node stage (1 = 0 nodes, 2 = 1-3, 3 = >= 4).' };
  }
  if (![1, 2, 3].includes(grade)) {
    return { valid: false, message: 'Select the histologic grade (1, 2, or 3).' };
  }

  const raw = 0.2 * size + node + grade;
  const npi = Math.round(raw * 100) / 100;

  let group, survival;
  if (npi <= 2.4) { group = 'excellent'; survival = '~93% 5-year survival'; }
  else if (npi <= 3.4) { group = 'good'; survival = '~85% 5-year survival'; }
  else if (npi <= 5.4) { group = 'moderate'; survival = '~70% 5-year survival'; }
  else { group = 'poor'; survival = '~50% 5-year survival'; }

  const bandRange = group === 'excellent' ? '<= 2.4'
    : group === 'good' ? '> 2.4 to <= 3.4'
    : group === 'moderate' ? '> 3.4 to <= 5.4'
    : '> 5.4';

  return {
    valid: true,
    npi,
    group,
    size,
    nodeStage: node,
    grade,
    abnormal: npi > 3.4,
    bandLabel: `NPI ${npi} (${group})`,
    band: `Nottingham Prognostic Index ${npi} — ${group} prognosis (${bandRange}; ${survival}).`,
    note: NOTE,
  };
}
