// spec-v4 §5 utility 111: Birthday rule resolver for two-parent dependent
// coverage. Pure decision logic; the renderer wires this to the form.
//
// Order of precedence:
//   1. Court order assigning responsibility for child's healthcare.
//   2. Custodial parent's plan in cases of separation/divorce, then the
//      custodial parent's spouse's plan.
//   3. The "birthday rule": parent whose birthday (month + day, year ignored)
//      falls earliest in the calendar year is primary.
//   4. If both parents share the same month/day, the plan that has covered
//      the parent longer is primary (caller supplies plan-tenure dates if
//      needed).

function monthDay(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) throw new RangeError('date must be YYYY-MM-DD');
  return { month: Number(m[2]), day: Number(m[3]) };
}

export function birthdayRulePrimary({
  parentA,                       // { dob, planEffectiveDate? }
  parentB,                       // { dob, planEffectiveDate? }
  custodyArrangement = 'shared', // 'shared' | 'custodial-A' | 'custodial-B'
  courtOrder = null,             // 'A' | 'B' | null
}) {
  if (!parentA || !parentB) throw new TypeError('parentA and parentB are required');
  if (courtOrder === 'A' || courtOrder === 'B') {
    return { primary: courtOrder, reason: 'court-order' };
  }
  if (custodyArrangement === 'custodial-A') return { primary: 'A', reason: 'custodial-parent' };
  if (custodyArrangement === 'custodial-B') return { primary: 'B', reason: 'custodial-parent' };

  const a = monthDay(parentA.dob);
  const b = monthDay(parentB.dob);
  if (a.month < b.month) return { primary: 'A', reason: 'birthday-rule' };
  if (a.month > b.month) return { primary: 'B', reason: 'birthday-rule' };
  if (a.day < b.day) return { primary: 'A', reason: 'birthday-rule' };
  if (a.day > b.day) return { primary: 'B', reason: 'birthday-rule' };

  // Tie-break: longer-tenured plan.
  const aPlan = parentA.planEffectiveDate;
  const bPlan = parentB.planEffectiveDate;
  if (aPlan && bPlan && aPlan !== bPlan) {
    return { primary: aPlan < bPlan ? 'A' : 'B', reason: 'longer-tenured-plan' };
  }
  return { primary: 'tie', reason: 'identical-birthdays-and-tenure' };
}
