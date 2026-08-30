import test from 'node:test';
import assert from 'node:assert/strict';
import { periopBridging as b, AGENTS, PROCEDURE_RISKS, THROMBOTIC_RISKS } from '../../lib/periop-bridging-v899.js';

test('periop-bridging: the published vocabularies', () => {
  assert.deepEqual(AGENTS.map((a) => a.value), ['doac', 'warfarin']);
  assert.deepEqual(PROCEDURE_RISKS.map((p) => p.value), ['minimal', 'low', 'high']);
  assert.deepEqual(THROMBOTIC_RISKS.map((t) => t.value), ['low', 'high']);
});

test('periop-bridging: a direct oral anticoagulant is never bridged, at any thrombotic risk', () => {
  for (const thrombotic of ['low', 'high']) {
    for (const procedure of ['low', 'high']) {
      const r = b({ agent: 'doac', procedureRisk: procedure, thromboticRisk: thrombotic });
      assert.equal(r.verdict, 'doac-never-bridged', `${procedure}/${thrombotic}`);
      assert.match(r.band, /never bridged/);
    }
  }
  assert.match(b({ agent: 'doac', procedureRisk: 'high' }).doacNote, /not timed on an INR/);
});

test('periop-bridging: warfarin turns on the thrombotic risk, and only warfarin does', () => {
  assert.equal(b({ agent: 'warfarin', procedureRisk: 'high', thromboticRisk: 'low' }).verdict, 'warfarin-no-bridge');
  assert.equal(b({ agent: 'warfarin', procedureRisk: 'high', thromboticRisk: 'high' }).verdict, 'warfarin-consider-bridge');
  assert.equal(b({ agent: 'warfarin', procedureRisk: 'high', thromboticRisk: 'low' }).abnormal, false);
  assert.equal(b({ agent: 'warfarin', procedureRisk: 'high', thromboticRisk: 'high' }).abnormal, true);
  assert.match(b({ agent: 'warfarin', procedureRisk: 'high', thromboticRisk: 'low' }).band, /BRIDGE trial/);
  // The warfarin branch still tells the reader about the other case.
  assert.match(b({ agent: 'warfarin', procedureRisk: 'high' }).doacNote, /those are never bridged/);
  assert.match(b({ agent: 'warfarin', procedureRisk: 'high' }).inrNote, /An INR is checked/);
  assert.equal(b({ agent: 'doac', procedureRisk: 'high' }).inrNote, null);
});

test('periop-bridging: minimal bleeding risk short-circuits both questions', () => {
  for (const agent of ['doac', 'warfarin']) {
    const r = b({ agent, procedureRisk: 'minimal', thromboticRisk: 'high' });
    assert.equal(r.verdict, 'no-interruption');
    assert.equal(r.interruptionNeeded, false);
    assert.match(r.band, /no bridging question arises/);
    assert.equal(r.minimalNote, null);
    assert.equal(r.resumeNote, null);
  }
  // Otherwise the tile raises it before the bridging question.
  assert.match(b({ agent: 'warfarin', procedureRisk: 'high' }).minimalNote, /whether interruption is needed at all/);
});

test('periop-bridging: the default is not to bridge, said on every result', () => {
  // The reason the tile exists.
  for (const input of [{}, { agent: 'warfarin', procedureRisk: 'high', thromboticRisk: 'high' }, { procedureRisk: 'minimal' }]) {
    assert.match(b(input).defaultNote, /default is not to bridge/);
    assert.match(b(input).defaultNote, /one of the few exceptions/);
    assert.match(b(input).scopeNote, /does not set an interruption schedule/);
  }
});

test('periop-bridging: resumption is named whenever an interruption is in play', () => {
  assert.match(b({ agent: 'doac', procedureRisk: 'high' }).resumeNote, /timed on hemostasis rather than on the calendar/);
  assert.match(b({ agent: 'warfarin', procedureRisk: 'low' }).resumeNote, /delayed further than a prophylactic one/);
});

test('periop-bridging: unknown values fall back', () => {
  assert.equal(b({ agent: 'made-up' }).agent, 'doac');
  assert.equal(b({ procedureRisk: 'made-up' }).procedureRisk, 'low');
  assert.equal(b({ thromboticRisk: 'made-up' }).thromboticRisk, 'low');
});

test('periop-bridging: the documented example', () => {
  const r = b({ agent: 'warfarin', procedureRisk: 'high', thromboticRisk: 'low' });
  assert.equal(r.verdict, 'warfarin-no-bridge');
  assert.equal(r.interruptionNeeded, true);
});
