import { send, $, download } from './client.js';
let words = [], config;
const presets = {
  deepseek: ['https://api.deepseek.com/chat/completions', 'deepseek-chat'],
  zhipu: ['https://open.bigmodel.cn/api/paas/v4/chat/completions', 'glm-4-flash'],
  openai: ['https://api.openai.com/v1/chat/completions', 'gpt-4.1-mini'],
  local: ['http://localhost:11434/v1/chat/completions', 'qwen2.5:7b'],
  custom: ['', '']
};
function el(tag, text, cls) { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; }
function notify(e) { $('globalStatus').textContent = e.message || e; }
function page(name) {
  document.querySelectorAll('.page').forEach(e => e.hidden = e.id !== name);
  document.querySelectorAll('nav button').forEach(e => e.classList.toggle('active', e.dataset.page === name));
  if (name === 'review') renderReview();
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => page(b.dataset.page));
async function refresh() { words = await send({ type: 'words' }); render(); }
function render() {
  $('total').textContent = words.length; $('listCount').textContent = words.length;
  $('dueCount').textContent = words.filter(w => w.due <= Date.now()).length;
  $('reviewCount').textContent = words.reduce((n,w) => n + w.reviews, 0);
  const q = $('search').value.trim().toLowerCase(), list = words.filter(w => (w.text + ' ' + w.translation).toLowerCase().includes(q));
  $('wordList').replaceChildren();
  if (!list.length) { const empty = el('div', '', 'empty'); empty.append(el('strong', q ? '还没有找到这个表达' : '你的词汇旅程，从一次划选开始'), el('p', q ? '试试其他关键词。' : '先在模型设置中填写 API Key，再打开网页划选文字。\n你收藏的词语和句子，会在这里安家。')); $('wordList').append(empty); }
  for (const w of list) {
    const card = el('article', '', 'word'); card.append(el('h3', w.text), el('p', w.translation));
    if (w.explanation) { const d = el('details'); d.append(el('summary', '用法与例句'), el('p', w.explanation)); card.append(d); }
    const footer = el('footer'), meta = el('span', `${new Date(w.created).toLocaleDateString('zh-CN')} 收藏 · 已复习 ${w.reviews} 次`);
    if (w.source && /^https?:\/\//.test(w.source)) { const a = el('a', '　阅读来源 ↗'); a.href = w.source; a.target = '_blank'; a.rel = 'noopener noreferrer'; meta.append(a); }
    const remove = el('button', '删除'); remove.onclick = async () => { if (!confirm(`删除“${w.text.slice(0,50)}”？`)) return; try { await send({ type: 'delete', id: w.id }); await refresh(); } catch(e) { notify(e); } }; footer.append(meta, remove); card.append(footer); $('wordList').append(card);
  }
}
$('search').oninput = render;
$('export').onclick = () => download(`拾词生词本-${new Date().toISOString().slice(0,10)}.json`, { version: 1, exportedAt: new Date().toISOString(), words });
function renderReview() {
  const due = words.filter(w => w.due <= Date.now()).sort((a,b) => a.due - b.due), card = $('reviewCard'); card.replaceChildren();
  if (!due.length) { card.append(el('small', 'TODAY, WELL DONE'), el('h2', words.length ? '今天的复习已完成。' : '先收藏第一个表达吧。'), el('p', words.length ? '记忆正在慢慢生长。到期的内容会出现在这里。' : '在网页上划选文字，翻译后点击“加入生词本”。', 'muted')); return; }
  const w = due[0]; card.append(el('small', `待复习 ${due.length} 条 · 先试着回想它的含义`), el('h2', w.text));
  const answer = el('div'); answer.hidden = true; answer.append(el('p', w.translation), el('p', w.explanation, 'muted'));
  const reveal = el('button', '揭晓答案', 'primary'); const actions = el('div', '', 'actions'); actions.hidden = true;
  for (const [rating, label] of [['again', '还没记住 · 10 分钟后'], ['good', '记住了 · 延长间隔']]) {
    const b = el('button', label, rating === 'good' ? 'primary' : ''); b.onclick = async () => { actions.querySelectorAll('button').forEach(x => x.disabled = true); try { await send({ type: 'review', id: w.id, rating }); await refresh(); renderReview(); } catch(e) { notify(e); actions.querySelectorAll('button').forEach(x => x.disabled = false); } }; actions.append(b);
  }
  reveal.onclick = () => { answer.hidden = false; actions.hidden = false; reveal.hidden = true; }; card.append(reveal, answer, actions);
}
$('provider').onchange = () => { const p = presets[$('provider').value]; $('endpoint').value = p[0]; $('model').value = p[1]; $('apiKey').value = ''; $('settingsStatus').textContent = '已切换服务商，请填写对应密钥并保存。'; };
$('reveal').onclick = () => { $('apiKey').type = $('apiKey').type === 'password' ? 'text' : 'password'; $('reveal').textContent = $('apiKey').type === 'password' ? '显示' : '隐藏'; };
$('settingsForm').onsubmit = async e => { e.preventDefault(); try { const s = Object.fromEntries(['provider','endpoint','model','apiKey','direction'].map(id => [id,$(id).value])); s.enabled = $('enabled').checked; await send({ type: 'setSettings', settings: s }); config = s; $('settingsStatus').textContent = '✓ 设置已保存。回到网页即可开始划词翻译。'; } catch(e) { $('settingsStatus').textContent = e.message; } };
$('test').onclick = async () => { $('test').disabled = true; $('settingsStatus').textContent = '正在测试已保存的配置…'; try { const r = await send({ type: 'translate', text: 'Learning opens doors.', direction: 'zh' }); $('settingsStatus').textContent = `✓ 连接成功：${r.translation}`; } catch(e) { $('settingsStatus').textContent = e.message; } finally { $('test').disabled = false; } };
async function init() { config = await send({ type: 'getSettings' }); for (const id of ['provider','endpoint','model','apiKey','direction']) $(id).value = config[id]; $('enabled').checked = config.enabled; await refresh(); if (!config.apiKey) page('settings'); }
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.words) refresh().catch(notify); });
init().catch(notify);
