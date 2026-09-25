// spec-v1475: modified RECIST (mRECIST) response for hepatocellular carcinoma, beside recist and
// irecist.
//
// Sources, read 2026-09-25:
//   Lencioni R, Llovet JM. Modified RECIST (mRECIST) assessment for hepatocellular carcinoma. Semin
//     Liver Dis. 2010;30(1):52-60 (doi:10.1055/s-0030-1247132) -- the original, not open.
//   Criteria as stated in open sources that apply it, which agree:
//     World J Radiol 2025, "Hepatocellular carcinoma treatment response: Imaging findings and
//       criteria" (PMC12576714): mRECIST measures "the largest diameter of the viable portion of a
//       target lesion", the portion that enhances in the hepatic arterial phase; "The pretreatment sum
//       of longest diameters of viable target lesions is the reference for defining partial response,
//       while the smallest sum ... since the start of therapy is the reference for evaluating disease
//       progression"; "current AASLD and EASL guidelines recommend applying mRECIST to evaluate tumor
//       response to locoregional therapies".
//     Cancers (Basel) 2026 (PMC13072226), table: CR "Disappearance of intratumoral arterial
//       enhancement in all target lesions"; PR 30% decrease in the sum of diameters of viable
//       (arterial enhancing) target lesions, baseline as reference; PD 20% increase, "taking as
//       reference the smallest sum ... since treatment started"; SD neither.
//     Korean J Radiol 2026 (PMC13136576): new hepatic lesions count as progression "only if they
//       demonstrate a typical HCC enhancement pattern (arterial enhancement followed by washout in the
//       portal/delayed phase)".
//   Most studies state the thresholds as "at least" 30% and 20%. Some add the RECIST 1.1 rule that
//   progression also needs an absolute increase of at least 5 mm (J Immunother Cancer 2026,
//   PMC13084789); most do not. The tile applies the 20% rule and says when the 5 mm rule would
//   change the answer.
//
// Consumes entered diameters of the ENHANCING tumor; it does not measure a scan. Pure: no DOM, no
// clock, no network.

import { inputFault } from './num.js';

const MAX_MM = 10000;
const truthy = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes';
const r1 = (x) => Math.round(x * 10) / 10;

export function mrecist(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the baseline sum of viable target-lesion diameters', o.baseline, 0, MAX_MM, 'mm'],
    ['the current sum of viable target-lesion diameters', o.current, 0, MAX_MM, 'mm'],
    ['the smallest sum since treatment started (nadir)', o.nadir, 0, MAX_MM, 'mm'],
  ]);
  if (fault) return { valid: false, message: fault };
  const baseline = Number(o.baseline);
  const current = Number(o.current);
  const nadir = Number(o.nadir);
  if (baseline <= 0) return { valid: false, message: 'Enter a baseline sum of viable diameters above 0 mm: mRECIST starts from enhancing tumor.' };
  if (nadir > baseline) return { valid: false, message: 'Enter the nadir again: it is the smallest sum since treatment started, so it cannot exceed the baseline sum.' };
  const newLesion = truthy(o.newLesion);
  const nonTarget = truthy(o.nonTarget);

  const rawBaseline = ((current - baseline) / baseline) * 100;
  const rawNadir = nadir > 0 ? ((current - nadir) / nadir) * 100 : 0;
  if (!Number.isFinite(rawBaseline) || !Number.isFinite(rawNadir)) {
    return { valid: false, message: 'Enter the sums again: these give a percentage change too large to read, which a measured tumor does not.' };
  }
  const pctBaseline = r1(rawBaseline);
  // A nadir of 0 (a complete response earlier) makes any regrowth an infinite percentage; the
  // regrowth itself is then the progression.
  const pctNadir = nadir > 0 ? r1(rawNadir) : (current > 0 ? Infinity : 0);
  const absNadir = r1(current - nadir);
  const sizePd = pctNadir >= 20;

  let cat; let label; let rule;
  if (newLesion || nonTarget || sizePd) {
    cat = 'PD'; label = 'Progressive disease (PD)';
    rule = newLesion ? 'a new lesion with the typical HCC enhancement pattern'
      : nonTarget ? 'unequivocal progression of non-target lesions'
        : nadir > 0 ? `a ${pctNadir}% increase in the viable sum from the nadir of ${nadir} mm`
          : `enhancing tumor has reappeared after the viable sum reached 0 mm`;
  } else if (current === 0) {
    cat = 'CR'; label = 'Complete response (CR)';
    rule = 'no intratumoral arterial enhancement remains in any target lesion (viable sum 0 mm)';
  } else if (pctBaseline <= -30) {
    cat = 'PR'; label = 'Partial response (PR)';
    rule = `a ${Math.abs(pctBaseline)}% decrease in the viable sum from the baseline of ${baseline} mm`;
  } else {
    cat = 'SD'; label = 'Stable disease (SD)';
    rule = `a ${Math.abs(pctBaseline)}% ${pctBaseline <= 0 ? 'decrease' : 'increase'} from baseline, short of a 30% decrease, and less than a 20% increase from the nadir`;
  }

  const notes = [
    'mRECIST measures only the viable, arterially enhancing part of each target lesion; a necrotic or non-enhancing part is not counted, which is where it differs from RECIST 1.1.',
    'A new liver lesion counts as progression only when it shows the typical HCC pattern: arterial enhancement followed by washout in the portal or delayed phase.',
  ];
  if (cat === 'PD' && !newLesion && !nonTarget && nadir > 0 && absNadir < 5) {
    notes.push(`The increase from the nadir is ${absNadir} mm. Some studies also require an absolute increase of at least 5 mm, as RECIST 1.1 does; under that rule this would not yet be progression.`);
  }
  notes.push('Guidelines (AASLD, EASL) recommend mRECIST for response to locoregional therapy, such as chemoembolization.');

  return {
    valid: true,
    category: cat,
    pctBaseline,
    pctNadir: Number.isFinite(pctNadir) ? pctNadir : null,
    abnormal: cat === 'PD',
    band: `${label}: ${rule}.`,
    bandLabel: label,
    notes,
    note: 'Lencioni R, Llovet JM, Semin Liver Dis 2010; criteria as stated in World J Radiol 2025 and Cancers (Basel) 2026. It reads entered diameters of the enhancing tumor; it does not measure a scan, and the response category is not a treatment decision.',
  };
}
