# spec-v1252 — Simon Broome preserves an invalid optional lipid

Simon Broome accepts total cholesterol, LDL-C, or both because either lipid can
meet its cholesterol criterion. Optional does not mean an entered value may be
discarded.

Both local readers already limited values to `0–50 mmol/L`, but returned the
same sentinel for an omitted field and an out-of-range number. With total
cholesterol at `8 mmol/L`, tendon xanthoma present, and LDL-C at `999,999`, the
invalid LDL-C disappeared and the calculator still returned definite familial
hypercholesterolemia. Omitting LDL-C produced the identical result.

The function now checks both raw lipids against those existing bounds before it
chooses the total-cholesterol or LDL-C branch. An entered out-of-range value is
named and refused; a blank still falls through to the original optional-input
logic. No threshold, classification band, or citation changed.

Unit, browser, and MCP tests pin both halves: the invalid LDL-C refuses on every
surface, while an omitted LDL-C still permits total cholesterol to establish a
definite classification. The impossible-as-absent probe falls from 5 silent
fields to 4.
