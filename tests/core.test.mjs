import test from 'node:test';
import assert from 'node:assert/strict';
import { endpointURL, normalize, schedule, parseTranslation } from '../core.mjs';
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
