// spec-v672: Minimal Disease Activity (MDA) in psoriatic arthritis.
//
// Companion to the built psoriatic-arthritis tiles (dapsa, caspar, pest). MDA is a
// treat-to-target state defined by meeting at least 5 of 7 objective criteria; meeting
// all 7 is Very Low Disease Activity (VLDA). Source:
//   Coates LC, Fransen J, Helliwell PS. Defining minimal disease activity in psoriatic
//   arthritis: a proposed objective target for treatment. Ann Rheum Dis.
//   2010;69(1):48-53. PMID 19147615.
//
// The 7 criteria (each is a documented threshold the user confirms as met):
//   1. tender joint count (68) <= 1
//   2. swollen joint count (66) <= 1
//   3. PASI <= 1 OR body surface area <= 3%
//   4. patient pain VAS <= 15 (0-100 mm scale)
//   5. patient global disease-activity VAS <= 20 (0-100 mm scale)
//   6. HAQ <= 0.5
//   7. tender entheseal points <= 1
// PASI/HAQ are themselves scored instruments and the skin item is an OR, so each
// criterion is entered as met/not-met rather than recomputed here. MDA does not use
// acute-phase reactants or axial activity.
//
// Pure: no DOM, no clock, no network.

export const MDA_NOTE = 'Minimal Disease Activity (MDA) in psoriatic arthritis (Coates LC, Fransen J, Helliwell PS, Ann Rheum Dis 2010;69(1):48-53). A patient is in MDA when at least 5 of 7 criteria are met: tender joint count (68-joint) 1 or fewer, swollen joint count (66-joint) 1 or fewer, PASI 1 or less or body surface area 3% or less, patient pain 15 or less on a 0-100 mm scale, patient global disease activity 20 or less on a 0-100 mm scale, HAQ 0.5 or less, and tender entheseal points 1 or fewer. Meeting all 7 is Very Low Disease Activity (VLDA), a more stringent target. The pain and global scores are on 0-100 mm visual-analogue scales (not 0-10). MDA deliberately excludes acute-phase reactants and axial disease. Because PASI and HAQ are themselves scored instruments and the skin item is an either/or, each criterion is confirmed as met or not rather than recomputed here. MDA is a treatment target to inform care, not by itself an order to change therapy.';

const CRITERIA = [
  { key: 'tjc', label: 'tender joint count (68) <= 1' },
  { key: 'sjc', label: 'swollen joint count (66) <= 1' },
  { key: 'skin', label: 'PASI <= 1 or BSA <= 3%' },
  { key: 'pain', label: 'patient pain VAS <= 15 (0-100)' },
  { key: 'global', label: 'patient global VAS <= 20 (0-100)' },
  { key: 'haq', label: 'HAQ <= 0.5' },
  { key: 'entheses', label: 'tender entheseal points <= 1' },
];

function onFlag(v) {
  return v === true || v === 1 || v === '1' || v === 'on';
}

export function mdaPsoriatic(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const met = [];
  const unmet = [];
  for (const c of CRITERIA) {
    if (onFlag(o[c.key])) met.push(c.label); else unmet.push(c.label);
  }
  const count = met.length;
  const mda = count >= 5;
  const vlda = count === 7;

  return {
    valid: true,
    count,
    mda,
    vlda,
    // Highlight when NOT in minimal disease activity (residual active disease).
    abnormal: !mda,
    met,
    unmet,
    band: vlda
      ? `MDA ${count}/7 — Very Low Disease Activity (VLDA): all 7 criteria met.`
      : (mda
          ? `MDA ${count}/7 — in Minimal Disease Activity (>= 5 of 7).`
          : `MDA ${count}/7 — not in Minimal Disease Activity (needs >= 5 of 7).`),
    detail: unmet.length ? `Criteria not met: ${unmet.join(', ')}.` : 'All 7 criteria met.',
    note: MDA_NOTE,
  };
}
