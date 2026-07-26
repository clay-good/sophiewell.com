// spec-v464: the Crawford classification of thoracoabdominal aortic aneurysms (TAAA), by the extent of aortic
// involvement — extents I / II / III / IV. It is the standard extent classification for open/endovascular
// TAAA planning and companions the DeBakey dissection tile. "crawford" / "thoracoabdominal aortic aneurysm
// extent" routed to nothing.
//
// HIGH-STAKES: this reports the anatomic EXTENT the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the vascular / cardiac-surgery team.
//
// EXTENTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Crawford ES, Crawford JL, Safi HJ, et al. Thoracoabdominal aortic aneurysms: preoperative and
//     intraoperative factors determining immediate and long-term results of operations in 605 patients.
//     J Vasc Surg. 1986;3(3):389-404.
//   - Vascular-surgery references reproducing the same four extents; the Safi modification later added an
//     extent V (distal descending thoracic to above the renal arteries), noted here but out of scope.
//
// Extents (aortic segment involved):
//   I   : from just distal to the left subclavian artery to above the renal arteries (most of the descending
//         thoracic aorta plus the upper abdominal / visceral segment).
//   II  : from just distal to the left subclavian artery to below the renal arteries (the aortoiliac
//         bifurcation) - the most extensive, involving the entire thoracoabdominal aorta.
//   III : from the sixth intercostal space (distal descending thoracic aorta) to below the renal arteries.
//   IV  : the entire abdominal aorta, from the twelfth intercostal space (diaphragm) to the aortoiliac
//         bifurcation.

const EXTENTS = {
  I: { extent: 'I', text: 'Crawford extent I - from just distal to the left subclavian artery to above the renal arteries (most of the descending thoracic aorta plus the upper abdominal / visceral segment).' },
  II: { extent: 'II', text: 'Crawford extent II - from just distal to the left subclavian artery to below the renal arteries (the aortoiliac bifurcation); the most extensive, involving the entire thoracoabdominal aorta.' },
  III: { extent: 'III', text: 'Crawford extent III - from the sixth intercostal space (distal descending thoracic aorta) to below the renal arteries.' },
  IV: { extent: 'IV', text: 'Crawford extent IV - the entire abdominal aorta, from the twelfth intercostal space (diaphragm) to the aortoiliac bifurcation.' },
};

const NOTE = 'The Crawford classification (Crawford 1986) groups thoracoabdominal aortic aneurysms by extent. I: left subclavian to above the renals. II: left subclavian to the aortoiliac bifurcation (most extensive). III: distal descending thoracic (sixth intercostal space) to below the renals. IV: the entire abdominal aorta (diaphragm to bifurcation). The Safi modification adds an extent V (distal descending thoracic to above the renals). This reports the extent the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   extent: 'I'..'IV' (case-insensitive; also accepts 1-4).
export function crawfordTaaa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.extent == null ? '' : o.extent).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const e = EXTENTS[key];
  if (!e) {
    return { valid: false, message: 'Select the Crawford extent (I, II, III, or IV).' };
  }
  return {
    valid: true,
    extent: e.extent,
    bandLabel: `Crawford extent ${e.extent}`,
    band: e.text,
    note: NOTE,
  };
}
