import test from 'node:test';
import assert from 'node:assert/strict';
import { endpointURL, normalize, schedule, parseTranslation, sourceURL, DAY, REVIEW_GAPS, reviewState, reviewPlan } from '../core.mjs';
test('eight recall checkpoints use expanding gaps then maintain at 120 days', () => {
  let word = {step:0,reviews:0,due:1000}, now = 1000;
  for (let count = 1; count <= 8; count++) {
    word = schedule(word,'good',now);
    assert.equal(word.completedStages,count);
    assert.equal(word.due-now,REVIEW_GAPS[Math.min(count,7)]*DAY);
    assert.equal(reviewState(word,now).completed,count);
    now=word.due;
  }
  assert.equal(reviewState(word,now).maintenance,true);
  word=schedule(word,'good',now);assert.equal(word.completedStages,8);assert.equal(word.due-now,120*DAY);assert.equal(word.reviews,9);
});
test('lapse restarts consolidation in ten minutes and preserves review history', () => {
  const word = schedule({step:6,completedStages:6,reviews:10,lapses:2,history:[{at:1,rating:'good'}]},'again',5000);
  assert.equal(word.completedStages,0);assert.equal(word.due,605000);assert.equal(word.reviews,11);assert.equal(word.lapses,3);assert.equal(word.history.length,2);
  assert.equal(schedule(word,'good',word.due).due,word.due+DAY);
});
test('legacy progress is preserved without inventing historical review dates', () => {
  const word={step:4,reviews:9,due:1000};
  assert.equal(reviewState(word,2000).completed,4);
  assert.equal(reviewPlan(word,2000).filter(p=>p.status==='completed').length,4);
  assert.ok(reviewPlan(word,2000).filter(p=>p.status==='completed').every(p=>p.date===null));
  assert.equal(schedule(word,'good',2000).completedStages,5);
});
test('future timeline intervals are measured from the preceding successful recall', () => {
  const now=1000,due=now+DAY,plan=reviewPlan({step:1,completedStages:1,due},now);
  assert.equal(plan[1].status,'current');assert.equal(plan[1].date,due);
  assert.equal(plan[2].date,due+3*DAY);assert.equal(plan[3].date,due+10*DAY);
  const overdue=reviewState({step:7,due:now-2*DAY},now);assert.equal(overdue.overdue,true);assert.equal(overdue.level,4);
  const bounded=schedule({step:7,history:Array.from({length:60},()=>({at:1}))},'good',now);assert.equal(bounded.history.length,50);
});
test('article URLs retain query and fragment and reject executable schemes', () => {
  const url = 'https://example.com/read?id=123&lang=en#chapter-2';
  assert.equal(sourceURL(url), url);
  for (const value of ['javascript:alert(1)', 'data:text/html,hello', 'https://user:secret@example.com', undefined, 'bad']) assert.equal(sourceURL(value), '');
});
test('only secure remote endpoints and local HTTP are accepted', () => {
  assert.equal(endpointURL('https://api.deepseek.com/chat/completions/'), 'https://api.deepseek.com/chat/completions');
  assert.equal(endpointURL('http://localhost:11434/v1/chat/completions'), 'http://localhost:11434/v1/chat/completions');
  for (const url of ['http://example.com/api', 'https://user:secret@example.com', 'https://example.com/?key=secret', 'file:///tmp/a']) assert.throws(() => endpointURL(url));
});
test('duplicates ignore case and whitespace', () => { assert.equal(normalize('  Take   Care '), normalize('take care')); });
test('review schedule advances and resets without losing counters', () => {
  let entry = schedule({ step: 0, reviews: 0 }, 'good', 1000);
  assert.equal(entry.due, 86401000); assert.equal(entry.step, 1);
  entry = schedule(entry, 'good', 1000); assert.equal(entry.due, 259201000);
  entry = schedule(entry, 'again', 1000); assert.equal(entry.due, 601000); assert.equal(entry.step, 0); assert.equal(entry.reviews, 3);
});
test('model response supports JSON, markdown fences and plain text', () => {
  assert.equal(parseTranslation('```json\n{"translation":"你好","explanation":"问候"}\n```').translation, '你好');
  assert.equal(parseTranslation('自然的译文').translation, '自然的译文');
  assert.throws(() => parseTranslation('  '));
});
