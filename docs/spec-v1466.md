# spec-v1466 — PCI surgery timing: a blank procedure is not a drug-eluting stent

Found by the same blank-select probe as [spec-v1460](spec-v1460.md).

## What was wrong

The minimum delay before elective noncardiac surgery depends on the procedure: 14 days after
balloon angioplasty, 30 after a bare-metal stent, and optimally 180 after a drug-eluting stent. The
procedure is optional on the agent surface, and a blank one became a drug-eluting stent. The answer
then opened with "120 days after drug-eluting stent", stating a stent type nobody entered. The
default is the conservative one, but it is still a printed finding that was never made. At 40 days
a blank read "short of the 180-day minimum", while after a bare-metal stent the same 40 days is past
the minimum. (The page was not affected: its select always holds a visible choice.)

## The fix

With no procedure entered, the interval is read against all three.

- If the answers differ, the tool asks: "Choose the procedure: at 40 days the answer differs
  between them (a 180-day minimum after a drug-eluting stent, 30 days after a bare-metal stent, and
  14 days after balloon angioplasty)."
- With no interval either, it asks for both.
- If every procedure gives the same answer (200 days is past all three minimums, and urgent surgery
  is outside the intervals altogether), it answers without naming a stent, adds "No procedure was
  entered; every procedure gives this same answer", and returns `procedure` as `null`.

## Tests

`test/unit/pci-surgery-timing.test.js`: a deciding blank is asked for, the no-interval blank asks
for both, an agreeing blank is disclosed without naming a stent, and urgent surgery is unchanged.
An unknown procedure is no longer read as a drug-eluting stent.
