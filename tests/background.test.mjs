import test from 'node:test';
import assert from 'node:assert/strict';
const storage = {};
let listener;
globalThis.chrome = {
  storage: { local: { setAccessLevel: async () => {}, get: async key => ({ [key]: structuredClone(storage[key]) }), set: async values => { Object.assign(storage, structuredClone(values)); } } },
  runtime: { id: 'test', getURL: (path = '') => `chrome-extension://test/${path}`, openOptionsPage: async () => {}, onMessage: { addListener: fn => { listener = fn; } } }
};
await import('../background.js');
const trusted = { id: 'test', url: 'chrome-extension://test/app.html' }, content = { id: 'test', tab: { id: 1 }, url: 'https://example.com' };
const call = (message, sender = trusted) => new Promise(resolve => listener(message, sender, resolve));
test('content cannot read secrets or change settings', async () => {
  assert.equal((await call({ type: 'getSettings' }, content)).ok, false);
  assert.equal((await call({ type: 'setSettings', settings: {} }, content)).ok, false);
  const r = await call({ type: 'publicSettings' }, content); assert.equal(r.data.apiKey, undefined);
});
test('settings page in a browser tab can save and read configuration', async () => {
  const sender = { ...trusted, tab: { id: 5 }, url: 'chrome-extension://test/app.html?view=settings#settings' };
  const settings = { provider: 'custom', endpoint: 'https://ark.cn-beijing.volces.com/api/plan/v3/chat/completions', model: 'example-model', apiKey: 'fake-regression-key', enabled: true, direction: 'auto' };
  assert.equal((await call({ type: 'setSettings', settings }, sender)).ok, true);
  const result = await call({ type: 'getSettings' }, sender);
  assert.equal(result.ok, true); assert.equal(result.data.apiKey, settings.apiKey);
  assert.equal(result.data.endpoint, settings.endpoint);
  assert.equal((await call({ type: 'words' }, sender)).ok, true);
  assert.equal((await call({ type: 'getSettings' }, { id: 'test', url: 'chrome-extension://test/popup.html' })).ok, true);
});
test('foreign extensions, web pages and unapproved extension paths are denied', async () => {
  for (const sender of [
    { id: 'other', url: trusted.url },
    { id: 'test', url: 'chrome-extension://other/app.html' },
    { id: 'test', url: 'https://example.com/app.html' },
    { id: 'test', url: 'chrome-extension://test/article.html' },
    { id: 'test', url: 'chrome-extension://test/app.html/other' },
    { id: 'test' }
  ]) {
    assert.equal((await call({ type: 'getSettings' }, sender)).ok, false);
    assert.equal((await call({ type: 'setSettings', settings: {} }, sender)).ok, false);
  }
});
test('simultaneous saves do not overwrite each other; duplicate is rejected', async () => {
  await Promise.all(['hello', 'world'].map(text => call({ type: 'save', entry: { text, translation: '译文' } }, content)));
  assert.equal(storage.words.length, 2);
  assert.equal((await call({ type: 'save', entry: { text: ' HELLO ', translation: '译文' } }, content)).data.duplicate, true);
  const id = storage.words[0].id;
  await call({ type: 'review', id, rating: 'good' }); assert.equal(storage.words.find(w => w.id === id).step, 1);
  await call({ type: 'delete', id }); assert.equal(storage.words.length, 1);
});
test('translation uses saved endpoint and reports provider errors without leaking key', async () => {
  await call({ type: 'setSettings', settings: { provider: 'custom', endpoint: 'https://example.com/v1/chat/completions', model: 'test-model', apiKey: 'test-secret', enabled: true } });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://example.com/v1/chat/completions'); assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, 'Bearer test-secret'); assert.equal(JSON.parse(options.body).model, 'test-model');
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"translation":"你好","explanation":"问候语"}' } }] }) };
  };
  assert.equal((await call({ type: 'translate', text: 'hello' }, content)).data.translation, '你好');
  globalThis.fetch = async () => ({ ok: false, status: 401 });
  const r = await call({ type: 'translate', text: 'hello' }); assert.equal(r.ok, false); assert.ok(!r.error.includes('test-secret'));
});
