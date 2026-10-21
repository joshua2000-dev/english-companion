import { send, $, download } from './client.js';
import { sourceURL } from './core.mjs';
import { memoryPanel, scheduleOverview } from './review-ui.js';
const { t, setLanguage, translateDocument, languageControl } = globalThis.CompanionI18n;
let words = [], config;
const presets = {
  deepseek: ['https://api.deepseek.com/chat/completions', 'deepseek-chat'],
  zhipu: ['https://open.bigmodel.cn/api/paas/v4/chat/completions', 'glm-4-flash'],
  openai: ['https://api.openai.com/v1/chat/completions', 'gpt-4.1-mini'],
  local: ['http://localhost:11434/v1/chat/completions', 'qwen2.5:7b'],
  custom: ['', '']
};
function el(tag, text, cls) { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; }
function notify(e) { $('globalStatus').textContent = t(e.message || e); }
let languageSelect;
function applyLanguage(language) {
  const revealed = $('reviewCard').querySelector('[data-answer]')?.hidden === false;
  setLanguage(language); translateDocument();
  if (languageSelect) languageSelect.value = globalThis.CompanionI18n.language;
  $('reveal').textContent = $('apiKey').type === 'password' ? t('显示') : t('隐藏');
  $('settingsStatus').textContent = ''; $('globalStatus').textContent = '';
  render(); renderReview();
  if (revealed) $('reviewCard').querySelector('[data-reveal]')?.click();
}
function sourceLink(word) {
  const href = sourceURL(word.source); if (!href) return null;
  const link = el('a', t('阅读原文 ↗'), 'source-link');
  link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.title = new URL(href).hostname; return link;
}
function page(name) {
  document.querySelectorAll('.page').forEach(e => e.hidden = e.id !== name);
  document.querySelectorAll('nav button').forEach(e => e.classList.toggle('active', e.dataset.page === name));
  if (name === 'review') renderReview();
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => page(b.dataset.page));
async function refresh() { words = await send({ type: 'words' }); render(); }
function render() {
  const expanded = new Set([...document.querySelectorAll('.word[data-id]')].filter(e => e.querySelector('.memory-details')?.open).map(e => e.dataset.id));
  $('total').textContent = words.length; $('listCount').textContent = words.length;
  $('dueCount').textContent = words.filter(w => w.due <= Date.now()).length;
  $('reviewCount').textContent = words.reduce((n,w) => n + w.reviews, 0);
  const q = $('search').value.trim().toLowerCase(), list = words.filter(w => (w.text + ' ' + w.translation).toLowerCase().includes(q));
  $('wordList').replaceChildren();
  if (!list.length) { const empty = el('div', '', 'empty'); empty.append(el('strong', q ? t('还没有找到这个表达') : t('你的词汇旅程，从一次划选开始')), el('p', q ? t('试试其他关键词。') : t('先在模型设置中填写 API Key，再打开网页划选文字。\n你收藏的词语和句子，会在这里安家。'))); $('wordList').append(empty); }
  for (const w of list) {
    const card = el('article', '', 'word'); card.dataset.id = w.id; card.append(el('h3', w.text), el('p', w.translation));
    if (w.explanation) { const d = el('details'); d.append(el('summary', t('用法与例句')), el('p', w.explanation)); card.append(d); }
    card.append(memoryPanel(w, Date.now(), expanded.has(w.id)));
    const footer = el('footer'), meta = el('span', t('{date} 收藏 · 已复习 {count} 次', { date: new Date(w.created).toLocaleDateString(globalThis.CompanionI18n.language === 'en' ? 'en-US' : 'zh-CN'), count: w.reviews }));
    const source = sourceLink(w); if (source) meta.append(source);
    const remove = el('button', t('删除')); remove.onclick = async () => { if (!confirm(t('删除“{text}”？', { text: w.text.slice(0,50) }))) return; try { await send({ type: 'delete', id: w.id }); await refresh(); } catch(e) { notify(e); } }; footer.append(meta, remove); card.append(footer); $('wordList').append(card);
  }
}
$('search').oninput = render;
$('export').onclick = () => download(`拾词生词本-${new Date().toISOString().slice(0,10)}.json`, { version: 1, exportedAt: new Date().toISOString(), words });
function renderReview(preserve = false) {
  const due = words.filter(w => w.due <= Date.now()).sort((a,b) => a.due - b.due), card = $('reviewCard');
  const previousId = card.dataset.wordId, revealed = preserve && card.querySelector('[data-answer]')?.hidden === false;
  const overview = scheduleOverview(words); const existing = document.querySelector('.schedule-overview');
  if (existing) existing.replaceWith(overview); else card.before(overview);
  card.replaceChildren(); delete card.dataset.wordId;
  if (!due.length) { card.append(el('small', 'TODAY, WELL DONE'), el('h2', words.length ? t('今天的复习已完成。') : t('先收藏第一个表达吧。')), el('p', words.length ? t('记忆正在慢慢生长。到期的内容会出现在这里。') : t('在网页上划选文字，翻译后点击“加入生词本”。'), 'muted')); return; }
  const w = due[0]; card.dataset.wordId = w.id;
  card.append(el('small', t('待复习 {count} 条 · 先试着回想它的含义', { count: due.length })), el('h2', w.text), memoryPanel(w));
  const answer = el('div'); answer.dataset.answer = ''; answer.hidden = true; answer.append(el('p', w.translation), el('p', w.explanation, 'muted'));
  const reveal = el('button', t('揭晓答案'), 'primary'); reveal.dataset.reveal = ''; const actions = el('div', '', 'actions'); actions.hidden = true;
  for (const [rating, label] of [['again', t('还没记住 · 10 分钟后')], ['good', t('记住了 · 延长间隔')]]) {
    const b = el('button', label, rating === 'good' ? 'primary' : ''); b.onclick = async () => { actions.querySelectorAll('button').forEach(x => x.disabled = true); try { await send({ type: 'review', id: w.id, rating }); await refresh(); renderReview(); } catch(e) { notify(e); actions.querySelectorAll('button').forEach(x => x.disabled = false); } }; actions.append(b);
  }
  reveal.onclick = () => { answer.hidden = false; actions.hidden = false; reveal.hidden = true; }; card.append(reveal, answer, actions);
  const source = sourceLink(w); if (source) { const footer = el('footer', '', 'review-source'); footer.append(source); card.append(footer); }
  if (revealed && previousId === w.id) reveal.click();
}
$('provider').onchange = () => { const p = presets[$('provider').value]; $('endpoint').value = p[0]; $('model').value = p[1]; $('apiKey').value = ''; $('settingsStatus').textContent = t('已切换服务商，请填写对应密钥并保存。'); };
$('reveal').onclick = () => { $('apiKey').type = $('apiKey').type === 'password' ? 'text' : 'password'; $('reveal').textContent = $('apiKey').type === 'password' ? t('显示') : t('隐藏'); };
$('settingsForm').onsubmit = async e => { e.preventDefault(); try { const s = Object.fromEntries(['provider','endpoint','model','apiKey','direction'].map(id => [id,$(id).value])); s.enabled = $('enabled').checked; await send({ type: 'setSettings', settings: s }); config = s; $('settingsStatus').textContent = t('✓ 设置已保存。回到网页即可开始划词翻译。'); } catch(e) { $('settingsStatus').textContent = t(e.message); } };
$('test').onclick = async () => { $('test').disabled = true; $('settingsStatus').textContent = t('正在测试已保存的配置…'); try { const r = await send({ type: 'translate', text: 'Learning opens doors.', direction: 'zh' }); $('settingsStatus').textContent = t('✓ 连接成功：{text}', { text: r.translation }); } catch(e) { $('settingsStatus').textContent = t(e.message); } finally { $('test').disabled = false; } };
async function init() {
  config = await send({ type: 'getSettings' });
  for (const id of ['provider','endpoint','model','apiKey','direction']) $(id).value = config[id]; $('enabled').checked = config.enabled;
  words = await send({ type: 'words' }); setLanguage(config.language);
  languageSelect = languageControl(document.querySelector('.topline'), async language => { try { await send({ type: 'setLanguage', language }); applyLanguage(language); } catch(e) { languageSelect.value = globalThis.CompanionI18n.language; notify(e); } });
  applyLanguage(config.language); if (!config.apiKey) page('settings');
}
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.words) refresh().then(() => { if (!$('review').hidden) renderReview(); }).catch(notify);
  const language = changes.settings?.newValue?.language;
  if (language && language !== globalThis.CompanionI18n.language) applyLanguage(language);
});
init().catch(notify);
setInterval(() => { if (!document.hidden && config) { render(); if (!$('review').hidden) renderReview(true); } }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && config) { render(); if (!$('review').hidden) renderReview(true); } });
