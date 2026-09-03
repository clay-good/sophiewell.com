// spec-v1024: the tiles whose answer changes with the wall clock, and why each
// one is allowed to.
//
// A calculator that reads differently on Tuesday than it did on Monday, from the
// same inputs, is either doing its job or rotting. Both exist here, and the
// difference is whether the passage of time is the thing being measured:
//
//   appeal-deadline     a filing window counts down; that IS the tool
//   timely-filing       "file by 2027-03-01; 179 days remaining"
//   pa-turnaround       a decision-due clock against the CMS-0057-F standard
//   overpayment-60day   the 60-day report-and-return clock
//   device-day-counter  device-days since insertion, which is the measurement
//
// and three that are here because spec-v1018 made them SAY they depend on the
// clock rather than quietly answering from it:
//
//   due-date            "the LMP entered is 87 weeks ago, past the ~42 weeks a
//                       pregnancy is dated to" -- the number in that sentence
//                       moves, and the estimated due date beside it does not
//   preg-dating         the same, plus a discordance now measured at the scan
//   code-blue-clock     "the code start entered is 107 days ago"
//
// A new tile on this list is a question, not a defect: is the clock what it
// measures, or has an example been left to rot?
export const CLOCK_DEPENDENT = new Set([
  'appeal-deadline',
  'code-blue-clock',
  'device-day-counter',
  'due-date',
  'overpayment-60day',
  'pa-turnaround',
  'preg-dating',
  'timely-filing',
]);
