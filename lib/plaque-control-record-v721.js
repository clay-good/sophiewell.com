// spec-v721: Plaque Control Record (O'Leary index).
//
// The percentage of tooth surfaces with detectable plaque at the gingival margin, used to
// track a patient's oral-hygiene performance. Source:
//   O'Leary TJ, Drake RB, Naylor JE. The plaque control record. J Periodontol.
//   1972;43(1):38. (PMID 4500182.)
//
//   Plaque Control Record (%) = (plaque-positive surfaces / total surfaces examined) x 100
//     total surfaces = 4 surfaces (mesial, distal, buccal, lingual) x number of teeth present
//
// A record of 10% or less is generally taken as good plaque control; higher indicates a need
// to improve oral hygiene (some references use a 20% target).
//
// Pure: no DOM, no clock, no network.

export const PLAQUE_CONTROL_NOTE = "Plaque Control Record (O'Leary TJ, Drake RB, Naylor JE, J Periodontol 1972;43(1):38), the percentage of tooth surfaces with detectable plaque at the gingival margin. After disclosing, each tooth is examined on four surfaces - mesial, distal, buccal, and lingual - so the total number of surfaces is four times the number of teeth present. The record equals the plaque-positive surfaces divided by the total surfaces, multiplied by 100. A record of 10 percent or less is generally taken as good plaque control, while a higher value indicates a need to improve oral hygiene, and some references use a 20 percent target. It measures oral-hygiene performance to guide instruction and monitoring over time, not to diagnose periodontal disease, and it supports rather than replaces the clinical dental and periodontal examination.";

function count(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

export function plaqueControlRecord(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const teeth = count(o.teethPresent);
  if (!Number.isInteger(teeth) || teeth <= 0 || teeth > 32) {
    return { valid: false, code: 'MISSING_INPUT', field: 'teethPresent', message: 'Enter the number of teeth present (1-32).', note: PLAQUE_CONTROL_NOTE };
  }
  const positive = count(o.plaqueSurfaces);
  if (!Number.isInteger(positive) || positive < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'plaqueSurfaces', message: 'Enter the number of plaque-positive surfaces.', note: PLAQUE_CONTROL_NOTE };
  }

  const totalSurfaces = teeth * 4;
  if (positive > totalSurfaces) {
    return { valid: false, code: 'INVALID_INPUT', field: 'plaqueSurfaces', message: 'Plaque-positive surfaces cannot exceed 4 x teeth present.', note: PLAQUE_CONTROL_NOTE };
  }

  const pct = (positive / totalSurfaces) * 100;
  const rounded = Math.round(pct * 10) / 10;
  const good = pct <= 10;

  return {
    valid: true,
    percent: rounded,
    tier: good ? 'good' : 'needs-improvement',
    abnormal: !good,
    totalSurfaces,
    bandLabel: `Plaque record ${rounded}%`,
    band: `Plaque Control Record ${rounded}% — ${good ? 'good plaque control' : 'above the 10% goal; improve oral hygiene'}.`,
    detail: `${positive} plaque-positive of ${totalSurfaces} surfaces (4 x ${teeth} teeth). Goal <= 10% (some references use 20%).`,
    note: PLAQUE_CONTROL_NOTE,
  };
}
