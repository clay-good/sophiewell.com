// spec-v647: Schenck (anatomic) classification of knee dislocations (KD-I..KD-V).
//
// A decision-logic classifier, not a score: it maps which ligaments are torn (and
// whether a periarticular fracture is present) to a KD grade, with C (arterial) and
// N (neurologic) modifiers. Source:
//   Schenck RC Jr. The dislocated knee. Instr Course Lect. 1994;43:127-136 (original
//   four-grade anatomic system). Wascher DC et al. 1997 added KD-V and the C/N
//   modifiers. Stannard later added the KD-V.1-.4 ligament subgrades.
//
// Grades: KD-I one cruciate torn (variable collateral); KD-II both cruciates,
// collaterals intact; KD-III both cruciates + one collateral (IIIM medial / IIIL
// lateral); KD-IV both cruciates + both collaterals; KD-V knee dislocation with a
// periarticular fracture. Two nuances handled per spec-v97: the Stannard KD-V.1-.4
// subgrade is inconsistently reported, so this reports BASE KD-V and names the
// omission; and KD-I strictly requires a documented tibiofemoral dislocation, so the
// note says the grade is inferred from the entered structures.
//
// Pure: no DOM, no clock, no network.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

export const SCHENCK_NOTE = 'Schenck anatomic classification of knee dislocations (Schenck RC Jr, Instr Course Lect 1994;43:127-136; KD-V and the C/N modifiers added by Wascher DC et al 1997). It maps the torn structures to a grade: KD-I one cruciate torn with variable collateral involvement; KD-II both cruciates torn with both collaterals intact; KD-III both cruciates plus one collateral corner (KD-IIIM medial, KD-IIIL lateral); KD-IV both cruciates plus both collaterals; KD-V a knee dislocation with a periarticular fracture. A "C" suffix marks an arterial (popliteal) injury and an "N" suffix a neurologic (commonly peroneal) injury, e.g. KD-IIIL-C-N. Two cautions: this grade is INFERRED from the structures you enter, and true KD-I requires a DOCUMENTED tibiofemoral dislocation, not merely a ligament pattern; and KD-V has a Stannard .1-.4 ligament subgrade that is inconsistently reported, so only the base KD-V is given here. It classifies the injury; the treatment plan and the urgent vascular assessment stay with the surgeon.';

export function schenckKnee(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const acl = onFlag(o.aclTorn);
  const pcl = onFlag(o.pclTorn);
  const medial = onFlag(o.medialTorn);
  const lateral = onFlag(o.lateralTorn);
  const fracture = onFlag(o.fracture);
  const arterial = onFlag(o.arterial);
  const nerve = onFlag(o.nerve);

  const cruc = (acl ? 1 : 0) + (pcl ? 1 : 0);
  const coll = (medial ? 1 : 0) + (lateral ? 1 : 0);

  let grade = null;
  if (fracture) {
    grade = 'KD-V';
  } else if (cruc === 0) {
    // No cruciate torn and no fracture: not a Schenck KD pattern.
    return {
      valid: true,
      classified: false,
      grade: null,
      abnormal: false,
      bandLabel: 'Not a Schenck KD pattern',
      detail: 'A knee dislocation in this system requires at least one torn cruciate, or a periarticular fracture for KD-V. Enter the torn structures.',
      note: SCHENCK_NOTE,
    };
  } else if (cruc === 1) {
    grade = 'KD-I';
  } else { // both cruciates
    if (coll === 0) grade = 'KD-II';
    else if (coll === 1) grade = medial ? 'KD-IIIM' : 'KD-IIIL';
    else grade = 'KD-IV';
  }

  const modifiers = `${arterial ? '-C' : ''}${nerve ? '-N' : ''}`;
  const gradeFull = grade + modifiers;
  const torn = [];
  if (acl) torn.push('ACL');
  if (pcl) torn.push('PCL');
  if (medial) torn.push('medial (MCL/PMC)');
  if (lateral) torn.push('lateral (LCL/PLC)');
  const bits = [];
  if (torn.length) bits.push(`torn: ${torn.join(', ')}`);
  if (fracture) bits.push('periarticular fracture');
  if (arterial) bits.push('arterial injury (C)');
  if (nerve) bits.push('neurologic injury (N)');

  return {
    valid: true,
    classified: true,
    grade,
    gradeFull,
    abnormal: true,
    bandLabel: `Schenck ${gradeFull}`,
    detail: (bits.join('; ') || 'no structures entered') + (grade === 'KD-V' ? '. Base KD-V; the Stannard ligament subgrade is not computed.' : '.'),
    note: SCHENCK_NOTE,
  };
}
