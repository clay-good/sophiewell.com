// spec-v1401 Part B: optional state lines for rabies-pep. The national decision tree (CDC ACIP) is
// unchanged; a state line appears only when that state is chosen.
//
// Source for Texas: 25 Tex. Admin. Code 169.27 (Cornell LII copy, as last amended effective March 31,
// 2013; read 2026-09-19). A dog, cat, or domestic ferret that bit a person is quarantined, whatever its
// vaccination status, until the end of a 10-day observation period that begins at the exposure; in a
// department-licensed facility, a veterinary clinic, or (if the rule's conditions are met) home
// confinement. The alternative is euthanasia with the brain preserved and a specimen sent for testing.
// A free-roaming high-risk animal is euthanized and tested.
// 25 TAC 169.30 (Cornell LII, as amended effective March 31, 2013; read 2026-09-19): a domestic animal
// exposed to a rabid animal is euthanized, or -- if currently vaccinated -- given a booster at once and
// confined 45 days; if not currently vaccinated, vaccinated at once, confined 90 days, and boosted in
// the third and eighth weeks. The plan's reservoir list (skunks, bats) comes from the DSHS guide, which
// was not read, so it is not printed.
//
// Pure: no DOM, no clock, no network.

export const RABIES_STATES = [
  { value: '', text: 'No state line' },
  { value: 'TX', text: 'Texas' },
];

export const RABIES_STATE_LINES = {
  TX: 'Texas (25 TAC 169.27): a dog, cat, or domestic ferret that bit someone is quarantined, vaccinated or not, until the end of a 10-day observation period that starts at the exposure. The other option is euthanasia and rabies testing of the brain. A free-roaming high-risk animal (a wild animal, or one captive under 200 days) is euthanized and tested. The local rabies control authority directs where the animal is held. A pet exposed to a rabid animal is euthanized, or, if currently vaccinated, boosted at once and confined 45 days; if not, vaccinated at once, confined 90 days, and boosted in weeks 3 and 8 (169.30).',
};

export function rabiesStateLine(state) {
  return Object.prototype.hasOwnProperty.call(RABIES_STATE_LINES, state) ? RABIES_STATE_LINES[state] : null;
}
