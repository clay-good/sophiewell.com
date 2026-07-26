// spec-v498: the Narakas classification of obstetric brachial plexus palsy (groups I-IV), by which nerve
// roots are involved. It joins the nerve tiles: seddon-sunderland grades the DEGREE of injury to a nerve
// (neurapraxia through neurotmesis); Narakas describes the EXTENT of a birth-related plexus lesion. "narakas"
// / "brachial plexus" routed to nothing - the plexus was uncovered entirely.
//
// HIGH-STAKES: this reports the GROUP the clinician has determined from the examination, NOT a diagnosis, a
// decision to operate or refer for nerve reconstruction, and NOT a recovery prediction for an individual
// infant (spec-v11 section 5.3). The management decision stays with the brachial-plexus team.
//
// GROUPS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Narakas AO. Obstetrical brachial plexus injuries. In: Lamb DW, ed. The Paralysed Hand. Edinburgh:
//     Churchill Livingstone; 1987:116-135.
//   - Pediatric brachial-plexus references reproducing the same C5-C6 (I) / C5-C7 (II) / C5-T1 (III) /
//     C5-T1-with-Horner (IV) grouping.
//
// Groups (increasing extent of root involvement):
//   I   : C5-C6 - the upper trunk (Erb palsy): shoulder abduction and elbow flexion affected.
//   II  : C5-C7 - group I plus wrist and finger extension affected.
//   III : C5-T1 - the whole plexus, a complete flaccid limb, without Horner syndrome.
//   IV  : C5-T1 with Horner syndrome - the whole plexus with a sympathetic-chain lesion.

const GROUPS = {
  I: { group: 'I', text: 'Narakas group I - C5-C6, the upper trunk (Erb palsy): shoulder abduction and elbow flexion are affected.' },
  II: { group: 'II', text: 'Narakas group II - C5-C7: the group I deficits plus affected wrist and finger extension.' },
  III: { group: 'III', text: 'Narakas group III - C5-T1: the whole plexus, a complete flaccid limb, without Horner syndrome.' },
  IV: { group: 'IV', text: 'Narakas group IV - C5-T1 with Horner syndrome: the whole plexus together with a sympathetic-chain lesion.' },
};

const NOTE = 'The Narakas classification (Narakas 1987) groups obstetric brachial plexus palsy by which nerve roots are involved, in increasing extent. I: C5-C6, the upper trunk (Erb palsy). II: C5-C7, adding wrist and finger extension. III: C5-T1, a complete flaccid limb without Horner syndrome. IV: C5-T1 with Horner syndrome. This reports the group the clinician has determined from the examination, not a diagnosis, a decision to refer for nerve reconstruction, or a recovery prediction for an individual infant.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   group: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function narakasObpp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.group == null ? '' : o.group).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GROUPS[key];
  if (!g) {
    return { valid: false, message: 'Select the Narakas group (I, II, III, or IV).' };
  }
  return {
    valid: true,
    group: g.group,
    bandLabel: `Narakas group ${g.group}`,
    band: g.text,
    note: NOTE,
  };
}
