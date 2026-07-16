// spec-v349: Fazekas scale for white matter hyperintensities (WMH) on brain MRI — the standard visual
// rating of age-related / small-vessel-disease white matter change, rated SEPARATELY for the
// periventricular (PVH, 0-3) and deep white matter (DWMH, 0-3) regions. The catalog carries the
// Marshall CT (traumatic brain injury) classification and many stroke scores but had no Fazekas WMH
// rating. "fazekas scale" / "white matter hyperintensity grade" routed to nothing.
//
// HIGH-STAKES: this reports the Fazekas GRADES the radiologist has determined from the MRI, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). WMH
// burden is interpreted in the clinical context (age, vascular risk, cognition); the grade alone is
// not a diagnosis of small vessel disease or dementia. The interpretation stays with the clinician.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Fazekas F, Chawluk JB, Alavi A, Hurtig HI, Zimmerman RA. MR signal abnormalities at 1.5 T in
//     Alzheimer's dementia and normal aging. AJR Am J Roentgenol. 1987;149(2):351-356 (the scale).
//   - Neuroradiology references (Radiopaedia / stroke-imaging reviews) reproducing the same PVH and
//     DWMH 0-3 definitions (FLAIR is the preferred sequence).
//
// Periventricular hyperintensity (PVH), adjacent to the ventricle surface:
//   0 absent; 1 caps or a pencil-thin periventricular lining; 2 smooth halo; 3 irregular PVH
//   extending into the deep white matter.
// Deep white matter hyperintensity (DWMH), away from the ventricle:
//   0 absent; 1 punctate foci; 2 beginning confluence of foci; 3 large confluent areas.

const PVH = {
  0: 'absent',
  1: 'caps or a pencil-thin periventricular lining',
  2: 'a smooth periventricular halo',
  3: 'irregular periventricular hyperintensity extending into the deep white matter',
};
const DWMH = {
  0: 'absent',
  1: 'punctate foci',
  2: 'beginning confluence of foci',
  3: 'large confluent areas',
};

const NOTE = 'The Fazekas scale (Fazekas 1987) rates white matter hyperintensities on brain MRI (FLAIR preferred) separately for the periventricular (PVH) and deep white matter (DWMH) regions, each 0-3. PVH: 0 absent, 1 caps / thin lining, 2 smooth halo, 3 irregular extension into deep white matter. DWMH: 0 absent, 1 punctate foci, 2 beginning confluence, 3 large confluent areas. Higher grades indicate a greater white-matter-disease burden, interpreted in the clinical context (age, vascular risk, cognition); the grade alone is not a diagnosis of small vessel disease or dementia. This reports the grades the radiologist has determined, not a diagnosis, a treatment decision, or a prognosis.';

function grade(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 3) return null;
  return n;
}

// input:
//   pvh:  periventricular hyperintensity grade 0-3
//   dwmh: deep white matter hyperintensity grade 0-3
export function fazekas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = grade(o.pvh);
  const d = grade(o.dwmh);
  if (p === null || d === null) {
    return { valid: false, message: 'Select both Fazekas grades: periventricular (PVH) and deep white matter (DWMH), each 0-3.' };
  }
  const total = p + d;
  const abnormal = p >= 2 || d >= 2;
  return {
    valid: true,
    pvh: p,
    dwmh: d,
    total,
    abnormal,
    bandLabel: `Fazekas PVH ${p} / DWMH ${d}`,
    band: `Fazekas periventricular (PVH) grade ${p} - ${PVH[p]}; deep white matter (DWMH) grade ${d} - ${DWMH[d]} (combined ${total} of 6).`,
    note: NOTE,
  };
}
