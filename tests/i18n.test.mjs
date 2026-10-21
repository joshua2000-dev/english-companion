import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('../i18n.js', import.meta.url),'utf8'), context);
const i18n = context.CompanionI18n;
test('language switches both ways without changing user content', () => {
  i18n.setLanguage('en'); assert.equal(i18n.t('阅读原文 ↗'), 'Read original ↗');
  assert.equal(i18n.t('保存设置'), 'Save settings'); assert.equal(i18n.t('待复习 {count} 条 · 先试着回想它的含义', {count:10}), '10 due · Try to recall the meaning first');
  assert.equal(i18n.t('用户收藏的句子'), '用户收藏的句子');
  i18n.setLanguage('zh'); assert.equal(i18n.t('保存设置'), '保存设置');
});
